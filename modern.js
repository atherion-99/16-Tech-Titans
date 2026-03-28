// ==================== MODERN JAVASCRIPT FOR QUICKSUB ==================== 

// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let subscriptions = JSON.parse(localStorage.getItem("subs")) || getDummySubscriptions();
let usageChart = null;

// ==================== DUMMY DATA ====================
function getDummySubscriptions() {
    return [
        {
            id: 1,
            name: "Netflix",
            price: 499,
            category: "Entertainment",
            billingCycle: "Monthly",
            renewalDate: "2026-04-15",
            usage: "daily",
            usageClassification: ""
        },
        {
            id: 2,
            name: "Spotify",
            price: 139,
            category: "Music",
            billingCycle: "Monthly",
            renewalDate: "2026-03-31",
            usage: "daily",
            usageClassification: ""
        },
        {
            id: 3,
            name: "Adobe Creative Cloud",
            price: 599,
            category: "Productivity",
            billingCycle: "Monthly",
            renewalDate: "2026-04-20",
            usage: "weekly",
            usageClassification: ""
        },
        {
            id: 4,
            name: "LinkedIn Premium",
            price: 799,
            category: "Productivity",
            billingCycle: "Monthly",
            renewalDate: "2026-04-02",
            usage: "rarely",
            usageClassification: ""
        },
        {
            id: 5,
            name: "Microsoft 365",
            price: 399,
            category: "Productivity",
            billingCycle: "Monthly",
            renewalDate: "2026-04-18",
            usage: "daily",
            usageClassification: ""
        },
        {
            id: 6,
            name: "Dropbox Plus",
            price: 199,
            category: "Cloud Storage",
            billingCycle: "Monthly",
            renewalDate: "2026-04-01",
            usage: "rarely",
            usageClassification: ""
        },
        {
            id: 7,
            name: "PlayStation Plus",
            price: 499,
            category: "Gaming",
            billingCycle: "Monthly",
            renewalDate: "2026-04-25",
            usage: "monthly",
            usageClassification: ""
        },
        {
            id: 8,
            name: "Audible",
            price: 249,
            category: "Entertainment",
            billingCycle: "Monthly",
            renewalDate: "2026-04-05",
            usage: "rarely",
            usageClassification: ""
        }
    ];
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function () {
    classifyAllSubscriptions();
    setupEventListeners();
    
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
});

// ==================== USAGE CLASSIFICATION ====================
function classifyUsage(usage) {
    switch(usage) {
        case "daily":
        case "weekly":
            return "frequent";
        case "monthly":
            return "occasional";
        case "rarely":
            return "rare";
        default:
            return "occasional";
    }
}

function classifyAllSubscriptions() {
    subscriptions.forEach(sub => {
        sub.usageClassification = classifyUsage(sub.usage);
    });
}

function getMostUsedSubscription() {
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent");
    return frequent.length > 0 ? frequent[0] : null;
}

function getUnusedSubscriptions() {
    return subscriptions.filter(s => s.usageClassification === "rare");
}

function calculateWastedAmount() {
    return getUnusedSubscriptions().reduce((sum, sub) => sum + sub.price, 0);
}

function calculatePotentialSavings() {
    return calculateWastedAmount() * 12;
}

function getExpiringSubscriptions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    
    return subscriptions.filter(sub => {
        const renewalDate = new Date(sub.renewalDate);
        renewalDate.setHours(0, 0, 0, 0);
        return renewalDate >= minDate && renewalDate <= maxDate;
    }).sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
    document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
    document.getElementById("mobileMenuBtn")?.addEventListener("click", toggleSidebar);
    document.getElementById("addSubBtn")?.addEventListener("click", openModal);
    document.querySelector(".modal")?.addEventListener("click", (e) => {
        if (e.target.id === "subscriptionModal") closeModal();
    });
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", closeModal);
    });
    document.getElementById("subscriptionForm")?.addEventListener("submit", handleAddSubscription);
    
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            if (window.innerWidth <= 1024) {
                document.querySelector(".sidebar").classList.remove("active");
            }
        });
    });
    
    document.getElementById("usageFilter")?.addEventListener("change", loadSubscriptionsPage);
    document.getElementById("sortFilter")?.addEventListener("change", loadSubscriptionsPage);
    document.getElementById("searchInput")?.addEventListener("input", loadSubscriptionsPage);
}

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("active");
}

