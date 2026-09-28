/**
 * HAIR STUDIO - MAIN CLIENT SCRIPT
 * Preserves original navigation and styling identity while powering:
 * - Dynamic Services & Pricing Menu with Search & Filters
 * - Stylists Section with Booking Shortcuts
 * - Appointment Booking Engine with Slot Availability & Coupon Validation
 * - Booking Confirmation Receipt
 * - Customer Dashboard (Upcoming & Previous History, Cancellation, Rescheduling)
 * - Admin Control Center (Live Statistics, Appointment Statuses, Service & Stylist CRUD)
 * - Hair Style Gallery with Lightbox
 * - Special Offers with One-Click Copy & Apply
 * - Reviews & Testimonials System with Star Rating
 * - Toast Notification Dispatcher
 */

// ==========================================================
// 1. ORIGINAL SIDE NAVIGATION LOGIC (PRESERVED & EXTENDED)
// ==========================================================
var menuBtn = document.getElementById("menuBtn");
var sideNav = document.getElementById("sideNav");
var menu = document.getElementById("menu");

if (sideNav) {
    sideNav.style.right = "-280px";
}

if (menuBtn) {
    menuBtn.onclick = function () {
        if (sideNav.style.right === "-280px" || sideNav.style.right === "") {
            sideNav.style.right = "0";
            if (menu) menu.src = "close.png";
        } else {
            sideNav.style.right = "-280px";
            if (menu) menu.src = "menu.png";
        }
    };
}

// Close sideNav when clicking any link
document.querySelectorAll("#sideNav a").forEach(link => {
    link.addEventListener("click", () => {
        if (sideNav && sideNav.style.right === "0px") {
            sideNav.style.right = "-280px";
            if (menu) menu.src = "menu.png";
        }
    });
});

// ==========================================================
// 2. DATA LAYER & STORAGE (DUAL REST API / LOCALSTORAGE)
// ==========================================================
const API_BASE = '/api';

const DEFAULT_DATA = {
    services: [
        {
            id: 1,
            name: "Hair Styling",
            category: "Styling",
            price: 600,
            duration: 45,
            image: "service_styling.jpg",
            description: "Personalized hair styling crafted to match your face profile, hair texture, and individual expression."
        },
        {
            id: 2,
            name: "Beard Trim & Grooming",
            category: "Grooming",
            price: 350,
            duration: 30,
            image: "service_beard.jpg",
            description: "Precision beard sculpt, hot towel prep, razor line-up, and nourishment with organic beard balm."
        },
        {
            id: 3,
            name: "Signature Hair Cut",
            category: "Haircut",
            price: 500,
            duration: 30,
            image: "service_haircut.jpg",
            description: "Tailored haircut with consultation, precision scissor and clipper work, wash and blow-dry finish."
        },
        {
            id: 4,
            name: "Hair Shampoo & Wash",
            category: "Hair Care",
            price: 400,
            duration: 30,
            image: "service_shampoo.jpg",
            description: "Scalp invigorating herbal shampoo wash, deep conditioning, and pressure point scalp massage."
        },
        {
            id: 5,
            name: "Hair Spa & Nourishment",
            category: "Spa",
            price: 1200,
            duration: 60,
            image: "service_hair_spa.jpg",
            description: "Deep moisture restoration hair spa to revive dry, dull hair, leaving it silky, bouncy, and hydrated."
        },
        {
            id: 6,
            name: "Hair Coloring & Highlights",
            category: "Coloring",
            price: 2000,
            duration: 90,
            image: "gallery_color.jpg",
            description: "Ammonia-free global color, balayage, or fashion highlights with long-lasting shine and color lock."
        },
        {
            id: 7,
            name: "Keratin Treatment",
            category: "Treatment",
            price: 2500,
            duration: 120,
            image: "service_treatment.jpg",
            description: "Intense protein smoothing therapy to eliminate stubborn frizz, repair damage, and add mirror shine."
        },
        {
            id: 8,
            name: "Royal Bridal Hair Styling",
            category: "Bridal",
            price: 3500,
            duration: 120,
            image: "gallery_bridal.jpg",
            description: "Elegant bridal updos, intricate braids, delicate floral styling, and all-day fixation for your special event."
        }
    ],
    stylists: [
        {
            id: 1,
            name: "John Miller",
            image: "stylist_john.jpg",
            specialization: "Hair Styling & Coloring",
            experience: "5 Years",
            rating: 4.9,
            reviewsCount: 142,
            availability: "Available Today",
            phone: "+91 98765 43210"
        },
        {
            id: 2,
            name: "Sophia Loren",
            image: "stylist_sophia.jpg",
            specialization: "Bridal & Hair Spa Specialist",
            experience: "7 Years",
            rating: 4.8,
            reviewsCount: 124,
            availability: "Available Today",
            phone: "+91 98765 43211"
        },
        {
            id: 3,
            name: "Crishna Patel",
            image: "stylist_crishna.jpg",
            specialization: "Classic Cuts & Beard Grooming",
            experience: "6 Years",
            rating: 4.9,
            reviewsCount: 98,
            availability: "Available Today",
            phone: "+91 98765 43212"
        },
        {
            id: 4,
            name: "Alex Vance",
            image: "pexels-hikaique-331989.jpg",
            specialization: "Modern Fades & Keratin Treatments",
            experience: "4 Years",
            rating: 4.7,
            reviewsCount: 86,
            availability: "Available Today",
            phone: "+91 98765 43213"
        }
    ],
    appointments: [
        {
            id: "HS-8421",
            customerName: "Rahul Sharma",
            customerEmail: "rahul@gmail.com",
            customerPhone: "9876500001",
            serviceId: 3,
            serviceName: "Signature Hair Cut",
            stylistId: 1,
            stylistName: "John Miller",
            date: "2026-09-30",
            time: "11:30 AM",
            duration: 30,
            amount: 450,
            discount: 50,
            coupon: "WELCOME10",
            status: "Confirmed",
            notes: "Prefers low taper fade on sides",
            createdAt: "2026-09-28T08:00:00Z"
        },
        {
            id: "HS-7319",
            customerName: "Rahul Sharma",
            customerEmail: "rahul@gmail.com",
            customerPhone: "9876500001",
            serviceId: 5,
            serviceName: "Hair Spa & Nourishment",
            stylistId: 2,
            stylistName: "Sophia Loren",
            date: "2026-09-15",
            time: "02:30 PM",
            duration: 60,
            amount: 960,
            discount: 240,
            coupon: "WEEKEND20",
            status: "Completed",
            notes: "Deep conditioning for dry ends",
            createdAt: "2026-09-14T10:00:00Z",
            reviewed: true
        },
        {
            id: "HS-9104",
            customerName: "Anita Verma",
            customerEmail: "anita@example.com",
            customerPhone: "9876500002",
            serviceId: 8,
            serviceName: "Royal Bridal Hair Styling",
            stylistId: 2,
            stylistName: "Sophia Loren",
            date: "2026-10-02",
            time: "10:00 AM",
            duration: 120,
            amount: 3000,
            discount: 500,
            coupon: "BRIDAL500",
            status: "Confirmed",
            notes: "Bridal trial styling session",
            createdAt: "2026-09-27T14:30:00Z"
        },
        {
            id: "HS-6201",
            customerName: "Karthik Reddy",
            customerEmail: "karthik@example.com",
            customerPhone: "9876500003",
            serviceId: 2,
            serviceName: "Beard Trim & Grooming",
            stylistId: 3,
            stylistName: "Crishna Patel",
            date: "2026-09-20",
            time: "04:00 PM",
            duration: 30,
            amount: 350,
            discount: 0,
            coupon: "",
            status: "Completed",
            notes: "Razor sharp line up",
            createdAt: "2026-09-19T11:00:00Z",
            reviewed: false
        }
    ],
    coupons: [
        {
            code: "WEEKEND20",
            type: "percent",
            discount: 20,
            minAmount: 800,
            description: "20% OFF on Hair Spa and Premium services!"
        },
        {
            code: "BRIDAL500",
            type: "flat",
            discount: 500,
            minAmount: 2000,
            description: "₹500 OFF on Bridal Hair Styling Packages!"
        },
        {
            code: "WELCOME10",
            type: "percent",
            discount: 10,
            minAmount: 400,
            description: "10% OFF on your First Hair Studio Visit!"
        },
        {
            code: "COLOR15",
            type: "percent",
            discount: 15,
            minAmount: 1500,
            description: "15% OFF on Hair Coloring & Balayage!"
        }
    ],
    reviews: [
        {
            id: 1,
            name: "MS DHONI",
            handle: "@mahi7",
            image: "dhoni.jpg",
            rating: 5,
            text: "I recently visited Hair Stdio and had a wonderful experience. The staff was friendly and professional, and the stylist really listened to my preferences, delivering exactly what I wanted. The salon was clean and had a relaxing atmosphere.",
            serviceName: "Hair Cut & Beard Trim",
            stylistName: "Crishna Patel",
            date: "2026-09-10"
        },
        {
            id: 2,
            name: "CRISTIANO RONALDO",
            handle: "@ronaldo",
            image: "ronaldo.jpeg.jpg",
            rating: 5,
            text: "I recently visited Hair Stdio and had a wonderful experience. The staff was friendly and professional, and the stylist really listened to my preferences, delivering exactly what I wanted.",
            serviceName: "Signature Hair Cut",
            stylistName: "John Miller",
            date: "2026-09-12"
        },
        {
            id: 3,
            name: "ACTOR SURYA",
            handle: "@actorsurya",
            image: "surya.jpeg.jpg",
            rating: 5,
            text: "I recently visited Hair Stdio and had a wonderful experience. The salon was clean and had a relaxing atmosphere.",
            serviceName: "Hair Styling",
            stylistName: "John Miller",
            date: "2026-09-18"
        }
    ],
    gallery: [
        {
            id: 1,
            title: "Modern Precision Fade Cut",
            category: "haircuts",
            image: "gallery_fade_cut.jpg",
            desc: "Razor-sharp temple taper fade with textured matte scissor crop on top."
        },
        {
            id: 2,
            title: "Sun-Kissed Balayage Waves",
            category: "coloring",
            image: "gallery_color.jpg",
            desc: "Seamless hand-painted caramel and warm blonde dimensional highlights."
        },
        {
            id: 3,
            title: "Royal Bridal Braided Updo",
            category: "bridal",
            image: "gallery_bridal.jpg",
            desc: "Romantic crown braid with fresh floral accents and delicate framing curls."
        },
        {
            id: 4,
            title: "Glamour Hollywood Waves",
            category: "styling",
            image: "gallery_glam_waves.jpg",
            desc: "Ultra-glossy, voluminous cascading waves with long-lasting silk bounce."
        },
        {
            id: 5,
            title: "Mirror Shine Keratin Makeover",
            category: "transformations",
            image: "service_treatment.jpg",
            desc: "Intense smoothing keratin transformation eliminating frizz with liquid glass shine."
        },
        {
            id: 6,
            title: "Beard Sculpt & Clean Razor Shave",
            category: "styling",
            image: "service_beard.jpg",
            desc: "Precision hot towel beard detailing with crisp razor lines and organic oils."
        }
    ]
};

