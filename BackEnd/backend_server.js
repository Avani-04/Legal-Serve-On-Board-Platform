/*
Full backend example: Express + Socket.IO appointment notification service
Features:
- REST API for professionals & clients registration (minimal demo)
- REST API to create appointment (client books)
- Socket.IO for real-time notifications to professionals and clients
- In-memory store for demo, optional MongoDB (mongoose) section included

How it works (short):
1. Professional opens their dashboard and connects via Socket.IO, authenticating with professionalId.
2. Client calls POST /appointments to book appointment for a professional.
3. Server creates appointment and emits `appointment:request` to the professional's socket (if connected).
4. Professional responds by emitting `appointment:response` with accept/reject. Server updates appointment and notifies the client.

Run:
- Node 18+
- npm init -y
- npm i express socket.io cors body-parser uuid
- Optionally: npm i mongoose
- Create .env with PORT and optionally MONGODB_URI
- node appointment-backend-server.js

This single file is sufficient for local development/demo. For production, move to modules, add authentication, persistence, and robust error handling.
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(bodyParser.json());

// ----------------------------
// In-memory stores (demo only)
// ----------------------------
const professionals = new Map(); // professionalId -> { id, name, ... }
const clients = new Map(); // clientId -> { id, name, ... }
const appointments = new Map(); // appointmentId -> { id, professionalId, clientId, time, status, ... }

// Map professionalId -> socketId (latest)
const professionalSockets = new Map();
// Map clientId -> socketId (optional)
const clientSockets = new Map();

// ----------------------------
// OPTIONAL: Mongoose / MongoDB
// ----------------------------
/*
If you want persistence, uncomment and install mongoose.

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointments';

mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

const AppointmentSchema = new mongoose.Schema({
  professionalId: String,
  clientId: String,
  time: Date,
  status: { type: String, enum: ['pending','accepted','rejected','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);
*/

// ----------------------------
// REST APIs (simple demo)
// ----------------------------

// Register professional (demo)
app.post('/professionals', (req, res) => {
  const { name, id } = req.body; // client may supply id or we generate
  const professionalId = id || uuidv4();
  professionals.set(professionalId, { id: professionalId, name: name || 'Unnamed' });
  res.json({ success: true, professionalId });
});

// Register client (demo)
app.post('/clients', (req, res) => {
  const { name, id } = req.body;
  const clientId = id || uuidv4();
  clients.set(clientId, { id: clientId, name: name || 'Unnamed' });
  res.json({ success: true, clientId });
});

// Create appointment (client books)
app.post('/appointments', async (req, res) => {
  const { professionalId, clientId, time, meta } = req.body;
  if (!professionalId || !clientId || !time) return res.status(400).json({ error: 'professionalId, clientId and time required' });

  const appointmentId = uuidv4();
  const appointment = {
    id: appointmentId,
    professionalId,
    clientId,
    time: new Date(time),
    status: 'pending',
    meta: meta || {},
    createdAt: new Date()
  };

  // Persist in-memory
  appointments.set(appointmentId, appointment);

  // If using MongoDB, create document here instead (uncomment below)
  // const doc = await Appointment.create({ professionalId, clientId, time, status: 'pending' });

  // Notify professional via socket if connected
  const profSocketId = professionalSockets.get(professionalId);
  if (profSocketId) {
    io.to(profSocketId).emit('appointment:request', appointment);
  }

  // Also notify client socket that booking is registered
  const clientSocketId = clientSockets.get(clientId);
  if (clientSocketId) {
    io.to(clientSocketId).emit('appointment:created', appointment);
  }

  res.json({ success: true, appointment });
});

// Get appointment
app.get('/appointments/:id', (req, res) => {
  const id = req.params.id;
  const appt = appointments.get(id);
  if (!appt) return res.status(404).json({ error: 'not found' });
  res.json(appt);
});

// Professional manually accept/reject (HTTP fallback)
app.post('/appointments/:id/respond', (req, res) => {
  const id = req.params.id;
  const { professionalId, action, note } = req.body; // action: 'accepted' | 'rejected'
  const appt = appointments.get(id);
  if (!appt) return res.status(404).json({ error: 'not found' });
  if (appt.professionalId !== professionalId) return res.status(403).json({ error: 'not authorized' });
  if (!['accepted','rejected','cancelled'].includes(action)) return res.status(400).json({ error: 'invalid action' });

  appt.status = action;
  appt.meta = appt.meta || {};
  if (note) appt.meta.note = note;
  appointments.set(id, appt);

  // Notify client via socket
  const clientSocketId = clientSockets.get(appt.clientId);
  if (clientSocketId) io.to(clientSocketId).emit('appointment:update', appt);

  res.json({ success: true, appt });
});

