/* Handle inputs, clicks, event handlers */

// Give focus to search bar after every action
function focusSearchBar() {
    document.getElementById('ean-input').focus();
}

// Handle search bar input
function handleEANInput(event) {
    let searchTerm = event.target.value.trim();
    console.log(`searchTerm = ${searchTerm}`);
    // EAN entered and Enter key pressed
    if (event.key === 'Enter') {
        const scannedEAN = event.target.value.trim();
        if (scannedEAN) {
            fetchProduct(scannedEAN);
            event.target.value = '';
        } else {
            alert('Please enter a valid EAN');
        }
    // Something typed but no Enter key pressed
    } else if(searchTerm.length >= 2) {
        fetchSearchResults(searchTerm);
    }
}

function handleDropdown(products) {
    clearDropdown();
    const eanInput = document.getElementById('ean-input');
    const dropdownMenu = document.getElementById('product-dropdown');
    const enterKey = new KeyboardEvent('keypress', {
        key: 'Enter', keyCode: 13
    });

    // Make dropdown active
    dropdownMenu.classList.add('active');
    
    // If there are no matches, show 'error'
    if (products.error) {
        let dropdownItem = document.createElement('DIV');
        dropdownItem.setAttribute('class', 'dropdown-result');
        dropdownItem.innerHTML = products.error;
        dropdownMenu.appendChild(dropdownItem);
    } else {
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
                availableQuantity: productContainer.dataset.availableQuantity
            };
            displayOverlay(document.querySelector('.qty-remove-popup'), productInfo);
        }
    }
}