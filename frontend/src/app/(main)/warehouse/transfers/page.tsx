'use client';

import { useState, useEffect } from 'react';
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
  SwapOutlined,
} from '@ant-design/icons';
import { transfersService, WarehouseTransfer } from '@/services/warehouse.service';
import { warehousesService } from '@/services/catalog.service';
import { samplesService } from '@/services/samples.service';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

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
  const [form] = Form.useForm();

  // Dropdown data
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([{ sampleId: '', quantity: 0, unit: 'g' }]);

  const loadDropdownData = async () => {
    try {
      const [warehousesRes, samplesRes] = await Promise.all([
        warehousesService.getAll({ page: 1, limit: 500 }),
        samplesService.getAll({ page: 1, limit: 500 }),
      ]);
      setWarehouses(warehousesRes.data || []);
      setSamples(samplesRes.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

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
    loadDropdownData();
  }, [page, limit, search, statusFilter]);

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setItems([{ sampleId: '', quantity: 0, unit: 'g' }]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: WarehouseTransfer) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      fromWarehouseId: record.fromWarehouseId,
      toWarehouseId: record.toWarehouseId,
      transferDate: record.transferDate ? dayjs(record.transferDate) : undefined,
      notes: record.notes,
    });
    setItems(record.items?.length ? record.items.map(i => ({
      sampleId: i.sampleId,
      quantity: i.quantity,
      unit: i.unit || 'g',
    })) : [{ sampleId: '', quantity: 0, unit: 'g' }]);
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
    try {
      const validItems = items.filter(i => i.sampleId && i.quantity > 0);
      if (validItems.length === 0) {
        message.error('Vui lòng thêm ít nhất một mẫu');
        return;
      }

      const payload = {
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        transferDate: values.transferDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        items: validItems,
      };

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

  const addItem = () => {
    setItems([...items, { sampleId: '', quantity: 0, unit: 'g' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
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
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="fromWarehouseId" label="Kho nguồn" style={{ flex: 1 }} rules={[{ required: true, message: 'Vui lòng chọn kho nguồn' }]}>
              <Select
                placeholder="Chọn kho nguồn"
                showSearch
                optionFilterProp="children"
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
              >
                {warehouses.map(w => (
                  <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="transferDate" label="Ngày chuyển" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Divider>Danh sách mẫu chuyển</Divider>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <Select
                placeholder="Chọn mẫu"
                style={{ flex: 2 }}
                showSearch
                optionFilterProp="children"
                value={item.sampleId || undefined}
                onChange={(value) => updateItem(index, 'sampleId', value)}
              >
                {samples.map(s => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.code} - {s.varietyName || s.localName}
                  </Select.Option>
                ))}
              </Select>
              <InputNumber
                placeholder="Số lượng"
                style={{ flex: 1 }}
                min={0}
                value={item.quantity}
                onChange={(value) => updateItem(index, 'quantity', value)}
              />
              <Select
                style={{ width: 100 }}
                value={item.unit}
                onChange={(value) => updateItem(index, 'unit', value)}
              >
                <Select.Option value="g">Gram</Select.Option>
                <Select.Option value="kg">Kg</Select.Option>
                <Select.Option value="hat">Hạt</Select.Option>
              </Select>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(index)} />
            </div>
          ))}
          <Button type="dashed" onClick={addItem} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            Thêm mẫu
          </Button>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
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
                  dataIndex: ['sample', 'varietyName'],
                  key: 'varietyName',
                  render: (_, record: any) => record.sample?.varietyName || record.sample?.localName || '-',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (qty: number, record: any) => `${qty} ${record.unit || 'g'}`,
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
