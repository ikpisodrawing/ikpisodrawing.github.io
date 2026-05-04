// ============================================================
// SCRIPT.JS — IK Piso Drawing | Art Portfolio
//
// TABLE OF CONTENTS:
// 1.  Element Selection       — grab all needed DOM elements
// 2.  Screen Navigation       — switch between Gallery / About / Contacts
// 3.  Commission Popup        — open and close the commission full-screen
// 4.  Price Calculator        — live price update based on form selections
// 5.  Checkout & Receipt      — validate form, generate and show receipt
// 6.  Receipt Actions         — download, copy, and back buttons
// 7.  Gallery Scroll Animation — fade-in items as they enter the viewport
// ============================================================


// ============================================================
// 1. ELEMENT SELECTION
// Grab every DOM element we'll need across the whole script.
// Stored in variables here so we don't query the DOM repeatedly.
// ============================================================

// --- Navigation ---
const navButtons = document.querySelectorAll('.nav-btn');  // All 3 bottom nav tabs

// --- Screens (main content areas) ---
const screens = {
    gallery: document.getElementById('screen-gallery'),
    resume:  document.getElementById('screen-resume'),
    links:   document.getElementById('screen-links')
};

// --- Commission Popup ---
const commissionScreen = document.getElementById('screen-commission');  // Full-screen popup
const commissionForm   = document.getElementById('commission-form');    // View 1: the order form
const receiptView      = document.getElementById('receipt-view');       // View 2: the receipt

// --- Commission Open Buttons ---
const startBtn  = document.getElementById('start-commission-btn');    // Header pill button
const startBtn2 = document.getElementById('start-commission-btn-2'); // Featured art "Commission Yours" button
const startBtn3 = document.getElementById('start-commission-btn-3'); // Gallery bottom CTA button

// --- Commission Close / Navigate Buttons ---
const backBtn    = document.getElementById('back-commission'); // ← Back button (closes popup)
const backToForm = document.getElementById('back-to-form');    // Back button inside receipt view

// --- Commission Form Dropdowns (used in price calculation) ---
const sizeSelect  = document.getElementById('drawing-size');
const headsSelect = document.getElementById('num-heads');
const bgSelect    = document.getElementById('background');
const rushSelect  = document.getElementById('rush-order');

// --- Price Display ---
const totalPrice = document.getElementById('total-price');   // Shows live calculated price

// --- Checkout Button ---
const checkoutBtn = document.getElementById('checkout-btn'); // "Check Out" button on the form

// --- Receipt Action Buttons ---
const downloadBtn  = document.getElementById('download-receipt'); // Downloads receipt as PNG
const copyOrderBtn = document.getElementById('copy-order-btn');   // Copies order text to clipboard

// --- Bottom Navigation Bar ---
const bottomNav = document.querySelector('.bottom-nav'); // Hidden when commission popup opens




// ============================================================
// 2. SCREEN NAVIGATION
// Switches between the 3 main screens: Gallery, About, Contacts.
// Only one screen is visible at a time (CSS handles the show/hide).
// The active nav tab is also highlighted.
// ============================================================

// switchScreen() — shows the target screen, hides all others,
// and marks the matching nav tab as active.
function switchScreen(screenName) {
    // Hide all screens by removing 'active' class
    Object.values(screens).forEach(screen => screen.classList.remove('active'));

    // Show the requested screen
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }

    // Update nav tab highlight
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-screen') === screenName) {
            btn.classList.add('active');
        }
    });
}

// Attach click listener to each bottom nav tab
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent page jump from href="#"
        const target = button.getAttribute('data-screen'); // e.g. "gallery", "resume", "links"
        switchScreen(target);
    });
});


// ============================================================
// 3. COMMISSION POPUP
// Opens and closes the full-screen commission form.
// When the popup opens, the bottom nav is hidden so it
// doesn't overlap the form. It's restored when closing.
// ============================================================

