import { Buffer } from 'node:buffer';
import * as XLSX from 'xlsx';

const SPREADSHEET_EXTENSIONS = new Set(['.xls', '.xlsx']);

function getFileExtension(fileName: string): string {
  const normalized = fileName.trim().toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');
  return dotIndex >= 0 ? normalized.slice(dotIndex) : '';
}

export function isSpreadsheetFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  if (SPREADSHEET_EXTENSIONS.has(extension)) {
    return true;
  }

  const mimeType = file.type.trim().toLowerCase();
  return (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

export async function readBulkImportFileAsCsv(file: File): Promise<string> {
  if (isSpreadsheetFile(file)) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(bytes, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return '';
    }
    const firstSheet = workbook.Sheets[firstSheetName];
    if (!firstSheet) {
      return '';
    }
    return XLSX.utils.sheet_to_csv(firstSheet, {
      blankrows: false,
    });
  }

  return file.text();
}

export function convertCsvToXlsxBuffer(csvContent: string, sheetName = 'Template'): Buffer {
  const workbook = XLSX.read(csvContent, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
  if (!firstSheet) {
    const emptyWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(emptyWorkbook, XLSX.utils.aoa_to_sheet([]), sheetName);
    return Buffer.from(
      XLSX.write(emptyWorkbook, {
        type: 'buffer',
        bookType: 'xlsx',
      }),
    );
  }
  if (firstSheetName && firstSheetName !== sheetName) {
    delete workbook.Sheets[firstSheetName];
    workbook.SheetNames = [sheetName];
    workbook.Sheets[sheetName] = firstSheet;
  }
  const binary = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });
  return Buffer.from(binary);
}
