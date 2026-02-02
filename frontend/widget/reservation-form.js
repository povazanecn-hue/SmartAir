/**
 * SmartAir Reservation Form Widget
 * Formulár pre rezerváciu obhliadky
 */

(function() {
    'use strict';

    const CONFIG = {
        apiEndpoint: 'https://api.smartair.space/reservations',
        phone: '+421 915 033 440'
    };

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .smartair-reservation-form * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .smartair-reservation-form {
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .smartair-reservation-form h2 {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
            text-align: center;
        }

        .smartair-reservation-form .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 32px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 8px;
            color: #333;
        }

        .form-group label .required {
            color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        @media (max-width: 500px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .time-slots {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .time-slot {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }

        .time-slot:hover {
            border-color: #3b82f6;
        }

        .time-slot.selected {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
        }

        .type-options {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .type-option {
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .type-option:hover {
            border-color: #3b82f6;
        }

        .type-option.selected {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            border-color: transparent;
            color: white;
        }

        .type-option .icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .type-option .label {
            font-weight: 600;
            font-size: 14px;
        }

        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 24px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .success-message {
            text-align: center;
            padding: 40px 20px;
        }

        .success-message .icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .success-message h3 {
            font-size: 24px;
            color: #10b981;
            margin-bottom: 12px;
        }

        .success-message p {
            color: #666;
            margin-bottom: 24px;
        }

        .success-message .reservation-id {
            background: #f3f4f6;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 18px;
            display: inline-block;
        }

        .error-message {
            background: #fee2e2;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: none;
        }

        .phone-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #666;
        }

        .phone-link a {
            color: #3b82f6;
            font-weight: 600;
            text-decoration: none;
        }
    `;

    function createForm() {
        const container = document.getElementById('smartair-reservation') || document.body;

        container.innerHTML = `
            <style>${styles}</style>
            <div class="smartair-reservation-form" id="reservation-form-container">
                <h2>📅 Rezervácia obhliadky</h2>
                <p class="subtitle">Vyplňte formulár a my vás budeme kontaktovať</p>

                <div class="error-message" id="error-message"></div>

                <form id="reservation-form">
                    <div class="form-group">
                        <label>Typ služby <span class="required">*</span></label>
                        <div class="type-options">
                            <div class="type-option selected" data-type="inspection">
                                <div class="icon">🔍</div>
                                <div class="label">Obhliadka</div>
                            </div>
                            <div class="type-option" data-type="installation">
                                <div class="icon">🔧</div>
                                <div class="label">Montáž</div>
                            </div>
                            <div class="type-option" data-type="service">
                                <div class="icon">🛠️</div>
                                <div class="label">Servis</div>
                            </div>
                        </div>
                        <input type="hidden" name="reservation_type" id="reservation_type" value="inspection">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Meno a priezvisko <span class="required">*</span></label>
                            <input type="text" id="name" name="name" required placeholder="Ján Novák">
                        </div>
                        <div class="form-group">
                            <label for="phone">Telefón <span class="required">*</span></label>
                            <input type="tel" id="phone" name="phone" required placeholder="+421 900 000 000">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email <span class="required">*</span></label>
                        <input type="email" id="email" name="email" required placeholder="jan.novak@email.sk">
                    </div>

                    <div class="form-group">
                        <label for="address">Adresa (miesto obhliadky) <span class="required">*</span></label>
                        <input type="text" id="address" name="address" required placeholder="Ulica 123, Bratislava">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="preferred_date">Preferovaný dátum <span class="required">*</span></label>
                            <input type="date" id="preferred_date" name="preferred_date" required>
                        </div>
                        <div class="form-group">
                            <label>Preferovaný čas <span class="required">*</span></label>
                            <div class="time-slots">
                                <div class="time-slot selected" data-time="08:00-10:00">8-10</div>
                                <div class="time-slot" data-time="10:00-12:00">10-12</div>
                                <div class="time-slot" data-time="12:00-14:00">12-14</div>
                                <div class="time-slot" data-time="14:00-16:00">14-16</div>
                                <div class="time-slot" data-time="16:00-18:00">16-18</div>
                                <div class="time-slot" data-time="18:00-20:00">18-20</div>
                            </div>
                            <input type="hidden" name="preferred_time" id="preferred_time" value="08:00-10:00">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="message">Poznámka (voliteľné)</label>
                        <textarea id="message" name="message" placeholder="Popíšte váš problém alebo požiadavku..."></textarea>
                    </div>

                    <button type="submit" class="submit-btn">Odoslať rezerváciu</button>
                </form>

                <p class="phone-link">
                    Potrebujete rýchlu odpoveď? Volajte <a href="tel:${CONFIG.phone}">${CONFIG.phone}</a>
                </p>
            </div>
        `;

        initForm();
    }

    function initForm() {
        const form = document.getElementById('reservation-form');
        const typeOptions = document.querySelectorAll('.type-option');
        const timeSlots = document.querySelectorAll('.time-slot');
        const errorMessage = document.getElementById('error-message');

        // Set minimum date to today
        const dateInput = document.getElementById('preferred_date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        // Type selection
        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                typeOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                document.getElementById('reservation_type').value = option.dataset.type;
            });
        });

        // Time slot selection
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                timeSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                document.getElementById('preferred_time').value = slot.dataset.time;
            });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.style.display = 'none';

            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Odosielam...';

            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                reservation_type: formData.get('reservation_type'),
                preferred_date: formData.get('preferred_date'),
                preferred_time: formData.get('preferred_time'),
                message: formData.get('message') || null
            };

            try {
                const response = await fetch(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Chyba pri odosielaní');
                }

                const result = await response.json();
                showSuccess(result.id);

            } catch (error) {
                errorMessage.textContent = 'Nepodarilo sa odoslať rezerváciu. Skúste to znova alebo nás kontaktujte telefonicky.';
                errorMessage.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Odoslať rezerváciu';
            }
        });
    }

    function showSuccess(reservationId) {
        const container = document.getElementById('reservation-form-container');
        container.innerHTML = `
            <div class="success-message">
                <div class="icon">✅</div>
                <h3>Rezervácia odoslaná!</h3>
                <p>Ďakujeme za vašu rezerváciu. Budeme vás kontaktovať na potvrdenie termínu.</p>
                <div class="reservation-id">ID: ${reservationId}</div>
                <p style="margin-top: 24px;">
                    <a href="tel:${CONFIG.phone}" style="color: #3b82f6;">
                        Máte otázky? Volajte ${CONFIG.phone}
                    </a>
                </p>
            </div>
        `;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createForm);
    } else {
        createForm();
    }
})();
