export enum SampleStatus {
  COLLECTED = 'COLLECTED',       // Đã thu thập
  EVALUATED = 'EVALUATED',       // Đã đánh giá
  IN_STORAGE = 'IN_STORAGE',     // Đang lưu trữ
  PROPAGATING = 'PROPAGATING',   // Đang nhân
  EXPORTED = 'EXPORTED',         // Đã xuất
  DISPOSED = 'DISPOSED',         // Đã thanh lý
}

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  [SampleStatus.COLLECTED]: 'Đã thu thập',
  [SampleStatus.EVALUATED]: 'Đã đánh giá',
  [SampleStatus.IN_STORAGE]: 'Đang lưu trữ',
  [SampleStatus.PROPAGATING]: 'Đang nhân',
  [SampleStatus.EXPORTED]: 'Đã xuất',
  [SampleStatus.DISPOSED]: 'Đã thanh lý',
};
