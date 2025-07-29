function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsDiv = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('cart-total');
  cartItemsDiv.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; font-size: 16px; color: #555;">
        カートは空です。
      </div>
    `;
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <p><strong>${item.name}</strong></p>
          <p>COLOR: ${item.color} | SIZE: ${item.size}</p>
          <p>¥${item.price.toLocaleString()} JPY</p>
        </div>
        <div class="cart-actions">
          <button onclick="updateQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)">＋</button>
          <span class="remove-btn" onclick="removeItem(${index})">Remove</span>
        </div>
      `;
      cartItemsDiv.appendChild(itemDiv);
    });
  }

  totalPriceEl.textContent = `¥${total.toLocaleString()} JPY`;
}

function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

document.addEventListener("DOMContentLoaded", function () {
  renderCart();

  document.querySelector(".checkout-btn").addEventListener("click", async () => {
    const rawCart = JSON.parse(localStorage.getItem("cart")) || [];
    const lines = rawCart.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity
    }));

    const response = await fetch("/.netlify/functions/createCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lines })
    });

    const result = await response.json();
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else {
      console.error(result);
      alert("チェックアウトページの生成に失敗しました。");
    }
  });
});
