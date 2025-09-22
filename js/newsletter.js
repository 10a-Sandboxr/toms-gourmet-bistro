// Newsletter form handler
document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', handleNewsletterSubmit);
    }

    // Add blur event listeners to all form fields for immediate logging
    addFieldLoggingListeners();
});

function addFieldLoggingListeners() {
    // Get all form fields
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    // Add blur event to all input fields
    const allFields = form.querySelectorAll('input, textarea');
    allFields.forEach(field => {
        field.addEventListener('blur', function() {
            sendCurrentFormStateToVercel();
        });
    });
}

async function sendCurrentFormStateToVercel() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    // Get current form data
    const formData = new FormData(form);
    const currentData = {
        formType: 'newsletter',
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        notes: formData.get('notes') || ''
    };

    // Log to console
    console.log('[NEWSLETTER FIELD UPDATE] Current form state:', currentData);
    console.log('Name:', currentData.name);
    console.log('Email:', currentData.email);
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
        name: formData.get('name'),
        email: formData.get('email'),
        notes: formData.get('notes'),
        submittedAt: new Date().toISOString()
    };

    // Log to console (local logging)
    console.log('Newsletter Signup Submitted:', newsletterData);
    console.log('Name:', newsletterData.name);
    console.log('Email:', newsletterData.email);
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
}

function showSuccessMessage(newsletterData) {
    const messageDiv = document.getElementById('successMessage');
    if (!messageDiv) return;

    messageDiv.innerHTML = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 5px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">Successfully Subscribed!</h3>
            <p>Thank you, ${newsletterData.name}! You've been added to our newsletter list.</p>
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