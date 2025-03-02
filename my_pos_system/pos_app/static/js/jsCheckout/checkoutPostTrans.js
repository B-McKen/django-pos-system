/* Update the stock record for items sold in a transaction,
increment the number for 'sales today' when viewing in the inventory management page. */
function updateDailySales() {
    const items = document.getElementById('product-container-main');
    const products = items.querySelectorAll('.product-item-template:not([style*="display: none"])');

    products.forEach(item => {
        fetch(`/update-sales/${item.dataset.ean}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ quantity: parseInt(item.dataset.quantity )}),
        })
        .then(response => response.json())
        .then(data => console.log('Sales updated:', data))
        .catch(error => console.error('Error:', error));
    });
}