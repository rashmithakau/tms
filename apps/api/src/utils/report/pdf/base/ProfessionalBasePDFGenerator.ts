import PDFDocument from 'pdfkit';

export abstract class ProfessionalBasePDFGenerator {
    protected doc: PDFDocument;
    protected currentY: number = 0;
    protected readonly pageWidth: number = 612; 
    protected readonly pageHeight: number = 792;
    protected readonly margin: number = 40; // Reduced margin for more content space
    protected pageNumber: number = 1;
    protected totalPages: number = 1;

    // Professional color scheme
    protected readonly colors = {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
        background: '#F8FAFC',
        border: '#E2E8F0',
        text: {
            primary: '#1E293B',
            secondary: '#64748B',
            muted: '#94A3B8'
        }
    };

    constructor() {
        this.doc = new PDFDocument({
            size: 'LETTER',
            margins: { 
                top: this.margin, 
                bottom: 60, // Extra space for footer
                left: this.margin, 
                right: this.margin
            },
            bufferPages: true, // Enable buffer pages for page counting
            info: {
                Title: 'Professional Report',
                Author: 'TMS System',
                Subject: 'Generated Report',
                Keywords: 'timesheet, report, professional',
                Creator: 'TMS PDF Generator',
                Producer: 'TMS System v1.0'
            }
        });

        // Initialize current Y position
        this.currentY = this.margin + 20;
        
        // Set up professional fonts
        this.setupFonts();
    }

    // Setup professional font configurations
    private setupFonts(): void {
        try {
           
        } catch (error) {
            // Fall back to built-in fonts
            console.log('Using built-in fonts');
        }
    }

    // Enhanced buffer generation with metadata
    async generateBuffer(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffers: Uint8Array[] = [];

            this.doc.on('data', (chunk: Uint8Array) => {
                buffers.push(chunk);
            });

            this.doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            this.doc.on('error', (error) => {
                reject(error);
            });

            // Add page numbers to all pages before finalizing
            this.addPageNumbers();
            
            this.doc.end();
        });
    }

    // Enhanced page break with automatic footer handling
    protected checkPageBreak(requiredSpace: number): void {
        const footerSpace = 60;
        if (this.currentY + requiredSpace > this.pageHeight - this.margin - footerSpace) {
            this.addPageFooter();
            this.doc.addPage();
            this.pageNumber++;
            this.currentY = this.margin + 20;
        }
    }

    // Add page footer with professional styling
    protected addPageFooter(): void {
        const footerY = this.pageHeight - 50;
        
        // Footer separator line
        this.doc.save()
            .strokeColor(this.colors.border)
            .lineWidth(1)
            .moveTo(this.margin, footerY - 10)
            .lineTo(this.pageWidth - this.margin, footerY - 10)
            .stroke();

        // Footer content
        this.doc.fontSize(8)
            .fillColor(this.colors.text.muted)
            .font('Helvetica');

        // Left: Confidential notice
        this.doc.text('Confidential - For Internal Use Only', 
            this.margin, footerY, { align: 'left' });

        // Center: Page number
        this.doc.text(`Page ${this.pageNumber}`, 
            0, footerY, { 
                align: 'center',
                width: this.pageWidth 
            });

        // Right: Generation timestamp
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.doc.text(`Generated: ${timestamp}`, 
            this.pageWidth - 150, footerY, { 
                align: 'right',
                width: 100 
            });

        this.doc.restore();
    }

    // Add page numbers to all buffered pages
    private addPageNumbers(): void {
        const range = this.doc.bufferedPageRange();
        this.totalPages = range.count;
        
        for (let i = 0; i < range.count; i++) {
            this.doc.switchToPage(i);
            
            // Update page number display
            const pageNum = i + 1;
            const footerY = this.pageHeight - 50;
            
            this.doc.fontSize(8)
                .fillColor(this.colors.text.muted)
                .font('Helvetica')
                .text(`Page ${pageNum} of ${this.totalPages}`, 
                    0, footerY, { 
                        align: 'center',
                        width: this.pageWidth 
                    });
        }
    }

    // Professional date formatting
    protected formatDate(date: Date | string): string {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format date with time
    protected formatDateTime(date: Date | string): string {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Add watermark for draft documents
    protected addWatermark(text: string = 'DRAFT'): void {
        this.doc.save()
            .rotate(-45, { origin: [this.pageWidth / 2, this.pageHeight / 2] })
            .fontSize(72)
            .fillColor('#F1F5F9')
            .font('Helvetica-Bold')
            .text(text, 0, this.pageHeight / 2 - 36, {
                align: 'center',
                width: this.pageWidth
            })
            .restore();
    }

    // Add professional table of contents
    protected addTableOfContents(sections: { title: string; page: number }[]): void {
        this.checkPageBreak(sections.length * 20 + 60);
        
        this.doc.fontSize(16)
            .fillColor(this.colors.text.primary)
            .font('Helvetica-Bold')
            .text('Table of Contents', this.margin, this.currentY);
        
        this.currentY += 30;
        
        sections.forEach((section) => {
            this.doc.fontSize(11)
                .fillColor(this.colors.text.primary)
                .font('Helvetica')
                .text(section.title, this.margin + 20, this.currentY);
            
            this.doc.text(`${section.page}`, this.pageWidth - 80, this.currentY, {
                align: 'right',
                width: 50
            });
            
            this.currentY += 20;
        });
        
        this.currentY += 20;
    }

    // Add executive summary section
    protected addExecutiveSummary(summary: string): void {
        this.checkPageBreak(100);
        
        this.doc.fontSize(16)
            .fillColor(this.colors.text.primary)
            .font('Helvetica-Bold')
            .text('Executive Summary', this.margin, this.currentY);
        
        this.currentY += 30;
        
        // Summary background
        const summaryHeight = 80;
        this.doc.rect(this.margin, this.currentY, 
            this.pageWidth - (this.margin * 2), summaryHeight)
            .fill(this.colors.background)
            .stroke(this.colors.border);
        
        this.doc.fontSize(11)
            .fillColor(this.colors.text.primary)
            .font('Helvetica')
            .text(summary, this.margin + 15, this.currentY + 15, {
                width: this.pageWidth - (this.margin * 2) - 30,
                align: 'justify'
            });
        
        this.currentY += summaryHeight + 20;
    }

    // Add chart placeholder (for future chart implementation)
    protected addChartPlaceholder(title: string, height: number = 200): void {
        this.checkPageBreak(height + 40);
        
        this.doc.fontSize(12)
            .fillColor(this.colors.text.primary)
            .font('Helvetica-Bold')
            .text(title, this.margin, this.currentY);
        
        this.currentY += 25;
        
        // Chart placeholder
        this.doc.rect(this.margin, this.currentY, 
            this.pageWidth - (this.margin * 2), height)
            .fill('#FAFBFC')
            .stroke(this.colors.border);
        
        // Placeholder text
        this.doc.fontSize(14)
            .fillColor(this.colors.text.muted)
            .font('Helvetica')
            .text('[Chart Placeholder]', 0, this.currentY + height / 2, {
                align: 'center',
                width: this.pageWidth
            });
        
        this.currentY += height + 20;
    }
}