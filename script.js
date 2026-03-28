// ==================== DATA & STATE MANAGEMENT ====================

// User state
let currentUser = null;

// Subscriptions data
let subscriptions = JSON.parse(localStorage.getItem("subs")) || getDummySubscriptions();

// Charts
let usageChart = null;

// ==================== DUMMY DATA ====================
/**
 * Initial dummy subscriptions with usage patterns
 */
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
    
    // Check if user is logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
});

/**
 * Clear session and return to login (called by logout button)
 */
function clearSession() {
    localStorage.removeItem("user");
    localStorage.removeItem("subs");
    currentUser = null;
    showLogin();
}

// ==================== USAGE CLASSIFICATION LOGIC ====================
/**
 * Classifies subscription usage based on frequency input
 * Daily/Weekly → "frequent" (green)
 * Monthly → "occasional" (yellow)
 * Rarely → "rare" (red)
 */
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

/**
 * Classify all subscriptions and add classification property
 */
function classifyAllSubscriptions() {
    subscriptions.forEach(sub => {
        sub.usageClassification = classifyUsage(sub.usage);
    });
}

/**
 * Get most used subscription
 */
function getMostUsedSubscription() {
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent");
    if (frequent.length > 0) {
        return frequent[0];
    }
    return null;
}

/**
 * Get unused subscriptions (for waste analysis)
 */
function getUnusedSubscriptions() {
    return subscriptions.filter(s => s.usageClassification === "rare");
}

/**
 * Calculate wasted money on unused subscriptions
 */
function calculateWastedAmount() {
    return getUnusedSubscriptions().reduce((sum, sub) => sum + sub.price, 0);
}

/**
 * Calculate yearly savings potential if unused subscriptions are cancelled
 */
function calculatePotentialSavings() {
    return calculateWastedAmount() * 12;
}

/**
 * Get subscriptions expiring within 3-5 days
 */
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

