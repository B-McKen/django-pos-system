// JavaScript functionality for the checkout interface

// Global variables
let productInfo = {};  // Stores information about the selected product
let isMember = false; // Assume customer is not a member to begin with

document.addEventListener('DOMContentLoaded', () => {
    displayTime();
    setInterval(displayTime, 1000);

    const eanInput = document.getElementById('ean-input');
    const memberButton = document.getElementById('member-button');
    const bagButton = document.getElementById('add-bag-button');
    const productContainer = document.getElementById('product-container-main');
    const fruitButton = document.getElementById('fruit-button');
    const vegButton = document.getElementById('veg-button');
    const bakeryButton = document.getElementById('bakery-button');
    const miscButton = document.getElementById('misc-button');
    const pluContainer = document.getElementById('PLU-main');

    eanInput.addEventListener('keypress', handleEANInput);
    memberButton.addEventListener('click', handleMemberClick);
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

// Handle membership button click
function handleMemberClick() {
    const items = document.getElementById('product-container-main');
    // Convert to array to loop backwards to prevent updated items appearing backwards
    const products = [...items.querySelectorAll('.product-item-template:not([style*="display: none"])')];

    // Toggle membership
    isMember = !isMember;
    console.log(`Now!!! Membership: ${isMember}, No. Products: ${products.length}`);

    // Button style based on membership status
    updateButtonStyle(isMember);

    // Update prices for all items based on membership status
    if (products.length !== 0) {
        products.reverse().forEach(product => {
            updateQuantity(product, product.dataset.quantity)
        });
        //for (let product of products) {
            // Change prices
            //updateQuantity(product, product.dataset.quantity);
            // Calls updateTotals after
    }
    
    //}
    // Display relevant alert afterwards
    alert(isMember ? 'Membership Activated!' : 'Membership Deactivated!');
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
                availableQuantity: productContainer.dataset.availableQuantity
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
    let itemCount = 0, savingsTotal = 0, rawBasketTotal = 0, basketTotal = 0;

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

    if (!qtyValue || qtyValue < 1 || qtyValue > 999) {
        qtyErrorMsg.textContent = 'Please enter a valid quantity between 1 and 999';
        qtyErrorMsg.style.display = 'inline-block';
    } else if (qtyValue > productInfo.availableQuantity) {
        qtyErrorMsg.textContent = `Unfortunately, we only have ${productInfo.availableQuantity} of this product left in stock. Please select a different amount.`;
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
    document.querySelector('.generic-error-popup').style.display = 'none';
}

// Clear error messages
function clearError() {
    const qtyErrorMsg = document.getElementById('qty-error-message');
    qtyErrorMsg.style.display = 'none';
}

/* Helper functions */
// Update member button styling
function updateButtonStyle(isMember) {
    const memberButton = document.getElementById('member-button');
    if (isMember) {
        memberButton.style.border = '3px solid rgb(81, 164, 17)';
        memberButton.style.color = 'rgb(81, 164, 17)';
        memberButton.textContent = 'Member: ON';
        memberButton.onmouseover = () => {
            memberButton.style.backgroundColor = 'rgb(81, 164, 17)';
            memberButton.style.color = '#fff';
        };
        memberButton.onmouseout = () => {
            memberButton.style.backgroundColor = '#fff';
            memberButton.style.color = 'rgb(81, 164, 17)';
        }
    } else {
        memberButton.style.border = '3px solid #008080';
        memberButton.style.color = '#008080';
        memberButton.textContent = 'Member: OFF';
        memberButton.onmouseover = () => {
            memberButton.style.backgroundColor = '#008080';
            memberButton.style.color = '#fff';
        };
        memberButton.onmouseout = () => {
            memberButton.style.backgroundColor = '#fff';
            memberButton.style.color = '#008080';
        };
    }
}

// Remove popup container children
function emptyPopupContainer(container, template) {
    const productsInPopup = container.querySelectorAll('.PLU-item-template');

    productsInPopup.forEach(item => {
        if (item !== template) {
            container.removeChild(item); // Remove all except the template
        }
    });

    // Remove error message from old menu
    const noProductsMsg = document.getElementById('no-PLU-msg');
    if (noProductsMsg) {
        noProductsMsg.remove();
    }
}