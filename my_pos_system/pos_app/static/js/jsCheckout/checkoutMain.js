// JavaScript functionality for the checkout interface

// Global variables
let productInfo = {};  // Stores information about the selected product
let isMember = false; // Assume customer is not a member to begin with
let itemCount = 0;
let savingsTotal = 0;
let basketTotal = 0;

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
    const payButton = document.getElementById('pay-button');
    const pluContainer = document.getElementById('PLU-main');

    eanInput.addEventListener('input', handleEANInput);
    eanInput.addEventListener('keypress', handleEANInput);
    memberButton.addEventListener('click', handleMemberClick);
    bagButton.addEventListener('click', () => fetchProduct(5057373964052));
    productContainer.addEventListener('click', handleProductClick);
    fruitButton.addEventListener('click', () => handlePLUClick('fruit'));
    vegButton.addEventListener('click', () => handlePLUClick('veg'));
    bakeryButton.addEventListener('click', () => handlePLUClick('bakery'));
    miscButton.addEventListener('click', () => handlePLUClick('misc'));
    payButton.addEventListener('click', handlePayButtonClick);
    pluContainer.addEventListener('click', handleAddPLU);
    document.addEventListener('click', clearDropdown);

    // Give focus to the search bar
    focusSearchBar();
    // Initialise payButton to be disabled
    updatePayButtonStyle();
});