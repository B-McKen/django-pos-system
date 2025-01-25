// JavaScript functionality for the checkout interface

document.addEventListener('DOMContentLoaded', () => {
    // Display current time
    displayTime();
    setInterval(displayTime, 1000);

    // Define container for product display and search bar
    const eanInput = document.getElementById('ean-input');
    const bagButton = document.getElementById('add-bag-button');

    // Event listener for enter key press on search bar
    eanInput.addEventListener('keypress', (KeyboardEvent) => {
        if (KeyboardEvent.key === 'Enter') {
            const scannedEAN = eanInput.value.trim();
            if (scannedEAN) {
                fetchProduct(scannedEAN);
                eanInput.value = ''; // Clear search bar
            } else {
                alert('Please enter a valid EAN');
            }
        }
    });

    // Event listener to add a bag when the button is pushed
    bagButton.addEventListener('click', () => {
        fetchProduct(5057373964052);
    });

});

// Function to display the current time
function displayTime() {
    const currentTime = new Date();
    const day = currentTime.getDay();
    const date = currentTime.getDate();
    const month = currentTime.getMonth();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const timeString = `${days[day]} ${date} ${months[month]} | ${hours}:${minutes}`;
    document.getElementById('checkout-datetime').textContent = timeString;
}

// Fetch product details by EAN
function fetchProduct(EAN) {
    fetch(`/api/product/?EAN=${EAN}`)
        .then(response => {
            if (!response.ok) throw new Error('Product not found');
            return response.json();
        })
        .then(product => {
            handleScan(product);
        })
        .catch(() => {
            alert('Product not found');
        });
}

// Handle adding scanned product to container/template
function handleScan(product) {
    const template = document.querySelector('.product-item-template');
    const newProduct = template.cloneNode(true);
    newProduct.style.display = 'flex';

    // Populate product data
    try {
        newProduct.querySelector('img').src = product.image_url;
        newProduct.querySelector('.product-name').textContent = product.name;
        newProduct.querySelector('.product-quantity').textContent = 'Quantity: 1';
        newProduct.querySelector('.product-price').textContent = product.discount
            ? `£${product.discounted_price.toFixed(2)} (D)`
            : `£${product.price.toFixed(2)}`;
    } catch (err) {
        console.error('Error populating template', err);
    }

    // Event listener for product click
    newProduct.querySelector('button').addEventListener('click', () => {
        openProductPopup(product);
    });

    // Insert new product at the top and scroll to the top
    const container = document.getElementById('product-container-main');
    container.insertBefore(newProduct, container.firstChild);
    container.scrollTop = 0;
}
