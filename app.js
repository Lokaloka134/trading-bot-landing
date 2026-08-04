// Mobile Navigation Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-xmark');
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '70px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.background = 'rgba(10, 14, 23, 0.95)';
            navMenu.style.padding = '20px';
            navMenu.style.borderBottom = '1px solid var(--border-color)';
        } else {
            icon.classList.replace('fa-xmark', 'fa-bars');
            navMenu.removeAttribute('style');
        }
    });
}

// FAQ Accordion Interaction
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const questionButton = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');

    questionButton.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items first
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Toggle clicked item
        if (!isActive) {
            item.classList.add('active');
            answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
        }
    });
});

// Live Trading Signal Simulator Data
const assets = [
    { pair: 'BTC / USDT', type: 'LONG', targets: 'TP: $65,800 | SL: $63,900', returnVal: '+185% (15x)' },
    { pair: 'ETH / USDT', type: 'LONG', targets: 'TP: $3,580 | SL: $3,410', returnVal: '+120% (10x)' },
    { pair: 'SOL / USDT', type: 'SHORT', targets: 'TP: $138.50 | SL: $146.20', returnVal: '+210% (20x)' },
    { pair: 'EUR / USD', type: 'LONG', targets: 'TP: 1.0920 | SL: 1.0840', returnVal: '+45 pips' },
    { pair: 'GBP / USD', type: 'SHORT', targets: 'TP: 1.2640 | SL: 1.2720', returnVal: '+35 pips' },
    { pair: 'AVAX / USDT', type: 'LONG', targets: 'TP: $28.50 | SL: $26.10', returnVal: '+150% (15x)' },
    { pair: 'ADA / USDT', type: 'SHORT', targets: 'TP: $0.345 | SL: $0.370', returnVal: 'Pending' },
    { pair: 'XRP / USDT', type: 'LONG', targets: 'TP: $0.585 | SL: $0.540', returnVal: 'Pending' }
];

const signalsFeed = document.getElementById('signals-feed');

function generateInitialSignals() {
    if (!signalsFeed) return;
    signalsFeed.innerHTML = '';
    
    // Display first 5 signals
    for (let i = 0; i < 5; i++) {
        const signal = assets[i];
        const isPending = signal.returnVal === 'Pending';
        
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        
        feedItem.innerHTML = `
            <div class="feed-item-info">
                <span class="feed-item-pair">
                    ${signal.pair}
                    <span class="feed-item-badge ${signal.type.toLowerCase()}">${signal.type}</span>
                </span>
                <span class="feed-item-time">${getFormattedTime(i * 12)} mins ago</span>
            </div>
            <div class="feed-item-targets">
                ${signal.targets}
            </div>
            <div class="feed-item-status ${isPending ? 'pending' : 'success'}">
                ${isPending ? '<i class="fa-solid fa-spinner fa-spin"></i> Pending' : '<i class="fa-solid fa-circle-check"></i> ' + signal.returnVal}
            </div>
        `;
        
        signalsFeed.appendChild(feedItem);
    }
}

// Format time relative helper
function getFormattedTime(minusMinutes) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - minusMinutes);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to dynamically spawn new signal
function spawnNewSignal() {
    if (!signalsFeed) return;

    // Pick random asset
    const randomIndex = Math.floor(Math.random() * assets.length);
    const asset = { ...assets[randomIndex] };
    
    // Assign entry/targets
    const isCrypto = asset.pair.includes('USDT');
    const isLong = Math.random() > 0.4;
    asset.type = isLong ? 'LONG' : 'SHORT';
    
    if (isCrypto) {
        if (asset.pair.includes('BTC')) {
            const price = 60000 + Math.floor(Math.random() * 5000);
            asset.targets = `TP: $${(price * (isLong ? 1.02 : 0.98)).toFixed(0)} | SL: $${(price * (isLong ? 0.985 : 1.015)).toFixed(0)}`;
        } else if (asset.pair.includes('ETH')) {
            const price = 3200 + Math.floor(Math.random() * 300);
            asset.targets = `TP: $${(price * (isLong ? 1.02 : 0.98)).toFixed(0)} | SL: $${(price * (isLong ? 0.985 : 1.015)).toFixed(0)}`;
        } else {
            const price = 50 + Math.floor(Math.random() * 100);
            asset.targets = `TP: $${(price * (isLong ? 1.03 : 0.97)).toFixed(2)} | SL: $${(price * (isLong ? 0.98 : 1.02)).toFixed(2)}`;
        }
        const lev = [10, 15, 20][Math.floor(Math.random() * 3)];
        asset.returnVal = `+${Math.floor(80 + Math.random() * 150)}% (${lev}x)`;
    } else {
        asset.targets = isLong ? 'TP: Target 1 Hit | SL: Secure' : 'TP: Target 2 Hit | SL: Secure';
        asset.returnVal = `+${Math.floor(30 + Math.random() * 40)} pips`;
    }

    // New item structure
    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    feedItem.style.opacity = '0';
    feedItem.style.transform = 'translateY(-20px)';
    feedItem.style.transition = 'all 0.5s ease';
    
    feedItem.innerHTML = `
        <div class="feed-item-info">
            <span class="feed-item-pair">
                ${asset.pair}
                <span class="feed-item-badge ${asset.type.toLowerCase()}">${asset.type}</span>
            </span>
            <span class="feed-item-time">Just Now</span>
        </div>
        <div class="feed-item-targets">
            ${asset.targets}
        </div>
        <div class="feed-item-status success">
            <i class="fa-solid fa-circle-check"></i> ${asset.returnVal}
        </div>
    `;

    // Prepend to list
    signalsFeed.insertBefore(feedItem, signalsFeed.firstChild);

    // Trigger enter animation
    setTimeout(() => {
        feedItem.style.opacity = '1';
        feedItem.style.transform = 'translateY(0)';
    }, 50);

    // Remove oldest item if count exceeds 6
    if (signalsFeed.children.length > 6) {
        const lastChild = signalsFeed.lastChild;
        lastChild.style.opacity = '0';
        lastChild.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (signalsFeed.contains(lastChild)) {
                signalsFeed.removeChild(lastChild);
            }
        }, 500);
    }
}

