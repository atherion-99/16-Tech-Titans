let subscriptions = JSON.parse(localStorage.getItem("subs")) || [];

function addSubscription() {
  let name = document.getElementById("name").value;
  let price = document.getElementById("price").value;
  let date = document.getElementById("date").value;

  if (name === "" || price === "" || date === "") {
    alert("Fill all fields");
    return;
  }

  let sub = { name, price: Number(price), date };
  subscriptions.push(sub);

  localStorage.setItem("subs", JSON.stringify(subscriptions));

  display();
}

function display() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  let total = 0;

  subscriptions.forEach((sub, index) => {
    total += sub.price;

    let li = document.createElement("li");
    li.innerHTML = `
      ${sub.name} - ₹${sub.price} - ${sub.date}
      <button onclick="deleteSub(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  document.getElementById("total").innerText = total;
}

function deleteSub(index) {
  subscriptions.splice(index, 1);
  localStorage.setItem("subs", JSON.stringify(subscriptions));
  display();
}

display();