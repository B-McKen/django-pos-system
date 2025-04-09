/* Display time, overlay, error handling */

// Give focus to search bar after every action
function focusSearchBar() {
    document.getElementById('ean-input').focus();
}

// Display time
function displayTime() {
    const currentTime = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const timeString = `${days[currentTime.getDay()]} ${currentTime.getDate()} ${months[currentTime.getMonth()]} | ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('checkout-datetime').textContent = timeString;
}

// Retrieve date and time for receipt
function getTransactionTime() {
    const currentTime = new Date();
    const day = currentTime.getDate().toString().padStart(2, '0');
    const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
    const year = currentTime.getFullYear().toString().slice(-2);

    const hours = currentTime.getHours().toString().padStart(2, '0');
    const mins = currentTime.getMinutes().toString().padStart(2, '0');

    const receiptTimeArray = [`${day}/${month}/${year}`, `${hours}:${mins}`];
    return receiptTimeArray;
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
    document.getElementById('pay-amount-popup').style.display = 'none';
    focusSearchBar();
}

// Clear error messages
function clearError() {
    const qtyErrorMsg = document.getElementById('qty-error-message');
    const paymentError = document.getElementById('pay-amount-error-message');
    qtyErrorMsg.style.display = 'none';
    paymentError.style.display = 'none';
}

/* Helper functions */
/* Update Pay button style when basket is / is not empty */
function updatePayButtonStyle() {
    const payButton = document.getElementById('pay-button');
    if (itemCount > 0) {
        payButton.disabled = false;
        payButton.classList.add('active');
        payButton.classList.remove('disabled');
    } else {
        payButton.disabled = true;
        payButton.classList.add('disabled');
        payButton.classList.remove('active');
    }
}

// Grey out back button when part-payment received
function updateBackButtonStyle() {
    const backButton = document.getElementById('pay-return-button');

    if (outstandingBalance < basketTotal) {
        backButton.disabled = true;
        backButton.classList.add('disabled');
        backButton.classList.remove('active');
    } else {
        backButton.disabled = false;
        backButton.classList.add('active');
        backButton.classList.remove('disabled');
    }
}

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

// Clear and close auto-complete dropdown menu
function clearDropdown() {
    const dropdownMenu = document.getElementById('product-dropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-result');
    for (let item of dropdownItems) {
        dropdownMenu.classList.remove('active');
        item.remove();
    }
}

// Continually monitor search bar to clear dropdown when empty
setInterval(() => {
    const eanInput = document.getElementById('ean-input');
    if (eanInput && eanInput.value.trim() === '') {
        clearDropdown();
    }
}, 1);

// Exit Pay screen when back button clicked
function exitPayScreen() {
    const checkoutScreen = document.getElementById('checkout-container');
    const paymentScreen = document.getElementById('pay-container');

    // Display checkout interface, hide payment screen
    checkoutScreen.style.display = 'flex';
    paymentScreen.style.display = 'none';
    focusSearchBar();
}

// Void entire shop, start again
function voidShop() {
    window.alert('Transaction Voided!');
    exitPayScreen();

    // Delete all products, reset basket to default values
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');
    
    products.forEach(item => {
        item.remove();
        updateTotals();
    });
    // Reset membership button
    isMember = false;
    updateButtonStyle(isMember);
    resetCounters();
    updateBackButtonStyle();
    focusSearchBar();
}

// Reset all global counters to default (if transaction voided or complete)
function resetCounters() {
    itemCount = 0;
    savingsTotal = 0;
    basketTotal = 0;
    outstandingBalance = 0;
    cashPaid = 0;
    cardPaid = 0;
    changeDue = 0;
}

// Update outstanding balance on pay screen and prevent button clicking
function updatePayScreen() {
    const paymentScreen = document.getElementById('pay-container');
    const backButton = document.getElementById('pay-return-button');

}
// Payment method error / invalid
function displayPaymentErrorMsg(errorType) {
    console.log(`Error type is ${errorType}`);

    const paymentError = document.getElementById('pay-amount-error-message');
    
    // Display relevant error message depending on errorType
    switch (errorType) {
        case "cashOver":
            paymentError.textContent = "Cannot pay more than £100 over the transaction value in cash.";
            break;
        case "negative":
            paymentError.textContent = "Please enter a valid amount.";
            break;
        case "cardOver":
            paymentError.textContent = "Cannot pay more than the outstanding balance by card.";
            break;
        default:
            paymentError.textContent = "Something went wrong. Sorry.";
    }
    paymentError.style.display = 'inline-block';
}

function getCSRFToken() {
    const csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return csrfToken || '';
}

// Create a PDF of the receipt and send it to the database
function saveTransaction() {
    const receiptData = `
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="http://127.0.0.1:8000/static/styles/pdf_receipt.css?">
        </head>
        <body>
            ${document.getElementById('receipt-container').outerHTML}
        </body>
    </html>
    `;

    const transactionData = {
        trans_date: document.getElementById('transaction-date').textContent,
        trans_time: document.getElementById('transaction-time').textContent,
        cash_value: cashPaid,
        card_value: cardPaid,
        trans_value: document.getElementById('receipt-total-amount').textContent.replace("£", ""),
        receipt_html: receiptData
    };

    fetch('/receipt-pdf/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store transaction number
            transactionNumber = data.transaction_no;
            // Update receipt popup with number
            document.getElementById('transaction-number').textContent = `Transaction ${transactionNumber}`;
            console.log('Transaction saved:', data);
        } else {
            console.error('Error saving transaction:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function restartCheckout() {
    location.reload();
}

function downloadReceipt() {
    // Retrieve transaction number
    if (!transactionNumber) {
        console.error('Transaction Number is missing!');
        return;
    }

    // URL to fetch receipt PDF from
    const downloadUrl = `/download-receipt/${transactionNumber}/`;

    // Link <a> element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `receipt-trans-no-${transactionNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}