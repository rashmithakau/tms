import PDFDocument from 'pdfkit';


export abstract class BasePDFGenerator {
    protected doc: PDFDocument;
    protected currentY: number = 50;
    protected readonly pageWidth: number = 612; 
    protected readonly pageHeight: number = 792;
    protected readonly margin: number = 50;
    //create new pdf document with standard letter size and margins
    constructor() {
        this.doc = new PDFDocument({
            size: 'LETTER',
            margins: { top: this.margin, bottom: this.margin, left: this.margin, right: this.margin}
        });
    }
    //converts the PDF document into a binary Buffer that can be sent to clients or saved to disk
    async generateBuffer(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffers: Uint8Array[] = []; //Creates empty array to collect PDF data chunks(PDF is generated in multiple pieces )

            this.doc.on('data',(chunk: Uint8Array)=>{
                buffers.push(chunk); //Each time a new chunk of data is available, it is pushed into the buffers array
            });

            this.doc.on('end',()=>{
                 resolve(Buffer.concat(buffers)); //When the PDF generation is complete, the 'end' event is triggered, and all collected chunks are concatenated into a single Buffer
            });

            this.doc.on('error',(error)=>{
                reject(error); //If any error occurs during the PDF generation process, the 'error' event is triggered, and the promise is rejected with the error
            });

            this.doc.end(); //Finalizes the PDF document, signaling that no more content will be added

        });
    }

    protected checkPageBreak(requiredSpace: number):void {
        if(this.currentY + requiredSpace > this.pageHeight - this.margin) {
            this.doc.addPage(); //Adds a new page to the PDF document
            this.currentY = this.margin; //Resets the current Y position to the top margin of the new page
        }
    }

    protected formatDate(date:Date|string):string {
        const d = new Date(date);
        return d.toLocaleDateString();
    }
}