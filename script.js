class UIAnalyzer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.uploadedImages = [];
        this.analysisResults = null;
        this.apiKey = null;
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.uploadedImagesContainer = document.getElementById('uploadedImages');
        this.imagesGrid = document.getElementById('imagesGrid');
        this.imageCount = document.getElementById('imageCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.exportBtn = document.getElementById('exportBtn');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.clearAllBtn.addEventListener('click', () => this.clearAllImages());
        this.analyzeBtn.addEventListener('click', () => this.analyzeImages());
        this.exportBtn.addEventListener('click', () => this.exportResults());

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('dragleave', () => this.handleDragLeave());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave() {
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            this.processFiles(files);
        }
    }

    handleFileSelect(e) {
        console.log('Files selected:', e.target.files.length);
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        console.log('Image files filtered:', files.length);
        if (files.length > 0) {
            this.processFiles(files);
        }
    }

    async processFiles(files) {
        console.log('Processing files:', files.length);
        for (const file of files) {
            await this.addImage(file);
        }
        console.log('Total images after processing:', this.uploadedImages.length);
        this.updateUI();
    }

    async addImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name
                };
                this.uploadedImages.push(imageData);
                resolve(imageData);
            };
            reader.readAsDataURL(file);
        });
    }

    removeImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
        this.updateUI();
    }

    clearAllImages() {
        this.uploadedImages = [];
        this.updateUI();
    }

    updateUI() {
        const hasImages = this.uploadedImages.length > 0;
        
        // Update visibility
        this.uploadArea.style.display = hasImages ? 'none' : 'block';
        this.uploadedImagesContainer.style.display = hasImages ? 'block' : 'none';
        
        // Update analyze button
        this.analyzeBtn.disabled = !hasImages;
        
        // Update image count
        this.imageCount.textContent = this.uploadedImages.length;
        
        // Render images grid
        this.renderImagesGrid();
        
        // Hide results if no images
        if (!hasImages) {
            this.resultsSection.style.display = 'none';
        }
    }

    renderImagesGrid() {
        this.imagesGrid.innerHTML = '';
        
        this.uploadedImages.forEach(imageData => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            
            imageItem.innerHTML = `
                <img src="${imageData.dataUrl}" alt="Screenshot">
                <button class="image-remove-btn" data-image-id="${imageData.id}">✕</button>
                <div class="image-overlay">
                    ${imageData.name}
                </div>
            `;
            
            // Add remove event listener
            const removeBtn = imageItem.querySelector('.image-remove-btn');
            removeBtn.addEventListener('click', () => this.removeImage(imageData.id));
            
            this.imagesGrid.appendChild(imageItem);
        });
    }

    async analyzeImages() {
        if (this.uploadedImages.length === 0) return;

        this.setLoadingState(true);

        try {
            // Check if we should use real OpenAI analysis or mock data
            if (this.shouldUseRealAnalysis()) {
                this.analysisResults = await this.performRealAnalysis();
            } else {
                // Show API key prompt first
                await this.promptForApiKey();
                if (this.apiKey) {
                    this.analysisResults = await this.performRealAnalysis();
                } else {
                    // Fall back to mock analysis
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    this.analysisResults = await this.performMockAnalysis();
                }
            }
            
            this.displayResults();
            
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed: ' + error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    shouldUseRealAnalysis() {
        return this.apiKey && this.apiKey.startsWith('sk-');
    }

    async promptForApiKey() {
        const apiKey = prompt(
            'Enter your OpenAI API key for real image analysis:\n\n' +
            '• Get your key from: https://platform.openai.com/api-keys\n' +
            '• Leave empty to use demo analysis\n' +
            '• Your key is only used locally and not stored'
        );
        
        if (apiKey && apiKey.trim()) {
            this.apiKey = apiKey.trim();
        }
    }

    async performRealAnalysis() {
        if (!this.apiKey) {
            throw new Error('OpenAI API key is required for real analysis');
        }

        const analysisPrompts = this.uploadedImages.map((imageData, index) => ({
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Analyze this mobile app screenshot (Image ${index + 1}/${this.uploadedImages.length}). Extract:
                    1. Color palette (hex values)
                    2. Typography details (fonts, sizes, hierarchy)
                    3. Layout patterns and spacing
                    4. UI components and their styles
                    5. UX insights and design patterns
                    
                    Provide specific, actionable details for a developer to recreate similar UI.`
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageData.dataUrl
                    }
                }
            ]
        }));

        // For multiple images, we'll analyze them together
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a UI/UX expert analyzing mobile app screenshots. Provide detailed, technical analysis that developers can use to recreate similar designs. Return structured data about colors, typography, layout, components, and UX patterns."
                    },
                    ...analysisPrompts
                ],
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;
        
        // Parse the AI response into structured data
        return this.parseAIAnalysis(analysis);
    }

    parseAIAnalysis(analysisText) {
        // This is a simplified parser. In a real app, you'd want more sophisticated parsing
        // or ask the AI to return structured JSON
        
        const colors = this.extractColors(analysisText);
        const typography = this.extractTypography(analysisText);
        const layout = this.extractLayout(analysisText);
        const components = this.extractComponents(analysisText);
        const uxInsights = this.extractUXInsights(analysisText);

        return {
            colors: colors.length > 0 ? colors : ['#667eea', '#764ba2', '#f8fafc', '#1e293b'],
            typography: typography,
            layout: layout,
            components: components,
            uxInsights: uxInsights,
            rawAnalysis: analysisText
        };
    }

    extractColors(text) {
        const hexRegex = /#[0-9A-Fa-f]{6}/g;
        const matches = text.match(hexRegex);
        return matches ? [...new Set(matches)] : [];
    }

    extractTypography(text) {
        return {
            primaryFont: this.extractValue(text, /primary font.*?([A-Za-z\s]+)/i) || 'System Font',
            secondaryFont: this.extractValue(text, /secondary font.*?([A-Za-z\s]+)/i) || 'System Font',
            headingSize: this.extractValue(text, /heading.*?(\d+(?:-\d+)?px)/i) || '24-32px',
            bodySize: this.extractValue(text, /body.*?(\d+(?:-\d+)?px)/i) || '16-18px',
            fontWeights: ['400 (Regular)', '600 (Semibold)', '700 (Bold)'],
            lineHeight: '1.4-1.6'
        };
    }

    extractLayout(text) {
        return {
            gridSystem: this.extractValue(text, /grid.*?([^.]+)/i) || 'Responsive grid system',
            spacing: this.extractValue(text, /spacing.*?([^.]+)/i) || '8px, 16px, 24px, 32px',
            borderRadius: this.extractValue(text, /border.*?radius.*?([^.]+)/i) || '8px, 12px, 16px',
            margins: this.extractValue(text, /margin.*?([^.]+)/i) || 'Consistent margins throughout',
            containerWidth: '1200px max-width'
        };
    }

    extractComponents(text) {
        const components = [];
        const componentPatterns = [
            /button/i, /card/i, /input/i, /navigation/i, /modal/i, /tab/i, /form/i
        ];
        
        // Extract component mentions from the text
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            componentPatterns.forEach(pattern => {
                if (pattern.test(sentence)) {
                    components.push(sentence.trim());
                }
            });
        });
        
        return components.length > 0 ? components : [
            'Modern button styling with rounded corners',
            'Card-based layout with subtle shadows',
            'Clean input fields with minimal borders'
        ];
    }

    extractUXInsights(text) {
        const insights = [];
        const sentences = text.split(/[.!?]+/);
        
        sentences.forEach(sentence => {
            if (sentence.length > 20 && (
                /user/i.test(sentence) || 
                /experience/i.test(sentence) || 
                /design/i.test(sentence) ||
                /interface/i.test(sentence)
            )) {
                insights.push(sentence.trim());
            }
        });
        
        return insights.length > 0 ? insights : [
            'Clean, user-friendly interface design',
            'Consistent visual hierarchy throughout',
            'Mobile-optimized interaction patterns'
        ];
    }

    extractValue(text, regex) {
        const match = text.match(regex);
        return match ? match[1].trim() : null;
    }

    async performMockAnalysis() {
        // Enhanced mock analysis for multiple images
        const imageCount = this.uploadedImages.length;
        
        return {
            colors: [
                '#667eea', '#764ba2', '#f8fafc', '#1e293b', 
                '#e2e8f0', '#10b981', '#ef4444', '#f59e0b'
            ],
            typography: {
                primaryFont: 'SF Pro Display',
                secondaryFont: 'SF Pro Text',
                headingSize: '24-32px',
                bodySize: '16-18px',
                fontWeights: ['400 (Regular)', '600 (Semibold)', '700 (Bold)'],
                lineHeight: '1.4-1.6'
            },
            layout: {
                gridSystem: '12-column responsive grid',
                spacing: '8px, 16px, 24px, 32px (increments of 8)',
                borderRadius: '8px, 12px, 16px (rounded corners)',
                margins: '16px mobile, 24px tablet, 32px desktop',
                containerWidth: '1200px max-width'
            },
            components: [
                'Card-based layout with subtle shadows',
                'Rounded buttons with gradient backgrounds',
                'Input fields with minimal borders',
                'Navigation tabs with underline indicators',
                'Modal overlays with backdrop blur',
                'Toast notifications in top-right',
                'Progress indicators with smooth animations'
            ],
            uxInsights: [
                `Analysis based on ${imageCount} uploaded screenshot${imageCount > 1 ? 's' : ''}`,
                'Clean, minimalist design with plenty of white space',
                'Consistent color palette throughout the interface',
                'Clear visual hierarchy with proper typography scaling',
                'Intuitive navigation with familiar interaction patterns',
                'Mobile-first responsive design approach',
                'Accessibility considerations with proper contrast ratios',
                'Smooth transitions and micro-interactions for better UX'
            ]
        };
    }

    displayResults() {
        // Display colors
        const colorPalette = document.getElementById('colorPalette');
        colorPalette.innerHTML = '';
        this.analysisResults.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.setAttribute('data-color', color);
            colorPalette.appendChild(swatch);
        });

        // Display typography
        const typography = document.getElementById('typography');
        typography.innerHTML = `
            <ul>
                <li><strong>Primary Font:</strong> ${this.analysisResults.typography.primaryFont}</li>
                <li><strong>Secondary Font:</strong> ${this.analysisResults.typography.secondaryFont}</li>
                <li><strong>Heading Size:</strong> ${this.analysisResults.typography.headingSize}</li>
                <li><strong>Body Size:</strong> ${this.analysisResults.typography.bodySize}</li>
                <li><strong>Font Weights:</strong> ${this.analysisResults.typography.fontWeights.join(', ')}</li>
                <li><strong>Line Height:</strong> ${this.analysisResults.typography.lineHeight}</li>
            </ul>
        `;

        // Display layout
        const layout = document.getElementById('layout');
        layout.innerHTML = `
            <ul>
                <li><strong>Grid System:</strong> ${this.analysisResults.layout.gridSystem}</li>
                <li><strong>Spacing:</strong> ${this.analysisResults.layout.spacing}</li>
                <li><strong>Border Radius:</strong> ${this.analysisResults.layout.borderRadius}</li>
                <li><strong>Margins:</strong> ${this.analysisResults.layout.margins}</li>
                <li><strong>Container Width:</strong> ${this.analysisResults.layout.containerWidth}</li>
            </ul>
        `;

        // Display components
        const components = document.getElementById('components');
        components.innerHTML = `
            <ul>
                ${this.analysisResults.components.map(component => `<li>${component}</li>`).join('')}
            </ul>
        `;

        // Display UX insights
        const uxInsights = document.getElementById('uxInsights');
        uxInsights.innerHTML = `
            <ul>
                ${this.analysisResults.uxInsights.map(insight => `<li>• ${insight}</li>`).join('')}
            </ul>
        `;

        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    setLoadingState(isLoading) {
        const btnText = this.analyzeBtn.querySelector('.btn-text');
        const spinner = this.analyzeBtn.querySelector('.loading-spinner');
        
        if (isLoading) {
            btnText.textContent = 'Analyzing Screenshots...';
            spinner.style.display = 'inline-block';
            this.analyzeBtn.disabled = true;
        } else {
            btnText.textContent = 'Analyze UI & Extract Styles';
            spinner.style.display = 'none';
            this.analyzeBtn.disabled = this.uploadedImages.length === 0;
        }
    }

    exportResults() {
        if (!this.analysisResults) return;

        const report = {
            timestamp: new Date().toISOString(),
            imageCount: this.uploadedImages.length,
            imageNames: this.uploadedImages.map(img => img.name),
            analysis: {
                colorPalette: this.analysisResults.colors,
                typography: this.analysisResults.typography,
                layout: this.analysisResults.layout,
                components: this.analysisResults.components,
                uxInsights: this.analysisResults.uxInsights
            },
            css: this.generateCSS(),
            recommendations: this.generateRecommendations(),
            ...(this.analysisResults.rawAnalysis && { rawAnalysis: this.analysisResults.rawAnalysis })
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ui-analysis-${this.uploadedImages.length}-screens-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateCSS() {
        const colors = this.analysisResults.colors;
        const typography = this.analysisResults.typography;
        
        return `
/* Generated CSS Variables from UI Analysis */
:root {
  /* Color Palette */
  --primary-color: ${colors[0]};
  --secondary-color: ${colors[1]};
  --background-color: ${colors[2]};
  --text-color: ${colors[3]};
  --border-color: ${colors[4]};
  --success-color: ${colors[5]};
  --error-color: ${colors[6]};
  --warning-color: ${colors[7]};
  
  /* Typography */
  --font-family-primary: '${typography.primaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-secondary: '${typography.secondaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-heading: ${typography.headingSize.split('-')[0]};
  --font-size-body: ${typography.bodySize.split('-')[0]};
  --line-height: ${typography.lineHeight.split('-')[0]};
  
  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  
  /* Border Radius */
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
}

/* Base Styles */
body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height);
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 600;
}

/* Card Styles */
.card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
        `.trim();
    }

    generateRecommendations() {
        const imageCount = this.uploadedImages.length;
        return [
            `Based on analysis of ${imageCount} screenshot${imageCount > 1 ? 's' : ''}:`,
            "Use the extracted color palette consistently across your app",
            "Implement the typography hierarchy with proper font sizes and weights",
            "Follow the spacing system for consistent layout",
            "Consider the UX patterns identified for better user experience",
            "Test the color contrast ratios for accessibility compliance",
            "Implement responsive design following the mobile-first approach",
            "Add subtle animations and transitions for better micro-interactions",
            ...(imageCount > 1 ? ["Compare patterns across screens for consistency"] : [])
        ];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UIAnalyzer();
});