// ==================== AUTHENTICATION ====================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (email && password) {
        currentUser = {
            email: email,
            createdAt: new Date().toLocaleDateString(),
            id: Date.now()
        };
        
        localStorage.setItem("user", JSON.stringify(currentUser));
        showDashboard();
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("user");
        currentUser = null;
        showLogin();
    }
}

// ==================== PAGE NAVIGATION ====================
function showLogin() {
    document.getElementById("loginPage").classList.add("active");
    document.querySelector(".dashboard-container").classList.remove("active");
}

function showDashboard() {
    document.getElementById("loginPage").classList.remove("active");
    document.querySelector(".dashboard-container").classList.add("active");
    
    if (currentUser) {
        document.getElementById("profileEmail").textContent = currentUser.email;
        document.getElementById("profileDate").textContent = currentUser.createdAt;
    }
    
    switchPage("dashboard");
}

function switchPage(page) {
    document.querySelectorAll(".page-content").forEach(p => {
        p.classList.remove("active");
    });
    
    document.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
    });
    
    document.getElementById(page + "Content").classList.add("active");
    document.querySelector(`[data-page="${page}"]`).classList.add("active");
    
    const titles = {
        dashboard: "Dashboard",
        subscriptions: "Subscriptions",
        analytics: "Analytics",
        settings: "Settings"
    };
    const subtitles = {
        dashboard: "Monitor your spending and get insights",
        subscriptions: "Manage all your subscriptions",
        analytics: "Deep dive into your subscription data",
        settings: "Account and preferences"
    };
    
    document.getElementById("pageTitle").textContent = titles[page];
    document.getElementById("pageSubtitle").textContent = subtitles[page];
    
    if (page === "dashboard") loadDashboardPage();
    if (page === "subscriptions") loadSubscriptionsPage();
    if (page === "analytics") loadAnalyticsPage();
    if (page === "settings") loadSettingsPage();
}

// ==================== DASHBOARD PAGE ====================
function loadDashboardPage() {
    classifyAllSubscriptions();
    updateMetrics();
    updateExpiringSection();
    updateUsageChart();
    updateRecommendations();
}

function updateMetrics() {
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    document.getElementById("totalSpending").textContent = total.toFixed(2);
    document.getElementById("activeCount").textContent = subscriptions.length;
    
    const wasted = calculateWastedAmount();
    document.getElementById("wastedAmount").textContent = wasted.toFixed(2);
    
    const savings = calculatePotentialSavings();
    document.getElementById("savingsPotential").textContent = savings.toFixed(0);
    
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent").length;
    const occasional = subscriptions.filter(s => s.usageClassification === "occasional").length;
    const rare = subscriptions.filter(s => s.usageClassification === "rare").length;
    
    document.getElementById("frequentCount").textContent = frequent;
    document.getElementById("occasionalCount").textContent = occasional;
    document.getElementById("rareCount").textContent = rare;
}

