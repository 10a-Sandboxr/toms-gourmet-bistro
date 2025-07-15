// Simple reservation system
let selectedDate = null;
let selectedTime = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const availableTimes = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', 
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', 
    '9:00 PM', '9:30 PM'
];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    setupEventListeners();
    updateFormState();
});

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('currentMonth');
    
    if (!calendar || !monthDisplay) return;
    
    // Update month display
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get calendar info
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const today = new Date();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDay = new Date(currentYear, currentMonth, day);
        const dateStr = currentDay.toISOString().split('T')[0];
        
        // Only allow selection of future dates
        if (currentDay >= today) {
            dayElement.classList.add('available');
            dayElement.dataset.date = dateStr;
            
            // Add availability indicator
            const indicator = document.createElement('div');
            indicator.className = 'availability-indicator';
            indicator.textContent = `${Math.floor(Math.random() * 6) + 3} slots`;
            dayElement.appendChild(indicator);
        }
        
        // Highlight today
        if (currentDay.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Highlight selected date
        if (selectedDate && dateStr === selectedDate) {
            dayElement.classList.add('selected');
        }
        
        calendar.appendChild(dayElement);
    }
}

function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer) return;
    
    // Clear existing time slots
    timeSlotsContainer.innerHTML = '';
    
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p style="text-align: center; color: #666;">Please select a date first</p>';
        return;
    }
    
    // Create time slots
    availableTimes.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot available';
        timeSlot.textContent = time;
        timeSlot.dataset.time = time;
        
        // Mark as selected if this is the selected time
        if (selectedTime === time) {
            timeSlot.classList.add('selected');
        }
        
        // Add click listener
        timeSlot.addEventListener('click', function() {
            // Remove selected class from all time slots
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('selected');
            });
            
            // Add selected class to this slot
            this.classList.add('selected');
            selectedTime = time;
            
            console.log('Selected time:', selectedTime);
            updateFormState();
        });
        
        timeSlotsContainer.appendChild(timeSlot);
    });
}

function updateSelectedDateInfo() {
    const selectedDateInfo = document.getElementById('selectedDateInfo');
    if (!selectedDateInfo) return;
    
    if (selectedDate) {
        const date = new Date(selectedDate);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = date.toLocaleDateString('en-US', options);
        
        selectedDateInfo.innerHTML = `
            <h3>Selected Date</h3>
            <p>${formattedDate}</p>
            <p>Please select a time slot below</p>
        `;
        selectedDateInfo.style.display = 'block';
    } else {
        selectedDateInfo.style.display = 'none';
    }
}

function updateFormState() {
    const form = document.querySelector('.reservation-form');
    const submitButton = document.getElementById('submitButton');
    
    if (!form || !submitButton) return;
    
    if (selectedDate && selectedTime) {
        form.classList.remove('form-disabled');
        submitButton.textContent = 'Confirm Reservation';
        submitButton.disabled = false;
    } else {
        form.classList.add('form-disabled');
        submitButton.textContent = 'Select Date & Time';
        submitButton.disabled = true;
    }
}

function setupEventListeners() {
    // Calendar navigation
    const prevButton = document.getElementById('prevMonth');
    const nextButton = document.getElementById('nextMonth');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
    
    // Date selection
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.addEventListener('click', function(e) {
            if (e.target.classList.contains('available') && e.target.dataset.date) {
                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Add selected class to clicked day
                e.target.classList.add('selected');
                selectedDate = e.target.dataset.date;
                selectedTime = null; // Reset time selection
                
                console.log('Selected date:', selectedDate);
                
                updateSelectedDateInfo();
                renderTimeSlots();
                updateFormState();
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReservationSubmit(e);
        });
    }
}

function handleReservationSubmit(event) {
    const formData = new FormData(event.target);
    const reservation = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        date: selectedDate,
        time: selectedTime,
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
    
    // Reset form and selections
    event.target.reset();
    selectedDate = null;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    updateSelectedDateInfo();
    updateFormState();
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