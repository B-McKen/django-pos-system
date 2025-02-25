/* Handles products, basket, quantities, totals etc. */

// Fetch product by EAN
function fetchProduct(EAN) {
    fetch(`/api/product/?EAN=${EAN}`)
        .then(response => {
            if (!response.ok) throw new Error('Product not found');
            return response.json();
        })
        .then(handleScan)
        .catch((error) => {
            if (error.message === 'Product not found') {
                alert('Product not found!');
            }
        });
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

// Fetch products matching search bar entry
function fetchSearchResults(searchInput) {
    console.log(`Search parameter: ${searchInput}`);

    fetch(`/api/search-product/?search-term=${searchInput}`)
        .then(response => {
            console.log(`Status: ${response.status}, OK: ${response.ok}`);
            return response.json();
        })
        .then(results => handleDropdown(results));
}

// Handle 'scanned' product
function handleScan(product) {
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    const overlay = document.querySelector('.outer');
    const popup = document.querySelector('.generic-error-popup');
    const errorMsg = popup.querySelector('.generic-error-message');
    let productFound = false;

    
    // Check if product is out of stock before proceeding
    if (product.available_qty === 0) {
        console.log('Product out of stock! Displaying error message.');
        overlay.style.display = 'flex';
        popup.style.display = 'flex';

        errorMsg.textContent = 
        `Unfortunately, this product is out of stock and cannot be added to the basket. Sorry!`;
        return;
    }

    // Search to see if the product is already in the basket (subsequent scan)
    products.forEach(item => {
        if (item.dataset.ean === product.EAN) {
            // Found product
            productFound = true;
            // Available qty exceeded
            if ((parseInt(item.dataset.quantity) + 1) > parseInt(item.dataset.availableQuantity)) {
                console.log('Available item quantity exceeded! Displaying error message.');
        
                overlay.style.display = 'flex';
                popup.style.display = 'flex';
                
                errorMsg.textContent =
                `Unfortunately, we only have ${item.dataset.availableQuantity} of this product left in stock
                and so you cannot add another to the basket. Sorry!`;
        
            // Maximum 999 exceeded
            } else if((parseInt(item.dataset.quantity) + 1) > 999) {
                console.log('Maximum allowed item quantity exceeded! Displaying error message.');
        
                overlay.style.display = 'flex';
                popup.style.display = 'flex';
        
                errorMsg.textContent = 
                `Unfortunately, the maximum quantity per item per transaction is 999 and so you cannot
                add another to the basket. Sorry!`;

            // No quantity-related issues found - add another to basket
            } else {
                item.dataset.quantity++;
                updateQuantity(item, item.dataset.quantity);
            }
        }
    });
    
    // First time product has appeared in basket
    if (!productFound) {
        addNewProduct(product);
    }
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
        newProduct.querySelector('.product-price').textContent = product.discount && isMember
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
    const newTotalPrice = hasDiscount && isMember ? discountedUnitPrice * newQuantity : unitPrice * newQuantity;
    
    const priceElement = product.querySelector('.product-price');

    // Remove existing (D) when membership turned off
    priceElement.textContent = `£${newTotalPrice.toFixed(2)}`;
    if(hasDiscount && isMember) {
        priceElement.textContent += ' (D)';
    }

    // Move product with new quantity to the top
    const container = document.getElementById('product-container-main');
    container.insertBefore(product, container.firstChild);
    updateTotals();
}

// Update savings, basket, and item totals
function updateTotals() {
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    
    // Reset totals before recalculating
    itemCount = 0;
    savingsTotal = 0;
    let rawBasketTotal = 0;
    basketTotal = 0;

    products.forEach(item => {
        const quantity = parseInt(item.dataset.quantity);
        const price = parseFloat(item.dataset.unitPrice);
        const discountedPrice = parseFloat(item.dataset.discountedUnitPrice);
        const hasDiscount = item.dataset.discount === "true";

        rawBasketTotal += quantity * price;
        basketTotal += hasDiscount && isMember ? quantity * discountedPrice : quantity * price;
        if (hasDiscount && isMember) savingsTotal = rawBasketTotal - basketTotal;

        itemCount += quantity;
    });

    document.getElementById('item-count').textContent = `${itemCount} Item${itemCount > 1 | itemCount == 0 ? 's' : ''}`;
    document.getElementById('savings-total').textContent = `Savings: £${savingsTotal.toFixed(2)}`;
    document.getElementById('basket-total').textContent = `Basket Total: £${basketTotal.toFixed(2)}`;

    // Enable / disable Pay button according to itemCount
    updatePayButtonStyle();
}

// Transaction complete - display receipt popup
function completeTransaction() {
    const overlay = document.querySelector('.outer');
    const receiptPopup = document.getElementById('receipt-popup');
    const template = document.querySelector('.receipt-item-template');
    const items = document.getElementById('product-container-main');
    // Convert to array to loop backwards to prevent items appearing backwards
    const products = [...items.querySelectorAll('.product-item-template:not([style*="display: none"])')];

    overlay.style.display = 'flex';
    receiptPopup.style.display = 'flex';

    // Populate receipt with product info
    products.reverse().forEach(item => {
        const receiptItem = template.cloneNode(true);
        const hasDiscount = item.dataset.discount === "true";
        const unitPrice = isMember && hasDiscount ? item.dataset.discountedUnitPrice || item.dataset.unitPrice : item.dataset.unitPrice;
        receiptItem.style.display = 'flex';

        receiptItem.querySelector('.receipt-item-quantity').textContent = item.dataset.quantity;
        receiptItem.querySelector('.receipt-item-name').textContent = 
        `${item.querySelector('.product-name').textContent} ${item.dataset.quantity > 1 ? '(£' + parseFloat(unitPrice).toFixed(2) + ' each)' : ''}`;
        receiptItem.querySelector('.receipt-item-price').textContent = item.querySelector('.product-price').textContent;
        
        const container = document.getElementById('receipt-main');
        container.appendChild(receiptItem);
    });

    // Populate receipt with basket / payment info
    if (isMember) {
        document.getElementById('receipt-savings').style.display = 'flex';
        document.getElementById('receipt-savings-amount').textContent = `£${savingsTotal.toFixed(2)}`;
    }
    
    document.getElementById('receipt-total-amount').textContent = `£${basketTotal.toFixed(2)}`;

    if (cashPaid !== 0) {
        document.getElementById('receipt-cash-total').style.display = 'flex';
        document.getElementById('receipt-cash-amount').textContent = `£${cashPaid.toFixed(2)}`;
    }
    if (cardPaid !== 0) {
        document.getElementById('receipt-card-total').style.display = 'flex';
        document.getElementById('receipt-card-amount').textContent = `£${cardPaid.toFixed(2)}`;
    }
    if (changeDue !== 0) {
        document.getElementById('receipt-change-due').style.display = 'flex';
        document.getElementById('receipt-change-amount').textContent = `£${changeDue.toFixed(2)}`;
    }

    // Footer info
    const transDate = document.getElementById('transaction-date');
    const transTime = document.getElementById('transaction-time');
    const [date, time] = getTransactionTime();
    transDate.textContent = date;
    transTime.textContent = time;
    document.getElementById('transaction-number').textContent = 'Transaction 1';
}