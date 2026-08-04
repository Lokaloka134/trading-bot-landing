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
