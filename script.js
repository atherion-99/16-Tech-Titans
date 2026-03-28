let subscriptions = JSON.parse(localStorage.getItem("subs")) || [];

function addSubscription(event) {
  event.preventDefault();

  let name = document.getElementById("name").value;
  let price = parseFloat(document.getElementById("price").value);
  let category = document.getElementById("category").value;
  let billingCycle = document.getElementById("billingCycle").value;
  let date = document.getElementById("date").value;
  let paymentMethod = document.getElementById("paymentMethod").value;

  if (name === "" || price === "" || date === "" || category === "") {
    alert("Please fill all required fields");
    return;
  }

  let sub = {
    id: Date.now(),
    name,
    price,
    category,
    billingCycle,
    date,
    paymentMethod,
    createdAt: new Date().toLocaleDateString()
  };

  subscriptions.push(sub);
  localStorage.setItem("subs", JSON.stringify(subscriptions));

  // Clear form
  document.querySelector("form").reset();

  display();
}

function display() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  if (subscriptions.length === 0) {
    list.innerHTML = '<p class="empty-state">No subscriptions yet. Add one to get started!</p>';
    document.getElementById("total").innerText = "0";
    document.getElementById("annual").innerText = "0";
    document.getElementById("count").innerText = "0";
    return;
  }

  let total = 0;

  subscriptions.forEach((sub) => {
    total += sub.price;

    let card = document.createElement("div");
    card.className = "subscription-card";

    // Calculate renewal date info
    const renewalDate = new Date(sub.date);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

    let renewalText = "Renewal due";
    if (daysUntilRenewal > 0) {
      renewalText = `${daysUntilRenewal} days until renewal`;
    } else if (daysUntilRenewal === 0) {
      renewalText = "Renews today";
    } else {
      renewalText = "Overdue";
    }

    card.innerHTML = `
      <h3>${sub.name}</h3>
      <span class="category">${sub.category}</span>
      <p><strong>Price:</strong> ₹${sub.price.toFixed(2)}/${sub.billingCycle.toLowerCase()}</p>
      <p><strong>Payment:</strong> ${sub.paymentMethod || "N/A"}</p>
      <p class="price">₹${sub.price.toFixed(2)}</p>
      <p><strong>Renewal:</strong> ${renewalText}</p>
      <button class="delete-btn" onclick="deleteSub(${sub.id})">🗑️ Delete</button>
    `;

    list.appendChild(card);
  });

  // Update stats
  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("annual").innerText = (total * 12).toFixed(2);
  document.getElementById("count").innerText = subscriptions.length;
}

function deleteSub(id) {
  if (confirm("Are you sure you want to delete this subscription?")) {
    subscriptions = subscriptions.filter(sub => sub.id !== id);
    localStorage.setItem("subs", JSON.stringify(subscriptions));
    display();
  }
}

// Load subscriptions on page load
document.addEventListener("DOMContentLoaded", display);