function updateExpiringSection() {
    const expiring = getExpiringSubscriptions();
    const list = document.getElementById("expiringSoonList");
    
    if (expiring.length === 0) {
        list.innerHTML = '<p class="empty-state">No subscriptions expiring soon</p>';
        return;
    }
    
    list.innerHTML = expiring.map(sub => {
        const daysUntil = Math.ceil((new Date(sub.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        const isCritical = daysUntil <= 3;
        const renewalDate = new Date(sub.renewalDate).toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        return `
            <div class="expiring-item ${isCritical ? 'critical' : ''}">
                <strong>${sub.name}</strong> - ${renewalDate} (${daysUntil} days)
            </div>
        `;
    }).join("");
}

function updateUsageChart() {
    const ctx = document.getElementById("usageChart")?.getContext("2d");
    if (!ctx) return;
    
    if (usageChart) usageChart.destroy();
    
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent").length;
    const occasional = subscriptions.filter(s => s.usageClassification === "occasional").length;
    const rare = subscriptions.filter(s => s.usageClassification === "rare").length;
    
    const spendingFrequent = subscriptions
        .filter(s => s.usageClassification === "frequent")
        .reduce((sum, s) => sum + s.price, 0);
    const spendingOccasional = subscriptions
        .filter(s => s.usageClassification === "occasional")
        .reduce((sum, s) => sum + s.price, 0);
    const spendingRare = subscriptions
        .filter(s => s.usageClassification === "rare")
        .reduce((sum, s) => sum + s.price, 0);
    
    usageChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Frequently Used", "Occasionally Used", "Rarely Used"],
            datasets: [
                {
                    label: "Count",
                    data: [frequent, occasional, rare],
                    borderColor: "rgba(6, 182, 212, 1)",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(6, 182, 212, 1)"
                },
                {
                    label: "Monthly Spend (₹)",
                    data: [spendingFrequent, spendingOccasional, spendingRare],
                    borderColor: "rgba(236, 72, 153, 1)",
                    backgroundColor: "rgba(236, 72, 153, 0.1)",
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(236, 72, 153, 1)"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: "rgba(226, 232, 240, 1)",
                        font: { size: 12, weight: "600" }
                    }
                }
            },
            scales: {
                r: {
                    ticks: { color: "rgba(148, 163, 184, 1)" },
                    grid: { color: "rgba(226, 232, 240, 0.1)" }
                }
            }
        }
    });
}

function updateRecommendations() {
    const unused = getUnusedSubscriptions();
    const list = document.getElementById("recommendationsList");
    
    if (unused.length === 0) {
        list.innerHTML = '<p class="empty-state">Great! You\'re not wasting money on unused subscriptions.</p>';
        return;
    }
    
    list.innerHTML = unused.map(sub => `
        <div class="recommendation-item">
            <strong>Cancel ${sub.name}</strong> - Save ₹${(sub.price * 12).toFixed(0)}/year
        </div>
    `).join("");
}

// ==================== SUBSCRIPTIONS PAGE ====================
function loadSubscriptionsPage() {
    classifyAllSubscriptions();
    
    const usageFilter = document.getElementById("usageFilter")?.value || "";
    const sortFilter = document.getElementById("sortFilter")?.value || "usage";
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    
    let filtered = subscriptions.filter(sub => {
        const matchesUsage = !usageFilter || sub.usageClassification === usageFilter;
        const matchesSearch = !searchTerm || sub.name.toLowerCase().includes(searchTerm);
        return matchesUsage && matchesSearch;
    });
    
    if (sortFilter === "price") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortFilter === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        const usageOrder = { frequent: 0, occasional: 1, rare: 2 };
        filtered.sort((a, b) => usageOrder[a.usageClassification] - usageOrder[b.usageClassification]);
    }
    
    const grid = document.getElementById("subscriptionsGrid");
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">No subscriptions found.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(sub => createSubscriptionCard(sub)).join("");
}

function createSubscriptionCard(sub) {
    const renewal = new Date(sub.renewalDate);
    const today = new Date();
    const days = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
    
    const icons = {
        Netflix: "fa-play",
        Spotify: "fa-music",
        "Adobe Creative Cloud": "fa-pen-nib",
        "LinkedIn Premium": "fa-linkedin",
        "Microsoft 365": "fa-microsoft",
        "Dropbox Plus": "fa-cloud",
        "PlayStation Plus": "fa-gamepad",
        Audible: "fa-book"
    };
    
    const renewalText = days > 0 ? `${days} days` : "Renews soon";
    const icon = icons[sub.name] || "fa-cube";
    
    return `
        <div class="subscription-card ${sub.usageClassification}">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(236, 72, 153, 0.2)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    <i class="fas ${icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px;">${sub.name}</div>
                    <div style="font-size: 12px; color: var(--text-tertiary);">${sub.category}</div>
                </div>
            </div>
            
            <div style="padding: 12px 0; border-top: 1px solid rgba(226, 232, 240, 0.1); border-bottom: 1px solid rgba(226, 232, 240, 0.1);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: var(--text-tertiary);">Price</span>
                    <strong>₹${sub.price}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 12px; color: var(--text-tertiary);">Billing</span>
                    <strong>${sub.billingCycle}</strong>
                </div>
            </div>
            
            <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <small style="color: var(--text-tertiary);">${renewalText}</small>
                <button onclick="deleteSubscription(${sub.id})" style="background: rgba(239, 68, 68, 0.1); border: none; border-radius: 6px; padding: 6px 10px; color: var(--danger); cursor: pointer; font-size: 12px;">Delete</button>
            </div>
        </div>
    `;
}