// Helper: open the commission popup and reset to form view
function openCommission() {
    commissionScreen.classList.add('active'); // Slides up into view (CSS transition)
    bottomNav.classList.add('hidden');        // Hide nav bar behind the popup
    commissionForm.style.display = 'block';   // Make sure form is shown
    receiptView.style.display = 'none';       // Hide receipt (reset state)
}

// Helper: close the commission popup
function closeCommission() {
    commissionScreen.classList.remove('active'); // Slides back down
    bottomNav.classList.remove('hidden');         // Restore bottom nav
}

// Header pill button
if (startBtn) {
  startBtn.addEventListener('click', openCommission);
}

if (startBtn2) {
  startBtn2.addEventListener('click', openCommission);
}

if (startBtn3) {
  startBtn3.addEventListener('click', openCommission);
}

// "← Back" button at the top of the commission popup
backBtn.addEventListener('click', closeCommission);


// ============================================================
// 4. WIZARD STATE
// Tracks what the client has selected across both steps.
// These are read by the price calculator and checkout.
// ============================================================

const wizardState = {
    size:  null,   // 'small' | 'medium' | 'large'
    heads: null,   // '1' | '2' | '3'
    bg:    null,   // 'none' | 'simple'
    rush:  null,   // 'no' | 'yes'
};

// Base prices per size
const BASE_PRICE = { small: 300, medium: 550, large: 950 };

// Background add-on per size
const BG_ADDON = { small: 50, medium: 70, large: 100 };


// ============================================================
// 5. TAP CARD SELECTION
// When a client taps an option card, mark it selected,
// save it to wizardState, and recalculate the price.
// ============================================================

document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
        const group = card.getAttribute('data-group');
        const value = card.getAttribute('data-value');

        // Deselect all cards in same group
        document.querySelectorAll(`.option-card[data-group="${group}"]`)
            .forEach(c => c.classList.remove('selected'));

        // Select tapped card
        card.classList.add('selected');

        // Save to state
        wizardState[group] = value;

        // Recalculate price
        calculatePrice();
    });
});


// ============================================================
// 6. PRICE CALCULATOR
// Reads wizardState and updates the live price display.
// Same pricing rules as before — size base, head discount,
// background add-on, rush surcharge.
// ============================================================

function calculatePrice() {
    const { size, heads, bg, rush } = wizardState;

    // If size or heads not picked yet, show placeholder
    if (!size || !heads) {
        document.getElementById('total-price').textContent  = '₱—';
        document.getElementById('price-breakdown').textContent = 'Select size and people to see price.';
        const tp2 = document.getElementById('total-price-2');
        if (tp2) tp2.textContent = '₱—';
        return;
    }

    // Step 1: base price
    let base = BASE_PRICE[size];
    let headsNum = parseInt(heads);

    // Step 2: per-head discount
    let pricePerHead = base;
    if      (headsNum === 2) pricePerHead = Math.round(base * 0.875);
    else if (headsNum >= 3)  pricePerHead = Math.round(base * 0.78);

    let total = pricePerHead * headsNum;

    // Step 3: background add-on
    if (bg === 'simple') total += BG_ADDON[size];

    // Step 4: rush surcharge
    if (rush === 'yes') total = Math.round(total * 1.3);

    // Update both price displays
    const priceText = `₱${total.toLocaleString()}`;
    document.getElementById('total-price').textContent  = priceText;
    const tp2 = document.getElementById('total-price-2');
    if (tp2) tp2.textContent = priceText;

    // Build breakdown note
    let note = `₱${pricePerHead.toLocaleString()} × ${headsNum} person${headsNum > 1 ? 's' : ''}`;
    if (bg === 'simple') note += ` + ₱${BG_ADDON[size]} background`;
    if (rush === 'yes')  note += ` + 30% rush`;
    document.getElementById('price-breakdown').textContent = note;
}


// ============================================================
// 7. STEP NAVIGATION
// Step 1 → Step 2: validate selections, build recap, move on.
// Step 2 → Step 1: go back to edit options.
// ============================================================

