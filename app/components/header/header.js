// Header functionality - shared across all pages
let isMenuOpen = false;

// Function to initialize header after DOM loads
function initializeHeader() {
    // Window controls
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.maximizeRestoreWindow();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });
    }

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const openHamburger = document.getElementById('openHamburger');
            const closeHamburger = document.getElementById('closeHamburger');
            const menu = document.getElementById('menu');
            
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                // Open menu
                openHamburger.style.opacity = '0';
                closeHamburger.style.opacity = '1';
                menu.classList.add('open');
            } else {
                // Close menu
                openHamburger.style.opacity = '1';
                closeHamburger.style.opacity = '0';
                menu.classList.remove('open');
            }
        });
    }
}

// Function to load header into any page
async function loadHeader() {
    try {
        // Determine the correct path based on current page location
        const currentLocation = window.location.pathname;
        let headerPath = './components/header/header.html';
        let basePath = './';
        
        // If we're in a subfolder (like clients/), adjust the paths
        if (currentLocation.includes('/clients/')) {
            headerPath = '../components/header/header.html';
            basePath = '../';
        }
        
        console.log('Loading header from:', headerPath, 'Base path:', basePath);
        
        const response = await fetch(headerPath);
        const headerHTML = await response.text();
        
        // Fix asset paths in the header HTML based on current location
        const fixedHeaderHTML = headerHTML
            .replace(/src="\.\/assets\//g, `src="${basePath}assets/`)
            .replace(/href="\.\/index\.html"/g, `href="${basePath}index.html"`)
            .replace(/href="\.\/clients\//g, `href="${basePath}clients/`);
        
        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', fixedHeaderHTML);
        
        // Initialize header functionality after loading
        initializeHeader();
        
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Auto-load header when DOM is ready
document.addEventListener('DOMContentLoaded', loadHeader);
