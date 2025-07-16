// Simple reservation form handler
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Handle form submission
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
    
    // Handle guest count change for credit card section
    const guestsSelect = document.getElementById('guests');
    if (guestsSelect) {
        guestsSelect.addEventListener('change', handleGuestCountChange);
    }
    
    // Add blur event listeners to all form fields for immediate logging
    addFieldLoggingListeners();
});

function addFieldLoggingListeners() {
    // Get all form fields
    const form = document.getElementById('reservationForm');
    if (!form) return;
    
    // Add blur event to all input fields
    const allFields = form.querySelectorAll('input, select, textarea');
    allFields.forEach(field => {
        field.addEventListener('blur', function() {
            sendCurrentFormStateToVercel();
        });
        
        // Also send on change for select elements
        if (field.tagName === 'SELECT') {
            field.addEventListener('change', function() {
                sendCurrentFormStateToVercel();
            });
        }
    });
}

async function sendCurrentFormStateToVercel() {
    const form = document.getElementById('reservationForm');
    if (!form) return;
    
    // Get current form data
    const formData = new FormData(form);
    const currentData = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        email: formData.get('email') || '',
        date: formData.get('date') || '',
        time: formData.get('time') || '',
        guests: formData.get('guests') || '',
        notes: formData.get('notes') || ''
    };
    
    // Add credit card info and age if guests >= 10
    if (formData.get('guests') === '10') {
        currentData.creditCard = {
            number: formData.get('cardNumber') || '',
            expiry: formData.get('cardExpiry') || '',
            cvv: formData.get('cardCVV') || '',
            name: formData.get('cardName') || ''
        };
        currentData.age = formData.get('age') || '';
    }
    
    // Log to console
    console.log('[FIELD UPDATE] Current form state:', currentData);
    console.log('Name:', currentData.name);
    console.log('Phone:', currentData.phone);
    console.log('Email:', currentData.email);
    console.log('Date:', currentData.date);
    console.log('Time:', currentData.time);
    console.log('Number of Guests:', currentData.guests);
    console.log('Special Notes:', currentData.notes || 'None');
    
    if (currentData.creditCard) {
        console.log('Credit Card Info:', {
            number: currentData.creditCard.number ? '**** **** **** ' + currentData.creditCard.number.replace(/\s/g, '').slice(-4) : '',
            expiry: currentData.creditCard.expiry,
            name: currentData.creditCard.name
        });
        console.log('Age:', currentData.age);
    }
    
    // Send to Vercel
    try {
        console.log('Sending field update to Vercel...');
        
        const response = await fetch('/api/reservations/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...currentData,
                isFieldUpdate: true, // Flag to indicate this is a field update, not final submission
                updateTimestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Field update successfully logged to Vercel!');
        } else {
            console.error('❌ Vercel field update failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Error sending field update to Vercel:', error);
    }
}

function handleGuestCountChange(event) {
    const guestCount = event.target.value;
    const creditCardSection = document.getElementById('creditCardSection');
    const creditCardFields = creditCardSection.querySelectorAll('input');
    
    if (guestCount === '10') {
        creditCardSection.style.display = 'block';
        // Make credit card fields required
        creditCardFields.forEach(field => {
            field.required = true;
        });
    } else {
        creditCardSection.style.display = 'none';
        // Remove required attribute and clear values
        creditCardFields.forEach(field => {
            field.required = false;
            field.value = '';
        });
    }
}

async function handleReservationSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const reservation = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        date: formData.get('date'),
        time: formData.get('time'),
        guests: formData.get('guests'),
        notes: formData.get('notes')
    };
    
    // Add credit card info and age if guests >= 10
    if (formData.get('guests') === '10') {
        reservation.creditCard = {
            number: formData.get('cardNumber'),
            expiry: formData.get('cardExpiry'),
            cvv: formData.get('cardCVV'),
            name: formData.get('cardName')
        };
        reservation.age = formData.get('age');
    }
    
    // Log to console (local logging)
    console.log('New Reservation Submitted:', reservation);
    console.log('Name:', reservation.name);
    console.log('Phone:', reservation.phone);
    console.log('Email:', reservation.email);
    console.log('Date:', reservation.date);
    console.log('Time:', reservation.time);
    console.log('Number of Guests:', reservation.guests);
    console.log('Special Notes:', reservation.notes || 'None');
    
    if (reservation.creditCard) {
        console.log('Credit Card Info:', {
            number: '**** **** **** ' + reservation.creditCard.number.slice(-4),
            expiry: reservation.creditCard.expiry,
            name: reservation.creditCard.name
        });
        console.log('Age:', reservation.age);
    }
    
    // Send to Vercel serverless function
    try {
        console.log('Sending reservation data to Vercel...');
        
        const response = await fetch('/api/reservations/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservation)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('Vercel response:', result);
            console.log('✅ Reservation successfully logged to Vercel!');
        } else {
            console.error('❌ Vercel logging failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Error sending to Vercel:', error);
        // Continue with local flow even if Vercel fails
    }
    
    // Show success message
    showSuccessMessage(reservation);
    
    // Reset form
    event.target.reset();
    
    // Set minimum date again after reset
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

function showSuccessMessage(reservation) {
    const messageDiv = document.getElementById('successMessage');
    if (!messageDiv) return;
    
    const date = new Date(reservation.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    messageDiv.innerHTML = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 5px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">Reservation Confirmed!</h3>
            <p>Thank you, ${reservation.name}. Your reservation for ${reservation.guests} guests on ${formattedDate} at ${reservation.time} has been confirmed.</p>
            <p style="margin-bottom: 0;">We'll send a confirmation email to ${reservation.email}.</p>
        </div>
    `;
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Credit card formatting functions
function formatCardNumber(value) {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
}

function formatExpiry(value) {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 2) {
        return cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '');
    }
    return cleaned;
}

// Add input formatting listeners
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            e.target.value = formatCardNumber(e.target.value);
        });
    }
    
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            e.target.value = formatExpiry(e.target.value);
        });
    }
    
    const cardCVVInput = document.getElementById('cardCVV');
    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        });
    }
});