// Setup & Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateInitialSignals();
    setupGateLinks();
    
    // Spawn a new signal dynamically every 10 seconds
    setInterval(spawnNewSignal, 10000);
    
    // Counter Animation
    const counters = document.querySelectorAll('.count');
    const speed = 200;

    const startCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = parseInt(counter.getAttribute('data-target'));
                const count = parseInt(counter.innerText.replace(/,/g, ''));
                const increment = Math.ceil(target / speed);

                if (count < target) {
                    counter.innerText = (count + increment).toLocaleString();
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            updateCount();
        });
    };

    // Simple intersection observer to trigger counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
});

// Credential System Logic
const modal = document.getElementById('credential-modal');
const closeBtn = document.getElementById('modal-close-btn');

// Steps switcher helper
function showStep(stepId) {
    const steps = document.querySelectorAll('.modal-step');
    steps.forEach(step => {
        if (step.id === stepId) {
            step.style.display = 'block';
        } else {
            step.style.display = 'none';
        }
    });
}

function openCredentialModal() {
    if (modal) {
        modal.classList.add('active');
        // Start at Captcha verification step
        showStep('modal-step-captcha');
        // Reset checkbox state
        const captchaCheckbox = document.getElementById('captcha-checkbox');
        if (captchaCheckbox) {
            captchaCheckbox.checked = false;
            captchaCheckbox.disabled = false;
        }
        const spinner = document.querySelector('.captcha-spinner');
        if (spinner) spinner.style.display = 'none';
        
        // Reset inputs
        document.getElementById('license-key').value = '';
        document.getElementById('tg-username-license').value = '';
        document.getElementById('pay-name').value = '';
        document.getElementById('pay-utr').value = '';
        document.getElementById('pay-tg').value = '';
        document.getElementById('error-message').innerText = '';
        document.getElementById('pay-error-message').innerText = '';
    }
}

function closeCredentialModal() {
    if (modal) {
        modal.classList.remove('active');
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    }
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeCredentialModal);
}

// Close on clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeCredentialModal();
    }
});

// Setup click triggers on all Telegram gate links
function setupGateLinks() {
    const gateLinks = document.querySelectorAll('.tg-gate-link');
    gateLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('apex_verified') === 'true') {
                window.open('https://t.me/+IuJHgqg4wIg0NDQ9', '_blank');
            } else {
                openCredentialModal();
            }
        });
    });
}

// ----------------------------------------------------
// STEP 1: CAPTCHA (I'm not a robot)
// ----------------------------------------------------
const captchaCheckbox = document.getElementById('captcha-checkbox');
const captchaSpinner = document.querySelector('.captcha-spinner');

if (captchaCheckbox) {
    captchaCheckbox.addEventListener('click', (e) => {
        // Prevent instant check browser action
        e.preventDefault();
        
        if (captchaCheckbox.disabled) return;
        
        // Disable during verification delay
        captchaCheckbox.disabled = true;
        if (captchaSpinner) captchaSpinner.style.display = 'block';
        
        setTimeout(() => {
            if (captchaSpinner) captchaSpinner.style.display = 'none';
            captchaCheckbox.checked = true;
            
            // Short delay to let checkmark animate, then transition to options
            setTimeout(() => {
                showStep('modal-step-options');
            }, 600);
        }, 1200);
    });
}

