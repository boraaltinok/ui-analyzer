# 🎨 UI Analyzer

Extract UI styles, color schemes, and UX patterns from competitor app screens using AI-powered analysis.

## Features

- 📱 **Multiple Image Support** - Upload and analyze multiple competitor screenshots
- 🤖 **AI-Powered Analysis** - Real OpenAI GPT-4 Vision analysis or demo mode
- 🎨 **Color Extraction** - Extract exact hex color palettes
- 🔤 **Typography Analysis** - Identify fonts, sizes, and hierarchy
- 📐 **Layout Patterns** - Discover spacing, grids, and component structures
- 💡 **UX Insights** - Get actionable design recommendations
- 📁 **Export Results** - Download comprehensive JSON reports with CSS variables

## Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main branch
4. Your app will be available at `https://yourusername.github.io/ui-analyzer`

### Option 2: Vercel (One-click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ui-analyzer)

### Option 3: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop this folder to deploy
3. Your app is live instantly

### Option 4: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/ui-analyzer.git
cd ui-analyzer

# Serve locally
npm start
# or
python3 -m http.server 8000

# Open http://localhost:8000
```

## Usage

1. **Upload Screenshots**: Drag & drop or browse to select competitor app screenshots
2. **AI Analysis**: Click "Analyze UI & Extract Styles"
3. **Enter API Key**: Provide your OpenAI API key for real analysis (or skip for demo)
4. **View Results**: See extracted colors, typography, layout patterns, and UX insights
5. **Export Report**: Download comprehensive analysis as JSON with CSS variables

## API Key Setup

To use real AI analysis:
1. Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Enter it when prompted (used locally only, never stored)
3. Enjoy detailed analysis of your competitor screenshots

## File Structure

```
ui-analyzer/
├── index.html          # Main application
├── styles.css          # Styling and responsive design
├── script.js           # JavaScript functionality
├── package.json        # Project metadata
└── README.md           # This file
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI Analysis**: OpenAI GPT-4 Vision API
- **Deployment**: Static hosting (GitHub Pages, Vercel, Netlify)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for commercial projects

## Support

For issues or feature requests, please open an issue on GitHub.

---

Built for analyzing competitor mobile app designs and extracting actionable UI/UX insights.