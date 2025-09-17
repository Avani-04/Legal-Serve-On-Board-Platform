// Global variables
let currentStep = 1;
let isSubmitting = false;
let navToggle = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    initializeForm();
    initializeContactForm();
    initializeScrollEffects();
    initializeFAQ();
    initializeNewsCards();
    initializePartners();
    initializeBackToTop();
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggleBtn = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', function() {
            navToggle = !navToggle;
            navToggleBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navToggle = false;
                navToggleBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to section helper function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            // Set initial state
            answer.style.maxHeight = '0px';
            answer.style.opacity = '0';
            
            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0px';
                            otherAnswer.style.opacity = '0';
                        }
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0px';
                    answer.style.opacity = '0';
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                }
            });
        }
    });
}

// News cards functionality
function initializeNewsCards() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add click functionality for read more links
        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink) {
            readMoreLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Add your news detail page logic here
                console.log('Opening news article:', card.querySelector('h3').textContent);
            });
        }
    });
}

// Partners section functionality
function initializePartners() {
    const partnerItems = document.querySelectorAll('.partner-item');
    
    partnerItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Enhanced scroll animations for new sections
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll(
        '.service-card, .benefit-item, .testimonial-card, .contact-method, ' +
        '.step-item, .stat-card, .news-card, .faq-item, .partner-item'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Enhanced counter animation for statistics
function initializeAnimations() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString() + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('₹') ? '' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString() + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('₹') ? '' : '');
            }
        }, 20);
    };

    const observeCounters = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                if (number) {
                    animateCounter(entry.target, number);
                }
                observeCounters.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        observeCounters.observe(stat);
    });
}

// Form handling
function initializeForm() {
    const form = document.getElementById('onboard-form');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    updateStepDisplay();
}

// Change form step
function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    const totalSteps = 3;
    const newStep = currentStep + direction;

    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        updateStepDisplay();
    }
}

// Update step display
function updateStepDisplay() {
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Update form steps
    steps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            indicator.classList.add('active');
        } else if (index + 1 < currentStep) {
            indicator.classList.add('completed');
        }
    });

    // Update navigation buttons
    if (prevBtn) prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = currentStep === 3 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = currentStep === 3 ? 'inline-flex' : 'none';
}

// Validate current step
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return true;

    const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'checkbox') {
            const checkboxGroup = input.closest('.form-group');
            const checkboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]');
            const isAnyChecked = Array.from(checkboxes).some(cb => cb.checked);
            
            if (!isAnyChecked) {
                showFieldError(checkboxGroup, 'Please select at least one specialization');
                isValid = false;
            } else {
                clearFieldError(checkboxGroup);
            }
        } else if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
            
            // Additional validation
            if (input.type === 'email' && !isValidEmail(input.value)) {
                showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            } else if (input.type === 'tel' && !isValidPhone(input.value)) {
                showFieldError(input, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    
    field.style.borderColor = 'var(--error-color)';
    
    if (field.classList.contains('form-group')) {
        field.appendChild(errorElement);
    } else {
        field.parentNode.appendChild(errorElement);
    }
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.classList.contains('form-group') 
        ? field.querySelector('.field-error')
        : field.parentNode.querySelector('.field-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = '';
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateCurrentStep()) {
        return;
    }

    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    
    // Add loading state
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
    }

    // Simulate form submission
    setTimeout(() => {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkbox arrays
        const specializations = formData.getAll('specializations[]');
        data.specializations = specializations;

        console.log('Form submitted with data:', data);
        
        // Show success modal
        showSuccessModal();
        
        // Reset form state
        isSubmitting = false;
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Complete Registration';
            submitBtn.disabled = false;
        }
        
        // Reset form
        e.target.reset();
        currentStep = 1;
        updateStepDisplay();
        
    }, 2000);
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Contact form submitted:', data);
            
            // Show success message
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                e.target.reset();
            }, 3000);
        });
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('success-modal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add input animations
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check if field is pre-filled
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-background');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Apply ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// Add ripple CSS
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 600ms linear;
        background-color: rgba(255, 255, 255, 0.6);
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    });

    document.querySelectorAll('.service-card, .benefit-item, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
} else {
    observeElements();
}

// Back to Top functionality
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}