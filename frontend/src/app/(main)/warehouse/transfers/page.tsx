'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Tooltip,
  Modal,
  message,
  Form,
  DatePicker,
  Select,
  Descriptions,
  Drawer,
  InputNumber,
  Divider,
  Cascader,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { transfersService, inventoryService, WarehouseTransfer } from '@/services/warehouse.service';
import { warehousesService, storageLocationsService } from '@/services/catalog.service';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

// Map đơn vị chuẩn hóa sang nhãn hiển thị
const unitLabelMap: Record<string, string> = {
  gram: 'Gram',
  kg: 'Kg',
  hat: 'Hạt',
};

// Lấy đơn vị chuẩn hóa từ sample
const getSampleUnit = (sample: any): string => {
  const unit = sample?.quantityUnit || 'gram';
  const lower = unit.toLowerCase().trim();
  if (lower === 'g' || lower === 'gram') return 'gram';
  if (lower === 'kg' || lower === 'kilogram') return 'kg';
  if (lower === 'hat' || lower === 'hạt') return 'hat';
  return lower;
};

const statusColors: Record<string, string> = {
  DRAFT: 'default',
  IN_TRANSIT: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  IN_TRANSIT: 'Đang chuyển',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// Helper: convert tree to Cascader options
const treeToCascaderOptions = (tree: any[]): any[] => {
  return tree.map(node => ({
    value: node.id,
    label: node.name,
    children: node.children?.length > 0 ? treeToCascaderOptions(node.children) : undefined,
  }));
};

// Helper: find path in tree by ID
const findPathInTree = (tree: any[], targetId: string, path: string[] = []): string[] | null => {
  for (const node of tree) {
    const currentPath = [...path, node.id];
    if (node.id === targetId) return currentPath;
    if (node.children?.length > 0) {
      const found = findPathInTree(node.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
};

interface AvailableStock {
  sampleId: string;
  sampleCode: string;
  varietyName: string;
  localName: string;
  availableQuantity: number;
  unit: string;
}

export default function TransfersPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WarehouseTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WarehouseTransfer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Dropdown data
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  // Available stock in source warehouse
  const [availableStocks, setAvailableStocks] = useState<AvailableStock[]>([]);
  // Map of sampleId -> availableQuantity for quick lookup
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  const loadWarehouses = async () => {
    try {
      const res = await warehousesService.getAll({ page: 1, limit: 500 });
      setWarehouses(res.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadLocations = async (warehouseId?: string) => {
    if (!warehouseId) {
      setLocationOptions([]);
      return;
    }
    try {
      const tree = await storageLocationsService.getTree(warehouseId);
      setLocationOptions(treeToCascaderOptions(tree || []));
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadAvailableStock = useCallback(async (warehouseId?: string) => {
    if (!warehouseId) {
      setAvailableStocks([]);
      setStockMap({});
      return;
    }
    try {
      const stocks = await inventoryService.getAvailableStockByWarehouse(warehouseId);
      setAvailableStocks(stocks || []);
      const map: Record<string, number> = {};
      for (const s of stocks || []) {
        map[s.sampleId] = s.availableQuantity;
      }
      setStockMap(map);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await transfersService.getAll({
        page,
        limit,
        search,
        status: statusFilter,
      });
      setData(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (error: any) {
      console.error('Fetch transfers error:', error);
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadWarehouses();
  }, [page, limit, search, statusFilter]);

  const handleFromWarehouseChange = (warehouseId: string) => {
    loadAvailableStock(warehouseId);
    // Reset items when source warehouse changes
    form.setFieldsValue({ items: [{}] });
  };

  const handleToWarehouseChange = (warehouseId: string) => {
    loadLocations(warehouseId);
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setLocationOptions([]);
    setAvailableStocks([]);
    setStockMap({});
    setIsModalOpen(true);
  };

  const handleEdit = async (record: WarehouseTransfer) => {
    setSelectedRecord(record);

    // Load locations for destination warehouse and stock for source warehouse
    const toTree = await storageLocationsService.getTree(record.toWarehouseId).catch(() => []);
    setLocationOptions(treeToCascaderOptions(toTree || []));
    await loadAvailableStock(record.fromWarehouseId);

    form.setFieldsValue({
      fromWarehouseId: record.fromWarehouseId,
      toWarehouseId: record.toWarehouseId,
      transferDate: record.transferDate ? dayjs(record.transferDate) : undefined,
      notes: record.notes,
      items: record.items?.map((i: any) => ({
        sampleId: i.sampleId,
        toLocationPath: i.toLocationId ? findPathInTree(toTree || [], i.toLocationId) : undefined,
        quantity: i.quantity,
        unit: i.sample ? getSampleUnit(i.sample) : (i.unit || 'gram'),
      })) || [{}],
    });
    setIsModalOpen(true);
  };

  const handleView = async (record: WarehouseTransfer) => {
    try {
      const detail = await transfersService.getById(record.id);
      setSelectedRecord(detail);
      setIsDetailOpen(true);
    } catch (error) {
      message.error('Không thể tải chi tiết');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phiếu chuyển kho này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await transfersService.delete(id);
          message.success('Đã xóa thành công');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Frontend validation: check quantities
      for (const item of values.items || []) {
        if (!item?.sampleId) continue;
        const available = stockMap[item.sampleId] ?? 0;
        if (item.quantity > available) {
          const stock = availableStocks.find(s => s.sampleId === item.sampleId);
          const name = stock ? (stock.sampleCode || stock.varietyName) : item.sampleId;
          message.error(`Mẫu "${name}" chỉ còn tồn kho ${available}, không thể chuyển ${item.quantity}`);
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        transferDate: values.transferDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        items: (values.items || [])
          .filter((item: any) => item?.sampleId && item?.quantity > 0)
          .map((item: any) => ({
            sampleId: item.sampleId,
            toLocationId: Array.isArray(item.toLocationPath)
              ? item.toLocationPath[item.toLocationPath.length - 1]
              : item.toLocationPath || null,
            quantity: item.quantity,
            unit: item.unit || 'g',
          })),
      };

      if (payload.items.length === 0) {
        message.error('Vui lòng thêm ít nhất một mẫu');
        setSubmitting(false);
        return;
      }

      if (selectedRecord) {
        await transfersService.update(selectedRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await transfersService.create(payload);
        message.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Submit error:', error);
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận gửi hàng',
      content: 'Bạn có chắc chắn muốn gửi hàng? Tồn kho sẽ bị trừ từ kho nguồn.',
      okText: 'Gửi hàng',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await transfersService.send(id);
          message.success('Đã gửi hàng thành công');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể gửi hàng');
        }
      },
    });
  };

  const handleReceive = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận nhận hàng',
      content: 'Bạn có chắc chắn đã nhận được hàng? Tồn kho sẽ được cộng vào kho đích.',
      okText: 'Nhận hàng',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await transfersService.receive(id);
          message.success('Đã nhận hàng thành công');
          fetchData();
          setIsDetailOpen(false);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể nhận hàng');
        }
      },
    });
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy',
      content: 'Bạn có chắc chắn muốn hủy phiếu chuyển kho này?',
      okText: 'Hủy phiếu',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await transfersService.cancel(id);
          message.success('Đã hủy phiếu chuyển kho');
          fetchData();
          setIsDetailOpen(false);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể hủy');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Số phiếu',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      width: 140,
    },
    {
      title: 'Kho nguồn',
      dataIndex: ['fromWarehouse', 'name'],
      key: 'fromWarehouse',
    },
    {
      title: 'Kho đích',
      dataIndex: ['toWarehouse', 'name'],
      key: 'toWarehouse',
    },
    {
      title: 'Ngày chuyển',
      dataIndex: 'transferDate',
      key: 'transferDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Số lượng mẫu',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: any, record: WarehouseTransfer) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <>
              <Tooltip title="Gửi hàng">
                <Button type="text" size="small" icon={<SendOutlined />} onClick={() => handleSend(record.id)} />
              </Tooltip>
              <Tooltip title="Sửa">
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
          {record.status === 'IN_TRANSIT' && (
            <Tooltip title="Nhận hàng">
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => handleReceive(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý chuyển kho</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo phiếu chuyển kho
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo số phiếu..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={selectedRecord ? 'Cập nhật phiếu chuyển kho' : 'Tạo phiếu chuyển kho'}
        open={isModalOpen}
        onCancel={() => {
          form.resetFields();
          setLocationOptions([]);
          setAvailableStocks([]);
          setStockMap({});
          setIsModalOpen(false);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={1000}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ items: [{}] }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="fromWarehouseId" label="Kho nguồn" style={{ flex: 1 }} rules={[{ required: true, message: 'Vui lòng chọn kho nguồn' }]}>
              <Select
                placeholder="Chọn kho nguồn"
                showSearch
                optionFilterProp="children"
                onChange={handleFromWarehouseChange}
              >
                {warehouses.map(w => (
                  <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="toWarehouseId" label="Kho đích" style={{ flex: 1 }} rules={[{ required: true, message: 'Vui lòng chọn kho đích' }]}>
              <Select
                placeholder="Chọn kho đích"
                showSearch
                optionFilterProp="children"
                onChange={handleToWarehouseChange}
              >
                {warehouses.map(w => (
                  <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="transferDate" label="Ngày chuyển" rules={[{ required: true, message: 'Vui lòng chọn ngày chuyển' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Divider>Danh sách mẫu chuyển</Divider>

          {availableStocks.length > 0 && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Kho nguồn có ${availableStocks.length} mẫu có tồn kho. Chọn mẫu từ danh sách bên dưới.`}
            />
          )}

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {/* Header row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr minmax(180px, 1.5fr) auto',
                    gap: 8,
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#666',
                  }}
                >
                  <div>Mẫu giống *</div>
                  <div>Vị trí (kho đích)</div>
                  <div>Số lượng *</div>
                  <div></div>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item
                    key={key}
                    noStyle
                    shouldUpdate={(prev, curr) =>
                      prev?.items?.[name]?.sampleId !== curr?.items?.[name]?.sampleId
                    }
                  >
                    {() => {
                      const currentSampleId = form.getFieldValue(['items', name, 'sampleId']);
                      const available = currentSampleId ? (stockMap[currentSampleId] ?? 0) : null;
                      const currentStock = currentSampleId ? availableStocks.find(s => s.sampleId === currentSampleId) : null;
                      const sampleUnit = currentStock ? getSampleUnit({ quantityUnit: currentStock.unit }) : null;
                      const unitLabel = sampleUnit ? (unitLabelMap[sampleUnit] || sampleUnit) : '';

                      return (
                        <div style={{ marginBottom: 8 }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 2fr minmax(180px, 1.5fr) auto',
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'sampleId']}
                              rules={[{ required: true, message: 'Chọn mẫu' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Chọn mẫu"
                                showSearch
                                optionFilterProp="children"
                                onChange={(sampleId: string) => {
                                  form.setFieldValue(['items', name, 'quantity'], undefined);
                                  const stock = availableStocks.find(s => s.sampleId === sampleId);
                                  if (stock) {
                                    const normalizedUnit = getSampleUnit({ quantityUnit: stock.unit });
                                    form.setFieldValue(['items', name, 'unit'], normalizedUnit);
                                  }
                                }}
                              >
                                {availableStocks.length > 0
                                  ? availableStocks.map(s => (
                                      <Select.Option key={s.sampleId} value={s.sampleId}>
                                        {s.sampleCode} - {s.varietyName || s.localName}
                                      </Select.Option>
                                    ))
                                  : <Select.Option disabled value="">Chọn kho nguồn trước</Select.Option>
                                }
                              </Select>
                            </Form.Item>

                            <Form.Item {...restField} name={[name, 'toLocationPath']} style={{ marginBottom: 0 }}>
                              <Cascader
                                options={locationOptions}
                                placeholder="Chọn vị trí lưu trữ"
                                changeOnSelect
                                expandTrigger="hover"
                                showSearch={{
                                  filter: (input: string, path: any[]) =>
                                    path.some(opt => (opt.label as string).toLowerCase().includes(input.toLowerCase())),
                                }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[
                                { required: true, message: 'Nhập SL' },
                                {
                                  validator: (_, value) => {
                                    const sampleId = form.getFieldValue(['items', name, 'sampleId']);
                                    if (!sampleId || !value) return Promise.resolve();
                                    const maxQty = stockMap[sampleId] ?? 0;
                                    if (value > maxQty) {
                                      return Promise.reject(`Tối đa ${maxQty} ${unitLabel}`);
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="Số lượng"
                                min={0.01}
                                style={{ width: '100%' }}
                                addonAfter={unitLabel || 'ĐV'}
                              />
                            </Form.Item>

                            <Form.Item {...restField} name={[name, 'unit']} initialValue="gram" style={{ marginBottom: 0 }} hidden>
                              <Select>
                                <Select.Option value="gram">Gram</Select.Option>
                                <Select.Option value="kg">Kg</Select.Option>
                                <Select.Option value="hat">Hạt</Select.Option>
                              </Select>
                            </Form.Item>

                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                          {available !== null && available >= 0 && (
                            <div style={{ fontSize: 12, color: '#1890ff', paddingLeft: 4 }}>
                              Tồn kho: <strong>{available}</strong> {unitLabel}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </Form.Item>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 16 }}
                >
                  Thêm mẫu
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Chi tiết phiếu chuyển kho"
        placement="right"
        width={600}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        extra={
          <Space>
            {selectedRecord?.status === 'IN_TRANSIT' && (
              <Button type="primary" icon={<CheckOutlined />} onClick={() => handleReceive(selectedRecord.id)}>
                Nhận hàng
              </Button>
            )}
            {selectedRecord?.status !== 'COMPLETED' && selectedRecord?.status !== 'CANCELLED' && (
              <Button danger icon={<CloseOutlined />} onClick={() => handleCancel(selectedRecord!.id)}>
                Hủy
              </Button>
            )}
          </Space>
        }
      >
        {selectedRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Số phiếu">{selectedRecord.transferNumber}</Descriptions.Item>
              <Descriptions.Item label="Kho nguồn">{selectedRecord.fromWarehouse?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Kho đích">{selectedRecord.toWarehouse?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày chuyển">
                {selectedRecord.transferDate ? dayjs(selectedRecord.transferDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedRecord.status]}>{statusLabels[selectedRecord.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedRecord.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider>Danh sách mẫu</Divider>
            <Table
              dataSource={selectedRecord.items || []}
              columns={[
                {
                  title: 'Mã mẫu',
                  dataIndex: ['sample', 'code'],
                  key: 'code',
                },
                {
                  title: 'Tên giống',
                  key: 'varietyName',
                  render: (_: any, record: any) => record.sample?.varietyName || record.sample?.localName || '-',
                },
                {
                  title: 'Vị trí (kho đích)',
                  key: 'toLocation',
                  render: (_: any, record: any) => record.toLocation?.name || '-',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (qty: number, record: any) => `${qty} ${unitLabelMap[record.unit] || record.unit || 'gram'}`,
                },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