function deleteSubscription(id) {
    if (confirm("Delete this subscription?")) {
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem("subs", JSON.stringify(subscriptions));
        loadSubscriptionsPage();
        loadDashboardPage();
    }
}

// ==================== ANALYTICS PAGE ====================
function loadAnalyticsPage() {
    classifyAllSubscriptions();
    
    const wasteAnalysis = document.getElementById("wasteAnalysis");
    const unused = getUnusedSubscriptions();
    
    if (unused.length === 0) {
        wasteAnalysis.innerHTML = '<p>No wasted subscriptions detected. Great work!</p>';
    } else {
        const wastedAmount = calculateWastedAmount();
        const yearlySavings = wastedAmount * 12;
        wasteAnalysis.innerHTML = `
            <p><strong>You're wasting ₹${wastedAmount.toFixed(0)}/month</strong></p>
            <p style="color: var(--text-tertiary); font-size: 13px; margin-top: 8px;">
                That's <strong>₹${yearlySavings.toFixed(0)}/year</strong> on unused subscriptions.
            </p>
        `;
    }
    
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent").length;
    const occasional = subscriptions.filter(s => s.usageClassification === "occasional").length;
    const rare = subscriptions.filter(s => s.usageClassification === "rare").length;
    
    document.getElementById("usagePatterns").innerHTML = `
        <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
                <div style="font-weight: 700; color: var(--success); font-size: 24px;">${frequent}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Frequently Used</div>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: var(--warning); font-size: 24px;">${occasional}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Occasionally</div>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: var(--danger); font-size: 24px;">${rare}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Rarely Used</div>
            </div>
        </div>
    `;
    
    const recs = document.getElementById("cancellationRecs");
    if (unused.length === 0) {
        recs.innerHTML = '<p>No recommendations. All subscriptions are being used!</p>';
    } else {
        recs.innerHTML = unused.map(sub => `
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 8px;">
                <div style="font-weight: 600; color: var(--text-primary);">Cancel ${sub.name}</div>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">
                    Rarely used • Costs ₹${(sub.price * 12).toFixed(0)}/year
                </div>
            </div>
        `).join("");
    }
}

// ==================== SETTINGS PAGE ====================
function loadSettingsPage() {
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    document.getElementById("profileSubCount").textContent = subscriptions.length;
    document.getElementById("profileMonthly").textContent = "₹" + total.toFixed(2);
}

// ==================== MODAL ====================
function openModal() {
    document.getElementById("subscriptionModal").classList.add("active");
}

function closeModal() {
    document.getElementById("subscriptionModal").classList.remove("active");
    document.getElementById("subscriptionForm").reset();
}

function handleAddSubscription(e) {
    e.preventDefault();
    
    const newSub = {
        id: Date.now(),
        name: document.getElementById("subName").value,
        price: parseFloat(document.getElementById("subPrice").value),
        category: document.getElementById("subCategory").value,
        billingCycle: document.getElementById("subBilling").value,
        renewalDate: document.getElementById("subDate").value,
        usage: document.getElementById("subUsage").value,
        usageClassification: ""
    };
    
    subscriptions.push(newSub);
    localStorage.setItem("subs", JSON.stringify(subscriptions));
    
    closeModal();
    classifyAllSubscriptions();
    loadSubscriptionsPage();
    loadDashboardPage();
}
