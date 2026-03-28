// ==================== DATA MANAGEMENT ====================
let subscriptions = JSON.parse(localStorage.getItem("subs")) || getDummyData();
let expenseChart = null;
let categoryChart = null;

// Dummy Data for Demo
function getDummyData() {
    return [
        {
            id: 1,
            name: "Netflix",
            category: "Streaming",
            price: 499,
            billingCycle: "Monthly",
            date: "2026-04-15",
            paymentMethod: "Credit Card",
            icon: "fab fa-netflix"
        },
        {
            id: 2,
            name: "Spotify",
            category: "Music",
            price: 139,
            billingCycle: "Monthly",
            date: "2026-04-10",
            paymentMethod: "Debit Card",
            icon: "fab fa-spotify"
        },
        {
            id: 3,
            name: "Amazon Prime",
            category: "Streaming",
            price: 299,
            billingCycle: "Monthly",
            date: "2026-04-05",
            paymentMethod: "Credit Card",
            icon: "fab fa-amazon"
        },
        {
            id: 4,
            name: "Microsoft 365",
            category: "Productivity",
            price: 399,
            billingCycle: "Monthly",
            date: "2026-04-20",
            paymentMethod: "Credit Card",
            icon: "fab fa-microsoft"
        },
        {
            id: 5,
            name: "Adobe Creative Cloud",
            category: "Productivity",
            price: 4999,
            billingCycle: "Monthly",
            date: "2026-04-12",
            paymentMethod: "Credit Card",
            icon: "fab fa-adobe"
        },
        {
            id: 6,
            name: "Google Drive Plus",
            category: "Cloud",
            price: 199,
            billingCycle: "Monthly",
            date: "2026-04-18",
            paymentMethod: "Google Account",
            icon: "fab fa-google"
        }
    ];
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function () {
    loadSubscriptions();
    setupEventListeners();
    initializeCharts();
    updateStats();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Modal Controls
    const modal = document.getElementById("subscriptionModal");
    const fabBtn = document.getElementById("fabBtn");
    const btnNewSub = document.querySelector(".btn-new-sub");
    const modalCloseBtn = document.querySelector(".modal-close");
    const modalCloseBtnSecondary = document.querySelector(".modal-close-btn");
    const subscriptionForm = document.getElementById("subscriptionForm");

    fabBtn.addEventListener("click", () => openModal());
    btnNewSub.addEventListener("click", () => openModal());
    modalCloseBtn.addEventListener("click", () => closeModal());
    modalCloseBtnSecondary.addEventListener("click", () => closeModal());
    subscriptionForm.addEventListener("submit", handleFormSubmit);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Search and Filter
    document.getElementById("searchInput").addEventListener("input", filterSubscriptions);
    document.getElementById("categoryFilter").addEventListener("change", filterSubscriptions);
    document.getElementById("sortFilter").addEventListener("change", filterSubscriptions);

    // Sidebar Navigation
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // Sidebar Toggle (Mobile)
    document.querySelector(".sidebar-toggle").addEventListener("click", () => {
        document.querySelector(".sidebar").classList.toggle("active");
    });

    // Chart Period Controls
    document.querySelectorAll(".btn-icon").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".btn-icon").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            updateExpenseChart(e.target.dataset.period);
        });
    });
}

// ==================== MODAL FUNCTIONS ====================
function openModal() {
    document.getElementById("subscriptionModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("subscriptionModal").classList.remove("active");
    document.body.style.overflow = "auto";
    document.getElementById("subscriptionForm").reset();
}

// ==================== FORM HANDLING ====================
function handleFormSubmit(e) {
    e.preventDefault();

    const newSubscription = {
        id: Date.now(),
        name: document.getElementById("subName").value,
        category: document.getElementById("subCategory").value,
        price: parseFloat(document.getElementById("subPrice").value),
        billingCycle: document.getElementById("subBilling").value,
        date: document.getElementById("subDate").value,
        paymentMethod: document.getElementById("subPayment").value,
        icon: document.getElementById("subIcon").value || "fas fa-credit-card"
    };

    subscriptions.push(newSubscription);
    localStorage.setItem("subs", JSON.stringify(subscriptions));
    
    closeModal();
    loadSubscriptions();
    updateStats();
    updateCharts();
}

// ==================== SUBSCRIPTION MANAGEMENT ====================
function loadSubscriptions() {
    const grid = document.getElementById("subscriptionsGrid");
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const sortBy = document.getElementById("sortFilter").value;

    let filtered = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || sub.category === category;
        return matchesSearch && matchesCategory;
    });

    // Sorting
    switch (sortBy) {
        case "price":
            filtered.sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            filtered.sort((a, b) => b.price - a.price);
            break;
        case "date":
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        default:
            filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state">No subscriptions found. Try adjusting your filters!</p>';
        return;
    }

    filtered.forEach(sub => {
        const card = createSubscriptionCard(sub);
        grid.appendChild(card);
    });
}

