export enum ExportStatus {
  DRAFT = 'DRAFT',                       // Nháp
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Chờ duyệt
  APPROVED = 'APPROVED',                 // Đã duyệt
  REJECTED = 'REJECTED',                 // Từ chối
  EXPORTED = 'EXPORTED',                 // Đã xuất
  CANCELLED = 'CANCELLED',               // Đã hủy
}

export const EXPORT_STATUS_LABELS: Record<ExportStatus, string> = {
  [ExportStatus.DRAFT]: 'Nháp',
  [ExportStatus.PENDING_APPROVAL]: 'Chờ duyệt',
  [ExportStatus.APPROVED]: 'Đã duyệt',
  [ExportStatus.REJECTED]: 'Từ chối',
  [ExportStatus.EXPORTED]: 'Đã xuất',
  [ExportStatus.CANCELLED]: 'Đã hủy',
};

export const ALLOWED_TRANSITIONS: Record<ExportStatus, ExportStatus[]> = {
  [ExportStatus.DRAFT]: [ExportStatus.PENDING_APPROVAL, ExportStatus.CANCELLED],
  [ExportStatus.PENDING_APPROVAL]: [ExportStatus.APPROVED, ExportStatus.REJECTED],
  [ExportStatus.APPROVED]: [ExportStatus.EXPORTED, ExportStatus.CANCELLED],
  [ExportStatus.REJECTED]: [ExportStatus.DRAFT, ExportStatus.CANCELLED],
  [ExportStatus.EXPORTED]: [],
  [ExportStatus.CANCELLED]: [],
};

export function canTransition(from: ExportStatus, to: ExportStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
}
