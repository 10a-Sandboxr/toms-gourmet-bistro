// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    // Preloaded bot responses
    const botResponses = {
        // Greetings
        'hello': "Hello! Welcome to Tom's Gourmet Bistro. How can I assist you today?",
        'hi': "Hi there! I'm here to help with any questions about our restaurant. What would you like to know?",
        'good morning': "Good morning! Thank you for contacting Tom's Gourmet Bistro. How may I help you today?",
        'good afternoon': "Good afternoon! Welcome to Tom's Gourmet Bistro. What can I do for you?",
        'good evening': "Good evening! I'm here to assist with your dining needs. How can I help?",

        // Reservations
        'reservation': "I'd be happy to help with your reservation! You can make a reservation online at our reservations page, or call us at (415) 302-6027. What date were you thinking?",
        'make a reservation': "Great! To make a reservation, please visit our reservations page or call us at (415) 302-6027. We accept reservations up to 30 days in advance.",
        'book a table': "I can help you book a table! Please visit our reservations page or call (415) 302-6027. Our team will be happy to find the perfect table for you.",
        'availability': "To check availability, please visit our reservations page or call us directly at (415) 302-6027. We typically have openings throughout the week.",
        'cancel reservation': "To cancel or modify your reservation, please call us at (415) 302-6027. We appreciate at least 24 hours notice for cancellations.",

        // Menu
        'menu': "Our menu features contemporary French-American cuisine with seasonal ingredients. You can view our full menu on the Menu page. We offer appetizers, entrees, desserts, and an extensive wine list.",
        'view menu': "You can view our complete menu on our Menu page. We feature seasonal dishes that change regularly to ensure the freshest ingredients.",
        'specials': "Our chef creates daily specials based on the freshest seasonal ingredients. Please ask your server or call us at (415) 302-6027 for today's specials.",
        'wine list': "We have an extensive wine list featuring both local California wines and international selections. Our sommelier can help pair wines with your meal.",
        'dessert': "Our dessert menu changes seasonally and features house-made pastries and confections. Current favorites include our chocolate soufflé and crème brûlée.",

        // Dietary
        'vegetarian': "Yes! We offer several vegetarian options on our menu. Our chef can also modify many dishes to be vegetarian. Please inform your server of your preferences.",
        'vegan': "We have vegan options available! Our chef can prepare several dishes vegan-style. Please let us know when making your reservation or inform your server.",
        'gluten free': "We accommodate gluten-free diets! Several menu items are naturally gluten-free, and our chef can modify others. Please inform us of any allergies.",
        'allergies': "We take allergies very seriously. Please inform us of any food allergies when making your reservation or tell your server immediately upon arrival.",
        'special dietary': "We're happy to accommodate special dietary needs! Please let us know your requirements when booking or speak with your server.",
        'dietary': "We accommodate various dietary restrictions including vegetarian, vegan, gluten-free, and more. Please inform us of your needs when making a reservation.",

        // Hours & Location
        'hours': "We're open Tuesday-Saturday from 5:00 PM to 10:00 PM, and Sunday from 5:00 PM to 9:00 PM. We're closed on Mondays.",
        'location': "We're located at 707 Montgomery Street, San Francisco, CA. We're in the Financial District, easily accessible by public transportation.",
        'address': "Our address is 707 Montgomery Street, San Francisco, CA 94111. We're in the heart of the Financial District.",
        'directions': "We're at 707 Montgomery Street in San Francisco's Financial District. Nearby landmarks include the Transamerica Pyramid. Valet parking is available.",
        'parking': "We offer valet parking for $15. Street parking is also available, and we're close to several public parking garages.",
        'phone': "You can reach us at (415) 302-6027. We're happy to answer any questions or help with reservations.",

        // Events
        'private dining': "We offer private dining for groups of 10-50 guests. Our private dining room provides an intimate setting for special occasions. Please call (415) 302-6027 for details.",
        'events': "We host private events including corporate dinners, celebrations, and wine tastings. Contact us at (415) 302-6027 to discuss your event.",
        'party': "Planning a party? We offer private dining options and can customize menus for your special occasion. Call us at (415) 302-6027.",
        'birthday': "We'd love to help celebrate your birthday! Let us know when making your reservation, and we'll make it special. We can arrange for a special dessert.",
        'anniversary': "Celebrating an anniversary? Please mention it when booking. We'll ensure you have a romantic table and can arrange special touches.",

        // Chef
        'chef': "Our Executive Chef Tom Volkov O'Sullivan brings a unique fusion of Eastern European and Irish culinary traditions with classical French training.",
        'tom volkov': "Chef Tom Volkov O'Sullivan is our Executive Chef, known for his innovative approach combining his multicultural heritage with French cuisine.",

        // Dress Code
        'dress code': "Our dress code is smart casual. We recommend business casual or elegant attire. Jackets are appreciated but not required.",
        'what to wear': "Smart casual attire is perfect for our restaurant. Many guests wear business casual or dressy casual outfits.",

        // Price
        'price': "Our entrees range from $32 to $58. Appetizers are $14-$22, and desserts are $12-$16. We offer a prix fixe menu for $85 per person.",
        'cost': "Expect to spend about $75-$100 per person for a full dining experience including appetizers, entrees, and wine.",
        'expensive': "We're a fine dining establishment offering exceptional value for the quality of ingredients and preparation. Our prix fixe menu at $85 offers excellent value.",

        // Default
        'default': "I'm not sure I understand that question. Could you please rephrase it? You can ask me about reservations, our menu, hours, dietary options, or special events."
    };

    // Initialize with welcome message (already in HTML)

    // Handle form submission
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }

    // Handle quick reply buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-reply-btn')) {
            const message = e.target.getAttribute('data-message');
            chatInput.value = message;
            handleChatSubmit(new Event('submit'));
        }
    });

    async function handleChatSubmit(event) {
        event.preventDefault();

        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        chatInput.value = '';

        // Log to serverless function
        await logChatMessage(message, 'user');

        // Show typing indicator
        showTyping();

        // Simulate delay for more natural feel
        setTimeout(async () => {
            removeTyping();

            // Get bot response
            const botResponse = getBotResponse(message);
            addMessage(botResponse, 'bot');

            // Log bot response
            await logChatMessage(botResponse, 'bot');

            // Add quick replies for certain responses
            if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                addQuickReplies(['View menu', 'Make a reservation', 'Hours & location']);
            }
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }

    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Check for keyword matches
        for (const [keyword, response] of Object.entries(botResponses)) {
            if (keyword !== 'default' && lowerMessage.includes(keyword)) {
                return response;
            }
        }

        // Return default response if no match
        return botResponses.default;
    }

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';
        const p = document.createElement('p');
        p.textContent = message;
        content.appendChild(p);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addQuickReplies(replies) {
        const lastBotMessage = chatMessages.querySelector('.bot-message:last-child .message-content');
        if (!lastBotMessage) return;

        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';

        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.setAttribute('data-message', reply);
            button.textContent = reply;
            quickRepliesDiv.appendChild(button);
        });

        lastBotMessage.appendChild(quickRepliesDiv);
    }

    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const typingMessage = chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    async function logChatMessage(message, sender) {
        try {
            const response = await fetch('/api/chatbot/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sender: sender,
                    timestamp: new Date().toISOString(),
                    sessionId: getSessionId(),
                    userAgent: navigator.userAgent,
                    page: 'aichatbot.html'
                })
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`✅ Chat message logged: ${sender} - "${message}"`);
            } else {
                console.error('❌ Failed to log chat message:', result);
            }
        } catch (error) {
            console.error('❌ Error logging chat message:', error);
        }
    }

    function getSessionId() {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatSessionId', sessionId);
        }
        return sessionId;
    }

    // Log page visit
    logChatMessage('User opened AI chatbot', 'system');
});