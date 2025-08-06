# The Visitor - Online Game Website

A responsive website for playing "The Visitor" horror game online. This project provides a modern, user-friendly interface for experiencing the classic point-and-click horror game.

![The Visitor Game Website](images/visitor-screenshot.jpg)

## Features

- Responsive design for both desktop and mobile devices
- Interactive game interface with fullscreen capability
- Comprehensive game information and instructions
- FAQ section for common questions
- Modern, horror-themed UI design

## Project Structure

```
the-visitor/
├── index.html         # Main HTML file
├── styles.css         # CSS styles
├── script.js          # JavaScript functionality
├── images/            # Image assets
│   ├── hero-bg.jpg    # Hero section background
│   ├── visitor-screenshot.jpg  # Game screenshot
│   └── README.md      # Image guidelines
└── README.md          # Project documentation
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/the-visitor.git
   ```

2. Add the required images to the `images` directory (see `images/README.md` for details)

3. Open `index.html` in your browser to view the website

## Game Integration

To integrate the actual game:

1. The game URL is already set to the CrazyGames hosted version:
   ```javascript
   // This line in script.js
   const gameUrl = 'https://games.crazygames.com/en_US/the-visitor/index.html';
   ```

2. If the game requires specific API calls for functions like sound control, update the relevant sections in `script.js`

## Customization

- **Colors**: Edit CSS variables in the `:root` section of `styles.css`
- **Content**: Update text in `index.html`
- **Images**: Replace placeholder images in the `images` directory

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Performance Optimization

For best performance:

1. Optimize all images using tools like [TinyPNG](https://tinypng.com/)
2. Consider using WebP format with fallbacks for better image compression
3. Minify CSS and JavaScript files for production

## License

This project is for demonstration purposes only. "The Visitor" game and its content are property of their respective owners.

## Credits

- Font Awesome for icons
- Google Fonts for typography
- Original game creators for "The Visitor"