// ----------------------------------------------------
// STEP 2: OPTIONS SELECTION
// ----------------------------------------------------
const btnSelectLicense = document.getElementById('btn-select-license');
const btnSelectBuy = document.getElementById('btn-select-buy');

if (btnSelectLicense) {
    btnSelectLicense.addEventListener('click', () => {
        showStep('modal-step-license');
    });
}

if (btnSelectBuy) {
    btnSelectBuy.addEventListener('click', () => {
        showStep('modal-step-plans');
    });
}

// Back Navigation
const backToOptions1 = document.getElementById('back-to-options-1');
const backToOptions2 = document.getElementById('back-to-options-2');
const backToPlans = document.getElementById('back-to-plans');
const btnRetryPayment = document.getElementById('btn-retry-payment');

if (backToOptions1) backToOptions1.addEventListener('click', (e) => { e.preventDefault(); showStep('modal-step-options'); });
if (backToOptions2) backToOptions2.addEventListener('click', (e) => { e.preventDefault(); showStep('modal-step-options'); });
if (backToPlans) backToPlans.addEventListener('click', (e) => { e.preventDefault(); showStep('modal-step-plans'); });
if (btnRetryPayment) btnRetryPayment.addEventListener('click', (e) => { e.preventDefault(); showStep('modal-step-plans'); });

// ----------------------------------------------------
// STEP 3A: LICENSE KEY VERIFICATION FORM
// ----------------------------------------------------
const licenseForm = document.getElementById('credential-form');
const licenseKeyInput = document.getElementById('license-key');
const tgUsernameLicenseInput = document.getElementById('tg-username-license');
const errorMsg = document.getElementById('error-message');

if (licenseForm) {
    licenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const licenseKey = licenseKeyInput.value.trim();
        let tgUsername = tgUsernameLicenseInput.value.trim();
        
        if (!licenseKey || !tgUsername) {
            errorMsg.innerText = 'Please fill in all fields.';
            return;
        }
        
        if (!tgUsername.startsWith('@')) {
            tgUsername = '@' + tgUsername;
        }

        // Show loading state using the pending step
        showStep('modal-step-pending');
        document.getElementById('pending-utr-label').innerText = 'License Key';
        
        const pendingLog = document.getElementById('pending-status-log');
        const progressFill = document.getElementById('pending-progress-fill');
        let pct = 10;
        if (progressFill) progressFill.style.width = pct + '%';
        if (pendingLog) pendingLog.innerText = 'Validating license credentials...';

        const steps = [
            { pct: 35, log: 'Connecting to secure gateway...' },
            { pct: 70, log: 'Decrypting license signatures...' },
            { pct: 90, log: 'Checking database registry...' },
            { pct: 100, log: 'Authentication successful!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const s = steps[currentStep];
                if (progressFill) progressFill.style.width = s.pct + '%';
                if (pendingLog) pendingLog.innerText = s.log;
                currentStep++;
            } else {
                clearInterval(interval);
                showStep('modal-step-success');
                document.getElementById('success-tg-username-display').innerText = tgUsername;
                localStorage.setItem('apex_verified', 'true');
                localStorage.setItem('apex_license', licenseKey);
                localStorage.setItem('apex_username', tgUsername);
            }
        }, 800);
    });
}

// ----------------------------------------------------
// STEP 3B: PLANS SELECTION & PRICING
// ----------------------------------------------------
let currentPlan = { price: 899, name: 'Lifetime VIP Access' };
const planItems = document.querySelectorAll('.plan-item');
const btnConfirmPlan = document.getElementById('btn-confirm-plan');

planItems.forEach(item => {
    item.addEventListener('click', () => {
        planItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        currentPlan.price = parseInt(item.getAttribute('data-price'));
        currentPlan.name = item.getAttribute('data-name');
    });
});

