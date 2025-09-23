import PDFDocument from 'pdfkit';

export class PDFComponents {
  constructor(
    private doc: PDFDocument,
    private margin: number,
    private getCurrentY: () => number,
    private setCurrentY: (y: number) => void,
    private checkPageBreak: (space: number) => void
  ) {}


  //report header 
  addReportHeader(title:string,filters:{startDate?:string,endDate?:string}):void {
    this.doc.fontSize(18)
    .fillColor('black')
    .text(title, this.margin, this.getCurrentY(), { align: 'center' });

    this.setCurrentY(this.getCurrentY() + 30);

    this.doc.fontSize(10)
    .text(`Generated on: ${new Date().toLocaleDateString()}`, this.margin, this.getCurrentY(), { align: 'left' });

    this.setCurrentY(this.getCurrentY() + 15);

    let filterText = 'Filters: ';
    if(filters.startDate) filterText +=`Start Date:${filters.startDate} `;
    if(filters.endDate) filterText +=`End Date:${filters.endDate} `;
    if(!filters.startDate && !filters.endDate) filterText +='None';

    this.doc.text(filterText,this.margin,this.getCurrentY());
    this.setCurrentY(this.getCurrentY() + 30);

  }

  //table header
  addTableHeader(headers:string[],columnWidths:number[]):void {
    this.checkPageBreak(25);

    let x = this.margin;

    //table header
    this.doc.rect(this.margin,this.getCurrentY()-5,
    columnWidths.reduce((sum, width) => sum + width, 0), 20)
      .fillAndStroke('#ffffffff', '#4f5153ff');

      //header text
      this.doc.fontSize(10)
      .fillColor('white');

     headers.forEach((header, index) => {
      this.doc.text(header, x + 5, this.getCurrentY(), { 
        width: columnWidths[index] - 10, 
        align: 'left' 
      });
      x += columnWidths[index];
    });

    this.setCurrentY(this.getCurrentY() + 2);
    this.doc.fillColor('black'); 
  }

  //table row
  addTableRow(rowData:string[],columnWidths:number[],isEven:boolean):void {
    this.checkPageBreak(20);

    let x = this.margin;
    const rowHeight = 18;

     // Background for alternating rows
    if (isEven) {
      this.doc.rect(this.margin, this.getCurrentY() - 2, 
        columnWidths.reduce((sum, width) => sum + width, 0), rowHeight)
        .fill('#F2F2F2');
    }
    
    // Row border
    this.doc.rect(this.margin, this.getCurrentY() - 2, 
      columnWidths.reduce((sum, width) => sum + width, 0), rowHeight)
      .stroke('#CCCCCC');
    
    this.doc.fontSize(9)
      .fillColor('black');
    
    rowData.forEach((data, index) => {
      this.doc.text(data, x + 5, this.getCurrentY(), { 
        width: columnWidths[index] - 10, 
        align: 'left',
        ellipsis: true
      });
      x += columnWidths[index];
    });
    
    this.setCurrentY(this.getCurrentY() + rowHeight);
  }

  addSummarySection(summaryData: { label: string; value: number }[]): void {
    this.checkPageBreak(summaryData.length * 20 + 30);
    
    this.doc.fontSize(14)
      .fillColor('black')
      .text('Summary', this.margin, this.getCurrentY());
    
    this.setCurrentY(this.getCurrentY() + 25);
    
    summaryData.forEach((item) => {
      this.doc.fontSize(11)
        .text(`${item.label}: ${item.value}`, this.margin + 20, this.getCurrentY());
      this.setCurrentY(this.getCurrentY() + 18);
    });
  }
}