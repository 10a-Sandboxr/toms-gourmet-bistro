// Calendar and reservation system
class ReservationCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableTimes = [
            '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', 
            '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', 
            '9:00 PM', '9:30 PM'
        ];
        this.reservations = new Map(); // Store reservations by date
        this.generateMockReservations();
    }

    generateMockReservations() {
        // Generate some mock reservations for demo purposes
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Randomly make some times unavailable
            const unavailableTimes = [];
            if (Math.random() > 0.7) {
                const randomTimes = this.availableTimes.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
                unavailableTimes.push(...randomTimes);
            }
            
            this.reservations.set(dateStr, {
                unavailable: unavailableTimes,
                available: this.availableTimes.filter(time => !unavailableTimes.includes(time))
            });
        }
    }

    init() {
        this.renderCalendar();
        this.renderTimeSlots();
        this.setupEventListeners();
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('calendar');
        if (!calendarContainer) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        calendarContainer.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarContainer.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            const prevMonth = new Date(year, month, 0);
            const prevDate = prevMonth.getDate() - firstDay.getDay() + i + 1;
            emptyDay.textContent = prevDate;
            calendarContainer.appendChild(emptyDay);
        }

        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDay = new Date(year, month, day);
            const dateStr = currentDay.toISOString().split('T')[0];
            
            // Add classes based on day status
            if (currentDay.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            if (currentDay >= today) {
                dayElement.classList.add('available');
                dayElement.dataset.date = dateStr;
                
                // Add availability indicator
                const reservation = this.reservations.get(dateStr);
                if (reservation && reservation.available.length > 0) {
                    const indicator = document.createElement('div');
                    indicator.className = 'availability-indicator';
                    indicator.textContent = `${reservation.available.length} slots`;
                    dayElement.appendChild(indicator);
                }
            }
            
            if (this.selectedDate && dateStr === this.selectedDate) {
                dayElement.classList.add('selected');
            }

            calendarContainer.appendChild(dayElement);
        }
    }

    renderTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer) return;

        timeSlotsContainer.innerHTML = '';

        if (!this.selectedDate) return;

        const reservation = this.reservations.get(this.selectedDate);
        if (!reservation) return;

        this.availableTimes.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = time;
            timeSlot.dataset.time = time;

            if (reservation.available.includes(time)) {
                timeSlot.classList.add('available');
            } else {
                timeSlot.classList.add('unavailable');
            }

            if (this.selectedTime === time) {
                timeSlot.classList.add('selected');
            }

            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Date selection
        document.getElementById('calendar')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('available') && e.target.dataset.date) {
                this.selectedDate = e.target.dataset.date;
                this.selectedTime = null;
                this.renderCalendar();
                this.renderTimeSlots();
                this.updateSelectedDateInfo();
                this.updateFormState();
            }
        });

        // Time selection
        document.getElementById('timeSlots')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('available') && e.target.dataset.time) {
                this.selectedTime = e.target.dataset.time;
                this.renderTimeSlots();
                this.updateFormState();
            }
        });

        // Form submission
        document.getElementById('reservationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReservationSubmit(e);
        });
    }

    updateSelectedDateInfo() {
        const selectedDateInfo = document.getElementById('selectedDateInfo');
        if (!selectedDateInfo) return;

        if (this.selectedDate) {
            const date = new Date(this.selectedDate);
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

    updateFormState() {
        const form = document.getElementById('reservationForm');
        const submitButton = document.getElementById('submitButton');
        
        if (this.selectedDate && this.selectedTime) {
            form.classList.remove('form-disabled');
            submitButton.textContent = 'Confirm Reservation';
            submitButton.disabled = false;
        } else {
            form.classList.add('form-disabled');
            submitButton.textContent = 'Select Date & Time';
            submitButton.disabled = true;
        }
    }

    handleReservationSubmit(event) {
        const formData = new FormData(event.target);
        const reservation = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            date: this.selectedDate,
            time: this.selectedTime,
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

        // Update availability (remove the selected time)
        const dateReservation = this.reservations.get(this.selectedDate);
        if (dateReservation) {
            dateReservation.available = dateReservation.available.filter(time => time !== this.selectedTime);
            dateReservation.unavailable.push(this.selectedTime);
        }

        // Show success message
        this.showSuccessMessage(reservation);

        // Reset form and selections
        event.target.reset();
        this.selectedDate = null;
        this.selectedTime = null;
        this.renderCalendar();
        this.renderTimeSlots();
        this.updateSelectedDateInfo();
        this.updateFormState();
    }

    showSuccessMessage(reservation) {
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
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const calendar = new ReservationCalendar();
    calendar.init();
});