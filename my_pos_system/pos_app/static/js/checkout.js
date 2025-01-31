// JavaScript functionality for the checkout interface

// Global variables
let productInfo = {};

document.addEventListener('DOMContentLoaded', () => {
    displayTime();
    setInterval(displayTime, 1000);

    const eanInput = document.getElementById('ean-input');
    const bagButton = document.getElementById('add-bag-button');
    const productContainer = document.getElementById('product-container-main');
    
    eanInput.addEventListener('keypress', handleEANInput);
    bagButton.addEventListener('click', () => fetchProduct(5057373964052));
    productContainer.addEventListener('click', handleProductClick);
});

// Event handlers
// Handle search bar input
function handleEANInput(event) {
    if (event.key === 'Enter') {
        const scannedEAN = event.target.value.trim();
        if (scannedEAN) {
            fetchProduct(scannedEAN);
            event.target.value = '';
        } else {
            alert('Please enter a valid EAN');
        }
    }
}

// Handle product quantity / status edit
function handleProductClick(event) {
    const productButton = event.target.closest('.edit-product-button');
    if (productButton) {
        const productContainer = productButton.closest('.product-item-template');
        if (productContainer) {
            productInfo = {
                id: productContainer.id,
                EAN: productContainer.dataset.ean,
                image: productContainer.querySelector('img').src,
                name: productContainer.querySelector('.product-name').textContent,
            };
            displayOverlay(document.querySelector('.qty-remove-popup'), productInfo);
        }
    }
}

// Display time function
function displayTime() {
    const currentTime = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const timeString = `${days[currentTime.getDay()]} ${currentTime.getDate()} ${months[currentTime.getMonth()]} | ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('checkout-datetime').textContent = timeString;
}

// Fetch product by EAN
function fetchProduct(EAN) {
    fetch(`/api/product/?EAN=${EAN}`)
        .then(response => {
            if (!response.ok) throw new Error('Product not found');
            return response.json();
        })
        .then(handleScan)
        .catch(() => alert('Product not found'));
}

// Handle 'scanned' product
function handleScan(product) {
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    let productFound = false;

    // Search to see if the product is already in the basket (subsequent scan)
    for (let item of products) {
        if (item.dataset.ean == product.EAN) {
            item.dataset.quantity++;
            updateQuantity(item, item.dataset.quantity);
            productFound = true;
            break;
        }
    }
    
    // First time product has appeared in basket
    if (!productFound) {
        addNewProduct(product);
    }
}

// Add new product to basket
function addNewProduct(product) {
    const template = document.querySelector('.product-item-template');
    const newProduct = template.cloneNode(true);
    newProduct.style.display = 'flex';
    newProduct.id = `basket-item-${product.EAN}`;
    newProduct.dataset.ean = product.EAN;
    newProduct.dataset.quantity = 1;
    newProduct.dataset.unitPrice = product.price;
    newProduct.dataset.discount = product.discount;
    newProduct.dataset.discountedUnitPrice = product.discounted_price;

    try {
        newProduct.querySelector('img').src = product.image_url;
        newProduct.querySelector('.product-name').textContent = product.name;
        newProduct.querySelector('.product-quantity').textContent = `Quantity: 1`;
        newProduct.querySelector('.product-price').textContent = product.discount
            ? `£${parseFloat(product.discounted_price).toFixed(2)} (D)`
            : `£${parseFloat(product.price).toFixed(2)}`;
        newProduct.querySelector('.edit-product-button').id = `edit-product-${product.EAN}`;
    } catch (err) {
        console.error('Error populating template', err);
    }

    const container = document.getElementById('product-container-main');
    container.insertBefore(newProduct, container.firstChild);
    container.scrollTop = 0;
    updateTotals();
}

// Update product quantity
function updateQuantity(product, newQuantity) {
    product.dataset.quantity = newQuantity;
    product.querySelector('.product-quantity').textContent = `Quantity: ${newQuantity}`;
    const unitPrice = parseFloat(product.dataset.unitPrice);
    const discountedUnitPrice = parseFloat(product.dataset.discountedUnitPrice);
    const hasDiscount = product.dataset.discount === "true";
    const newTotalPrice = hasDiscount ? discountedUnitPrice * newQuantity : unitPrice * newQuantity;
    product.querySelector('.product-price').textContent = `£${newTotalPrice.toFixed(2)}${hasDiscount ? ' (D)' : ''}`;
    updateTotals();
}

// Update savings, basket, and item totals
function updateTotals() {
    const member = true;
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    let itemCount = 0, savingsTotal = 0, rawBasketTotal = 0, basketTotal = 0;

    for (let item of products) {
        let quantity = parseInt(item.dataset.quantity);
        let price = parseFloat(item.dataset.unitPrice);
        let discountedPrice = parseFloat(item.dataset.discountedUnitPrice);
        let hasDiscount = item.dataset.discount === "true";

        rawBasketTotal += quantity * price;
        basketTotal += hasDiscount && member ? quantity * discountedPrice : quantity * price;
        if (hasDiscount && member) savingsTotal = rawBasketTotal - basketTotal;

        itemCount += quantity;
    }

    document.getElementById('item-count').textContent = `${itemCount} Item${itemCount > 1 ? 's' : ''}`;
    document.getElementById('savings-total').textContent = `Savings: £${savingsTotal.toFixed(2)}`;
    document.getElementById('basket-total').textContent = `Basket Total: £${basketTotal.toFixed(2)}`;
}

// Display overlay window
function displayOverlay(window, info) {
    const overlay = document.querySelector('.outer');
    overlay.style.display = 'flex';
    window.style.display = 'flex';
    window.querySelector('img').src = info.image;
    window.querySelector('.img-and-name p').textContent = info.name;
    document.getElementById('quantity-input').value = info.quantity;
    clearError();
}

// Event listeners for overlay actions
document.getElementById('remove-button').addEventListener('click', () => {
    document.getElementById(productInfo.id).remove();
    updateTotals();
    closeOverlay();
});

document.getElementById('back-button').addEventListener('click', closeOverlay);

document.getElementById('submit-qty-button').addEventListener('click', () => {
    const quantityInput = document.getElementById('quantity-input');
    const newQuantity = parseInt(quantityInput.value, 10);
    const qtyErrorMsg = document.getElementById('quantity-error');

    // Handle incorrect quantity input
    if (isNaN(newQuantity) || !Number.isInteger(newQuantity) || newQuantity < 1 || newQuantity > 999) {
        quantityInput.style.border = '2px solid red';
        qtyErrorMsg.textContent = "Please enter a valid quantity between 1 and 999";
        qtyErrorMsg.style.fontWeight = 'bold';
        qtyErrorMsg.style.color = 'red';
    } else {
        document.getElementById(productInfo.id).dataset.quantity = newQuantity;
        updateQuantity(document.getElementById(productInfo.id), newQuantity);
        closeOverlay();
    }
});

function clearError() {
    const quantityInput = document.getElementById('quantity-input');
    quantityInput.style.border = '';
    document.getElementById('quantity-error').textContent = '';
}

document.getElementById('quantity-input').addEventListener('input', clearError);

function closeOverlay() {
    document.querySelector('.outer').style.display = 'none';
    document.querySelector('.qty-remove-popup').style.display = 'none';
    document.querySelector('.PLU-popup').style.display = 'none';
}
