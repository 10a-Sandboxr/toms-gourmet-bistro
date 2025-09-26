// Vercel Serverless Function to view interaction logs v3
// Endpoint: /api/interactions/view-v3

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to Neon database
        const sql = neon(process.env.subscription_form_DATABASE_URL);

        // Get query parameters for filtering
        const {
            limit = 100,
            session_id,
            field_name,
            action,
            with_timing = 'false',
            summary_only = 'false'
        } = req.query;

        let result;

        if (summary_only === 'true') {
            // Get summary statistics
            result = await sql`
                SELECT
                    COUNT(*) as total_interactions,
                    COUNT(DISTINCT session_id) as unique_sessions,
                    COUNT(DISTINCT field_name) as fields_interacted,
                    AVG(value_length) as avg_value_length,
                    AVG(time_since_injection) FILTER (WHERE time_since_injection IS NOT NULL) as avg_time_since_injection,
                    action,
                    COUNT(*) as action_count
                FROM interaction_logs_v3
                GROUP BY action
                ORDER BY action_count DESC;
            `;
        } else {
            // Build dynamic query based on filters
            let whereConditions = [];
            let parameters = [];

            if (session_id) {
                whereConditions.push('session_id = $' + (parameters.length + 1));
                parameters.push(session_id);
            }
            if (field_name) {
                whereConditions.push('field_name = $' + (parameters.length + 1));
                parameters.push(field_name);
            }
            if (action) {
                whereConditions.push('action = $' + (parameters.length + 1));
                parameters.push(action);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
            const limitClause = `LIMIT ${parseInt(limit)}`;

            if (with_timing === 'true') {
                result = await sql`
                    SELECT
                        id,
                        session_id,
                        field_name,
                        action,
                        value_length,
                        has_value,
                        interaction_timestamp,
                        time_iso,
                        time_since_page_load,
                        time_since_injection,
                        viewport_position,
                        element_position,
                        sequence_number,
                        user_agent,
                        ip_address,
                        created_at
                    FROM interaction_logs_v3
                    ${whereClause}
                    ORDER BY interaction_timestamp DESC, sequence_number ASC
                    ${limitClause}
                `.execute(parameters);
            } else {
                result = await sql`
                    SELECT
                        id,
                        session_id,
                        field_name,
                        action,
                        value_length,
                        has_value,
                        sequence_number,
                        interaction_timestamp,
                        created_at
                    FROM interaction_logs_v3
                    ${whereClause}
                    ORDER BY interaction_timestamp DESC, sequence_number ASC
                    ${limitClause}
                `.execute(parameters);
            }
        }

        // Calculate basic statistics
        const stats = {
            total_records: result.length,
            unique_sessions: [...new Set(result.map(r => r.session_id))].length,
            fields_tracked: [...new Set(result.map(r => r.field_name))].length,
            action_breakdown: result.reduce((acc, r) => {
                acc[r.action] = (acc[r.action] || 0) + 1;
                return acc;
            }, {}),
            with_values: result.filter(r => r.has_value).length,
            average_sequence: result.length > 0 ?
                result.reduce((sum, r) => sum + (r.sequence_number || 0), 0) / result.length : 0
        };

        res.status(200).json({
            success: true,
            message: 'Interaction logs v3 retrieved successfully',
            attack_type: 'viewport-injection-interactions',
            statistics: stats,
            data: result,
            table: 'interaction_logs_v3',
            filters_applied: {
                session_id: session_id || 'all',
                field_name: field_name || 'all',
                action: action || 'all',
                with_timing: with_timing === 'true',
                summary_only: summary_only === 'true',
                limit: parseInt(limit)
            },
            note: 'Comprehensive field interaction tracking for viewport injection attack analysis'
        });

    } catch (error) {
        console.error('Failed to retrieve interaction logs v3:', error);
        res.status(500).json({
            error: 'Failed to retrieve interaction logs v3',
            details: error.message,
            attack_type: 'viewport-injection-interactions'
        });
    }
}