/**
 * Smartesko Chat Widget
 * AI asistent pre SmartAir - klimatizácie a vzduchotechnika
 */

(function() {
    'use strict';

    const CONFIG = {
        apiEndpoint: 'https://api.smartair.space/chat',
        mascotImage: 'https://images.smartair.space/smartesko-avatar.png',
        companyName: 'SmartAir',
        assistantName: 'Smartesko',
        welcomeMessage: 'Ahoj! Som Smartesko, váš AI asistent. Pomôžem vám s klimatizáciami, tepelnými čerpadlami a vzduchotechnikou. Ako vám môžem pomôcť?',
        placeholder: 'Napíšte správu...',
        phone: '+421 915 033 440'
    };

    // Inject styles
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        #smartesko-widget-container * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        #smartesko-toggle {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            z-index: 99998;
            transition: transform 0.3s, box-shadow 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        #smartesko-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
        }

        #smartesko-toggle img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }

        #smartesko-toggle .close-icon {
            display: none;
            font-size: 28px;
            color: white;
        }

        #smartesko-toggle.open img {
            display: none;
        }

        #smartesko-toggle.open .close-icon {
            display: block;
        }

        #smartesko-chat {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 380px;
            height: 520px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            z-index: 99999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: smartesko-slide-up 0.3s ease;
        }

        #smartesko-chat.open {
            display: flex;
        }

        @keyframes smartesko-slide-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .smartesko-header {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .smartesko-header-avatar {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .smartesko-header-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .smartesko-header-info h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .smartesko-header-info span {
            font-size: 12px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .smartesko-header-info span::before {
            content: '';
            width: 8px;
            height: 8px;
            background: #4ade80;
            border-radius: 50%;
        }

        .smartesko-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #f8fafc;
        }

        .smartesko-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            animation: smartesko-fade-in 0.3s ease;
        }

        @keyframes smartesko-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .smartesko-message.bot {
            background: #ffffff;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .smartesko-message.user {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .smartesko-message.bot .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #3b82f6;
            font-size: 13px;
        }

        .smartesko-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: #ffffff;
            border-radius: 16px;
            align-self: flex-start;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .smartesko-typing span {
            width: 8px;
            height: 8px;
            background: #94a3b8;
            border-radius: 50%;
            animation: smartesko-bounce 1.4s infinite ease-in-out;
        }

        .smartesko-typing span:nth-child(1) { animation-delay: -0.32s; }
        .smartesko-typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes smartesko-bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }

        .smartesko-input-area {
            padding: 16px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .smartesko-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.3s;
        }

        .smartesko-input:focus {
            border-color: #3b82f6;
        }

        .smartesko-send {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }

        .smartesko-send:hover {
            transform: scale(1.05);
        }

        .smartesko-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .smartesko-send svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        .smartesko-quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 0 16px 16px;
            background: #f8fafc;
        }

        .smartesko-quick-btn {
            padding: 8px 14px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
        }

        .smartesko-quick-btn:hover {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }

        .smartesko-footer {
            padding: 8px 16px;
            background: #f1f5f9;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
        }

        .smartesko-footer a {
            color: #3b82f6;
            text-decoration: none;
        }

        @media (max-width: 480px) {
            #smartesko-chat {
                width: calc(100% - 32px);
                height: calc(100% - 140px);
                right: 16px;
                bottom: 90px;
            }

            #smartesko-toggle {
                right: 16px;
                bottom: 16px;
            }
        }
    `;

    // Create widget HTML
    function createWidget() {
        const container = document.createElement('div');
        container.id = 'smartesko-widget-container';

        container.innerHTML = `
            <style>${styles}</style>

            <button id="smartesko-toggle" aria-label="Otvoriť chat">
                <img src="${CONFIG.mascotImage}" alt="Smartesko" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span style="display:none; width:40px; height:40px; background:rgba(255,255,255,0.2); border-radius:50%; align-items:center; justify-content:center; font-size:20px;">🤖</span>
                <span class="close-icon">×</span>
            </button>

            <div id="smartesko-chat">
                <div class="smartesko-header">
                    <div class="smartesko-header-avatar">
                        <img src="${CONFIG.mascotImage}" alt="Smartesko" onerror="this.innerHTML='🤖';">
                    </div>
                    <div class="smartesko-header-info">
                        <h4>${CONFIG.assistantName}</h4>
                        <span>Online - tu pre vás</span>
                    </div>
                </div>

                <div class="smartesko-messages" id="smartesko-messages">
                    <div class="smartesko-message bot">
                        <div class="message-header">🤖 ${CONFIG.assistantName}</div>
                        ${CONFIG.welcomeMessage}
                    </div>
                </div>

                <div class="smartesko-quick-actions" id="smartesko-quick-actions">
                    <button class="smartesko-quick-btn" data-message="Aké klimatizácie ponúkate?">Klimatizácie</button>
                    <button class="smartesko-quick-btn" data-message="Koľko stojí montáž?">Cena montáže</button>
                    <button class="smartesko-quick-btn" data-message="Potrebujem servis klimatizácie">Servis</button>
                    <button class="smartesko-quick-btn" data-message="Chcem si objednať inštaláciu">Objednávka</button>
                </div>

                <div class="smartesko-input-area">
                    <input type="text" class="smartesko-input" id="smartesko-input" placeholder="${CONFIG.placeholder}">
                    <button class="smartesko-send" id="smartesko-send" aria-label="Odoslať">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>

                <div class="smartesko-footer">
                    Potrebujete rýchlu pomoc? Volajte <a href="tel:${CONFIG.phone}">${CONFIG.phone}</a>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        initializeWidget();
    }

    // Initialize widget functionality
    function initializeWidget() {
        const toggle = document.getElementById('smartesko-toggle');
        const chat = document.getElementById('smartesko-chat');
        const input = document.getElementById('smartesko-input');
        const sendBtn = document.getElementById('smartesko-send');
        const messages = document.getElementById('smartesko-messages');
        const quickActions = document.getElementById('smartesko-quick-actions');

        let conversationHistory = [];

        // Toggle chat
        toggle.addEventListener('click', () => {
            const isOpen = chat.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            if (isOpen) {
                input.focus();
            }
        });

        // Send message
        async function sendMessage(text) {
            if (!text.trim()) return;

            // Hide quick actions after first message
            quickActions.style.display = 'none';

            // Add user message
            addMessage(text, 'user');
            input.value = '';
            sendBtn.disabled = true;

            // Show typing indicator
            const typingId = showTyping();

            try {
                const response = await fetch(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history: conversationHistory
                    })
                });

                const data = await response.json();
                removeTyping(typingId);

                if (data.response) {
                    addMessage(data.response, 'bot');
                    conversationHistory.push(
                        { role: 'user', content: text },
                        { role: 'assistant', content: data.response }
                    );
                } else {
                    addMessage('Prepáčte, niečo sa pokazilo. Skúste to znova alebo nás kontaktujte na ' + CONFIG.phone, 'bot');
                }
            } catch (error) {
                removeTyping(typingId);
                // Fallback response when API is not available
                const fallbackResponse = getFallbackResponse(text);
                addMessage(fallbackResponse, 'bot');
            }

            sendBtn.disabled = false;
        }

        // Fallback responses when API is unavailable
        function getFallbackResponse(text) {
            const lowerText = text.toLowerCase();

            if (lowerText.includes('cena') || lowerText.includes('kolko') || lowerText.includes('stoj')) {
                return `Ceny sa líšia podľa typu zariadenia a náročnosti montáže. Pre presnú cenovú ponuku nás kontaktujte na ${CONFIG.phone} alebo využite náš online formulár na webe.`;
            }
            if (lowerText.includes('klimatiz') || lowerText.includes('klima')) {
                return 'Ponúkame klimatizácie od značiek Daikin, Samsung, Midea, Vivax, Inventor a TCL. Zabezpečujeme profesionálnu montáž vrátane záruky. Ktorá značka vás zaujíma?';
            }
            if (lowerText.includes('tepeln') || lowerText.includes('cerpadl')) {
                return 'Tepelné čerpadlá sú skvelé riešenie pre úsporu energie. Ponúkame návrh, montáž aj servis. Chcete sa dozvedieť viac o možnostiach pre váš dom?';
            }
            if (lowerText.includes('servis') || lowerText.includes('oprav')) {
                return `Poskytujeme záručný aj pozáručný servis s diagnostikou. Pre objednanie servisu volajte ${CONFIG.phone} alebo využite online rezerváciu.`;
            }
            if (lowerText.includes('kontakt') || lowerText.includes('telefon') || lowerText.includes('volat')) {
                return `Môžete nás kontaktovať na ${CONFIG.phone}. Sme tu pre vás v pracovných dňoch od 8:00 do 18:00.`;
            }
            if (lowerText.includes('objedna') || lowerText.includes('install') || lowerText.includes('montaz')) {
                return `Pre objednanie montáže využite náš online formulár na webe alebo volajte ${CONFIG.phone}. Montáž je možná už do 48 hodín!`;
            }

            return `Ďakujem za vašu správu! Pre podrobnejšie informácie nás kontaktujte na ${CONFIG.phone} alebo využite kontaktný formulár na našej stránke. Radi vám pomôžeme s akýmikoľvek otázkami o klimatizáciách a vzduchotechnike.`;
        }

        // Add message to chat
        function addMessage(text, type) {
            const div = document.createElement('div');
            div.className = `smartesko-message ${type}`;

            if (type === 'bot') {
                div.innerHTML = `<div class="message-header">🤖 ${CONFIG.assistantName}</div>${text}`;
            } else {
                div.textContent = text;
            }

            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        // Show typing indicator
        function showTyping() {
            const id = 'typing-' + Date.now();
            const div = document.createElement('div');
            div.id = id;
            div.className = 'smartesko-typing';
            div.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            return id;
        }

        // Remove typing indicator
        function removeTyping(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        // Event listeners
        sendBtn.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(input.value);
        });

        // Quick action buttons
        quickActions.querySelectorAll('.smartesko-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sendMessage(btn.dataset.message);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