// Storage helper functions
function getLocalDB() {
    const raw = localStorage.getItem('HAIR_STUDIO_DB');
    let db;
    if (!raw) {
        db = JSON.parse(JSON.stringify(DEFAULT_DATA));
    } else {
        try {
            db = JSON.parse(raw);
        } catch(e) {
            db = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    // Cleanse any unwanted reviews (Rohit Sharma, Rahul Sharma, Automated Test User)
    if (db.reviews) {
        db.reviews = db.reviews.filter(r => 
            !r.name.toLowerCase().includes('rohit') && 
            !r.name.toLowerCase().includes('rahul') && 
            !r.name.toLowerCase().includes('automated') && 
            !r.name.toLowerCase().includes('test')
        );
        // Ensure genuine default reviews exist
        if (db.reviews.length === 0) {
            db.reviews = JSON.parse(JSON.stringify(DEFAULT_DATA.reviews));
        }
    }

    // Update Stylist Crishna Patel
    if (db.stylists) {
        const crishna = db.stylists.find(st => st.id === 3 || st.name.toLowerCase().includes('patel'));
        if (crishna) {
            crishna.name = "Crishna Patel";
            crishna.image = "stylist_crishna.jpg";
        }
    }

    // Update service images
    if (db.services) {
        const imageMap = {
            1: "service_styling.jpg",
            2: "service_beard.jpg",
            3: "service_haircut.jpg",
            4: "service_shampoo.jpg",
            5: "service_hair_spa.jpg",
            6: "gallery_color.jpg",
            7: "service_treatment.jpg",
            8: "gallery_bridal.jpg"
        };
        db.services.forEach(s => {
            if (imageMap[s.id]) s.image = imageMap[s.id];
        });
    }

    // Update gallery images
    db.gallery = JSON.parse(JSON.stringify(DEFAULT_DATA.gallery));

    localStorage.setItem('HAIR_STUDIO_DB', JSON.stringify(db));
    return db;
}

function saveLocalDB(db) {
    localStorage.setItem('HAIR_STUDIO_DB', JSON.stringify(db));
}

// ==========================================================
// 2B. REAL AUTHENTICATION & SESSION MANAGEMENT (MONGODB + JWT)
// ==========================================================
let authToken = localStorage.getItem('HAIR_STUDIO_JWT') || null;
let currentUser = null;

// Store active database in memory
let appDB = getLocalDB();

// Restore session from MongoDB Atlas via JWT
async function restoreSession() {
    authToken = localStorage.getItem('HAIR_STUDIO_JWT');
    if (authToken) {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                currentUser = data.user;
            } else {
                localStorage.removeItem('HAIR_STUDIO_JWT');
                authToken = null;
                currentUser = null;
            }
        } catch (e) {
            console.warn('Session restore wait / connection:', e.message);
        }
    }
    updateAuthUI();
}

function updateAuthUI() {
    const topAuthContainer = document.getElementById('topAuthButtons');
    const sideNavUserPill = document.getElementById('sideNavUserPill');

    if (currentUser) {
        // Authenticated State
        if (topAuthContainer) {
            if (currentUser.role === 'admin') {
                topAuthContainer.innerHTML = `
                    <button onclick="openAdminDashboard()" class="top-badge-btn" id="topAdminBtn"><i class="fa-solid fa-shield-halved"></i> Admin Portal</button>
                    <button onclick="handleLogout()" class="top-badge-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
                `;
            } else {
                topAuthContainer.innerHTML = `
                    <button onclick="openCustomerDashboard()" class="top-badge-btn" id="topUserBtn"><i class="fa-solid fa-user"></i> My Dashboard</button>
                    <button onclick="handleLogout()" class="top-badge-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
                `;
            }
        }

        if (sideNavUserPill) {
            sideNavUserPill.innerHTML = `
                <span class="uname"><i class="fa-solid fa-circle-user"></i> ${currentUser.name}</span>
                <small>${currentUser.role === 'admin' ? 'Administrator' : 'Verified Customer'}</small>
                <div style="margin-top: 8px;">
                    <a href="javascript:void(0)" onclick="handleLogout()" style="color: #fff; text-decoration: underline; font-size: 11px;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
                </div>
            `;
        }

        // Fill form fields with logged-in user profile
        const nameInput = document.getElementById('bookingNameInput');
        const phoneInput = document.getElementById('bookingPhoneInput');
        const emailInput = document.getElementById('bookingEmailInput');
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';

    } else {
        // Logged-out (Guest) State
        if (topAuthContainer) {
            topAuthContainer.innerHTML = `
                <button onclick="openAuthModal('customer')" class="top-badge-btn" id="topSignInBtn"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In</button>
            `;
        }

        if (sideNavUserPill) {
            sideNavUserPill.innerHTML = `
                <span class="uname"><i class="fa-solid fa-user-lock"></i> Welcome, Guest</span>
                <small>Sign in to view your appointments</small>
                <div style="margin-top: 8px;">
                    <a href="javascript:void(0)" onclick="openAuthModal('customer')" style="color: #fff; text-decoration: underline; font-size: 11px;"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In / Register</a>
                </div>
            `;
        }
    }
}

// ----------------------------------------------------------
// Auth Modal & Form Handlers
// ----------------------------------------------------------
function openAuthModal(initialTab = 'customer', notice = '') {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const noticeBanner = document.getElementById('authNoticeBanner');
    const noticeText = document.getElementById('authNoticeText');
    if (notice && noticeBanner && noticeText) {
        noticeText.textContent = notice;
        noticeBanner.style.display = 'block';
    } else if (noticeBanner) {
        noticeBanner.style.display = 'none';
    }

    hideAuthError();

    const adminEmailField = document.getElementById('adminLoginEmail');
    const adminPassField = document.getElementById('adminLoginPassword');
    if (adminEmailField) { adminEmailField.value = ''; adminEmailField.placeholder = ''; }
    if (adminPassField) { adminPassField.value = ''; }

    if (initialTab === 'admin') {
        switchAuthTab('admin', document.getElementById('tabAdminBtn'));
    } else {
        switchAuthTab('customer', document.getElementById('tabCustomerBtn'));
    }

    openModal('authModal');
}

function switchAuthTab(tab, btn) {
    document.querySelectorAll('#authModal .dash-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const customerPanel = document.getElementById('customerAuthPanel');
    const adminPanel = document.getElementById('adminAuthPanel');
    const title = document.getElementById('authModalTitle');

    hideAuthError();

    const adminEmailField = document.getElementById('adminLoginEmail');
    const adminPassField = document.getElementById('adminLoginPassword');
    if (adminEmailField) { adminEmailField.value = ''; adminEmailField.placeholder = ''; }
    if (adminPassField) { adminPassField.value = ''; }

    if (tab === 'admin') {
        if (customerPanel) customerPanel.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        if (title) title.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Admin Control Center Login`;
    } else {
        if (customerPanel) customerPanel.style.display = 'block';
        if (adminPanel) adminPanel.style.display = 'none';
        if (title) title.innerHTML = `<i class="fa-solid fa-lock"></i> Customer Sign In`;
    }
}

function toggleCustomerAuthMode(mode) {
    const loginForm = document.getElementById('customerLoginForm');
    const regForm = document.getElementById('customerRegisterForm');
    hideAuthError();

    if (mode === 'register') {
        if (loginForm) loginForm.style.display = 'none';
        if (regForm) regForm.style.display = 'block';
        document.getElementById('authModalTitle').innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Customer Account`;
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (regForm) regForm.style.display = 'none';
        document.getElementById('authModalTitle').innerHTML = `<i class="fa-solid fa-lock"></i> Customer Sign In`;
    }
}

function showAuthError(msg) {
    const banner = document.getElementById('authErrorBanner');
    const text = document.getElementById('authErrorText');
    if (banner && text) {
        text.textContent = msg;
        banner.style.display = 'block';
    }
}

function hideAuthError() {
    const banner = document.getElementById('authErrorBanner');
    if (banner) banner.style.display = 'none';
}

async function handleCustomerLoginSubmit(event) {
    event.preventDefault();
    hideAuthError();
    const email = document.getElementById('customerLoginEmail').value.trim();
    const password = document.getElementById('customerLoginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, requestedRole: 'customer' })
        });
        const data = await res.json();
        if (!res.ok) {
            showAuthError(data.error || 'Invalid email or password.');
            return;
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('HAIR_STUDIO_JWT', authToken);
        updateAuthUI();
        closeModal('authModal');
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        fetchNotifications(true);
        openCustomerDashboard();
    } catch (err) {
        showAuthError('Unable to connect to server. Please try again.');
    }
}

