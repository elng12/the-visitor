document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            
            // Change hamburger to X
            const hamburger = this.querySelector('.hamburger');
            hamburger.classList.toggle('active');
            
            if (hamburger.classList.contains('active')) {
                hamburger.style.background = 'transparent';
                hamburger.style.transform = 'rotate(180deg)';
            } else {
                hamburger.style.background = 'var(--text-color)';
                hamburger.style.transform = 'rotate(0)';
            }
        });
    }
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            
            const hamburger = mobileMenuToggle.querySelector('.hamburger');
            hamburger.classList.remove('active');
            hamburger.style.background = 'var(--text-color)';
            hamburger.style.transform = 'rotate(0)';
        });
    });
    
    // FAQ items are now always expanded - no accordion functionality needed
    
    // Game iframe loading with error handling
    const gameIframe = document.getElementById('game-iframe');
    if (gameIframe) {
        // Set the actual game URL here - using Cloudflare Worker to avoid CORS issues
        const gameUrl = 'https://games.crazygames.com/en_US/the-visitor/index.html';
        
        // Loading message
        const gameContainer = document.querySelector('.game-container');
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = '<p>Loading game...</p><div class="spinner"></div>';
        gameContainer.appendChild(loadingMessage);
        
        // Error handling
        const showError = () => {
            loadingMessage.innerHTML = '<p>⚠️ Game failed to load. Please refresh the page or try again later.</p>';
            loadingMessage.style.color = 'var(--accent-color)';
        };
        
        // Set iframe source
        console.log('Setting game URL to:', gameUrl);
        gameIframe.src = gameUrl;
        
        // Success handler
        gameIframe.addEventListener('load', () => {
            setTimeout(() => {
                loadingMessage.style.display = 'none';
            }, 1000);
        });
        
        // Error handler
        gameIframe.addEventListener('error', showError);
        
        // Timeout handler (if game doesn't load within 30 seconds)
        setTimeout(() => {
            if (loadingMessage.style.display !== 'none') {
                showError();
            }
        }, 30000);
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn && gameIframe) {
        fullscreenBtn.addEventListener('click', () => {
            // Google Analytics event tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'fullscreen_click', {
                    'event_category': 'game_interaction',
                    'event_label': 'the_visitor_game'
                });
            }
            
            if (gameIframe.requestFullscreen) {
                gameIframe.requestFullscreen();
            } else if (gameIframe.mozRequestFullScreen) { // Firefox
                gameIframe.mozRequestFullScreen();
            } else if (gameIframe.webkitRequestFullscreen) { // Chrome, Safari and Opera
                gameIframe.webkitRequestFullscreen();
            } else if (gameIframe.msRequestFullscreen) { // IE/Edge
                gameIframe.msRequestFullscreen();
            }
        });
    }
    
    // Sound toggle button
    const soundBtn = document.getElementById('sound-btn');
    let soundOn = true;
    
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundOn = !soundOn;
            const icon = soundBtn.querySelector('i');
            
            // Google Analytics event tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'sound_toggle', {
                    'event_category': 'game_interaction',
                    'event_label': soundOn ? 'sound_on' : 'sound_off'
                });
            }
            
            if (soundOn) {
                icon.className = 'fas fa-volume-up';
                // Logic to unmute game sound would go here
                // This depends on how your game handles sound
                if (gameIframe && gameIframe.contentWindow) {
                    // Example: gameIframe.contentWindow.unmuteSound();
                }
            } else {
                icon.className = 'fas fa-volume-mute';
                // Logic to mute game sound would go here
                if (gameIframe && gameIframe.contentWindow) {
                    // Example: gameIframe.contentWindow.muteSound();
                }
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        // Update last scroll position
        lastScrollTop = scrollTop;
        
        // Show header when at top of page
        if (scrollTop === 0) {
            header.style.transform = 'translateY(0)';
        }
    });
    
    // Add CSS for the loading spinner
    const style = document.createElement('style');
    style.textContent = `
        .loading-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
        }
        
        .spinner {
            margin: 20px auto;
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: var(--accent-color);
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .header {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});