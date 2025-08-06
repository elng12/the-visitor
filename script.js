// Game preloading disabled to prevent conflicts
// Will be re-enabled once proxy is properly configured

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
    
    // Game iframe loading with optimized performance
    const gameIframe = document.getElementById('game-iframe');
    if (gameIframe) {
        // Use direct loading for now (proxy can be enabled later)
        const useProxy = false; // Set to true when proxy is deployed
        const proxyUrl = 'https://your-proxy-domain.vercel.app/game'; // Update this when ready
        const directUrl = 'https://games.crazygames.com/en_US/the-visitor/index.html';
        const gameUrl = useProxy ? `${proxyUrl}/en_US/the-visitor/index.html` : directUrl;
        
        // Optimized loading message with progress indication
        const gameContainer = document.querySelector('.game-container');
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = `
            <div class="loading-content">
                <p>🎮 Loading The Visitor...</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="loading-tip">💡 Tip: Use headphones for the best horror experience!</p>
            </div>
        `;
        gameContainer.appendChild(loadingMessage);
        
        // Simulate progress for better UX
        const progressFill = loadingMessage.querySelector('.progress-fill');
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);
        
        // Error handling
        const showError = () => {
            clearInterval(progressInterval);
            loadingMessage.innerHTML = `
                <div class="error-content">
                    <p>⚠️ Game failed to load</p>
                    <button onclick="location.reload()" class="btn btn-primary">🔄 Retry</button>
                    <p class="error-tip">Try refreshing the page or check your internet connection</p>
                </div>
            `;
        };
        
        // Skip preloading for now to avoid conflicts
        console.log('🚀 Loading game directly...');
        
        // Set iframe source with optimizations
        console.log('🎮 Loading game from:', gameUrl);
        gameIframe.src = gameUrl;
        
        // Enhanced success handler
        gameIframe.addEventListener('load', () => {
            clearInterval(progressInterval);
            progressFill.style.width = '100%';
            
            // Google Analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_loaded', {
                    'event_category': 'game_performance',
                    'event_label': 'the_visitor_loaded'
                });
            }
            
            setTimeout(() => {
                loadingMessage.style.opacity = '0';
                setTimeout(() => {
                    loadingMessage.style.display = 'none';
                }, 300);
            }, 500);
        });
        
        // Error handler
        gameIframe.addEventListener('error', showError);
        
        // Reduced timeout for faster error detection
        setTimeout(() => {
            if (loadingMessage.style.display !== 'none') {
                showError();
            }
        }, 20000);
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
            transition: opacity 0.3s ease;
            z-index: 10;
        }
        
        .loading-content, .error-content {
            background: rgba(0, 0, 0, 0.8);
            padding: 2rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--accent-color);
            backdrop-filter: blur(10px);
        }
        
        .progress-bar {
            width: 200px;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            margin: 1rem auto;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 3px;
        }
        
        .loading-tip, .error-tip {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 1rem;
        }
        
        .error-content .btn {
            margin: 1rem 0;
            padding: 0.8rem 1.5rem;
        }
        
        .header {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});