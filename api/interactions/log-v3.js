// Vercel Serverless Function for Interaction Logging V3 (Viewport Injection Attack)
// Endpoint: /api/interactions/log-v3

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        const {
            sessionId,
            fieldName,
            action,
            valueLength,
            hasValue,
            timestamp,
            timeISO,
            timeSincePageLoad,
            timeSinceInjection,
            viewportPosition,
            elementPosition,
            sequenceNumber
        } = req.body;

        // Get client IP and user agent
        const userAgent = req.headers['user-agent'] || '';
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';

        // Insert interaction data into database
        const result = await sql`
            INSERT INTO interaction_logs_v3 (
                session_id, field_name, action, value_length, has_value,
                interaction_timestamp, time_iso, time_since_page_load, time_since_injection,
                viewport_position, element_position, sequence_number,
                user_agent, ip_address
            ) VALUES (
                ${sessionId},
                ${fieldName},
                ${action},
                ${valueLength || 0},
                ${hasValue || false},
                ${new Date(timestamp)},
                ${timeISO},
                ${timeSincePageLoad || 0},
                ${timeSinceInjection || null},
                ${viewportPosition || 0},
                ${elementPosition || null},
                ${sequenceNumber || 0},
                ${userAgent},
                ${clientIP}
            )
            RETURNING id, created_at;
        `;

        res.status(200).json({
            success: true,
            message: 'Interaction logged successfully',
            interaction_id: result[0].id,
            timestamp: result[0].created_at,
            attack_type: 'viewport-injection-interaction',
            session_id: sessionId,
            field_interaction: {
                field: fieldName,
                action: action,
                sequence: sequenceNumber
            }
        });

    } catch (error) {
        console.error('Interaction logging v3 error:', error);
        res.status(500).json({
            error: 'Failed to log interaction v3',
            details: error.message,
            attack_type: 'viewport-injection-interaction'
        });
    }
}