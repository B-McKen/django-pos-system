/* Display time, overlay, error handling */

// Display time
function displayTime() {
    const currentTime = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const timeString = `${days[currentTime.getDay()]} ${currentTime.getDate()} ${months[currentTime.getMonth()]} | ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('checkout-datetime').textContent = timeString;
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