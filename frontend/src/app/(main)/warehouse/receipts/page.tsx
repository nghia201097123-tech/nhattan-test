'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Tooltip,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
  Drawer,
  Descriptions,
  Popconfirm,
  Cascader,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { receiptsService } from '@/services/warehouse.service';
import { warehousesService, storageLocationsService } from '@/services/catalog.service';
import { samplesService } from '@/services/samples.service';
import dayjs from 'dayjs';

const { Title } = Typography;

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
  CONFIRMED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
};

const sourceTypeLabels: Record<string, string> = {
  COLLECTION: 'Thu thập',
  PROPAGATION: 'Nhân giống',
  TRANSFER: 'Chuyển kho',
  OTHER: 'Khác',
};

export default function WarehouseReceiptsPage() {
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locationTree, setLocationTree] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Convert tree data to Cascader options format
  const treeToCascaderOptions = (tree: any[]): any[] => {
    return tree.map(node => ({
      value: node.id,
      label: node.name,
      children: node.children?.length > 0 ? treeToCascaderOptions(node.children) : undefined,
    }));
  };

  // Find full path (array of IDs) in tree for a given locationId
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

  const loadWarehouses = async () => {
    try {
      const res = await warehousesService.getAll({ page: 1, limit: 500 });
      setWarehouses(res.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadSamples = async () => {
    try {
      const res = await samplesService.getAll({ page: 1, limit: 500 });
      setSamples(res.data || []);
    } catch (error) {
      console.error('Error loading samples:', error);
    }
  };

  const loadLocations = async (warehouseId?: string) => {
    if (!warehouseId) {
      setLocationTree([]);
      setLocationOptions([]);
      return;
    }
    try {
      const tree = await storageLocationsService.getTree(warehouseId);
      setLocationTree(tree || []);
      setLocationOptions(treeToCascaderOptions(tree || []));
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const result = await receiptsService.getAll({ page, limit, search });
      setReceipts(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (error: any) {
      console.error('Fetch receipts error:', error);
      message.error('Không thể tải danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadSamples();
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [page, limit, search]);

  const handleCreate = async () => {
    setEditingId(null);
    form.resetFields();
    try {
      const { code } = await receiptsService.generateCode();
      form.setFieldsValue({
        receiptNumber: code,
        receiptDate: dayjs(),
        items: [{}],
      });
    } catch (error) {
      form.setFieldsValue({
        receiptDate: dayjs(),
        items: [{}],
      });
    }
    setIsModalOpen(true);
  };

  const handleEdit = async (record: any) => {
    setEditingId(record.id);
    await loadLocations(record.warehouseId);
    // Need to wait for locationTree to be available to reconstruct cascade paths
    const tree = await storageLocationsService.getTree(record.warehouseId);
    form.setFieldsValue({
      ...record,
      receiptDate: dayjs(record.receiptDate),
      items: record.items?.map((item: any) => {
        const sample = samples.find((s) => s.id === item.sampleId);
        return {
          sampleId: item.sampleId,
          locationPath: item.locationId ? findPathInTree(tree || [], item.locationId) : undefined,
          quantity: item.quantity,
          unit: sample ? getSampleUnit(sample) : (item.unit || 'gram'),
        };
      }) || [{}],
    });
    setIsModalOpen(true);
  };

  const handleView = async (record: any) => {
    try {
      const detail = await receiptsService.getById(record.id);
      setSelectedReceipt(detail);
      setIsDetailOpen(true);
    } catch (error) {
      message.error('Không thể tải chi tiết phiếu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await receiptsService.delete(id);
      message.success('Đã xóa phiếu nhập');
      fetchReceipts();
    } catch (error) {
      message.error('Không thể xóa phiếu');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        receiptDate: values.receiptDate?.format('YYYY-MM-DD'),
        items: values.items?.map((item: any) => ({
          sampleId: item.sampleId,
          // Extract the last ID from cascader path array as the actual locationId
          locationId: Array.isArray(item.locationPath)
            ? item.locationPath[item.locationPath.length - 1]
            : item.locationPath || null,
          quantity: item.quantity,
          unit: item.unit,
        })),
      };

      if (editingId) {
        await receiptsService.update(editingId, payload);
        message.success('Cập nhật phiếu nhập thành công');
      } else {
        await receiptsService.create(payload);
        message.success('Tạo phiếu nhập thành công');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchReceipts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Số phiếu',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 150,
    },
    {
      title: 'Kho',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Nguồn',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      render: (type: string) => sourceTypeLabels[type] || type || '-',
    },
    {
      title: 'Số mẫu',
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
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: ['creator', 'fullName'],
      key: 'creator',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <>
              <Tooltip title="Sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Popconfirm
                title="Xác nhận xóa?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Tooltip title="Xóa">
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Phiếu nhập kho</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo phiếu nhập
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Tìm kiếm theo số phiếu..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Table
          dataSource={receipts}
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
        title={editingId ? 'Sửa phiếu nhập kho' : 'Tạo phiếu nhập kho'}
        open={isModalOpen}
        onCancel={() => {
          form.resetFields();
          setLocationTree([]);
          setLocationOptions([]);
          setIsModalOpen(false);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="receiptNumber"
              label="Số phiếu"
              rules={[{ required: true, message: 'Vui lòng nhập số phiếu' }]}
            >
              <Input disabled={!!editingId} />
            </Form.Item>

            <Form.Item
              name="warehouseId"
              label="Kho nhập"
              rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
            >
              <Select
                placeholder="Chọn kho"
                showSearch
                optionFilterProp="children"
                onChange={(val) => loadLocations(val)}
              >
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="receiptDate"
              label="Ngày nhập"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="sourceType" label="Nguồn nhập">
              <Select placeholder="Chọn nguồn" allowClear>
                <Select.Option value="COLLECTION">Thu thập</Select.Option>
                <Select.Option value="PROPAGATION">Nhân giống</Select.Option>
                <Select.Option value="TRANSFER">Chuyển kho</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="sourceReference" label="Tham chiếu nguồn">
              <Input placeholder="Số phiếu tham chiếu" />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={1} />
            </Form.Item>
          </div>

          <Title level={5}>Danh sách mẫu nhập</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
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
                      const currentSample = samples.find((s) => s.id === currentSampleId);
                      const sampleUnit = currentSample ? getSampleUnit(currentSample) : null;
                      const maxQuantity = currentSample?.initialQuantity ?? undefined;
                      const unitLabel = sampleUnit ? (unitLabelMap[sampleUnit] || sampleUnit) : '';

                      return (
                        <div style={{ marginBottom: 8 }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 2fr 1fr auto',
                              gap: 8,
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
                                  const selected = samples.find((s) => s.id === sampleId);
                                  if (selected) {
                                    const unit = getSampleUnit(selected);
                                    form.setFieldValue(['items', name, 'unit'], unit);
                                    form.setFieldValue(['items', name, 'quantity'], undefined);
                                  }
                                }}
                              >
                                {samples.map((s) => (
                                  <Select.Option key={s.id} value={s.id}>
                                    {s.code} - {s.varietyName || s.localName} ({s.initialQuantity || 0} {unitLabelMap[getSampleUnit(s)] || s.quantityUnit})
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item {...restField} name={[name, 'locationPath']} style={{ marginBottom: 0 }}>
                              <Cascader
                                options={locationOptions}
                                placeholder="Chọn vị trí lưu trữ"
                                changeOnSelect
                                expandTrigger="hover"
                                showSearch={{
                                  filter: (inputValue: string, path: any[]) =>
                                    path.some((option) =>
                                      (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
                                    ),
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
                                    if (!value || maxQuantity == null) return Promise.resolve();
                                    if (value > maxQuantity) {
                                      return Promise.reject(`Tối đa ${maxQuantity} ${unitLabel}`);
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="Số lượng"
                                min={0}
                                max={maxQuantity}
                                style={{ width: '100%' }}
                                addonAfter={unitLabel || 'ĐV'}
                              />
                            </Form.Item>

                            <Form.Item {...restField} name={[name, 'unit']} initialValue="gram" hidden>
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
                          {currentSample && maxQuantity != null && (
                            <div style={{ fontSize: 12, color: '#1890ff', marginTop: 2, paddingLeft: 4 }}>
                              SL thu thập: <strong>{maxQuantity}</strong> {unitLabel}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </Form.Item>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm mẫu
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer
        title="Chi tiết phiếu nhập kho"
        placement="right"
        width={700}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedReceipt && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Số phiếu">{selectedReceipt.receiptNumber}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedReceipt.status]}>
                  {statusLabels[selectedReceipt.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kho">{selectedReceipt.warehouse?.name}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập">
                {dayjs(selectedReceipt.receiptDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Nguồn">
                {sourceTypeLabels[selectedReceipt.sourceType] || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tham chiếu">
                {selectedReceipt.sourceReference || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {selectedReceipt.creator?.fullName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedReceipt.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedReceipt.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Danh sách mẫu ({selectedReceipt.items?.length || 0})</Title>
            <Table
              dataSource={selectedReceipt.items || []}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Mã mẫu',
                  dataIndex: ['sample', 'code'],
                  key: 'code',
                },
                {
                  title: 'Tên giống',
                  key: 'name',
                  render: (_: any, record: any) =>
                    record.sample?.varietyName || record.sample?.localName || '-',
                },
                {
                  title: 'Vị trí',
                  dataIndex: ['location', 'name'],
                  key: 'location',
                  render: (name: string) => name || '-',
                },
                {
                  title: 'Số lượng',
                  key: 'quantity',
                  align: 'right' as const,
                  render: (_: any, record: any) => `${record.quantity} ${unitLabelMap[record.unit] || record.unit || 'gram'}`,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