async function handleCustomerRegisterSubmit(event) {
    event.preventDefault();
    hideAuthError();
    const name = document.getElementById('custRegName').value.trim();
    const phone = document.getElementById('custRegPhone').value.trim();
    const email = document.getElementById('custRegEmail').value.trim();
    const password = document.getElementById('custRegPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        const data = await res.json();
        if (!res.ok) {
            showAuthError(data.error || 'Registration failed.');
            return;
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('HAIR_STUDIO_JWT', authToken);
        updateAuthUI();
        closeModal('authModal');
        showToast(`Account created successfully! Welcome, ${currentUser.name}.`, 'success');
        fetchNotifications(true);
        openCustomerDashboard();
    } catch (err) {
        showAuthError('Unable to connect to server. Please try again.');
    }
}

async function handleAdminLoginSubmit(event) {
    event.preventDefault();
    hideAuthError();
    const email = document.getElementById('adminLoginEmail').value.trim();
    const password = document.getElementById('adminLoginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, requestedRole: 'admin' })
        });
        const data = await res.json();
        if (!res.ok) {
            showAuthError(data.error || 'Invalid admin credentials.');
            return;
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('HAIR_STUDIO_JWT', authToken);
        updateAuthUI();
        closeModal('authModal');
        showToast(`Admin access granted. Welcome, ${currentUser.name}!`, 'success');
        fetchNotifications(true);
        openAdminDashboard();
    } catch (err) {
        showAuthError('Unable to connect to server. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('HAIR_STUDIO_JWT');
    authToken = null;
    currentUser = null;
    closeModal('customerDashboardModal');
    closeModal('adminDashboardModal');
    closeModal('authModal');
    updateAuthUI();
    showToast('You have been logged out successfully.', 'info');
    fetchNotifications(true);
}

// Sync with backend server if running
async function syncWithServer() {
    try {
        const res = await fetch(`${API_BASE}/services`);
        if (res.ok) {
            const services = await res.json();
            const [stylistsRes, reviewsRes, couponsRes, galleryRes] = await Promise.all([
                fetch(`${API_BASE}/stylists`),
                fetch(`${API_BASE}/reviews`),
                fetch(`${API_BASE}/coupons`),
                fetch(`${API_BASE}/gallery`)
            ]);
            if (stylistsRes.ok) appDB.stylists = await stylistsRes.json();
            if (reviewsRes.ok) appDB.reviews = await reviewsRes.json();
            if (couponsRes.ok) appDB.coupons = await couponsRes.json();
            if (galleryRes.ok) appDB.gallery = await galleryRes.json();
            appDB.services = services;
            saveLocalDB(appDB);
            renderAllSections();
        }
    } catch (e) {
        console.log("Using local database mode");
    }
    await restoreSession();
    fetchNotifications(true);
    if (!notifPollingInterval) {
        notifPollingInterval = setInterval(() => fetchNotifications(false), 7000);
    }
}

// ==========================================================
// 3. REAL-TIME NOTIFICATIONS & TOAST DISPATCHER
// ==========================================================
let studioNotifications = [];
let lastSeenNotifIds = new Set();
let notifPollingInterval = null;
let currentNotifFilter = 'all';

function playNotificationSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Subtle 2-tone luxury chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
        gain2.gain.setValueAtTime(0.14, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.6);
    } catch (e) {
        // AudioContext may be restricted before user gesture
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `studio-toast ${type}`;

    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

function formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildNotificationCardHTML(notif, showAdminActions = false) {
    const isUnread = !notif.read;
    const type = notif.type || 'info';
    let iconClass = 'fa-bell';
    if (type === 'rescheduled') iconClass = 'fa-clock-rotate-left';
    else if (type === 'confirmed') iconClass = 'fa-circle-check';
    else if (type === 'cancelled') iconClass = 'fa-ban';
    else if (type === 'booking') iconClass = 'fa-calendar-plus';
    else if (type === 'completed') iconClass = 'fa-wand-magic-sparkles';

    const timeAgo = formatTimeAgo(notif.createdAt);

    return `
        <div class="notif-card ${type} ${isUnread ? 'unread' : ''}" id="notif-card-${notif.id}">
            <div class="notif-icon-box ${type}">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-header">
                    <h5 class="notif-title">${notif.title}</h5>
                    <span class="notif-time">${timeAgo}</span>
                </div>
                <p class="notif-msg">${notif.message}</p>
                <div class="notif-actions">
                    ${isUnread ? `
                        <button class="studio-btn-outline studio-btn-sm" style="font-size: 11px; padding: 2px 7px;" onclick="markNotificationAsRead('${notif.id}')">
                            <i class="fa-solid fa-check"></i> Mark Read
                        </button>
                    ` : ''}
                    ${showAdminActions && type === 'rescheduled' && notif.appointmentId ? `
                        <button class="studio-btn studio-btn-sm" style="font-size: 11px; padding: 3px 9px;" onclick="adminApproveReschedule('${notif.id}', '${notif.appointmentId}')">
                            <span></span><i class="fa-solid fa-check"></i> Approve & Confirm Slot
                        </button>
                    ` : ''}
                    ${!showAdminActions && notif.appointmentId ? `
                        <button class="studio-btn-outline studio-btn-sm" style="font-size: 11px; padding: 2px 7px;" onclick="closeModal('notificationsCenterModal'); openCustomerDashboard();">
                            <i class="fa-solid fa-calendar"></i> View Booking
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

async function fetchNotifications(isInitial = false) {
    try {
        let url = `${API_BASE}/notifications`;
        const headers = {};

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else if (currentUser && currentUser.email) {
            url += `?email=${encodeURIComponent(currentUser.email)}`;
        } else {
            const guestEmail = document.getElementById('bookingEmailInput')?.value || localStorage.getItem('STUDIO_LAST_BOOKING_EMAIL');
            if (guestEmail) {
                url += `?email=${encodeURIComponent(guestEmail)}`;
            }
        }

        const res = await fetch(url, { headers });
        if (!res.ok) return;

        const notifs = await res.json();
        if (!Array.isArray(notifs)) return;

        let hasNewAlert = false;
        notifs.forEach(n => {
            if (!lastSeenNotifIds.has(n.id)) {
                if (!isInitial && !n.read) {
                    hasNewAlert = true;
                    const alertType = n.type === 'rescheduled' ? 'warning' : n.type === 'confirmed' ? 'success' : 'info';
                    showToast(`${n.title}: ${n.message}`, alertType);
                }
                lastSeenNotifIds.add(n.id);
            }
        });

        if (hasNewAlert) {
            playNotificationSound();
        }

        studioNotifications = notifs;

        // Update Badges
        const unreadCount = notifs.filter(n => !n.read).length;
        const topBadge = document.getElementById('topNotifBadge');
        const sideBadge = document.getElementById('sideNotifBadge');
        const custBadge = document.getElementById('custAlertsTabBadge');
        const adminBadge = document.getElementById('adminAlertsTabBadge');

        [topBadge, sideBadge, custBadge, adminBadge].forEach(badge => {
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        });

        renderNotificationsCenter();
        renderAdminAlertsTab();
        renderCustomerAlertsTab();
    } catch (e) { }
}

function openNotificationsCenter() {
    fetchNotifications();
    openModal('notificationsCenterModal');
}

function filterNotifications(filterType, btn) {
    currentNotifFilter = filterType;
    document.querySelectorAll('.notif-filter-group .notif-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderNotificationsCenter();
}

function renderNotificationsCenter() {
    const listEl = document.getElementById('notificationsCenterList');
    if (!listEl) return;

    let filtered = [...studioNotifications];
    if (currentNotifFilter === 'rescheduled') {
        filtered = filtered.filter(n => n.type === 'rescheduled');
    } else if (currentNotifFilter === 'unread') {
        filtered = filtered.filter(n => !n.read);
    }

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="notif-empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No notifications ${currentNotifFilter !== 'all' ? 'matching this filter' : 'at this time'}.</p>
            </div>
        `;
        return;
    }

    const isAdmin = currentUser && currentUser.role === 'admin';
    listEl.innerHTML = filtered.map(n => buildNotificationCardHTML(n, isAdmin)).join('');
}

function renderAdminAlertsTab() {
    const listEl = document.getElementById('adminAlertsList');
    if (!listEl) return;

    if (studioNotifications.length === 0) {
        listEl.innerHTML = `
            <div class="notif-empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No salon notifications or reschedule requests pending.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = studioNotifications.map(n => buildNotificationCardHTML(n, true)).join('');
}

function renderCustomerAlertsTab() {
    const listEl = document.getElementById('customerAlertsList');
    if (!listEl) return;

    if (studioNotifications.length === 0) {
        listEl.innerHTML = `
            <div class="notif-empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No notifications found for your account.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = studioNotifications.map(n => buildNotificationCardHTML(n, false)).join('');
}

async function markNotificationAsRead(id) {
    const notif = studioNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
    renderNotificationsCenter();
    renderAdminAlertsTab();
    renderCustomerAlertsTab();

    try {
        await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
        fetchNotifications();
    } catch (e) { }
}

async function markAllNotificationsRead() {
    studioNotifications.forEach(n => n.read = true);
    renderNotificationsCenter();
    renderAdminAlertsTab();
    renderCustomerAlertsTab();

    const body = {};
    if (currentUser && currentUser.email) body.email = currentUser.email;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        await fetch(`${API_BASE}/notifications/mark-all-read`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        showToast('All notifications marked as read.', 'info');
        fetchNotifications();
    } catch (e) { }
}

async function clearReadNotifications() {
    studioNotifications = studioNotifications.filter(n => !n.read);
    renderNotificationsCenter();
    renderAdminAlertsTab();
    renderCustomerAlertsTab();

    const body = {};
    if (currentUser && currentUser.email) body.email = currentUser.email;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        await fetch(`${API_BASE}/notifications/clear`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        showToast('Read notifications cleared.', 'info');
        fetchNotifications();
    } catch (e) { }
}

async function adminApproveReschedule(notifId, apptId) {
    updateAppointmentStatus(apptId, 'Confirmed');
    await markNotificationAsRead(notifId);
    showToast(`Appointment #${apptId} new slot has been approved and confirmed!`, 'success');
}


// ==========================================================
// 4. SERVICES & PRICING LOGIC
// ==========================================================
let currentServiceCategory = 'All';

function renderServices(servicesToRender = appDB.services) {
    const container = document.getElementById('servicesGridContainer');
    if (!container) return;

    if (!servicesToRender || servicesToRender.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 8px;">
                <p style="color: #888; font-size: 16px;">No services found matching your criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = servicesToRender.map(s => `
        <div class="service-card-item">
            <div class="service-card-img">
                <img src="${s.image}" alt="${s.name}" onerror="this.src='2.jpg'">
                <span class="service-card-badge">${s.category || 'General'}</span>
            </div>
            <div class="service-card-body">
                <h4>${s.name}</h4>
                <div class="service-card-meta">
                    <span><i class="fa-regular fa-clock"></i> ${s.duration} mins</span>
                    <span><i class="fa-solid fa-star" style="color: #ff9800;"></i> 4.9</span>
                </div>
                <p>${s.description || 'Professional styling service tailored for you.'}</p>
                <div class="service-card-footer">
                    <span class="service-price">₹${s.price}</span>
                    <button class="studio-btn studio-btn-sm" onclick="selectServiceForBooking(${s.id})">
                        <span></span>Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterServices() {
    const searchVal = (document.getElementById('serviceSearchInput')?.value || '').toLowerCase();
    const maxPrice = Number(document.getElementById('priceRangeInput')?.value || 4000);
    const label = document.getElementById('priceRangeLabel');
    if (label) label.textContent = `₹${maxPrice}`;

    const filtered = appDB.services.filter(s => {
        const matchesCategory = currentServiceCategory === 'All' || s.category.toLowerCase() === currentServiceCategory.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(searchVal) || (s.description && s.description.toLowerCase().includes(searchVal));
        const matchesPrice = Number(s.price) <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
    });

    renderServices(filtered);
}

function setServiceCategory(cat, btn) {
    currentServiceCategory = cat;
    document.querySelectorAll('.services-menu-container .cat-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    filterServices();
}

function selectServiceForBooking(serviceId) {
    const serviceSelect = document.getElementById('bookingServiceSelect');
    if (serviceSelect) {
        serviceSelect.value = serviceId;
        handleBookingServiceChange();
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast("Service selected! Please pick your preferred stylist and date.", "info");
}

// ==========================================================
// 5. STYLISTS LOGIC
// ==========================================================
let currentStylistFilter = 'All';

function renderStylists(stylistsToRender = appDB.stylists) {
    const container = document.getElementById('stylistsGridContainer');
    if (!container) return;

    if (!stylistsToRender || stylistsToRender.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 8px;">
                <p style="color: #888; font-size: 16px;">No stylists found matching your criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = stylistsToRender.map(st => `
        <div class="stylist-card">
            <div class="stylist-img-container">
                <img src="${st.image}" alt="${st.name}" onerror="this.src='stylist_john.jpg'">
                <div class="stylist-avail-badge">
                    <span class="avail-dot"></span> ${st.availability || 'Available Today'}
                </div>
            </div>
            <div class="stylist-card-info">
                <h3>${st.name}</h3>
                <span class="stylist-spec">${st.specialization}</span>
                <div class="stylist-stats">
                    <span><i class="fa-solid fa-briefcase" style="color: #009688;"></i> ${st.experience}</span>
                    <span class="rating"><i class="fa-solid fa-star"></i> ${st.rating} (${st.reviewsCount || 50})</span>
                </div>
                <div style="margin-top: auto; display: flex; gap: 8px;">
                    <button class="studio-btn studio-btn-sm" style="flex: 1;" onclick="selectStylistForBooking(${st.id})">
                        <span></span>Book Stylist
                    </button>
                    <a href="tel:${st.phone || '+919876543210'}" class="studio-btn-outline studio-btn-sm" title="Contact Stylist">
                        <i class="fa-solid fa-phone"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function filterStylists() {
    const searchVal = (document.getElementById('stylistSearchInput')?.value || '').toLowerCase();
    const filtered = appDB.stylists.filter(st => {
        const matchesCategory = currentStylistFilter === 'All' ||
            st.specialization.toLowerCase().includes(currentStylistFilter.toLowerCase());
        const matchesSearch = st.name.toLowerCase().includes(searchVal) ||
            st.specialization.toLowerCase().includes(searchVal);
        return matchesCategory && matchesSearch;
    });
    renderStylists(filtered);
}

function setStylistFilter(filterKey, btn) {
    currentStylistFilter = filterKey;
    document.querySelectorAll('.stylists-filter-bar .cat-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    filterStylists();
}

function selectStylistForBooking(stylistId) {
    const stylistSelect = document.getElementById('bookingStylistSelect');
    if (stylistSelect) {
        stylistSelect.value = stylistId;
        handleBookingStylistChange();
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast("Stylist selected! Now choose your preferred appointment date & slot.", "info");
}

// ==========================================================
// 6. APPOINTMENT BOOKING SYSTEM
// ==========================================================
const ALL_TIME_SLOTS = [
    "09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM",
    "02:30 PM", "04:00 PM", "05:30 PM", "07:00 PM"
];

let appliedCoupon = null;

function initBookingForm() {
    const dateInput = document.getElementById('bookingDateInput');
    if (dateInput) {
        // Set minimum date to today (prevent past appointments)
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }

    // Populate Customer info defaults if logged in
    const nameInput = document.getElementById('bookingNameInput');
    const phoneInput = document.getElementById('bookingPhoneInput');
    const emailInput = document.getElementById('bookingEmailInput');
    if (currentUser) {
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    }

    populateBookingDropdowns();
    renderTimeSlots();
    updateBookingSummary();
}

function populateBookingDropdowns() {
    const serviceSelect = document.getElementById('bookingServiceSelect');
    const stylistSelect = document.getElementById('bookingStylistSelect');

    if (serviceSelect) {
        const currentVal = serviceSelect.value;
        serviceSelect.innerHTML = `<option value="">-- Choose a Service --</option>` +
            appDB.services.map(s => `<option value="${s.id}">${s.name} - ₹${s.price} (${s.duration}m)</option>`).join('');
        if (currentVal) serviceSelect.value = currentVal;
    }

    if (stylistSelect) {
        const currentVal = stylistSelect.value;
        stylistSelect.innerHTML = `<option value="">-- Choose Stylist --</option>` +
            appDB.stylists.map(st => `<option value="${st.id}">${st.name} (${st.specialization})</option>`).join('');
        if (currentVal) stylistSelect.value = currentVal;
    }
}

function renderTimeSlots() {
    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;

    const dateVal = document.getElementById('bookingDateInput')?.value;
    const stylistIdVal = document.getElementById('bookingStylistSelect')?.value;
    const selectedTimeInput = document.getElementById('bookingSelectedTime');

    // Find slots that are already booked for this stylist on this date
    const bookedTimes = appDB.appointments
        .filter(a => a.date === dateVal && String(a.stylistId) === String(stylistIdVal) && a.status !== 'Cancelled')
        .map(a => a.time);

    container.innerHTML = ALL_TIME_SLOTS.map(slot => {
        const isBooked = bookedTimes.includes(slot);
        const isActive = selectedTimeInput?.value === slot;
        return `
            <button type="button" 
                class="time-slot-btn ${isActive ? 'active' : ''}" 
                ${isBooked ? 'disabled title="Slot already booked for this stylist"' : ''}
                onclick="selectTimeSlot('${slot}', this)">
                ${slot}
            </button>
        `;
    }).join('');
}

function selectTimeSlot(slot, btn) {
    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const input = document.getElementById('bookingSelectedTime');
    if (input) input.value = slot;
    updateBookingSummary();
}

function handleBookingServiceChange() {
    updateBookingSummary();
}

function handleBookingStylistChange() {
    renderTimeSlots();
    updateBookingSummary();
}

function handleBookingDateChange() {
    renderTimeSlots();
    updateBookingSummary();
}

function applyCouponCode() {
    const code = (document.getElementById('bookingCouponInput')?.value || '').trim().toUpperCase();
    const msgEl = document.getElementById('couponMessage');
    const serviceSelect = document.getElementById('bookingServiceSelect');

    if (!code) {
        appliedCoupon = null;
        if (msgEl) { msgEl.textContent = 'Please enter a coupon code'; msgEl.style.color = '#e53935'; }
        updateBookingSummary();
        return;
    }

    const service = appDB.services.find(s => s.id === Number(serviceSelect?.value));
    const basePrice = service ? Number(service.price) : 0;

    const foundCoupon = appDB.coupons.find(c => c.code === code);
    if (!foundCoupon) {
        appliedCoupon = null;
        if (msgEl) { msgEl.textContent = 'Invalid coupon code.'; msgEl.style.color = '#e53935'; }
        showToast('Invalid coupon code.', 'error');
        updateBookingSummary();
        return;
    }

    if (basePrice < foundCoupon.minAmount) {
        appliedCoupon = null;
        if (msgEl) {
            msgEl.textContent = `Coupon requires minimum booking amount of ₹${foundCoupon.minAmount}`;
            msgEl.style.color = '#e53935';
        }
        showToast(`Minimum order of ₹${foundCoupon.minAmount} required for this coupon`, 'error');
        updateBookingSummary();
        return;
    }

    appliedCoupon = foundCoupon;
    if (msgEl) {
        msgEl.textContent = `Coupon applied! ${foundCoupon.description}`;
        msgEl.style.color = '#2e7d32';
    }
    showToast(`Coupon ${code} applied successfully!`, 'success');
    updateBookingSummary();
}

function updateBookingSummary() {
    const serviceSelect = document.getElementById('bookingServiceSelect');
    const stylistSelect = document.getElementById('bookingStylistSelect');
    const dateInput = document.getElementById('bookingDateInput');
    const timeInput = document.getElementById('bookingSelectedTime');

    const service = appDB.services.find(s => s.id === Number(serviceSelect?.value));
    const stylist = appDB.stylists.find(st => st.id === Number(stylistSelect?.value));

    // Summary elements
    const sumService = document.getElementById('sumServiceName');
    const sumStylist = document.getElementById('sumStylistName');
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const sumDuration = document.getElementById('sumDuration');
    const sumBasePrice = document.getElementById('sumBasePrice');
    const sumDiscountRow = document.getElementById('sumDiscountRow');
    const sumDiscount = document.getElementById('sumDiscount');
    const sumTotal = document.getElementById('sumTotalAmount');

    if (sumService) sumService.textContent = service ? service.name : 'Please select';
    if (sumStylist) sumStylist.textContent = stylist ? stylist.name : 'Please select';
    if (sumDate) sumDate.textContent = dateInput?.value || 'Not chosen';
    if (sumTime) sumTime.textContent = timeInput?.value || 'Not chosen';
    if (sumDuration) sumDuration.textContent = service ? `${service.duration} mins` : '--';

    const base = service ? Number(service.price) : 0;
    if (sumBasePrice) sumBasePrice.textContent = `₹${base}`;

    let discount = 0;
    if (appliedCoupon && base >= appliedCoupon.minAmount) {
        if (appliedCoupon.type === 'percent') {
            discount = Math.round((base * appliedCoupon.discount) / 100);
        } else {
            discount = appliedCoupon.discount;
        }
        if (sumDiscountRow) sumDiscountRow.style.display = 'flex';
        if (sumDiscount) sumDiscount.textContent = `-₹${discount}`;
    } else {
        if (sumDiscountRow) sumDiscountRow.style.display = 'none';
    }

    const total = Math.max(0, base - discount);
    if (sumTotal) sumTotal.textContent = `₹${total}`;
}

async function handleBookingSubmit(event) {
    event.preventDefault();

    const serviceId = Number(document.getElementById('bookingServiceSelect')?.value);
    const stylistId = Number(document.getElementById('bookingStylistSelect')?.value);
    const date = document.getElementById('bookingDateInput')?.value;
    const time = document.getElementById('bookingSelectedTime')?.value;
    const name = document.getElementById('bookingNameInput')?.value.trim();
    const phone = document.getElementById('bookingPhoneInput')?.value.trim();
    const email = document.getElementById('bookingEmailInput')?.value.trim();
    const notes = document.getElementById('bookingNotesInput')?.value.trim();

    if (!time) {
        showToast("Please choose an available time slot.", "error");
        return;
    }

    // Validation: Prevent past date
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
        showToast("Cannot book appointments in the past.", "error");
        return;
    }

    // Validation: Check duplicate booking
    const conflict = appDB.appointments.find(a =>
        a.date === date && a.time === time && a.stylistId === stylistId && a.status !== 'Cancelled'
    );
    if (conflict) {
        showToast("This time slot is already booked for this stylist. Please pick another slot.", "error");
        return;
    }

    const service = appDB.services.find(s => s.id === serviceId);
    const stylist = appDB.stylists.find(st => st.id === stylistId);

    const base = service ? Number(service.price) : 0;
    let discount = 0;
    if (appliedCoupon && base >= appliedCoupon.minAmount) {
        discount = appliedCoupon.type === 'percent' ? Math.round((base * appliedCoupon.discount) / 100) : appliedCoupon.discount;
    }
    const finalAmount = Math.max(0, base - discount);

    const newAppointment = {
        id: `HS-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        serviceId: serviceId,
        serviceName: service ? service.name : "Custom Service",
        stylistId: stylistId,
        stylistName: stylist ? stylist.name : "Hair Stylist",
        date: date,
        time: time,
        duration: service ? service.duration : 30,
        amount: finalAmount,
        discount: discount,
        coupon: appliedCoupon ? appliedCoupon.code : "",
        status: "Confirmed",
        notes: notes,
        createdAt: new Date().toISOString()
    };

    // Save to local DB & backend
    appDB.appointments.unshift(newAppointment);
    saveLocalDB(appDB);

    const bookingHeaders = { 'Content-Type': 'application/json' };
    if (authToken) bookingHeaders['Authorization'] = `Bearer ${authToken}`;

    try {
        fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: bookingHeaders,
            body: JSON.stringify(newAppointment)
        });
    } catch (e) { }

    showToast(`Appointment booked successfully! Booking Ref: #${newAppointment.id}`, "success");
    if (email) localStorage.setItem('STUDIO_LAST_BOOKING_EMAIL', email);
    setTimeout(() => fetchNotifications(false), 500);

    // Display Confirmation Receipt Modal
    displayBookingReceipt(newAppointment);

    // Reset Form
    event.target.reset();
    appliedCoupon = null;
    document.getElementById('bookingSelectedTime').value = '';
    const msgEl = document.getElementById('couponMessage');
    if (msgEl) msgEl.textContent = '';
    renderTimeSlots();
    updateBookingSummary();
    renderAllSections();
    if (currentUser) {
        updateAuthUI();
    }
}

function displayBookingReceipt(appt) {
    document.getElementById('receiptId').textContent = `#${appt.id}`;
    document.getElementById('receiptCustomer').textContent = appt.customerName;
    document.getElementById('receiptService').textContent = appt.serviceName;
    document.getElementById('receiptStylist').textContent = appt.stylistName;
    document.getElementById('receiptDateTime').textContent = `${appt.date} at ${appt.time}`;
    document.getElementById('receiptDuration').textContent = `${appt.duration} minutes`;
    document.getElementById('receiptAmount').textContent = `₹${appt.amount}`;
    document.getElementById('receiptStatus').textContent = appt.status.toUpperCase();

    openModal('bookingReceiptModal');
}

function printAppointmentSlip() {
    const id = document.getElementById('receiptId')?.textContent || '#HS-0000';
    const customer = document.getElementById('receiptCustomer')?.textContent || 'Guest Customer';
    const service = document.getElementById('receiptService')?.textContent || '--';
    const stylist = document.getElementById('receiptStylist')?.textContent || '--';
    const dateTime = document.getElementById('receiptDateTime')?.textContent || '--';
    const duration = document.getElementById('receiptDuration')?.textContent || '--';
    const amount = document.getElementById('receiptAmount')?.textContent || '₹0';
    const status = document.getElementById('receiptStatus')?.textContent || 'CONFIRMED';

    // Create or reuse isolated hidden print iframe
    let printFrame = document.getElementById('receiptPrintFrame');
    if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'receiptPrintFrame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hair Studio Booking Slip - ${id}</title>
            <style>
                @page { size: auto; margin: 12mm; }
                body {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                    color: #222;
                    background: #fff;
                    margin: 0;
                    padding: 20px;
                }
                .slip-container {
                    max-width: 440px;
                    margin: 0 auto;
                    border: 2px dashed #009688;
                    border-radius: 8px;
                    padding: 24px;
                    background: #fff;
                }
                .slip-header {
                    text-align: center;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 14px;
                    margin-bottom: 14px;
                }
                .slip-header h1 {
                    margin: 0;
                    color: #009688;
                    font-size: 26px;
                    letter-spacing: 1px;
                }
                .slip-header p {
                    margin: 4px 0 0;
                    color: #666;
                    font-size: 13px;
                }
                .badge {
                    display: inline-block;
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 12px;
                    margin-top: 8px;
                    border: 1px solid #c8e6c9;
                }
                .table-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f5f5f5;
                    font-size: 13.5px;
                }
                .table-row span {
                    color: #666;
                }
                .table-row strong {
                    color: #111;
                    font-weight: 600;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0 6px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #009688;
                    border-top: 2px solid #009688;
                    margin-top: 10px;
                }
                .slip-footer {
                    text-align: center;
                    margin-top: 18px;
                    padding-top: 12px;
                    border-top: 1px dashed #ccc;
                    font-size: 11px;
                    color: #777;
                    line-height: 1.5;
                }
                .barcode {
                    letter-spacing: 5px;
                    font-family: monospace;
                    font-weight: bold;
                    margin-top: 8px;
                    font-size: 15px;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="slip-container">
                <div class="slip-header">
                    <h1>HAIR STUDIO</h1>
                    <p>Luxury Barber & Styling Salon</p>
                    <p style="font-size: 12px; color: #888;">123 Fashion Blvd, Jubilee Hills | Tel: +91 98765 43210</p>
                    <div class="badge">&#10003; ${status}</div>
                </div>
                <div class="table-row">
                    <span>Booking Reference:</span>
                    <strong>${id}</strong>
                </div>
                <div class="table-row">
                    <span>Customer Name:</span>
                    <strong>${customer}</strong>
                </div>
                <div class="table-row">
                    <span>Service:</span>
                    <strong>${service}</strong>
                </div>
                <div class="table-row">
                    <span>Stylist:</span>
                    <strong>${stylist}</strong>
                </div>
                <div class="table-row">
                    <span>Date & Time:</span>
                    <strong>${dateTime}</strong>
                </div>
                <div class="table-row">
                    <span>Duration:</span>
                    <strong>${duration}</strong>
                </div>
                <div class="total-row">
                    <span>Amount:</span>
                    <span>${amount}</span>
                </div>
                <div class="slip-footer">
                    <div class="barcode">||| | ||||| || |||| |||</div>
                    <p>Please arrive 10 minutes prior to your appointment.<br>Free cancellation up to 2 hours before scheduled slot.</p>
                    <p>Thank you for choosing Hair Studio!</p>
                </div>
            </div>
        </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        } catch (e) {
            window.print();
        }
    }, 250);
}

// ==========================================================
// 7. HAIR STYLE GALLERY & LIGHTBOX
// ==========================================================
let currentGalleryFilter = 'all';

function renderGallery(galleryItems = appDB.gallery) {
    const container = document.getElementById('galleryGridContainer');
    if (!container) return;

    container.innerHTML = galleryItems.map(item => `
        <div class="gallery-item" onclick="openLightbox('${item.image}', '${item.title}', '${item.desc}')">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='2.jpg'">
            <div class="gallery-zoom-icon"><i class="fa-solid fa-expand"></i></div>
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
            </div>
        </div>
    `).join('');
}

function filterGallery(category, btn) {
    currentGalleryFilter = category;
    document.querySelectorAll('.gallery-filters .gallery-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (category === 'all') {
        renderGallery(appDB.gallery);
    } else {
        const filtered = appDB.gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());
        renderGallery(filtered);
    }
}

function openLightbox(src, title, desc) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxTitle').textContent = title;
    document.getElementById('lightboxDesc').textContent = desc;
    openModal('lightboxModal');
}

// ==========================================================
// 8. SPECIAL OFFERS & COUPONS
// ==========================================================
function renderOffers() {
    const container = document.getElementById('offersContainer');
    if (!container) return;

    container.innerHTML = appDB.coupons.map(coupon => `
        <div class="offer-card">
            <div>
                <span class="offer-badge"><i class="fa-solid fa-bolt"></i> LIMITED TIME OFFER</span>
                <h3>${coupon.code === 'WEEKEND20' ? 'Weekend Hair Spa' : coupon.code === 'BRIDAL500' ? 'Bridal Package' : coupon.code === 'WELCOME10' ? 'First Visit Discount' : 'Color Glam Spec'}</h3>
                <div class="offer-discount">${coupon.type === 'percent' ? coupon.discount + '% OFF' : '₹' + coupon.discount + ' OFF'}</div>
                <p>${coupon.description}</p>
            </div>
            <div>
                <div class="offer-coupon-box">
                    <span class="offer-code">${coupon.code}</span>
                    <button class="copy-btn" onclick="copyCouponCode('${coupon.code}', this)">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                </div>
                <button class="studio-btn studio-btn-sm" style="width: 100%; margin-top: 12px;" onclick="useOfferCode('${coupon.code}')">
                    <span></span>Apply & Book
                </button>
            </div>
        </div>
    `).join('');
}

function copyCouponCode(code, btn) {
    navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        showToast(`Coupon code ${code} copied to clipboard!`, 'info');
        setTimeout(() => {
            btn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
        }, 2000);
    });
}

function useOfferCode(code) {
    const couponInput = document.getElementById('bookingCouponInput');
    if (couponInput) {
        couponInput.value = code;
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    applyCouponCode();
}

// ==========================================================
// 9. TESTIMONIALS & REVIEWS SYSTEM
// ==========================================================
function renderTestimonials() {
    const container = document.getElementById('testimonialContainer');
    if (!container) return;

    // Filter out automated or test reviews to ensure genuine client testimonials
    const visibleReviews = (appDB.reviews || []).filter(r => !/(test|automated|sample|fake)/i.test((r.name || '') + ' ' + (r.text || '')));

    container.innerHTML = visibleReviews.map(rev => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fa-solid fa-star" style="color: ${i <= rev.rating ? '#ff9800' : '#ddd'};"></i>`;
        }

        return `
            <div class="testimonial-col">
                <div class="testimonial-rating">${starsHtml}</div>
                <p>"${rev.text}"</p>
                <div class="user">
                    <img src="${rev.image}" alt="${rev.name}" onerror="this.src='dhoni.jpg'">
                    <div class="user-info">
                        <h4>${rev.name} <i class="fa-brands fa-twitter"></i></h4>
                        <small>${rev.handle}</small>
                    </div>
                </div>
                <div class="review-service-tag">
                    <i class="fa-solid fa-check-circle" style="color: #009688;"></i> Verified • ${rev.serviceName || 'Hair Studio Cut'}
                </div>
            </div>
        `;
    }).join('');
}

function openReviewModal(apptId = null) {
    const select = document.getElementById('reviewServiceSelect');
    if (select) {
        select.innerHTML = appDB.services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
    document.getElementById('reviewApptId').value = apptId || '';
    document.getElementById('reviewAuthorName').value = currentUser ? currentUser.name : '';
    selectStarRating(5);
    openModal('reviewModal');
}

function selectStarRating(val) {
    document.getElementById('selectedStarValue').value = val;
    const stars = document.querySelectorAll('#starRatingSelect i');
    stars.forEach((s, idx) => {
        if (idx < val) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function handleReviewSubmit(event) {
    event.preventDefault();
    const apptId = document.getElementById('reviewApptId').value;
    const name = document.getElementById('reviewAuthorName').value.trim();
    const serviceName = document.getElementById('reviewServiceSelect').value;
    const rating = Number(document.getElementById('selectedStarValue').value) || 5;
    const text = document.getElementById('reviewCommentText').value.trim();

    const newRev = {
        id: appDB.reviews.length + 1,
        name: name,
        handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
        image: "dhoni.jpg",
        rating: rating,
        text: text,
        serviceName: serviceName,
        stylistName: "Salon Team",
        date: new Date().toISOString().split('T')[0]
    };

    appDB.reviews.unshift(newRev);

    if (apptId) {
        const appt = appDB.appointments.find(a => a.id === apptId);
        if (appt) appt.reviewed = true;
    }

    saveLocalDB(appDB);

    try {
        fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newRev, appointmentId: apptId })
        });
    } catch (e) { }

    showToast("Thank you for your review! It is now published.", "success");
    closeModal('reviewModal');
    event.target.reset();
    renderTestimonials();
    renderCustomerAppointments();
}

// ==========================================================
// 10. CUSTOMER DASHBOARD
// ==========================================================
async function openCustomerDashboard() {
    // Enforce real customer authentication
    if (!currentUser || !authToken) {
        openAuthModal('customer', 'Please sign in with your customer account to view your dashboard and appointments.');
        return;
    }

    // Populate user profile card in dashboard
    const profileName = document.getElementById('custProfileName');
    const profileContact = document.getElementById('custProfileContact');
    if (profileName) profileName.textContent = currentUser.name || 'Valued Customer';
    if (profileContact) profileContact.textContent = `${currentUser.email || ''} | ${currentUser.phone || 'Phone not set'}`;

    const editName = document.getElementById('custEditName');
    const editEmail = document.getElementById('custEditEmail');
    const editPhone = document.getElementById('custEditPhone');
    if (editName) editName.value = currentUser.name || '';
    if (editEmail) editEmail.value = currentUser.email || '';
    if (editPhone) editPhone.value = currentUser.phone || '';

    // Fetch customer's live appointments from MongoDB Atlas via JWT
    try {
        const res = await fetch(`${API_BASE}/appointments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            const customerAppts = await res.json();
            // Merge customer appointments into appDB.appointments without clearing other salon bookings
            customerAppts.forEach(cA => {
                const idx = appDB.appointments.findIndex(a => a.id === cA.id);
                if (idx !== -1) {
                    appDB.appointments[idx] = cA;
                } else {
                    appDB.appointments.unshift(cA);
                }
            });
            saveLocalDB(appDB);
        }
    } catch (e) {
        console.warn('Could not fetch customer appointments from MongoDB Atlas:', e);
    }

    renderCustomerAppointments();
    openModal('customerDashboardModal');
}

function switchCustomerTab(tabId, btn) {
    document.querySelectorAll('#customerDashboardModal .dash-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#customerDashboardModal .dash-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    if (tabId === 'customerAlertsTab') renderCustomerAlertsTab();
}

function renderCustomerAppointments() {
    const upcomingContainer = document.getElementById('customerUpcomingList');
    const previousContainer = document.getElementById('customerPreviousList');
    if (!currentUser) return;

    // Filter appointments for the authenticated customer only
    const customerAppts = (appDB.appointments || []).filter(a => {
        if (/(automated|test_user|sample_test|fake_user)/i.test((a.customerName || '') + ' ' + (a.customerEmail || ''))) return false;
        const matchesEmail = a.customerEmail && a.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
        const matchesName = a.customerName && a.customerName.toLowerCase() === currentUser.name.toLowerCase();
        return matchesEmail || matchesName;
    });

    const upcoming = customerAppts.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
    const previous = customerAppts.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

    // Render Upcoming
    if (upcomingContainer) {
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #777;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 32px; color: #aaa; margin-bottom: 10px;"></i>
                    <p>No upcoming appointments found.</p>
                    <a href="#booking" onclick="closeModal('customerDashboardModal')" class="studio-btn studio-btn-sm" style="margin-top: 15px;">
                        <span></span>Book an Appointment Now
                    </a>
                </div>
            `;
        } else {
            upcomingContainer.innerHTML = upcoming.map(a => `
                <div class="appt-item-card">
                    <div class="appt-info-main">
                        <h4>${a.serviceName}</h4>
                        <div class="appt-info-meta">
                            <span><i class="fa-solid fa-hashtag"></i> ${a.id}</span>
                            <span><i class="fa-solid fa-user-tie"></i> ${a.stylistName}</span>
                            <span><i class="fa-regular fa-calendar"></i> ${a.date}</span>
                            <span><i class="fa-regular fa-clock"></i> ${a.time}</span>
                            <span><i class="fa-solid fa-indian-rupee-sign"></i> ₹${a.amount}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span>
                        <button class="studio-btn studio-btn-outline studio-btn-sm" onclick="openRescheduleModal('${a.id}')">
                            <i class="fa-solid fa-calendar-pen"></i> Reschedule
                        </button>
                        <button class="studio-btn studio-btn-danger studio-btn-sm" onclick="cancelAppointment('${a.id}')">
                            <i class="fa-solid fa-ban"></i> Cancel
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Previous
    if (previousContainer) {
        if (previous.length === 0) {
            previousContainer.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #777;">
                    <p>No previous appointments in history.</p>
                </div>
            `;
        } else {
            previousContainer.innerHTML = previous.map(a => `
                <div class="appt-item-card">
                    <div class="appt-info-main">
                        <h4>${a.serviceName}</h4>
                        <div class="appt-info-meta">
                            <span><i class="fa-solid fa-hashtag"></i> ${a.id}</span>
                            <span><i class="fa-solid fa-user-tie"></i> ${a.stylistName}</span>
                            <span><i class="fa-regular fa-calendar"></i> ${a.date}</span>
                            <span><i class="fa-solid fa-indian-rupee-sign"></i> ₹${a.amount}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span>
                        ${a.status === 'Completed' && !a.reviewed ? `
                            <button class="studio-btn studio-btn-sm" onclick="openReviewModal('${a.id}')">
                                <span></span><i class="fa-regular fa-star"></i> Write Review
                            </button>
                        ` : a.reviewed ? `
                            <span style="font-size: 12px; color: #4caf50;"><i class="fa-solid fa-check"></i> Reviewed</span>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
}

function cancelAppointment(apptId) {
    if (!confirm(`Are you sure you want to cancel appointment #${apptId}?`)) return;

    const appt = appDB.appointments.find(a => a.id === apptId);
    if (appt) {
        appt.status = 'Cancelled';
        saveLocalDB(appDB);

        if (authToken) {
            try {
                fetch(`${API_BASE}/appointments/${apptId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ status: 'Cancelled' })
                });
            } catch (e) { }
        }

        showToast(`Appointment #${apptId} has been cancelled.`, 'info');
        renderCustomerAppointments();
        renderAdminDashboard();
        renderTimeSlots();
    }
}

function openRescheduleModal(apptId) {
    const appt = appDB.appointments.find(a => a.id === apptId);
    if (!appt) return;

    document.getElementById('rescheduleApptId').value = apptId;
    document.getElementById('rescheduleApptInfo').textContent =
        `Rescheduling: ${appt.serviceName} with ${appt.stylistName} (Currently: ${appt.date} at ${appt.time} • Status: ${appt.status})`;

    const dateInput = document.getElementById('rescheduleDateInput');
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.value = appt.date;

    populateRescheduleSlots(appt, appt.date, appt.time);
    openModal('rescheduleModal');
}

function handleRescheduleDateChange() {
    const apptId = document.getElementById('rescheduleApptId').value;
    const newDate = document.getElementById('rescheduleDateInput').value;
    const appt = appDB.appointments.find(a => a.id === apptId);
    if (appt && newDate) {
        populateRescheduleSlots(appt, newDate);
    }
}

function populateRescheduleSlots(appt, selectedDate, preselectTime = null) {
    const select = document.getElementById('rescheduleTimeSelect');
    if (!select) return;

    const bookedTimes = appDB.appointments
        .filter(a => a.id !== appt.id && a.date === selectedDate && String(a.stylistId) === String(appt.stylistId) && a.status !== 'Cancelled')
        .map(a => a.time);

    select.innerHTML = ALL_TIME_SLOTS.map(slot => {
        const isBooked = bookedTimes.includes(slot);
        const isCurrent = slot === appt.time && selectedDate === appt.date;
        const disabledAttr = isBooked ? 'disabled' : '';
        const label = isBooked ? `${slot} (Booked - Unavailable)` : isCurrent ? `${slot} (Current Slot)` : slot;
        return `<option value="${slot}" ${disabledAttr}>${label}</option>`;
    }).join('');

    if (preselectTime) {
        select.value = preselectTime;
    }
}

async function handleRescheduleSubmit(event) {
    event.preventDefault();
    const apptId = document.getElementById('rescheduleApptId').value;
    const newDate = document.getElementById('rescheduleDateInput').value;
    const newTime = document.getElementById('rescheduleTimeSelect').value;

    const appt = appDB.appointments.find(a => a.id === apptId);
    if (!appt) return;

    if (!newTime) {
        showToast("Please choose an available time slot.", "error");
        return;
    }

    // Check conflict locally
    const conflict = appDB.appointments.find(a =>
        a.id !== apptId && a.date === newDate && a.time === newTime &&
        String(a.stylistId) === String(appt.stylistId) && a.status !== 'Cancelled'
    );
    if (conflict) {
        showToast("That slot is already booked for this stylist. Choose another.", "error");
        return;
    }

    const payload = {
        date: newDate,
        time: newTime,
        customerEmail: appt.customerEmail,
        stylistId: appt.stylistId
    };

    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
        const res = await fetch(`${API_BASE}/appointments/${apptId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "Failed to update appointment slot.", "error");
            return;
        }

        // Update local memory with the verified server appointment
        const idx = appDB.appointments.findIndex(a => a.id === apptId);
        if (idx !== -1) {
            appDB.appointments[idx] = data;
        }
        saveLocalDB(appDB);

        showToast(`Appointment #${apptId} slot updated to ${newDate} at ${newTime}! Sent for salon confirmation.`, 'success');
        closeModal('rescheduleModal');
        renderCustomerAppointments();
        renderAdminDashboard();
        renderTimeSlots();
        setTimeout(() => fetchNotifications(false), 500);
    } catch (e) {
        // Fallback for offline local mode
        appt.date = newDate;
        appt.time = newTime;
        appt.status = 'Pending';
        saveLocalDB(appDB);
        showToast(`Appointment #${apptId} rescheduled to ${newDate} at ${newTime}!`, 'success');
        closeModal('rescheduleModal');
        renderCustomerAppointments();
        renderAdminDashboard();
        renderTimeSlots();
        setTimeout(() => fetchNotifications(false), 500);
    }
}

function handleCustomerProfileSave(event) {
    event.preventDefault();
    if (!currentUser) return;
    currentUser.name = document.getElementById('custEditName').value.trim();
    currentUser.email = document.getElementById('custEditEmail').value.trim();
    currentUser.phone = document.getElementById('custEditPhone').value.trim();

    const pName = document.getElementById('custProfileName');
    const pContact = document.getElementById('custProfileContact');
    if (pName) pName.textContent = currentUser.name;
    if (pContact) pContact.textContent = `${currentUser.email} | ${currentUser.phone}`;
    updateAuthUI();

    showToast("Profile information updated successfully!", "success");
}

// ==========================================================
// 11. ADMIN DASHBOARD CONTROL CENTER
// ==========================================================
async function openAdminDashboard() {
    // Enforce real admin authentication
    if (!currentUser || currentUser.role !== 'admin' || !authToken) {
        openAuthModal('admin', 'Admin login required. Please sign in with your administrator credentials.');
        return;
    }

    // Fetch all real appointments from MongoDB Atlas via JWT
    try {
        const res = await fetch(`${API_BASE}/appointments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            appDB.appointments = await res.json();
            saveLocalDB(appDB);
        }
    } catch (e) {
        console.warn('Could not fetch admin appointments from MongoDB Atlas:', e);
    }

    renderAdminDashboard();
    openModal('adminDashboardModal');
}

function switchAdminTab(tabId, btn) {
    document.querySelectorAll('#adminDashboardModal .dash-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#adminDashboardModal .dash-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    if (tabId === 'adminAlertsTab') renderAdminAlertsTab();
}

function renderAdminDashboard() {
    // 1. Statistics (Excluding any automated test users)
    const validAppts = (appDB.appointments || []).filter(a => !/(automated|test_user|sample_test|fake_user)/i.test((a.customerName || '') + ' ' + (a.customerEmail || '')));
    const totalCustomers = new Set(validAppts.map(a => a.customerEmail || a.customerName)).size || 18;
    const totalAppts = validAppts.length;
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = validAppts.filter(a => a.date === today && a.status !== 'Cancelled').length;
    const availableStylists = appDB.stylists.filter(st => st.availability.includes('Available')).length;
    const totalServices = appDB.services.length;
    const revenue = validAppts
        .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
        .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    const statCust = document.getElementById('statCustomers');
    const statAppt = document.getElementById('statAppointments');
    const statToday = document.getElementById('statTodayAppts');
    const statStyl = document.getElementById('statStylists');
    const statServ = document.getElementById('statServices');
    const statRev = document.getElementById('statRevenue');

    if (statCust) statCust.textContent = totalCustomers;
    if (statAppt) statAppt.textContent = totalAppts;
    if (statToday) statToday.textContent = todayAppts;
    if (statStyl) statStyl.textContent = availableStylists;
    if (statServ) statServ.textContent = totalServices;
    if (statRev) statRev.textContent = `₹${revenue.toLocaleString()}`;

    // 2. Populate Stylist filter dropdown in Admin
    const stylistFilter = document.getElementById('adminStylistFilter');
    if (stylistFilter && stylistFilter.children.length <= 1) {
        stylistFilter.innerHTML = `<option value="All">All Stylists</option>` +
            appDB.stylists.map(st => `<option value="${st.name}">${st.name}</option>`).join('');
    }

    renderAdminAppointments();
    renderAdminServices();
    renderAdminStylists();
}

function renderAdminAppointments() {
    const tableBody = document.getElementById('adminAppointmentsTableBody');
    if (!tableBody) return;

    const dateFilter = document.getElementById('adminDateFilter')?.value;
    const statusFilter = document.getElementById('adminStatusFilter')?.value || 'All';
    const stylistFilter = document.getElementById('adminStylistFilter')?.value || 'All';

    const filtered = (appDB.appointments || []).filter(a => {
        // Exclude automated test appointments from visible customer lists
        if (/(automated|test_user|sample_test|fake_user)/i.test((a.customerName || '') + ' ' + (a.customerEmail || ''))) return false;
        const matchesDate = !dateFilter || a.date === dateFilter;
        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        const matchesStylist = stylistFilter === 'All' || a.stylistName === stylistFilter;
        return matchesDate && matchesStatus && matchesStylist;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #888; padding: 25px;">No appointments match your filters.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(a => `
        <tr>
            <td><strong>#${a.id}</strong></td>
            <td>
                <div><strong>${a.customerName}</strong></div>
                <small style="color: #777;">${a.customerPhone}</small>
            </td>
            <td>${a.serviceName}</td>
            <td>${a.stylistName}</td>
            <td>${a.date}<br><small style="color: #666;">${a.time}</small></td>
            <td><strong>₹${a.amount}</strong></td>
            <td>
                <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span>
                ${a.rescheduled ? `<br><small style="color: #e65100; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;"><i class="fa-solid fa-clock-rotate-left"></i> Rescheduled</small>` : ''}
            </td>
            <td>
                <div style="display: flex; gap: 5px;">
                    ${a.status !== 'Confirmed' ? `
                        <button class="studio-btn-outline studio-btn-sm" style="color: #009688; border-color: #009688;" title="Confirm Slot" onclick="updateAppointmentStatus('${a.id}', 'Confirmed')">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="studio-btn-outline studio-btn-sm" title="Reschedule Slot" onclick="openRescheduleModal('${a.id}')">
                        <i class="fa-solid fa-calendar-pen"></i>
                    </button>
                    ${a.status !== 'Completed' ? `
                        <button class="studio-btn-outline studio-btn-sm" style="color: #2e7d32; border-color: #2e7d32;" title="Complete" onclick="updateAppointmentStatus('${a.id}', 'Completed')">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                    ` : ''}
                    ${a.status !== 'Cancelled' ? `
                        <button class="studio-btn-outline studio-btn-sm" style="color: #c62828; border-color: #c62828;" title="Cancel" onclick="updateAppointmentStatus('${a.id}', 'Cancelled')">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function updateAppointmentStatus(apptId, newStatus) {
    const appt = appDB.appointments.find(a => a.id === apptId);
    if (!appt) return;

    appt.status = newStatus;
    if (newStatus === 'Confirmed') {
        appt.rescheduled = false;
    }
    saveLocalDB(appDB);

    if (authToken) {
        try {
            fetch(`${API_BASE}/appointments/${apptId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status: newStatus, rescheduled: false })
            });
        } catch (e) { }
    }

    showToast(`Appointment #${apptId} status changed to ${newStatus}`, 'success');
    renderAdminDashboard();
    renderCustomerAppointments();
    renderTimeSlots();
    setTimeout(() => fetchNotifications(false), 500);
}

function resetAdminFilters() {
    if (document.getElementById('adminDateFilter')) document.getElementById('adminDateFilter').value = '';
    if (document.getElementById('adminStatusFilter')) document.getElementById('adminStatusFilter').value = 'All';
    if (document.getElementById('adminStylistFilter')) document.getElementById('adminStylistFilter').value = 'All';
    renderAdminAppointments();
}

// ----------------------------------------------------------
// Admin: Services Management (CRUD)
// ----------------------------------------------------------
function renderAdminServices() {
    const tableBody = document.getElementById('adminServicesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = appDB.services.map(s => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${s.image}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;" onerror="this.src='2.jpg'">
                    <strong>${s.name}</strong>
                </div>
            </td>
            <td><span class="service-card-badge" style="position: static;">${s.category}</span></td>
            <td>${s.duration} mins</td>
            <td><strong>₹${s.price}</strong></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="studio-btn-outline studio-btn-sm" onclick="openEditServiceModal(${s.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="studio-btn-danger studio-btn studio-btn-sm" onclick="deleteService(${s.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddServiceModal() {
    document.getElementById('serviceModalTitle').innerHTML = `<i class="fa-solid fa-scissors"></i> Add New Service`;
    document.getElementById('serviceEditId').value = '';
    document.getElementById('serviceEditForm').reset();
    openModal('serviceFormModal');
}

function openEditServiceModal(id) {
    const service = appDB.services.find(s => s.id === id);
    if (!service) return;

    document.getElementById('serviceModalTitle').innerHTML = `<i class="fa-solid fa-pen"></i> Edit Service`;
    document.getElementById('serviceEditId').value = service.id;
    document.getElementById('serviceEditName').value = service.name;
    document.getElementById('serviceEditCategory').value = service.category;
    document.getElementById('serviceEditPrice').value = service.price;
    document.getElementById('serviceEditDuration').value = service.duration;
    document.getElementById('serviceEditImage').value = service.image;
    document.getElementById('serviceEditDescription').value = service.description || '';

    openModal('serviceFormModal');
}

function handleSaveService(event) {
    event.preventDefault();
    const id = document.getElementById('serviceEditId').value;
    const name = document.getElementById('serviceEditName').value.trim();
    const category = document.getElementById('serviceEditCategory').value;
    const price = Number(document.getElementById('serviceEditPrice').value);
    const duration = Number(document.getElementById('serviceEditDuration').value);
    const image = document.getElementById('serviceEditImage').value.trim() || '2.jpg';
    const description = document.getElementById('serviceEditDescription').value.trim();

    const authHeaders = { 'Content-Type': 'application/json' };
    if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

    if (id) {
        // Edit
        const s = appDB.services.find(s => s.id === Number(id));
        if (s) {
            s.name = name;
            s.category = category;
            s.price = price;
            s.duration = duration;
            s.image = image;
            s.description = description;

            try {
                fetch(`${API_BASE}/services/${id}`, {
                    method: 'PUT',
                    headers: authHeaders,
                    body: JSON.stringify(s)
                });
            } catch (e) { }
            showToast(`Service "${name}" updated successfully!`, 'success');
        }
    } else {
        // Add
        const newId = appDB.services.length > 0 ? Math.max(...appDB.services.map(s => s.id)) + 1 : 1;
        const newService = { id: newId, name, category, price, duration, image, description };
        appDB.services.push(newService);

        try {
            fetch(`${API_BASE}/services`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(newService)
            });
        } catch (e) { }
        showToast(`New service "${name}" added!`, 'success');
    }

    saveLocalDB(appDB);
    closeModal('serviceFormModal');
    renderAllSections();
    renderAdminDashboard();
}

function deleteService(id) {
    const s = appDB.services.find(s => s.id === id);
    if (!confirm(`Delete service "${s?.name}"?`)) return;

    appDB.services = appDB.services.filter(s => s.id !== id);
    saveLocalDB(appDB);

    const authHeaders = {};
    if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

    try {
        fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers: authHeaders });
    } catch (e) { }

    showToast("Service deleted.", "info");
    renderAllSections();
    renderAdminDashboard();
}

// ----------------------------------------------------------
// Admin: Stylists Management (CRUD)
// ----------------------------------------------------------
function renderAdminStylists() {
    const tableBody = document.getElementById('adminStylistsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = appDB.stylists.map(st => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${st.image}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" onerror="this.src='stylist_john.jpg'">
                    <strong>${st.name}</strong>
                </div>
            </td>
            <td>${st.specialization}</td>
            <td>${st.experience}</td>
            <td><i class="fa-solid fa-star" style="color: #ff9800;"></i> ${st.rating}</td>
            <td><span class="status-badge ${st.availability.includes('Available') ? 'confirmed' : 'pending'}">${st.availability}</span></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="studio-btn-outline studio-btn-sm" onclick="openEditStylistModal(${st.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="studio-btn-danger studio-btn studio-btn-sm" onclick="deleteStylist(${st.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddStylistModal() {
    document.getElementById('stylistModalTitle').innerHTML = `<i class="fa-solid fa-user-tie"></i> Add New Stylist`;
    document.getElementById('stylistEditId').value = '';
    document.getElementById('stylistEditForm').reset();
    openModal('stylistFormModal');
}

function openEditStylistModal(id) {
    const st = appDB.stylists.find(s => s.id === id);
    if (!st) return;

    document.getElementById('stylistModalTitle').innerHTML = `<i class="fa-solid fa-pen"></i> Edit Stylist`;
    document.getElementById('stylistEditId').value = st.id;
    document.getElementById('stylistEditName').value = st.name;
    document.getElementById('stylistEditSpecialization').value = st.specialization;
    document.getElementById('stylistEditExperience').value = st.experience;
    document.getElementById('stylistEditRating').value = st.rating;
    document.getElementById('stylistEditAvailability').value = st.availability;
    document.getElementById('stylistEditImage').value = st.image;

    openModal('stylistFormModal');
}

function handleSaveStylist(event) {
    event.preventDefault();
    const id = document.getElementById('stylistEditId').value;
    const name = document.getElementById('stylistEditName').value.trim();
    const specialization = document.getElementById('stylistEditSpecialization').value.trim();
    const experience = document.getElementById('stylistEditExperience').value.trim();
    const rating = Number(document.getElementById('stylistEditRating').value) || 4.8;
    const availability = document.getElementById('stylistEditAvailability').value;
    const image = document.getElementById('stylistEditImage').value.trim() || 'stylist_john.jpg';

    const authHeaders = { 'Content-Type': 'application/json' };
    if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

    if (id) {
        // Edit
        const st = appDB.stylists.find(s => s.id === Number(id));
        if (st) {
            st.name = name;
            st.specialization = specialization;
            st.experience = experience;
            st.rating = rating;
            st.availability = availability;
            st.image = image;

            try {
                fetch(`${API_BASE}/stylists/${id}`, {
                    method: 'PUT',
                    headers: authHeaders,
                    body: JSON.stringify(st)
                });
            } catch (e) { }
            showToast(`Stylist "${name}" updated!`, 'success');
        }
    } else {
        // Add
        const newId = appDB.stylists.length > 0 ? Math.max(...appDB.stylists.map(s => s.id)) + 1 : 1;
        const newStylist = {
            id: newId,
            name,
            specialization,
            experience,
            rating,
            reviewsCount: 1,
            availability,
            image,
            phone: "+91 98765 00000"
        };
        appDB.stylists.push(newStylist);

        try {
            fetch(`${API_BASE}/stylists`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(newStylist)
            });
        } catch (e) { }
        showToast(`Stylist "${name}" added to the team!`, 'success');
    }

    saveLocalDB(appDB);
    closeModal('stylistFormModal');
    renderAllSections();
    renderAdminDashboard();
}

function deleteStylist(id) {
    const st = appDB.stylists.find(s => s.id === id);
    if (!confirm(`Remove stylist "${st?.name}"?`)) return;

    appDB.stylists = appDB.stylists.filter(s => s.id !== id);
    saveLocalDB(appDB);

    const authHeaders = {};
    if (authToken) authHeaders['Authorization'] = `Bearer ${authToken}`;

    try {
        fetch(`${API_BASE}/stylists/${id}`, { method: 'DELETE', headers: authHeaders });
    } catch (e) { }

    showToast("Stylist removed.", "info");
    renderAllSections();
    renderAdminDashboard();
}

// ==========================================================
// 12. MODAL CONTROLS (GLOBAL)
// ==========================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking on backdrop
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('studio-modal-backdrop')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Escape key closes modals
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.studio-modal-backdrop.active').forEach(m => {
            m.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
});

// ==========================================================
// 13. MASTER RENDER & INIT
// ==========================================================
function renderAllSections() {
    renderServices();
    renderStylists();
    renderGallery();
    renderOffers();
    renderTestimonials();
    populateBookingDropdowns();
}

document.addEventListener('DOMContentLoaded', () => {
    renderAllSections();
    initBookingForm();
    syncWithServer();
});