const step1El      = document.getElementById('commission-step-1');
const step2El      = document.getElementById('commission-step-2');
const dot1         = document.getElementById('dot-1');
const dot2         = document.getElementById('dot-2');

// Size label map for recap text
const SIZE_LABEL  = { small: 'Small 6×8"', medium: 'Medium 8×10"', large: 'Large 9×12"' };
const HEADS_LABEL = { '1': 'Solo (1 person)', '2': 'Couple (2 people)', '3': 'Group (3+ people)' };
const BG_LABEL    = { none: 'No background', simple: 'With background' };
const RUSH_LABEL  = { no: 'Normal delivery', yes: 'Rush order (+30%)' };

// Go to Step 2
document.getElementById('step1-next-btn').addEventListener('click', () => {
    const { size, heads, bg, rush } = wizardState;

    // Validate: size and heads are required
    if (!size || !heads) {
        alert('Please select a size and number of people.');
        return;
    }

    // Default bg and rush if not picked
    if (!bg)   wizardState.bg   = 'none';
    if (!rush) wizardState.rush = 'no';

    // Recalculate with defaults applied
    calculatePrice();

    // Build recap summary for Step 2
    const recapEl = document.getElementById('order-recap');
    if (recapEl) {
        recapEl.innerHTML =
            `<strong style="color:var(--text-light);">Your selection:</strong><br>` +
            `${SIZE_LABEL[size]} &nbsp;•&nbsp; ${HEADS_LABEL[heads]}<br>` +
            `${BG_LABEL[wizardState.bg]} &nbsp;•&nbsp; ${RUSH_LABEL[wizardState.rush]}<br>` +
            `<strong style="color:var(--primary);">Total: ${document.getElementById('total-price').textContent}</strong>`;
    }

    // Switch views
    step1El.style.display = 'none';
    step2El.style.display = 'block';

    // Update step dots
    dot1.classList.remove('active');
    dot2.classList.add('active');

    // Scroll to top of popup
    document.querySelector('.commission-content').scrollTop = 0;
});

// Go back to Step 1
document.getElementById('step2-back-btn').addEventListener('click', () => {
    step2El.style.display = 'none';
    step1El.style.display = 'block';
    dot2.classList.remove('active');
    dot1.classList.add('active');
    document.querySelector('.commission-content').scrollTop = 0;
});


// ============================================================
// 8. CHECKOUT & RECEIPT
// Validates step 2 fields, fills receipt, shows receipt view.
// ============================================================

document.getElementById('checkout-btn').addEventListener('click', function () {
    const name    = document.getElementById('client-name').value.trim();
    const contact = document.getElementById('client-contact').value.trim();
    const address = document.getElementById('client-address').value.trim();

    if (!name || !contact || !address) {
        alert('Please fill in your name, contact, and address.');
        return;
    }

    const { size, heads, bg, rush } = wizardState;
    const total     = document.getElementById('total-price').textContent;
    const totalNum  = parseInt(total.replace(/[^\d]/g, '')) || 0;
    const downpay   = `₱${Math.ceil(totalNum * 0.5).toLocaleString()}`;
    const date      = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    const orderId   = 'IK' + Date.now().toString().slice(-6);

    // Fill receipt fields
    document.getElementById('receipt-date').textContent    = date;
    document.getElementById('receipt-id').textContent      = orderId;
    document.getElementById('r-name').textContent          = name;
    document.getElementById('r-contact').textContent       = contact;
    document.getElementById('r-address').textContent       = address;
    document.getElementById('r-size').textContent          = SIZE_LABEL[size]  || size;
    document.getElementById('r-heads').textContent         = HEADS_LABEL[heads] || heads;
    document.getElementById('r-bg').textContent            = BG_LABEL[bg]      || bg;
    document.getElementById('r-rush').textContent          = RUSH_LABEL[rush]  || rush;
    document.getElementById('r-price').textContent         = total;
    document.getElementById('r-downpayment').textContent   = downpay;

    // Hide step 2, show receipt
    step2El.style.display    = 'none';
    document.getElementById('receipt-view').style.display = 'block';
    document.querySelector('.commission-content').scrollTop = 0;
});

