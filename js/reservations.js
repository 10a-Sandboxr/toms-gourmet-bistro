// Demo reservation data
const demoReservations = [
    {
        name: "Sarah Johnson",
        phone: "(415) 555-1234",
        email: "sarah.j@email.com",
        date: "2024-12-28",
        time: "7:00 PM",
        guests: 2,
        notes: "Anniversary dinner"
    },
    {
        name: "Michael Chen",
        phone: "(415) 555-5678",
        email: "mchen@email.com",
        date: "2024-12-29",
        time: "8:00 PM",
        guests: 4,
        notes: "Business dinner"
    },
    {
        name: "Emily Rodriguez",
        phone: "(415) 555-9012",
        email: "emily.r@email.com",
        date: "2024-12-30",
        time: "6:30 PM",
        guests: 3,
        notes: "Birthday celebration"
    },
    {
        name: "James Wilson",
        phone: "(415) 555-3456",
        email: "jwilson@email.com",
        date: "2024-12-31",
        time: "9:00 PM",
        guests: 2,
        notes: "New Year's Eve dinner"
    },
    {
        name: "Lisa Thompson",
        phone: "(415) 555-7890",
        email: "lisa.t@email.com",
        date: "2025-01-02",
        time: "7:30 PM",
        guests: 6,
        notes: "Family gathering"
    }
];

// Load demo reservations on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDemoReservations();
    
    // Add form submission handler
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

function loadDemoReservations() {
    const tableBody = document.getElementById('reservationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    demoReservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.name}</td>
            <td>${reservation.phone}</td>
            <td>${reservation.email}</td>
            <td>${formatDate(reservation.date)}</td>
            <td>${reservation.time}</td>
            <td>${reservation.guests}</td>
            <td>${reservation.notes || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

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
    
    messageDiv.innerHTML = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 5px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">Reservation Confirmed!</h3>
            <p>Thank you, ${reservation.name}. Your reservation for ${reservation.guests} guests on ${formatDate(reservation.date)} at ${reservation.time} has been confirmed.</p>
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