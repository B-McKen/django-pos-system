// Index.html and navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('enter-checkout-button');
    startButton.addEventListener('click', function() {
        window.location.href = '/checkout-main/';
    });
});