// "Start New Order" — resets everything back to step 1
document.getElementById('back-to-form').addEventListener('click', function () {
    // Reset wizard state
    wizardState.size = wizardState.heads = wizardState.bg = wizardState.rush = null;

    // Deselect all cards
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));

    // Clear client fields
    ['client-name','client-contact','client-address','description'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Reset price display
    document.getElementById('total-price').textContent      = '₱—';
    document.getElementById('price-breakdown').textContent  = '';

    // Go back to step 1
    document.getElementById('receipt-view').style.display = 'none';
    step1El.style.display = 'block';
    step2El.style.display = 'none';
    dot1.classList.add('active');
    dot2.classList.remove('active');
    document.querySelector('.commission-content').scrollTop = 0;
});


// ============================================================
// 6. RECEIPT ACTIONS
// Three actions available after checkout:
//   A. Download Receipt — saves the receipt card as a PNG image
//   B. Copy Order Details — copies a text summary to clipboard
//   C. Send to Facebook — handled by the <a> tag in HTML (no JS needed)
// ============================================================

// --- A. Download Receipt as PNG image ---
// Uses html2canvas to take a "screenshot" of the receipt card
// and triggers a download of it as a .png file.
if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    const receipt = document.getElementById('receipt-content');

    html2canvas(receipt, {
        scale: 2,                    // 2x resolution for a sharper image
        backgroundColor: '#ffffff'   // Force white background on the capture
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'IK-Commission-Receipt.png';
        link.href = canvas.toDataURL('image/png');
        link.click(); // Trigger the file download
    }).catch(err => {
        // Fallback message if html2canvas fails
        alert('Screenshot this receipt and send to @ik_pisodrawing on IG');
    });
});
    
}

// --- B. Copy Order Details to Clipboard ---
// Builds a readable text summary of the order and copies it.
// Button label temporarily changes to "Copied!" as confirmation.
if (copyOrderBtn) {
  copyOrderBtn.addEventListener('click', function () {
    const orderText = `
Hi! I just placed an order.

Order ID: ${document.getElementById('receipt-id').textContent}
Name: ${document.getElementById('r-name').textContent}
Size: ${document.getElementById('r-size').textContent}
Total: ${document.getElementById('r-price').textContent}

I will send my reference photos here. Thank you!
    `.trim();

    // Modern + fallback approach
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(orderText).then(() => {
        showCopySuccess();
      }).catch(() => {
        fallbackCopy(orderText);
      });
    } else {
      fallbackCopy(orderText);
    }
  });
}

function showCopySuccess() {
  copyOrderBtn.textContent = '✅ Copied!';
  setTimeout(() => {
    copyOrderBtn.textContent = 'Copy Order Details';
  }, 2000);
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-999999px';
  textarea.style.top = '-999999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  
  try {
    document.execCommand('copy');
    showCopySuccess();
  } catch (err) {
    alert('Failed to copy. Please long-press and copy the text manually.');
  }
  
  document.body.removeChild(textarea);
}


// ============================================================
// 7. GALLERY SCROLL ANIMATION
// Gallery items start invisible (opacity: 0 in CSS).
// When the gallery screen enters the viewport, JS adds the
// .visible class to each item with a staggered delay so they
// fade and slide in one by one instead of all at once.
// ============================================================

// animateGalleryItems() — adds .visible to each gallery card
// with a 100ms stagger between each one
function animateGalleryItems() {
    const items = document.querySelectorAll('.gallery-item');

    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible'); // CSS handles the fade-in transition
        }, 100 * index); // Each card is delayed by 100ms more than the previous
    });
}

// observeGallery() — sets up an IntersectionObserver to watch
// the gallery screen. Triggers the animation when it's visible.
function observeGallery() {
    const galleryScreen = document.getElementById('screen-gallery');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateGalleryItems(); // Fire once when gallery becomes visible
            }
        });
    }, { threshold: 0.3 }); // Trigger when 30% of the gallery screen is visible

    observer.observe(galleryScreen);
}

