// User types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Pagination types
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

// Catalog types
export interface SeedCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  path: string;
  level: number;
  isActive: boolean;
  children?: SeedCategory[];
}

export interface SeedVariety {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  category?: SeedCategory;
  scientificName?: string;
  origin?: string;
  characteristics?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  type: 'PROVINCE' | 'DISTRICT' | 'COMMUNE';
  parentId?: string;
  path: string;
  level: number;
  children?: Location[];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  locationId?: string;
  location?: Location;
  capacity?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  managerId?: string;
  isActive: boolean;
}

export interface StorageLocation {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  warehouse?: Warehouse;
  type: 'CABINET' | 'SHELF' | 'COMPARTMENT';
  parentId?: string;
  path: string;
  capacity?: number;
  isActive: boolean;
  children?: StorageLocation[];
}

export interface Staff {
  id: string;
  fullName: string;
  code: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  roles: string[];
  isActive: boolean;
}

export interface SampleProvider {
  id: string;
  name: string;
  code: string;
  type: 'ORGANIZATION' | 'INDIVIDUAL' | 'RESEARCH_INSTITUTE';
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
}

// Sample types
export interface Sample {
  id: string;
  sampleCode: string;
  sampleName: string;
  categoryId: string;
  category?: SeedCategory;
  varietyId?: string;
  variety?: SeedVariety;
  providerId?: string;
  provider?: SampleProvider;
  collectionDate: string;
  collectionLocation?: string;
  collectorId?: string;
  quantity: number;
  unit: string;
  status: SampleStatus;
  storageLocationId?: string;
  storageLocation?: StorageLocation;
  warehouseId?: string;
  warehouse?: Warehouse;
  lastEvaluationDate?: string;
  lastGerminationRate?: number;
  nextEvaluationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SampleStatus =
  | 'COLLECTED'
  | 'PROCESSING'
  | 'EVALUATED'
  | 'IN_STORAGE'
  | 'EXPORTED'
  | 'DESTROYED';

// Evaluation types
export interface SampleEvaluation {
  id: string;
  sampleId: string;
  sample?: Sample;
  stageId?: string;
  evaluationDate: string;
  evaluatorId?: string;
  evaluator?: Staff;
  overallResult?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  germinationRate?: number;
  conclusion?: string;
  recommendations?: string;
  notes?: string;
  results?: EvaluationResult[];
}

export interface EvaluationResult {
  id: string;
  evaluationId: string;
  criteriaId: string;
  numericValue?: number;
  textValue?: string;
  isPassed?: boolean;
  notes?: string;
}

// Warehouse types
export interface WarehouseReceipt {
  id: string;
  receiptCode: string;
  warehouseId: string;
  warehouse?: Warehouse;
  receiptDate: string;
  receiverId?: string;
  receiver?: Staff;
  notes?: string;
  items?: WarehouseReceiptItem[];
  createdAt: string;
}

export interface WarehouseReceiptItem {
  id: string;
  receiptId: string;
  sampleId: string;
  sample?: Sample;
  quantity: number;
  storageLocationId?: string;
  storageLocation?: StorageLocation;
  notes?: string;
}

export interface WarehouseExport {
  id: string;
  exportCode: string;
  warehouseId: string;
  warehouse?: Warehouse;
  purpose: ExportPurpose;
  status: ExportStatus;
  requestDate?: string;
  requesterId?: string;
  requester?: Staff;
  approverId?: string;
  approver?: Staff;
  approvalDate?: string;
  exportDate?: string;
  recipientName?: string;
  recipientOrg?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  reason?: string;
  rejectReason?: string;
  notes?: string;
  items?: WarehouseExportItem[];
  createdAt: string;
}

export interface WarehouseExportItem {
  id: string;
  exportId: string;
  sampleId: string;
  sample?: Sample;
  quantity: number;
  notes?: string;
}

export type ExportPurpose = 'RESEARCH' | 'DISTRIBUTION' | 'DESTRUCTION' | 'TRANSFER' | 'OTHER';
export type ExportStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPORTED' | 'CANCELLED';

// Inventory types
export interface InventoryTransaction {
  id: string;
  sampleId: string;
  sample?: Sample;
  warehouseId: string;
  warehouse?: Warehouse;
  storageLocationId?: string;
  storageLocation?: StorageLocation;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  referenceType: string;
  referenceId: string;
  transactionDate: string;
  notes?: string;
}

export interface StockSummary {
  sampleId: string;
  sampleCode: string;
  sampleName: string;
  warehouseId: string;
  warehouseName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}