/**
 * Render expiring subscriptions
 */
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
                <div class="expiring-item-info">
                    <div class="expiring-item-name">${sub.name}</div>
                    <div class="expiring-item-date">Renews on ${renewalDate}</div>
                </div>
                <span class="expiring-item-badge">${daysUntil} days</span>
            </div>
        `;
    }).join("");
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Login form
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
    
    // Logout button
    document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
    
    // Navigation
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
    
    // Floating action button
    document.querySelectorAll(".fab-trigger").forEach(btn => {
        btn.addEventListener("click", openSubscriptionModal);
    });
    
    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", closeSubscriptionModal);
    });
    
    // Close modal when clicking outside
    document.getElementById("subscriptionModal")?.addEventListener("click", (e) => {
        if (e.target.id === "subscriptionModal") closeSubscriptionModal();
    });
    
    // Form submission
    document.getElementById("subscriptionForm")?.addEventListener("submit", handleAddSubscription);
    
    // Filters
    document.getElementById("usageFilter")?.addEventListener("change", loadSubscriptionsPage);
    document.getElementById("sortFilter")?.addEventListener("change", loadSubscriptionsPage);
    document.getElementById("searchInput")?.addEventListener("input", loadSubscriptionsPage);
}

// ==================== AUTHENTICATION ====================
/**
 * Handle login form submission
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Simple validation (frontend only)
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

/**
 * Handle logout with confirmation
 */
function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("user");
        currentUser = null;
        showLogin();
    }
}

// ==================== PAGE SWITCHING ====================
/**
 * Show login page
 */
function showLogin() {
    document.getElementById("loginPage").classList.add("active");
    document.querySelector(".dashboard-wrapper").classList.remove("active");
}

/**
 * Show dashboard page and load user profile
 */
function showDashboard() {
    document.getElementById("loginPage").classList.remove("active");
    document.querySelector(".dashboard-wrapper").classList.add("active");
    
    // Update profile info
    if (currentUser) {
        document.getElementById("profileEmail").textContent = currentUser.email;
        document.getElementById("profileDate").textContent = currentUser.createdAt;
    }
    
    // Load dashboard by default
    switchPage("dashboard");
}

/**
 * Switch between dashboard pages
 */
function switchPage(page) {
    // Hide all pages
    document.querySelectorAll(".page-content").forEach(p => {
        p.classList.remove("active");
    });
    
    // Remove active from nav
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
    
    // Show selected page
    document.getElementById(page + "Content").classList.add("active");
    
    // Update nav
    document.querySelector(`[data-page="${page}"]`).classList.add("active");
    
    // Update page title
    const titles = {
        dashboard: "Dashboard",
        subscriptions: "Subscriptions",
        insights: "Smart Insights",
        profile: "Profile"
    };
    document.getElementById("pageTitle").textContent = titles[page];
    
    // Load page specific content
    if (page === "dashboard") loadDashboardPage();
    if (page === "subscriptions") loadSubscriptionsPage();
    if (page === "insights") loadInsightsPage();
    if (page === "profile") loadProfilePage();
}

// ==================== DASHBOARD PAGE ====================
/**
 * Load and render dashboard with metrics and insights
 */
function loadDashboardPage() {
    classifyAllSubscriptions();
    updateMetrics();
    updateExpiringSection();
    updateUsageChart();
    updateRecommendations();
}

/**
 * Update all metric cards with calculated values
 */
function updateMetrics() {
    // Total spending
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    document.getElementById("totalSpending").textContent = total.toFixed(2);
    document.getElementById("activeCount").textContent = subscriptions.length;
    
    // Most used subscription
    const mostUsed = getMostUsedSubscription();
    if (mostUsed) {
        document.getElementById("mostUsedName").textContent = mostUsed.name;
        document.getElementById("mostUsedFreq").textContent = mostUsed.usage;
    }
    
    // Wasted amount
    const wasted = calculateWastedAmount();
    document.getElementById("wastedAmount").textContent = wasted.toFixed(2);
    document.getElementById("wastedCount").textContent = getUnusedSubscriptions().length;
    
    // Potential savings
    const savings = calculatePotentialSavings();
    document.getElementById("savingsPotential").textContent = savings.toFixed(2);
    
    // Usage counts
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent").length;
    const occasional = subscriptions.filter(s => s.usageClassification === "occasional").length;
    const rare = subscriptions.filter(s => s.usageClassification === "rare").length;
    
    document.getElementById("frequentCount").textContent = frequent;
    document.getElementById("occasionalCount").textContent = occasional;
    document.getElementById("rareCount").textContent = rare;
}

/**
 * Create and render usage distribution chart
 */
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
                    borderColor: "rgba(99, 102, 241, 1)",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(99, 102, 241, 1)"
                },
                {
                    label: "Monthly Spend (₹)",
                    data: [spendingFrequent, spendingOccasional, spendingRare],
                    borderColor: "rgba(16, 185, 129, 1)",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(16, 185, 129, 1)"
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

/**
 * Update smart recommendations list
 */
function updateRecommendations() {
    const unused = getUnusedSubscriptions();
    const list = document.getElementById("recommendationsList");
    
    if (unused.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Great! You\'re not wasting money on unused subscriptions.</p>';
        return;
    }
    
    list.innerHTML = unused.map(sub => `
        <div class="recommendation-item">
            <strong>Cancel ${sub.name}</strong>
            <span>Save ₹${(sub.price * 12).toFixed(0)}/year</span>
        </div>
    `).join("");
}

// ==================== SUBSCRIPTIONS PAGE ====================
/**
 * Load and render subscriptions with filtering and sorting
 */
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
    
    // Sort subscriptions
    if (sortFilter === "price") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortFilter === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // Default: by usage classification (frequent → occasional → rare)
        const usageOrder = { frequent: 0, occasional: 1, rare: 2 };
        filtered.sort((a, b) => usageOrder[a.usageClassification] - usageOrder[b.usageClassification]);
    }
    
    const grid = document.getElementById("subscriptionsGrid");
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">No subscriptions found.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(sub => createSubscriptionCard(sub)).join("");
    
    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-sub-btn").forEach(btn => {
        btn.addEventListener("click", () => deleteSubscription(btn.dataset.id));
    });
}

/**
 * Create HTML for a single subscription card
 */
function createSubscriptionCard(sub) {
    const renewal = new Date(sub.renewalDate);
    const today = new Date();
    const days = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
    
    const usageIcons = {
        frequent: "✅",
        occasional: "⚠️",
        rare: "❌"
    };
    
    const renewalText = days > 0 ? `${days} days` : "Renews soon";
    
    return `
        <div class="subscription-card ${sub.usageClassification}">
            <div class="card-top">
                <div class="card-name">${sub.name}</div>
                <div class="card-actions">
                    <button class="card-btn delete-sub-btn" data-id="${sub.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <span class="category-badge">${sub.category}</span>
            <span class="usage-badge ${sub.usageClassification}">
                ${usageIcons[sub.usageClassification]} ${sub.usageClassification.charAt(0).toUpperCase() + sub.usageClassification.slice(1)}
            </span>
            
            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">₹${sub.price}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Cycle:</span>
                    <span class="detail-value">${sub.billingCycle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Usage:</span>
                    <span class="detail-value">${sub.usage}</span>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="price">₹${sub.price}</div>
                <div class="renewal-info">${renewalText}</div>
            </div>
        </div>
    `;
}

/**
 * Delete subscription with confirmation
 */
function deleteSubscription(id) {
    if (confirm("Delete this subscription?")) {
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem("subs", JSON.stringify(subscriptions));
        loadSubscriptionsPage();
        loadDashboardPage();
    }
}

// ==================== INSIGHTS PAGE ====================
/**
 * Load insights page with waste analysis and recommendations
 */
function loadInsightsPage() {
    classifyAllSubscriptions();
    
    const wasteAnalysis = document.getElementById("wasteAnalysis");
    const unused = getUnusedSubscriptions();
    
    if (unused.length === 0) {
        wasteAnalysis.innerHTML = '<p>No wasted subscriptions detected. Keep up the good work!</p>';
    } else {
        const wastedAmount = calculateWastedAmount();
        const yearlySavings = wastedAmount * 12;
        wasteAnalysis.innerHTML = `
            <p><strong>You\'re wasting ₹${wastedAmount.toFixed(0)}/month</strong></p>
            <p style="color: var(--text-tertiary); font-size: 13px; margin-top: 8px;">
                That\'s <strong>₹${yearlySavings.toFixed(0)}/year</strong> on unused subscriptions.
            </p>
        `;
    }
    
    // Usage patterns
    const frequent = subscriptions.filter(s => s.usageClassification === "frequent").length;
    const occasional = subscriptions.filter(s => s.usageClassification === "occasional").length;
    const rare = subscriptions.filter(s => s.usageClassification === "rare").length;
    
    document.getElementById("usagePatterns").innerHTML = `
        <div style="display: flex; gap: 20px; margin: 16px 0;">
            <div>
                <div style="font-weight: 700; color: var(--success-color);">${frequent}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Frequently Used</div>
            </div>
            <div>
                <div style="font-weight: 700; color: var(--warning-color);">${occasional}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Occasionally Used</div>
            </div>
            <div>
                <div style="font-weight: 700; color: var(--danger-color);">${rare}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">Rarely Used</div>
            </div>
        </div>
    `;
    
    // Cancellation recommendations
    const recs = document.getElementById("cancellationRecs");
    if (unused.length === 0) {
        recs.innerHTML = '<p>No subscriptions to cancel. You\'re managing them well!</p>';
    } else {
        recs.innerHTML = unused.map(sub => `
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin: 8px 0;">
                <div style="font-weight: 700; color: var(--text-primary);">Cancel ${sub.name}</div>
                <div style="font-size: 13px; color: var(--text-tertiary); margin-top: 4px;">
                    Rarely used • Costs ₹${(sub.price * 12).toFixed(0)}/year
                </div>
            </div>
        `).join("");
    }
}

// ==================== PROFILE PAGE ====================
/**
 * Load profile page with user statistics
 */
function loadProfilePage() {
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    document.getElementById("profileSubCount").textContent = subscriptions.length;
    document.getElementById("profileMonthly").textContent = "₹" + total.toFixed(2);
}

// ==================== MODAL MANAGEMENT ====================
/**
 * Open subscription modal
 */
function openSubscriptionModal() {
    document.getElementById("subscriptionModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

/**
 * Close subscription modal
 */
function closeSubscriptionModal() {
    document.getElementById("subscriptionModal").classList.remove("active");
    document.body.style.overflow = "auto";
    document.getElementById("subscriptionForm").reset();
}

// ==================== ADD SUBSCRIPTION ====================
/**
 * Handle form submission to add new subscription
 */
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
    
    closeSubscriptionModal();
    classifyAllSubscriptions();
    loadSubscriptionsPage();
    loadDashboardPage();
}
