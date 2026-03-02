/**
 * Dreamairko Chat Widget
 * AI sprievodca pre Dream Air zákaznícky konfigurátor
 */

(function() {
    'use strict';

    const CONFIG = {
        apiEndpoint: 'https://api.smartair.space/chat',
        mascotImage: 'https://images.smartair.space/smartesko-avatar.png',
        companyName: 'Dream Air',
        assistantName: 'Dreamairko (Drímerko)',
        welcomeMessage: 'Ahoj! Som Dreamairko (hovorovo Drímerko), AI sprievodca Dream Air. Pomôžem vám vybrať správnu klimatizáciu, porovnať modely a orientačne prepočítať montáž. Môžeme začať krokovým sprievodcom?',
        placeholder: 'Napíšte otázku alebo odpoveď... ',
        phone: '+421 915 033 440',
        voiceEnabledByDefault: true,
    };

    const GUIDED_QUESTIONS = [
        { key: 'propertyType', question: 'Krok 1: Typ nehnuteľnosti? (byt / dom / hala / kancelária / iné)' },
        { key: 'roomsCount', question: 'Krok 2: Koľko miestností chcete riešiť klimatizáciou?' },
        { key: 'roomArea', question: 'Krok 3: Aká je plocha hlavnej miestnosti v m²?' },
        { key: 'roomHeight', question: 'Krok 4: Aká je výška stropu v metroch? (pre m³ výpočet)' },
        { key: 'systemType', question: 'Krok 5: Preferujete split alebo multisplit riešenie?' },
        { key: 'brandPreference', question: 'Krok 6: Máte preferenciu značky? (Daikin, Samsung, Midea, TCL, GREE, AUX...)' },
        { key: 'noisePriority', question: 'Krok 7: Je pre vás dôležitejšia tichosť, úspora, smart funkcie alebo filtrácia?' },
        { key: 'powerPhase', question: 'Krok 8: Elektrické napájanie je 230V alebo 400V?' },
        { key: 'connectionLength', question: 'Krok 9: Približná dĺžka napojenia trasy v metroch?' },
        { key: 'extraRouteMeters', question: 'Krok 10: Koľko metrov trasy je nad štandard 3 m?' },
        { key: 'extraPenetrations', question: 'Krok 11: Koľko je dodatočných prierazov (2. a ďalší)?' },
        { key: 'wallMaterial', question: 'Krok 12: Materiál prierazu? (drevo / betón / železobetón / porfix-ytong / plná tehla / dierovaná tehla)' },
        { key: 'drillingMeters', question: 'Krok 13: Potrebné drážkovanie/sekanie? Ak áno, koľko bm?' },
        { key: 'condensateMode', question: 'Krok 14: Odvod kondenzu bude bez čerpadla alebo s čerpadlom?' },
        { key: 'difficultAccess', question: 'Krok 15: Je montáž v zhoršenom prístupe alebo vo výške?' },
    ];

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

        #smartesko-toggle .close-icon { display: none; font-size: 28px; color: white; }
        #smartesko-toggle.open img { display: none; }
        #smartesko-toggle.open .close-icon { display: block; }

        #smartesko-chat {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 400px;
            height: 560px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
            z-index: 99999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: smartesko-slide-up 0.3s ease;
        }

        #smartesko-chat.open { display: flex; }

        @keyframes smartesko-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .smartesko-header {
            background: linear-gradient(135deg, #0d3c66 0%, #0a4b7a 100%);
            color: white;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .smartesko-header-main { display: flex; align-items: center; gap: 12px; }

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

        .smartesko-header-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .smartesko-header-info h4 { margin: 0; font-size: 16px; font-weight: 600; }
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

        .smartesko-tools { display: flex; gap: 8px; }
        .smartesko-tool-btn {
            border: 1px solid rgba(255,255,255,0.4);
            color: #fff;
            background: rgba(255,255,255,0.12);
            border-radius: 10px;
            font-size: 12px;
            padding: 7px 10px;
            cursor: pointer;
        }

        .smartesko-tool-btn.active { background: rgba(255,255,255,0.26); }

        .smartesko-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: linear-gradient(180deg, #f8fbff 0%, #f2f7fc 100%);
        }

        .smartesko-message {
            max-width: 88%;
            padding: 12px 14px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.5;
            animation: smartesko-fade-in 0.3s ease;
            white-space: pre-wrap;
        }

        @keyframes smartesko-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .smartesko-message.bot {
            background: #ffffff;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
            border: 1px solid #e4edf8;
        }

        .smartesko-message.user {
            background: linear-gradient(135deg, #2f80ff 0%, #00bdeb 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }

        .smartesko-message.bot .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            font-weight: 600;
            color: #1f4f8c;
            font-size: 12px;
        }

        .smartesko-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: #ffffff;
            border-radius: 16px;
            align-self: flex-start;
            border: 1px solid #e4edf8;
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
        @keyframes smartesko-bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

        .smartesko-input-area {
            padding: 14px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .smartesko-input {
            flex: 1;
            padding: 11px 14px;
            border: 1px solid #d7e2ef;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
        }

        .smartesko-input:focus { border-color: #2f80ff; }

        .smartesko-send {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2f80ff 0%, #00bdeb 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .smartesko-send:disabled { opacity: 0.55; cursor: not-allowed; }
        .smartesko-send svg { width: 20px; height: 20px; fill: #fff; }

        .smartesko-quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 0 14px 14px;
            background: #f8fbff;
        }

        .smartesko-quick-btn {
            padding: 8px 12px;
            background: #ffffff;
            border: 1px solid #d7e2ef;
            border-radius: 18px;
            font-size: 12px;
            cursor: pointer;
            color: #33517a;
        }

        .smartesko-quick-btn:hover {
            background: #2f80ff;
            color: #fff;
            border-color: #2f80ff;
        }

        .smartesko-footer {
            padding: 7px 16px;
            background: #eef4fb;
            text-align: center;
            font-size: 11px;
            color: #6b7d97;
        }

        .smartesko-footer a { color: #2f80ff; text-decoration: none; }

        @media (max-width: 480px) {
            #smartesko-chat {
                width: calc(100% - 24px);
                height: calc(100% - 130px);
                right: 12px;
                bottom: 84px;
            }

            #smartesko-toggle { right: 12px; bottom: 12px; }
            .smartesko-header { padding: 12px; }
        }
    `;

    function createWidget() {
        const container = document.createElement('div');
        container.id = 'smartesko-widget-container';

        container.innerHTML = `
            <style>${styles}</style>

            <button id="smartesko-toggle" aria-label="Otvoriť chat">
                <img src="${CONFIG.mascotImage}" alt="Dreamairko" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span style="display:none; width:40px; height:40px; background:rgba(255,255,255,0.2); border-radius:50%; align-items:center; justify-content:center; font-size:20px;">🤖</span>
                <span class="close-icon">×</span>
            </button>

            <div id="smartesko-chat">
                <div class="smartesko-header">
                    <div class="smartesko-header-main">
                        <div class="smartesko-header-avatar">
                            <img src="${CONFIG.mascotImage}" alt="Dreamairko" onerror="this.innerHTML='🤖';">
                        </div>
                        <div class="smartesko-header-info">
                            <h4>${CONFIG.assistantName}</h4>
                            <span>AI sprievodca konfigurátorom</span>
                        </div>
                    </div>
                    <div class="smartesko-tools">
                        <button id="smartesko-voice" class="smartesko-tool-btn" title="Zapnúť / vypnúť čítanie nahlas">🔊</button>
                        <button id="smartesko-guide" class="smartesko-tool-btn" title="Spustiť krokový sprievodca">Sprievodca</button>
                    </div>
                </div>

                <div class="smartesko-messages" id="smartesko-messages">
                    <div class="smartesko-message bot">
                        <div class="message-header">🤖 ${CONFIG.assistantName}</div>
                        ${CONFIG.welcomeMessage}
                    </div>
                </div>

                <div class="smartesko-quick-actions" id="smartesko-quick-actions">
                    <button class="smartesko-quick-btn" data-message="Spustiť AI sprievodcu konfigurátorom">Spustiť AI sprievodcu</button>
                    <button class="smartesko-quick-btn" data-message="Porovnaj mi prosím Daikin, Samsung a GREE podľa tichosti a ceny.">Porovnať značky</button>
                    <button class="smartesko-quick-btn" data-message="Ako sa počíta orientačná cena montáže nad štandard 350 €?">Cena montáže</button>
                    <button class="smartesko-quick-btn" data-message="Odporuč mi model podľa miestnosti a rozpočtu.">Odporučiť model</button>
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

    function initializeWidget() {
        const toggle = document.getElementById('smartesko-toggle');
        const chat = document.getElementById('smartesko-chat');
        const input = document.getElementById('smartesko-input');
        const sendBtn = document.getElementById('smartesko-send');
        const messages = document.getElementById('smartesko-messages');
        const quickActions = document.getElementById('smartesko-quick-actions');
        const voiceBtn = document.getElementById('smartesko-voice');
        const guideBtn = document.getElementById('smartesko-guide');

        let conversationHistory = [];
        let voiceEnabled = CONFIG.voiceEnabledByDefault;
        let guidedMode = {
            active: false,
            currentIndex: 0,
            answers: {},
        };

        updateVoiceButton();

        toggle.addEventListener('click', () => {
            const isOpen = chat.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            if (isOpen) input.focus();
        });

        voiceBtn.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            updateVoiceButton();
            if (!voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
        });

        guideBtn.addEventListener('click', () => {
            startGuidedMode();
        });

        function updateVoiceButton() {
            voiceBtn.classList.toggle('active', voiceEnabled);
            voiceBtn.textContent = voiceEnabled ? '🔊' : '🔇';
        }

        function speakText(text) {
            if (!voiceEnabled || !window.speechSynthesis) return;
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ' '));
                utterance.lang = 'sk-SK';
                utterance.rate = 1.02;
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            } catch (_) {
                // noop
            }
        }

        function startGuidedMode() {
            guidedMode = { active: true, currentIndex: 0, answers: {} };
            quickActions.style.display = 'none';
            const intro = 'Spúšťam AI sprievodcu Dreamairko (Drímerko) podľa obhliadkového tlačiva. Prejdeme všetky potrebné otázky pre predbežný a orientačný odhad ceny montáže aj výber zariadenia.';
            addMessage(intro, 'bot', true);
            askGuidedQuestion();
        }

        function askGuidedQuestion() {
            const question = GUIDED_QUESTIONS[guidedMode.currentIndex];
            if (!question) {
                finishGuidedMode();
                return;
            }
            addMessage(question.question, 'bot', true);
        }


        function parseNumber(value) {
            const normalized = String(value || '').replace(',', '.');
            const match = normalized.match(/-?\d+(?:\.\d+)?/);
            return match ? Number(match[0]) : 0;
        }

        function includesAny(value, terms) {
            const source = String(value || '').toLowerCase();
            return terms.some(term => source.includes(term));
        }

        function calculateExtraEstimate(answers) {
            let total = 0;
            const breakdown = [];

            const extraRoute = Math.max(0, parseNumber(answers.extraRouteMeters));
            if (extraRoute > 0) {
                const cost = extraRoute * 30;
                total += cost;
                breakdown.push(`Trasa nad 3 m (${extraRoute} bm × 30 €): ${cost.toFixed(0)} €`);
            }

            const extraPenetrations = Math.max(0, parseNumber(answers.extraPenetrations));
            if (extraPenetrations > 0) {
                const cost = extraPenetrations * 69;
                total += cost;
                breakdown.push(`Dodatočné prierazy (${extraPenetrations} × 69 €): ${cost.toFixed(0)} €`);
            }

            const drillingMeters = Math.max(0, parseNumber(answers.drillingMeters));
            const wallMaterial = String(answers.wallMaterial || '').toLowerCase();
            if (drillingMeters > 0) {
                const rate = includesAny(wallMaterial, ['betón', 'zelezobeton', 'železobetón']) ? 109 : 59;
                const cost = drillingMeters * rate;
                total += cost;
                breakdown.push(`Drážkovanie (${drillingMeters} bm × ${rate} €): ${cost.toFixed(0)} €`);
            }

            if (includesAny(answers.wallMaterial, ['betón', 'panel', 'železobetón', 'zelezobeton']) && extraPenetrations > 0) {
                const cost = extraPenetrations * 99;
                total += cost;
                breakdown.push(`Jadrový prieraz (${extraPenetrations} × 99 €): ${cost.toFixed(0)} €`);
            }

            if (includesAny(answers.condensateMode, ['s čerpadlom', 'cerpadlo', 'čerpadlo'])) {
                total += 160;
                breakdown.push('Čerpadlo kondenzátu: 160 €');
            }

            if (includesAny(answers.difficultAccess, ['áno', 'ano', 'výška', 'vyska', 'zhoršen'])) {
                total += 79;
                breakdown.push('Príplatok zhoršený prístup: 79 €');
            }

            return { total, breakdown };
        }

        function finishGuidedMode() {
            const lines = GUIDED_QUESTIONS.map(q => `• ${q.key}: ${guidedMode.answers[q.key] || 'neuvedené'}`);
            const estimate = calculateExtraEstimate(guidedMode.answers);
            const estimateLines = estimate.breakdown.length ? estimate.breakdown : ['Neboli zadané položky nadštandardu.'];

            const summary = [
                'Ďakujem, máme vyplnený predbežný obhliadkový formulár.',
                'Zhrnutie vstupov:',
                ...lines,
                'Orientačný odhad nadštandardných montážnych prác:',
                ...estimateLines.map(item => `- ${item}`),
                `Predbežný odhad nadštandardu spolu: ${estimate.total.toFixed(0)} € s DPH.`,
                'Poznámka: ide o orientačný odhad, finálna suma sa potvrdí po technickej obhliadke.'
            ].join('\n');
            addMessage(summary, 'bot', true);

            const recommendationPrompt = `Používateľ dokončil obhliadkový formulár. Priprav odporúčanie 2-3 modelov a transparentný cenový split.\nVstupy:\n${lines.join('\n')}\nOrientačný nadštandard montáže: ${estimate.total.toFixed(0)} €.`;
            guidedMode.active = false;
            sendMessageToApi(recommendationPrompt, false);
        }

        async function sendMessage(text) {
            if (!text.trim()) return;

            quickActions.style.display = 'none';
            addMessage(text, 'user');
            input.value = '';

            if (/spustiť ai sprievodcu|sprievodca konfigurátorom/i.test(text) && !guidedMode.active) {
                startGuidedMode();
                return;
            }

            if (guidedMode.active) {
                const currentQuestion = GUIDED_QUESTIONS[guidedMode.currentIndex];
                guidedMode.answers[currentQuestion.key] = text;
                addMessage('Super, rozumiem. Pokračujeme na ďalší krok.', 'bot', true);
                guidedMode.currentIndex += 1;
                askGuidedQuestion();
                return;
            }

            await sendMessageToApi(text, true);
        }

        async function sendMessageToApi(text, includeInHistory) {
            sendBtn.disabled = true;
            const typingId = showTyping();

            try {
                const response = await fetch(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history: conversationHistory,
                    }),
                });

                const data = await response.json();
                removeTyping(typingId);

                if (data.response) {
                    addMessage(data.response, 'bot', true, true);
                    if (includeInHistory) {
                        conversationHistory.push(
                            { role: 'user', content: text },
                            { role: 'assistant', content: data.response }
                        );
                    }
                } else {
                    addMessage('Prepáčte, nepodarilo sa mi získať odpoveď. Skúste to prosím znova.', 'bot', true);
                }
            } catch (error) {
                removeTyping(typingId);
                addMessage(getFallbackResponse(text), 'bot', true);
            }

            sendBtn.disabled = false;
        }

        function getFallbackResponse(text) {
            const lowerText = text.toLowerCase();

            if (lowerText.includes('montáž') || lowerText.includes('instal')) {
                return 'Orientačne: štandardná montáž je 350 € s DPH. Nadštandard sa počíta podľa trasy nad 3 m, prestupov, elektro úprav, kondenzu a prístupu. Môžem sa vás na to opýtať krokovo.';
            }
            if (lowerText.includes('porovnaj') || lowerText.includes('značk')) {
                return 'Rád porovnám značky podľa tichosti, účinnosti, výbavy a ceny. Napíšte mi prosím plochu miestnosti, rozpočet a preferenciu (napr. tichosť alebo smart funkcie).';
            }
            if (lowerText.includes('výkon') || lowerText.includes('btu') || lowerText.includes('kw')) {
                return 'Výkon orientačne počítame podľa plochy, výšky stropu, izolácie a orientácie. Ak chcete, spustím AI sprievodcu a vypočítame vhodný rozsah krok po kroku.';
            }

            return `Som tu ako AI sprievodca Dream Air. Pomôžem s výberom modelu, porovnaním značiek aj orientačnou cenou montáže. Ak chcete, môžeme hneď spustiť krokového sprievodcu. Kontakt: ${CONFIG.phone}.`;
        }

        function addMessage(text, type, shouldSpeak = false, allowHtml = false) {
            const div = document.createElement('div');
            div.className = `smartesko-message ${type}`;
            const normalizedText = String(text ?? '');

            if (type === 'bot') {
                const header = document.createElement('div');
                header.className = 'message-header';
                header.textContent = `🤖 ${CONFIG.assistantName}`;

                const body = document.createElement('div');
                if (allowHtml) {
                    body.innerHTML = normalizedText;
                } else {
                    body.textContent = normalizedText;
                }

                div.appendChild(header);
                div.appendChild(body);

                if (shouldSpeak) speakText(normalizedText);
            } else {
                div.textContent = normalizedText;
            }

            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        function showTyping() {
            const id = `typing-${Date.now()}`;
            const div = document.createElement('div');
            div.id = id;
            div.className = 'smartesko-typing';
            div.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            return id;
        }

        function removeTyping(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        sendBtn.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(input.value);
        });

        quickActions.querySelectorAll('.smartesko-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sendMessage(btn.dataset.message);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