function createSubscriptionCard(sub) {
    const card = document.createElement("div");
    card.className = "subscription-card";

    const renewalDate = new Date(sub.date);
    const today = new Date();
    const daysUntil = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

    let renewalText = "";
    let renewalClass = "";
    if (daysUntil <= 0) {
        renewalText = "Renews today";
        renewalClass = "danger";
    } else if (daysUntil <= 7) {
        renewalText = `${daysUntil} day${daysUntil > 1 ? "s" : ""} left`;
        renewalClass = "warning";
    } else {
        renewalText = `${daysUntil} days left`;
        renewalClass = "success";
    }

    const iconHtml = sub.icon.includes("fa-") 
        ? `<i class="${sub.icon}"></i>`
        : `<img src="${sub.icon}" style="width: 100%; height: 100%; object-fit: cover;">`;

    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon ${sub.icon.includes("fa-") ? "" : "custom"}">
                ${iconHtml}
            </div>
            <div class="card-actions">
                <button class="card-btn edit-btn" onclick="editSubscription(${sub.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="card-btn delete" onclick="deleteSubscription(${sub.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="card-name">${sub.name}</div>
        <span class="card-category">${sub.category}</span>
        <div class="card-details">
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">₹${sub.price.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Billing:</span>
                <span class="detail-value">${sub.billingCycle}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Next Renewal:</span>
                <span class="detail-value">${new Date(sub.date).toLocaleDateString()}</span>
            </div>
            ${sub.paymentMethod ? `
            <div class="detail-row">
                <span class="detail-label">Payment:</span>
                <span class="detail-value">${sub.paymentMethod}</span>
            </div>
            ` : ""}
        </div>
        <div class="card-footer">
            <div class="price">₹${sub.price}</div>
            <span class="renewal-status">${renewalText}</span>
        </div>
    `;

    return card;
}

function deleteSubscription(id) {
    if (confirm("Are you sure you want to delete this subscription?")) {
        subscriptions = subscriptions.filter(sub => sub.id !== id);
        localStorage.setItem("subs", JSON.stringify(subscriptions));
        loadSubscriptions();
        updateStats();
        updateCharts();
    }
}

function editSubscription(id) {
    // Future enhancement: Implement edit functionality
    alert("Edit functionality coming soon!");
}

function filterSubscriptions() {
    loadSubscriptions();
}

// ==================== STATISTICS ====================
function updateStats() {
    if (subscriptions.length === 0) {
        document.getElementById("monthlyCost").textContent = "0";
        document.getElementById("activeCount").textContent = "0";
        document.getElementById("annualCost").textContent = "0";
        document.getElementById("daysUntil").textContent = "-";
        document.getElementById("nextPaymentName").textContent = "-";
        document.getElementById("nextPaymentAmount").textContent = "0";
        return;
    }

    // Monthly Cost
    const monthlyCost = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    document.getElementById("monthlyCost").textContent = monthlyCost.toFixed(2);

    // Active Count
    document.getElementById("activeCount").textContent = subscriptions.length;

    // Annual Cost
    const annualCost = monthlyCost * 12;
    document.getElementById("annualCost").textContent = annualCost.toFixed(2);

    // Next Payment
    const nextPayment = subscriptions.reduce((earliest, sub) => {
        const subDate = new Date(sub.date);
        const earliestDate = new Date(earliest.date);
        return subDate < earliestDate ? sub : earliest;
    });

    const today = new Date();
    const renewalDate = new Date(nextPayment.date);
    const daysUntil = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

    document.getElementById("daysUntil").textContent = Math.max(0, daysUntil);
    document.getElementById("nextPaymentName").textContent = nextPayment.name;
    document.getElementById("nextPaymentAmount").textContent = nextPayment.price.toFixed(2);
}

// ==================== CHARTS ====================
function initializeCharts() {
    createExpenseChart();
    createCategoryChart();
}

function createExpenseChart() {
    const ctx = document.getElementById("expenseChart").getContext("2d");
    
    const monthlyData = getMonthlyExpenseData();

    expenseChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: "Monthly Expenses",
                data: monthlyData.data,
                borderColor: "rgba(99, 102, 241, 1)",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "rgba(99, 102, 241, 1)",
                pointBorderColor: "rgba(15, 23, 42, 1)",
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "rgba(226, 232, 240, 1)",
                        font: { size: 12, weight: "600" },
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "rgba(148, 163, 184, 1)" },
                    grid: { color: "rgba(226, 232, 240, 0.1)" }
                },
                x: {
                    ticks: { color: "rgba(148, 163, 184, 1)" },
                    grid: { display: false }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");
    
    const categoryData = getCategoryBreakdown();

    categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.data,
                backgroundColor: [
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(167, 139, 250, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(249, 115, 22, 0.8)"
                ],
                borderColor: "rgba(15, 23, 42, 1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "rgba(226, 232, 240, 1)",
                        font: { size: 12, weight: "600" },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function getMonthlyExpenseData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = months.map((month, index) => {
        // Simulate monthly data with some variation
        const baseAmount = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
        return Math.round(baseAmount * (0.85 + Math.random() * 0.3));
    });

    return { labels: months, data };
}

function getCategoryBreakdown() {
    const categories = {};
    subscriptions.forEach(sub => {
        categories[sub.category] = (categories[sub.category] || 0) + sub.price;
    });

    return {
        labels: Object.keys(categories),
        data: Object.values(categories)
    };
}

function updateExpenseChart(period) {
    if (!expenseChart) return;

    let labels, data;
    if (period === "month") {
        const monthlyData = getMonthlyExpenseData();
        labels = monthlyData.labels;
        data = monthlyData.data;
    } else {
        labels = ["Q1", "Q2", "Q3", "Q4"];
        const quarterly = subscriptions.reduce((sum, sub) => sum + sub.price, 0) * 3;
        data = [quarterly, quarterly * 1.05, quarterly * 0.95, quarterly * 1.1];
    }

    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
}

function updateCharts() {
    if (expenseChart) expenseChart.destroy();
    if (categoryChart) categoryChart.destroy();
    initializeCharts();
}