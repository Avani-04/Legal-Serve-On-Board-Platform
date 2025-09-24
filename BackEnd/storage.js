// Store professionals and appointments
let professionals = JSON.parse(localStorage.getItem("professionals")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

// === Professional Registration ===
const professionalForm = document.getElementById("professional-form");
if (professionalForm) {
  professionalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("proName").value;
    const specialization = document.getElementById("specialization").value;
    const contact = document.getElementById("contact").value;

    professionals.push({ name, specialization, contact });
    localStorage.setItem("professionals", JSON.stringify(professionals));
    alert("Professional registered successfully!");
    professionalForm.reset();
  });
}

// === Client Side: Show professionals ===
const list = document.getElementById("professional-list");
const selectProfessional = document.getElementById("selectProfessional");

if (list && selectProfessional) {
  list.innerHTML = professionals.map(
    (pro) => `<li>${pro.name} - ${pro.specialization} (${pro.contact})</li>`
  ).join("");

  professionals.forEach((pro, i) => {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = `${pro.name} - ${pro.specialization}`;
    selectProfessional.appendChild(option);
  });
}

// === Client Appointment Form ===
const appointmentForm = document.getElementById("appointment-form");
if (appointmentForm) {
  appointmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const clientName = document.getElementById("clientName").value;
    const proIndex = document.getElementById("selectProfessional").value;
    const date = document.getElementById("date").value;

    let appointment = {
      clientName,
      professional: professionals[proIndex],
      date,
      status: "Pending"
    };

    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    alert("Appointment requested!");
    appointmentForm.reset();
  });
}

// === Professional Side: Manage Appointments ===
const appointmentRequests = document.getElementById("appointment-requests");
if (appointmentRequests) {
  function renderAppointments() {
    appointmentRequests.innerHTML = appointments.map((appt, i) => `
      <li>
        <b>${appt.clientName}</b> requested with <b>${appt.professional.name}</b> on ${appt.date} 
        - Status: ${appt.status} 
        <button onclick="accept(${i})">Accept</button>
        <button onclick="reject(${i})">Reject</button>
      </li>
    `).join("");
  }
  renderAppointments();

  window.accept = (i) => {
    appointments[i].status = "Accepted";
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderAppointments();
  };

  window.reject = (i) => {
    appointments[i].status = "Rejected";
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderAppointments();
  };
}
