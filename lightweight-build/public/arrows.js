document.addEventListener("DOMContentLoaded", function() {
  // Get references to the arrow buttons
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');

  // Add click event listeners to the arrow buttons
  leftArrow.addEventListener('click', function() {
    // Action to perform when left arrow button is clicked
    console.log('Left arrow button clicked');
    // Add your custom logic here
  });

  rightArrow.addEventListener('click', function() {
    // Action to perform when right arrow button is clicked
    console.log('Right arrow button clicked');
    type = (type + 1) % 3;
  });
});