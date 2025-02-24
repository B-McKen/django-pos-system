/* Handle inputs, clicks, event handlers */

// Handle search bar input
function handleEANInput(event) {
    let searchTimeout;
    let searchTerm = event.target.value.trim();
    console.log(`searchTerm = ${searchTerm}`);

    clearTimeout(searchTimeout); // Prevent multiple rapid requests

    // EAN entered and Enter key pressed
    if (event.key === 'Enter') {
        const scannedEAN = event.target.value.trim();
        if (scannedEAN) {
            fetchProduct(scannedEAN);
            clearDropdown();
            event.target.value = '';
        } else {
            alert('Please enter a valid EAN');
        }
    }
    // Something typed but no Enter key pressed
    else if(searchTerm.length >= 2) {
        fetchSearchResults(searchTerm);
        clearDropdown();
    }
}

function handleDropdown(products) {
    clearDropdown();
    const eanInput = document.getElementById('ean-input');
    const dropdownMenu = document.getElementById('product-dropdown');
    const enterKey = new KeyboardEvent('keypress', {
        key: 'Enter', keyCode: 13
    });
    
    // If there are no matches, show 'error'
    if (products.error) {
        // Make dropdown active
        dropdownMenu.classList.add('active');
        let dropdownItem = document.createElement('DIV');
        dropdownItem.setAttribute('class', 'dropdown-result');
        dropdownItem.innerHTML = products.error;
        dropdownMenu.appendChild(dropdownItem);
    } else {
        // Make dropdown active
        dropdownMenu.classList.add('active');
        for (i = 0; i < products.length; i++) {
            // Create div element for matching result
            let dropdownItem = document.createElement('DIV');
            dropdownItem.setAttribute('class', 'dropdown-result');
            dropdownItem.dataset.ean = products[i].EAN;
            
            // Display matching product
            dropdownItem.innerHTML = products[i].name;
            
            // Event listener for click of that dropdown item
            dropdownItem.addEventListener('click', () => {
                // Input product's EAN and hit 'Enter' key
                eanInput.value = dropdownItem.dataset.ean;
                clearDropdown();
                eanInput.dispatchEvent(enterKey);
            });
            dropdownMenu.appendChild(dropdownItem);
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
    }
    // Display relevant alert afterwards
    alert(isMember ? 'Membership Activated!' : 'Membership Deactivated!');
    focusSearchBar();
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
                quantity: productContainer.dataset.quantity,
                availableQuantity: productContainer.dataset.availableQuantity
            };
            displayOverlay(document.querySelector('.qty-remove-popup'), productInfo);
        }
    }
}

// Handle displaying pay screen upon click
function handlePayButtonClick() {
    const payButton = document.getElementById('pay-button');
    const checkoutScreen = document.getElementById('checkout-container');
    const paymentScreen = document.getElementById('pay-container');
    const payItemCount = document.getElementById('pay-item-count');
    const payBalance = document.getElementById('outstanding-balance');
    const paySavings = document.getElementById('pay-savings-total');
    const backButton = document.getElementById('pay-return-button');
    const voidButton = document.getElementById('void-button');
    const cashButton = document.getElementById('cash-button');
    const cardButton = document.getElementById('card-button');

    // Check if payButton is active or disabled (greyed-out)
    if (payButton.disabled) {
        return; // Nothing happens
    } else {
        // Display pay container, hide checkout interface
        checkoutScreen.style.display = 'none';
        paymentScreen.style.display = 'flex';

        // Populate basket values on screen
        outstandingBalance = basketTotal;
        payItemCount.textContent = `Items: ${itemCount}`;
        payBalance.textContent = `£${basketTotal.toFixed(2)}`;
        paySavings.textContent = `Savings £${savingsTotal.toFixed(2)}`;

        // Attach event listeners
        backButton.addEventListener('click', exitPayScreen);
        voidButton.addEventListener('click', voidShop);
        cashButton.addEventListener('click', () => displayPayAmount('cash'));
        cardButton.addEventListener('click', () => displayPayAmount('card'));
    }
}

// Handle cash/card popup
function displayPayAmount(method) {
    clearError();
    const overlay = document.querySelector('.outer');
    const popup = document.getElementById('pay-amount-popup');
    const paymentInput = document.getElementById('pay-amount-input');
    const submitPaymentButton = document.getElementById('submit-payment-button');
    const cancelPaymentButton = document.getElementById('submit-payment-back-button');

    overlay.style.display = 'flex';
    popup.style.display = 'flex';
    paymentInput.value = "";
    document.getElementById('pay-amount-title').textContent = `Enter the amount to pay by ${method}:`;
    document.getElementById('popup-outstanding').textContent = `£${outstandingBalance.toFixed(2)}`;

    // Event listeners for buttons
    // Remove previous event listeners before adding a new one
    submitPaymentButton.replaceWith(submitPaymentButton.cloneNode(true));
    const newSubmitButton = document.getElementById('submit-payment-button');

    newSubmitButton.addEventListener('click', () => handlePayment(method));

    cancelPaymentButton.addEventListener('click', closeOverlay);

}

// Handle submission of payment method
function handlePayment(method) {
    const paymentInput = document.getElementById('pay-amount-input');
    let paymentAmount = parseFloat(paymentInput.value);
    
    // If format is invalid, display relevant error
    if (isNaN(paymentAmount) || paymentAmount < 0.01) {
        return displayPaymentErrorMsg("negative");
    }
    
    // Convert to string (2dp) for format check
    const formattedAmount = paymentAmount.toFixed(2);
    if (parseFloat(formattedAmount) !== paymentAmount) {
        return displayPaymentErrorMsg("negative");
    }

    paymentAmount = parseFloat(formattedAmount); // Round to pennies for calculations

    if (method === "cash" && paymentAmount > outstandingBalance + 100) {
        return displayPaymentErrorMsg("cashOver");
    }
    
    if (method === "card" && paymentAmount > outstandingBalance) {
        return displayPaymentErrorMsg("cardOver");
    }

    // Valid payment - update balances
    if (method === "cash") {
        if (paymentAmount > outstandingBalance) {
            console.log("Payment type: Cash")
            changeDue = paymentAmount - outstandingBalance;
            outstandingBalance = 0;
            closeOverlay();
        } else {
            console.log("Payment type: Cash")
            outstandingBalance -= paymentAmount;
            changeDue = 0;
            closeOverlay();
        }
        cashPaid += paymentAmount;
    } else if (method === "card") {
        console.log("Payment type: Card")
        outstandingBalance -= paymentAmount;
        cardPaid += paymentAmount;
        changeDue = 0;
        closeOverlay();
    }

    outstandingBalance = parseFloat(outstandingBalance.toFixed(2)); // Rounding error fix
    changeDue = parseFloat(changeDue.toFixed(2));

    // Update payment main screen after successful part-payment
    document.getElementById('total-outstanding-title').textContent = "LEFT TO PAY:";
    document.getElementById('outstanding-balance').textContent = `£${outstandingBalance.toFixed(2)}`;
    updateBackButtonStyle();

    // Transaction complete - display "Thank You" message
    console.log(`Balances: Cash ${cashPaid}, Card ${cardPaid}, OutstandingBalance ${outstandingBalance}, Change ${changeDue}`);
    if (outstandingBalance == 0) {
        alert("Thank You!");
    }
}