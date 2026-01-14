export function generateCode(prefix: string, lastCode?: string, padLength = 6): string {
  const year = new Date().getFullYear();
  let sequence = 1;

  if (lastCode) {
    // Extract sequence from lastCode (format: PREFIX + YEAR + SEQUENCE)
    const numericPart = lastCode.replace(/\D/g, '');
    if (numericPart.length > 4) {
      sequence = parseInt(numericPart.slice(4), 10) + 1;
    }
  }

  return `${prefix}${year}${sequence.toString().padStart(padLength, '0')}`;
}

export function generateReceiptNumber(lastCode?: string): string {
  return generateCode('PN', lastCode); // Phieu Nhap
}

export function generateExportNumber(lastCode?: string): string {
  return generateCode('PX', lastCode); // Phieu Xuat
}

export function generateTransferNumber(lastCode?: string): string {
  return generateCode('PC', lastCode); // Phieu Chuyen
}

export function generateSampleCode(lastCode?: string): string {
  return generateCode('SM', lastCode); // Sample
}

export function generateBatchCode(lastCode?: string): string {
  return generateCode('DN', lastCode); // Dot Nhan
}