// ----------------------------
// Socket.IO handlers
// ----------------------------

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // We expect the client to emit 'register' quickly with role and id
  // { role: 'professional'|'client', id: 'userId' }
  socket.on('register', (payload) => {
    try {
      const { role, id } = payload || {};
      if (!role || !id) return socket.emit('error', { message: 'role and id required for register' });

      if (role === 'professional') {
        professionalSockets.set(id, socket.id);
        socket.data.role = 'professional';
        socket.data.userId = id;
        console.log(`professional ${id} connected -> socket ${socket.id}`);
      } else if (role === 'client') {
        clientSockets.set(id, socket.id);
        socket.data.role = 'client';
        socket.data.userId = id;
        console.log(`client ${id} connected -> socket ${socket.id}`);
      }

      socket.emit('registered', { ok: true });
    } catch (err) {
      console.error('register error', err);
      socket.emit('error', { message: 'register failed' });
    }
  });

  // Professional responds to appointment requests via socket
  // payload: { appointmentId, status: 'accepted'|'rejected', note }
  socket.on('appointment:response', (payload) => {
    const { appointmentId, status, note } = payload || {};
    if (!appointmentId || !status) return socket.emit('error', { message: 'appointmentId and status required' });

    const appt = appointments.get(appointmentId);
    if (!appt) return socket.emit('error', { message: 'appointment not found' });
    if (socket.data.role !== 'professional' || socket.data.userId !== appt.professionalId) {
      return socket.emit('error', { message: 'not authorized to respond' });
    }

    if (!['accepted','rejected','cancelled'].includes(status)) return socket.emit('error', { message: 'invalid status' });

    appt.status = status;
    appt.meta = appt.meta || {};
    if (note) appt.meta.note = note;
    appointments.set(appointmentId, appt);

    // notify client
    const clientSocketId = clientSockets.get(appt.clientId);
    if (clientSocketId) io.to(clientSocketId).emit('appointment:update', appt);

    // ack professional
    socket.emit('appointment:response:ack', appt);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
    // Clean maps where socket was stored
    for (const [profId, sId] of professionalSockets.entries()) if (sId === socket.id) professionalSockets.delete(profId);
    for (const [clientId, sId] of clientSockets.entries()) if (sId === socket.id) clientSockets.delete(clientId);
  });
});


server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});


/*
-- Sample client/professional connection code (frontend) --

// client.js (client pages)

const socket = io('http://localhost:3000');
const clientId = 'client-abc-123';

socket.on('connect', () => {
  socket.emit('register', { role: 'client', id: clientId });
});

socket.on('registered', () => console.log('client registered'));

socket.on('appointment:created', (appt) => {
  console.log('your appointment was created', appt);
});

socket.on('appointment:update', (appt) => {
  console.log('appointment status updated', appt);
  // Update UI accordingly
});


// professional.js (professional dashboard)
const socket = io('http://localhost:3000');
const professionalId = 'prof-xyz-001';

socket.on('connect', () => {
  socket.emit('register', { role: 'professional', id: professionalId });
});

socket.on('appointment:request', (appt) => {
  console.log('new appointment request', appt);
  // show modal accept/reject. On user click:
  // socket.emit('appointment:response', { appointmentId: appt.id, status: 'accepted' })
});

socket.on('appointment:response:ack', (appt) => console.log('response ack', appt));

socket.on('registered', () => console.log('professional registered'));


Notes & next steps:
- For production, implement authentication (JWT), verify identities before allowing register/response.
- Use a persistent DB (Mongo/Postgres) for appointments and user accounts.
- Add retry / delivery receipts: if professional not connected, send email/SMS push or queue, and optionally notify when they come online.
- Consider WebRTC P2P if you need direct media connections (video/audio) between client and professional. For simple notifications, server-mediated Socket.IO is the typical approach.
- If you truly want a peer-to-peer notification (no server involvement after signaling), you'd still need a signaling server to exchange connection info; typically you still run a small server like the one above.
*/
