// Index.html and navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('enter-checkout-button');
    startButton.addEventListener('click', function() {
        window.location.href = '/checkout-main/';
    });
});

/* Image slideshow container (From W3Schools) */
let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 7000); // Change image every 7 seconds
}
