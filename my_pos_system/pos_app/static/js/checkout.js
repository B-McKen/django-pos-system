// JavaScript functionality for the checkout interface

// Global variables
let productInfo = {};  // Stores information about the selected product

document.addEventListener('DOMContentLoaded', () => {
    displayTime();
    setInterval(displayTime, 1000);

    const eanInput = document.getElementById('ean-input');
    const bagButton = document.getElementById('add-bag-button');
    const productContainer = document.getElementById('product-container-main');
    const fruitButton = document.getElementById('fruit-button');
    const vegButton = document.getElementById('veg-button');
    const bakeryButton = document.getElementById('bakery-button');
    const miscButton = document.getElementById('misc-button');
    const pluContainer = document.getElementById('PLU-main');

    eanInput.addEventListener('keypress', handleEANInput);
    bagButton.addEventListener('click', () => fetchProduct(5057373964052));
    productContainer.addEventListener('click', handleProductClick);
    fruitButton.addEventListener('click', () => handlePLUClick('fruit'));
    vegButton.addEventListener('click', () => handlePLUClick('veg'));
    bakeryButton.addEventListener('click', () => handlePLUClick('bakery'));
    miscButton.addEventListener('click', () => handlePLUClick('misc'));
    pluContainer.addEventListener('click', handleAddPLU);
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

function handlePLUClick(department) {
    // Display overlay relevant to department
    console.log(`Handling data for the ${department} department`);
    const overlay = document.querySelector('.outer');
    const popup = document.querySelector('.PLU-popup');
    overlay.style.display = 'flex';
    popup.style.display = 'flex';

    popup.querySelector('.popup-title p').textContent = `Select an item from the ${department} department:`;
    fetchProductDept(department);
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

// Fetch products belonging to a department
function fetchProductDept(department) {
    console.log(`Queried department: ${department}`);

    fetch(`/api/product/department/?dept=${department}`)
        .then(response => {
            console.log(`Status: ${response.status}, OK: ${response.ok}`);
            return response.json();
        })
        .then(products => handlePopulatePLU(products))
        .catch(err => {
            console.error('Fetch error:', err);
            alert('Cannot display department products.');
        });
}

// Populate the PLU menu with products
function handlePopulatePLU(products) {
    const containerPLU = document.querySelector('.PLU-main');
    const templatePLU = document.querySelector('.PLU-item-template');

    // Clear old entries
    emptyPopupContainer(containerPLU, templatePLU);

    // Display 'empty' window if no data
    if (!Array.isArray(products) || products.length === 0) {
        const noProductsMsg = document.createElement('p');
        noProductsMsg.id = 'no-PLU-msg';
        noProductsMsg.textContent = 'No products are available for this department right now... Sorry!';
        containerPLU.appendChild(noProductsMsg);
        return;
    }

    // Add cloned nodes for each product in the department
    products.forEach(item => {
        const newPLU = templatePLU.cloneNode(true);
        newPLU.style.display = 'flex';
        newPLU.id = `PLU-item-${item.EAN}`;
        newPLU.dataset.ean = item.EAN;

        try {
            newPLU.querySelector('img').src = item.image;
            newPLU.querySelector('.PLU-name').textContent = item.name;
            newPLU.querySelector('.PLU-price').textContent = item.discount
                ? `£${parseFloat(item.price).toFixed(2)} | £${parseFloat(item.discounted_price).toFixed(2)} (D)`
                : `£${parseFloat(item.price).toFixed(2)}`;

            containerPLU.appendChild(newPLU);
        } catch (err) {
            console.error('Error populating PLU template', err);
        }
    });
}

// Handle PLU 'scan'
function handleAddPLU(event) {
    const productButton = event.target.closest('.add-PLU-button');
    const containerPLU = document.querySelector('.PLU-main');
    const templatePLU = document.querySelector('.PLU-item-template');

    if (productButton) {
        const desiredPLU = productButton.closest('.PLU-item-template');
        if (desiredPLU) {
            const pluEAN = desiredPLU.dataset.ean;
            fetchProduct(pluEAN);
            emptyPopupContainer(containerPLU, templatePLU); // Clear old entries
            closeOverlay();
        }
    }
}

// Handle 'scanned' product
function handleScan(product) {
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    let productFound = false;

    // Search to see if the product is already in the basket (subsequent scan)
    products.forEach(item => {
        if (item.dataset.ean === product.EAN) {
            item.dataset.quantity++;
            updateQuantity(item, item.dataset.quantity);
            productFound = true;
        }
    });

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
    newProduct.dataset.availableQuantity = product.available_qty;

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
    
    // Move product with new quantity to the top
    const container = document.getElementById('product-container-main');
    container.insertBefore(product, container.firstChild);
    updateTotals();
}

// Update savings, basket, and item totals
function updateTotals() {
    const member = true;  // Assuming member status for discounts
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    let itemCount = 0, savingsTotal = 0, rawBasketTotal = 0, basketTotal = 0;

    products.forEach(item => {
        const quantity = parseInt(item.dataset.quantity);
        const price = parseFloat(item.dataset.unitPrice);
        const discountedPrice = parseFloat(item.dataset.discountedUnitPrice);
        const hasDiscount = item.dataset.discount === "true";

        rawBasketTotal += quantity * price;
        basketTotal += hasDiscount && member ? quantity * discountedPrice : quantity * price;
        if (hasDiscount && member) savingsTotal = rawBasketTotal - basketTotal;

        itemCount += quantity;
    });

    document.getElementById('item-count').textContent = `${itemCount} Item${itemCount > 1 ? 's' : ''}`;
    document.getElementById('savings-total').textContent = `Savings: £${savingsTotal.toFixed(2)}`;
    document.getElementById('basket-total').textContent = `Basket Total: £${basketTotal.toFixed(2)}`;
}

// Display overlay window
function displayOverlay(popup, info) {
    const overlay = document.querySelector('.outer');
    overlay.style.display = 'flex';
    popup.style.display = 'flex';
    popup.querySelector('img').src = info.image;
    popup.querySelector('.img-and-name p').textContent = info.name;
    document.getElementById('quantity-input').value = info.quantity;
    clearError();
}

// Event listeners for overlay actions
document.getElementById('remove-button').addEventListener('click', () => {
    document.getElementById(productInfo.id).remove();
    updateTotals();
    closeOverlay();
});

document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('back-button')) {
        closeOverlay();
    }
});

document.getElementById('submit-qty-button').addEventListener('click', () => {
    const quantityInput = document.getElementById('quantity-input');
    const newQuantity = parseInt(quantityInput.value, 10);
    const qtyErrorMsg = document.getElementById('qty-error-message');
    const qtyValue = parseInt(quantityInput.value);

    if (!qtyValue || qtyValue < 1 || qtyValue > productInfo.availableQuantity) {
        qtyErrorMsg.style.display = 'inline-block';
    } else {
        updateQuantity(document.getElementById(productInfo.id), newQuantity);
        closeOverlay();
    }
});

// Close overlay window
function closeOverlay() {
    document.querySelector('.outer').style.display = 'none';
    document.querySelector('.qty-remove-popup').style.display = 'none';
    document.querySelector('.PLU-popup').style.display = 'none';
}

// Clear error messages
function clearError() {
    const qtyErrorMsg = document.getElementById('qty-error-message');
    qtyErrorMsg.style.display = 'none';
}

// Remove popup container children
function emptyPopupContainer(container, template) {
    const productsInPopup = container.querySelectorAll('.PLU-item-template');
    productsInPopup.forEach(item => item.style.display = 'none');
}