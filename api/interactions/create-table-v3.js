// Simple endpoint to create interaction logs table v3 (viewport injection attack)
// Visit: https://your-vercel-url.com/api/interactions/create-table-v3

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Create interaction logs table v3 for detailed field interaction tracking
        await sql`
            CREATE TABLE IF NOT EXISTS interaction_logs_v3 (
                id SERIAL PRIMARY KEY,

                -- Session and field identification
                session_id VARCHAR(100) NOT NULL,
                field_name VARCHAR(100) NOT NULL,
                action VARCHAR(50) NOT NULL, -- focus, blur, input, change, paste, keydown-tab, etc.

                -- Value tracking
                value_length INTEGER DEFAULT 0,
                has_value BOOLEAN DEFAULT FALSE,

                -- Timing analysis
                interaction_timestamp TIMESTAMP NOT NULL,
                time_iso VARCHAR(30),
                time_since_page_load BIGINT DEFAULT 0,
                time_since_injection BIGINT,

                -- Position tracking
                viewport_position INTEGER DEFAULT 0,
                element_position INTEGER,
                sequence_number INTEGER DEFAULT 0,

                -- Environment data
                user_agent TEXT,
                ip_address INET,

                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Create indexes for performance and analysis
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_session ON interaction_logs_v3(session_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_field ON interaction_logs_v3(field_name);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_action ON interaction_logs_v3(action);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_timestamp ON interaction_logs_v3(interaction_timestamp);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_sequence ON interaction_logs_v3(sequence_number);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_interaction_v3_created ON interaction_logs_v3(created_at);`;

        res.status(200).json({
            success: true,
            message: 'Interaction logs database table v3 created successfully',
            table: 'interaction_logs_v3',
            purpose: 'Comprehensive field interaction tracking for viewport injection attack',
            attack_type: 'Viewport Injection - Interaction Analysis',
            endpoints: {
                log: '/api/interactions/log-v3',
                view: '/api/interactions/view-v3'
            },
            columns: {
                identification: ['session_id', 'field_name', 'action'],
                value_tracking: ['value_length', 'has_value'],
                timing_analysis: ['interaction_timestamp', 'time_iso', 'time_since_page_load', 'time_since_injection'],
                position_tracking: ['viewport_position', 'element_position', 'sequence_number'],
                environment: ['user_agent', 'ip_address'],
                metadata: ['created_at']
            },
            interaction_types: [
                'focus', 'blur', 'input', 'change', 'paste',
                'keydown-tab', 'keydown-enter', 'keydown-escape',
                'keydown-arrowup', 'keydown-arrowdown'
            ]
        });

    } catch (error) {
        console.error('Interaction table v3 creation error:', error);
        res.status(500).json({
            error: 'Failed to create interaction logs table v3',
            details: error.message
        });
    }
}