export function generateCode(prefix: string, sequence: number, padLength = 6): string {
  const year = new Date().getFullYear();
  return `${prefix}${year}${sequence.toString().padStart(padLength, '0')}`;
}

export function generateReceiptNumber(sequence: number): string {
  return generateCode('PN', sequence); // Phieu Nhap
}

export function generateExportNumber(sequence: number): string {
  return generateCode('PX', sequence); // Phieu Xuat
}

export function generateTransferNumber(sequence: number): string {
  return generateCode('PC', sequence); // Phieu Chuyen
}

export function generateSampleCode(sequence: number): string {
  return generateCode('SM', sequence); // Sample
}

export function generateBatchCode(sequence: number): string {
  return generateCode('DN', sequence); // Dot Nhan
}
