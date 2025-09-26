export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const chatData = req.body;
            const timestamp = new Date().toISOString();
            const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

            // Log chat interaction
            console.log('========== CHATBOT INTERACTION ==========');
            console.log('Timestamp:', timestamp);
            console.log('Session ID:', chatData.sessionId || 'unknown');
            console.log('IP Address:', ipAddress);
            console.log('User Agent:', chatData.userAgent || 'unknown');
            console.log('Page:', chatData.page || 'unknown');
            console.log('Sender:', chatData.sender || 'unknown');
            console.log('Message:', chatData.message || '');

            // Track conversation flow
            if (chatData.sender === 'user') {
                console.log('--- USER INPUT ---');
                console.log('User typed:', chatData.message);

                // Analyze user intent
                const lowerMessage = (chatData.message || '').toLowerCase();
                const intents = [];

                if (lowerMessage.includes('reservation') || lowerMessage.includes('book')) {
                    intents.push('RESERVATION_INTENT');
                }
                if (lowerMessage.includes('menu') || lowerMessage.includes('food')) {
                    intents.push('MENU_INTENT');
                }
                if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
                    intents.push('HOURS_INTENT');
                }
                if (lowerMessage.includes('diet') || lowerMessage.includes('vegan') || lowerMessage.includes('vegetarian') || lowerMessage.includes('gluten')) {
                    intents.push('DIETARY_INTENT');
                }
                if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
                    intents.push('PRICING_INTENT');
                }
                if (lowerMessage.includes('event') || lowerMessage.includes('party') || lowerMessage.includes('private')) {
                    intents.push('EVENT_INTENT');
                }

                if (intents.length > 0) {
                    console.log('Detected intents:', intents.join(', '));
                }

                // Check for potential personal information
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                const phoneRegex = /(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{10})/;

                if (emailRegex.test(chatData.message)) {
                    console.log('⚠️  Email address detected in message');
                }
                if (phoneRegex.test(chatData.message)) {
                    console.log('⚠️  Phone number detected in message');
                }
            } else if (chatData.sender === 'bot') {
                console.log('--- BOT RESPONSE ---');
                console.log('Bot replied:', chatData.message ? chatData.message.substring(0, 100) + '...' : '');
            } else if (chatData.sender === 'system') {
                console.log('--- SYSTEM EVENT ---');
                console.log('Event:', chatData.message);
            }

            console.log('========================================\n');

            // Store structured log for analytics
            const logEntry = {
                timestamp,
                sessionId: chatData.sessionId,
                ipAddress,
                userAgent: chatData.userAgent,
                sender: chatData.sender,
                message: chatData.message,
                messageLength: chatData.message ? chatData.message.length : 0,
                conversationTime: chatData.timestamp
            };

            // Log as JSON for easier parsing
            console.log('STRUCTURED_LOG:', JSON.stringify(logEntry));

            // Track session statistics
            if (chatData.sender === 'user') {
                console.log('SESSION_STATS:', JSON.stringify({
                    sessionId: chatData.sessionId,
                    userMessageCount: 1, // Would need to track this properly in production
                    timestamp
                }));
            }

            // Send success response
            res.status(200).json({
                success: true,
                message: 'Chat interaction logged successfully',
                timestamp,
                sessionId: chatData.sessionId
            });

        } catch (error) {
            console.error('ERROR processing chat log:', error);
            console.error('Error stack:', error.stack);
            console.error('Request body:', JSON.stringify(req.body));

            res.status(500).json({
                success: false,
                error: 'Failed to log chat interaction',
                details: error.message
            });
        }
    } else if (req.method === 'GET') {
        // Helpful message for GET requests
        res.status(200).json({
            service: 'Chatbot Logger',
            status: 'operational',
            message: 'This endpoint logs chatbot interactions',
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed`
        });
    }
}