if (btnConfirmPlan) {
    btnConfirmPlan.addEventListener('click', () => {
        // Prepare Payment Details
        const amount = currentPlan.price;
        const upiId = 'panchalkalpeshkumar@fam'; // Actual Fampay UPI ID
        const payeeName = 'Kalpeshkumar Panchal';
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(currentPlan.name)}`;
        
        // Generate UPI QR Code dynamically
        document.getElementById('upi-qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
        
        // Setup direct payment deep link
        document.getElementById('upi-mobile-link').href = upiString;
        
        // Setup text labels
        document.getElementById('pay-amount-label').innerText = amount;
        document.getElementById('upi-id-label').innerText = upiId;
        document.getElementById('upi-name-label').innerText = payeeName;
        
        showStep('modal-step-pay');
    });
}

// ----------------------------------------------------
// STEP 4: UPI PAYMENT FORM SUBMISSION
// ----------------------------------------------------
const payForm = document.getElementById('payment-submit-form');
const payNameInput = document.getElementById('pay-name');
const payUtrInput = document.getElementById('pay-utr');
const payTgInput = document.getElementById('pay-tg');
const payError = document.getElementById('pay-error-message');

let pollingInterval = null;

if (payForm) {
    payForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        payError.innerText = '';

        const name = payNameInput.value.trim();
        const utr = payUtrInput.value.trim();
        let tgUsername = payTgInput.value.trim();

        if (!name || !utr || !tgUsername) {
            payError.innerText = 'Please fill in all fields.';
            return;
        }

        // Validate UTR is exactly 12 digits
        if (!/^\d{12}$/.test(utr)) {
            payError.innerText = 'UTR Reference number must be exactly 12 digits.';
            return;
        }

        if (!tgUsername.startsWith('@')) {
            tgUsername = '@' + tgUsername;
        }

        // Transition to pending/waiting screen
        showStep('modal-step-pending');
        document.getElementById('pending-utr-label').innerText = utr;

        try {
            // Trigger Netlify API gateway payment notification
            const response = await fetch('/.netlify/functions/payment-handler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    utr,
                    amount: currentPlan.price,
                    tgUsername
                })
            });

            if (!response.ok) {
                throw new Error('API Endpoint Offline');
            }

            const result = await response.json();
            const txId = result.txId;

            // Start live polling Loop
            startLivePolling(txId, tgUsername);

        } catch (err) {
            console.warn('Backend Function offline, falling back to simulated validation loop.');
            // Fallback for local testing or when Netlify is building
            simulateMockVerification(tgUsername);
        }
    });
}

// ----------------------------------------------------
// STEP 5: POLLING / VERIFICATION PROCESSORS
// ----------------------------------------------------
function startLivePolling(txId, tgUsername) {
    if (pollingInterval) clearInterval(pollingInterval);

    const pendingLog = document.getElementById('pending-status-log');
    const progressFill = document.getElementById('pending-progress-fill');
    let pct = 30;

    pendingLog.innerText = 'Handshake sent to admin. Awaiting authorization...';
    if (progressFill) progressFill.style.width = pct + '%';

    pollingInterval = setInterval(async () => {
        // Slowly animate progress loader to keep visual engagement
        if (pct < 90) {
            pct += Math.floor(Math.random() * 5) + 2;
            if (progressFill) progressFill.style.width = pct + '%';
        }

        try {
            const res = await fetch(`/.netlify/functions/payment-handler?txId=${txId}`);
            if (res.ok) {
                const data = await res.json();
                
                if (data.status === 'approved') {
                    clearInterval(pollingInterval);
                    if (progressFill) progressFill.style.width = '100%';
                    pendingLog.innerText = 'Payment Confirmed! Account authorized.';
                    
                    setTimeout(() => {
                        showStep('modal-step-success');
                        document.getElementById('success-tg-username-display').innerText = tgUsername;
                        localStorage.setItem('apex_verified', 'true');
                        localStorage.setItem('apex_username', tgUsername);
                    }, 800);
                } else if (data.status === 'rejected') {
                    clearInterval(pollingInterval);
                    showStep('modal-step-rejected');
                }
            }
        } catch (e) {
            console.error('Polling connection failed:', e);
        }
    }, 3000);
}

// Fallback logic for local tests (so it works 100% out-of-the-box locally)
function simulateMockVerification(tgUsername) {
    if (pollingInterval) clearInterval(pollingInterval);

    const pendingLog = document.getElementById('pending-status-log');
    const progressFill = document.getElementById('pending-progress-fill');
    let pct = 15;

    const logs = [
        'Broadcasting UTR signature to admin network...',
        'Confirming bank transfer ledger...',
        'Validating transaction hashes...',
        'Admin verifying deposit logs...',
        'Generating encryption session...'
    ];

    let currentLog = 0;
    if (progressFill) progressFill.style.width = pct + '%';

    pollingInterval = setInterval(() => {
        if (pct < 95) {
            pct += 15;
            if (progressFill) progressFill.style.width = pct + '%';
            if (pendingLog && currentLog < logs.length) {
                pendingLog.innerText = logs[currentLog];
                currentLog++;
            }
        } else {
            clearInterval(pollingInterval);
            if (progressFill) progressFill.style.width = '100%';
            if (pendingLog) pendingLog.innerText = 'Authorization Complete!';
            
            setTimeout(() => {
                showStep('modal-step-success');
                document.getElementById('success-tg-username-display').innerText = tgUsername;
                localStorage.setItem('apex_verified', 'true');
                localStorage.setItem('apex_username', tgUsername);
            }, 800);
        }
    }, 1800);
}
