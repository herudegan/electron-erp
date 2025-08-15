document.getElementById('minimize-btn').addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
  window.electronAPI.maximizeRestoreWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

// Hamburger menu toggle with animation
let isMenuOpen = false;

document.getElementById('hamburger').addEventListener('click', () => {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  
  isMenuOpen = !isMenuOpen;
  
  if (isMenuOpen) {
    // Open menu
    hamburger.classList.add('open');
    menu.classList.add('open');
  } else {
    // Close menu
    hamburger.classList.remove('open');
    menu.classList.remove('open');
  }
});