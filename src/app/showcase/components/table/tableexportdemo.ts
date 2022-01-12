import { Component, OnInit } from '@angular/core';
import { Product } from '../../domain/product';
import { ProductService } from '../../service/productservice';
import * as FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    templateUrl: './tableexportdemo.html'
})
export class TableExportDemo implements OnInit {

    products: Product[];

    selectedProducts: Product[];

    constructor(private productService: ProductService) { }

    cols: any[];

    exportColumns: any[];

    ngOnInit() {
        this.productService.getProductsSmall().then(data => this.products = data);

        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'category', header: 'Category' },
            { field: 'quantity', header: 'Quantity' }
        ];

        this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));
    }

    exportPdf() {
        // default is A4 PDF
        const doc = new jsPDF();
        // Landscape export, 2×4 inches
        // const doc = new jsPDF({
        //     orientation: 'landscape',
        //     unit: 'in',
        //     format: [4, 2]
        //   });
        autoTable(doc, {
            columns: this.exportColumns,
            body: this.products.map((record) => ({
                code: record.code,
                name: record.name,
                category: record.category,
                quantity: record.quantity?.toString(),
            })),
        });
        doc.save('products.pdf');
    }

    exportExcel() {
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.products);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "products");
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
}