// Run the gallery observer once the whole page has loaded
window.addEventListener('load', () => {
    observeGallery();
});



// ============================================================
// GALLERY UPGRADE — SCRIPTS (Updated)
// ============================================================


// ── ANIMATED NUMBER COUNTERS ──
// Counts up from 0 to target number with a smooth animation.
// Used by BOTH the header stats strip AND previously the gallery trust bar.
// Now runs only for the header on page load.
function animateCounter(elementId, target, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            el.textContent = target + '+';
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

// ── HEADER ENTRANCE ANIMATION + COUNTER TRIGGER ──
// Runs once on page load / refresh.
// Staggers the header elements sliding in, then fires the counters.
// CSS classes .header-ready and .header-animate are defined in style.css.
function runHeaderEntrance() {
    const header      = document.querySelector('header');
    const headerTop   = document.querySelector('.header-top');
    const headerStats = document.querySelector('.header-stats');

    if (!header) return;

    // Step 1: make elements visible but in their start position
    header.classList.add('header-ready');

    // Step 2: stagger the slide-in animations
    setTimeout(() => { if (headerTop)   headerTop.classList.add('header-animate');   }, 80);
    setTimeout(() => { if (headerStats) headerStats.classList.add('header-animate'); }, 280);

    // Step 3: start the number counters after the stats strip has arrived
    setTimeout(() => {
        // ── CHANGE THESE NUMBERS to match your real stats ──
        animateCounter('h-counter-clients',  50,  1200);   // 50+ happy clients
        animateCounter('h-counter-artworks', 80,  1500);   // 80+ artworks done
        animateCounter('h-counter-years',    2,   800);    // 2+ years
    }, 500);
}

// Fire the header entrance when the page finishes loading
window.addEventListener('load', () => {
    runHeaderEntrance();
    observeGallery();  // gallery card animations still run too
});


// ── FILTER TABS ──
// Hides/shows gallery items based on their data-filter attribute.
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active tab style
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        const items  = document.querySelectorAll('.gallery-item');

        items.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-filter') === filter) {
                item.classList.remove('hidden');
                // Re-trigger entrance animation
                item.classList.remove('visible');
                setTimeout(() => item.classList.add('visible'), 50);
            } else {
                item.classList.add('hidden');
            }
        });
    });
});


// ── ROTATING TESTIMONIALS ──
// Change the quotes and authors below to real client feedback.
const testimonials = [
    { quote: '"The portrait was so realistic, my mom cried when she saw it."',     author: '— Happy Client, Cagayan de Oro' },
    { quote: '"Ordered as a gift. My partner was speechless. 100% recommend!"',    author: '— Verified Buyer' },
    { quote: '"Fast delivery and the details are unbelievable. Will order again!"', author: '— Repeat Client' },
    { quote: '"Khimhar captured the personality perfectly. Worth every peso."',     author: '— Facebook Client' },
];

let currentTestimonial = 0;
const quoteEl  = document.getElementById('testimonial-text');
const authorEl = document.getElementById('testimonial-author');
const dotsEl   = document.getElementById('testimonial-dots');

// Build dot indicators
if (dotsEl) {
    testimonials.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 't-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => showTestimonial(i));
        dotsEl.appendChild(dot);
    });
}

function showTestimonial(index) {
    if (!quoteEl || !authorEl) return;
    quoteEl.style.opacity  = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
        currentTestimonial       = index;
        quoteEl.textContent      = testimonials[index].quote;
        authorEl.textContent     = testimonials[index].author;
        document.querySelectorAll('.t-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        quoteEl.style.opacity  = '1';
        authorEl.style.opacity = '1';
    }, 300);
}

// Auto-rotate every 4 seconds
setInterval(() => {
    showTestimonial((currentTestimonial + 1) % testimonials.length);
}, 4000);

function openFacebook(e) {
    e.preventDefault();
    window.open('https://www.facebook.com/khimharsumampil', '_blank');
}