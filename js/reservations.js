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
});

function handleReservationSubmit(event) {
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
    
    // Log to console as requested
    console.log('New Reservation Submitted:', reservation);
    console.log('Name:', reservation.name);
    console.log('Phone:', reservation.phone);
    console.log('Email:', reservation.email);
    console.log('Date:', reservation.date);
    console.log('Time:', reservation.time);
    console.log('Number of Guests:', reservation.guests);
    console.log('Special Notes:', reservation.notes || 'None');
    
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