'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Upload,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { seedVarietiesService, seedCategoriesService } from '@/services/catalog.service';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { TextArea } = Input;

export default function VarietiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategories, setActiveCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 100, // Max allowed by backend
      };
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      const result = await seedVarietiesService.getAll(params);
      // Handle both paginated and array response
      const items = Array.isArray(result) ? result : (result.data || result.items || []);
      setData(items);
    } catch (error) {
      message.error('Không thể tải danh sách giống');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await seedCategoriesService.getAll();
      setCategories(result);
      // Chỉ lấy các nhóm đang hoạt động cho form
      setActiveCategories(result.filter((c: any) => c.isActive));
    } catch (error) {
      // Silently fail - categories list is non-critical
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        // Khi edit, không gửi code
        const { code, ...updateData } = values;
        await seedVarietiesService.update(editingItem.id, updateData);
        message.success('Cập nhật thành công');
      } else {
        await seedVarietiesService.create(values);
        message.success('Thêm mới thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await seedVarietiesService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Filter data
  const filteredData = data.filter((item) => {
    const matchSearch =
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus =
      selectedStatus === undefined ||
      (selectedStatus === 'active' && item.isActive) ||
      (selectedStatus === 'inactive' && !item.isActive);
    return matchSearch && matchStatus;
  });

  // Export Excel
  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      'Mã giống': item.code,
      'Tên giống': item.name,
      'Tên khoa học': item.scientificName || '',
      'Tên địa phương': item.localName || '',
      'Nhóm giống': item.category?.name || '',
      'Xuất xứ': item.origin || '',
      'Thời gian sinh trưởng': item.growthDuration || '',
      'Đặc điểm': item.characteristics || '',
      'Năng suất tiềm năng': item.yieldPotential || '',
      'Khả năng chống bệnh': item.diseaseResistance || '',
      'Trạng thái': item.isActive ? 'Hoạt động' : 'Ngừng',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách giống');
    XLSX.writeFile(wb, `danh-sach-giong-${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Xuất Excel thành công');
  };

  // Import Excel
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData as any[]) {
          try {
            // Tìm category theo tên
            const category = categories.find(
              (c) => c.name?.toLowerCase() === row['Nhóm giống']?.toLowerCase()
            );

            if (!category) {
              errorCount++;
              continue;
            }

            const varietyData = {
              code: row['Mã giống'],
              name: row['Tên giống'],
              scientificName: row['Tên khoa học'] || null,
              localName: row['Tên địa phương'] || null,
              categoryId: category.id,
              origin: row['Xuất xứ'] || null,
              growthDuration: row['Thời gian sinh trưởng'] || null,
              characteristics: row['Đặc điểm'] || null,
              yieldPotential: row['Năng suất tiềm năng'] || null,
              diseaseResistance: row['Khả năng chống bệnh'] || null,
              isActive: row['Trạng thái'] !== 'Ngừng',
            };

            await seedVarietiesService.create(varietyData);
            successCount++;
          } catch {
            errorCount++;
          }
        }

        message.success(`Import hoàn tất: ${successCount} thành công, ${errorCount} lỗi`);
        fetchData();
      } catch {
        message.error('Lỗi khi đọc file Excel');
      }
    };
    reader.readAsBinaryString(file);
    return false; // Prevent upload
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mã giống': 'VD_001',
        'Tên giống': 'Giống mẫu',
        'Tên khoa học': 'Oryza sativa',
        'Tên địa phương': 'Lúa địa phương',
        'Nhóm giống': 'LÚA KHÔ', // Tên nhóm giống
        'Xuất xứ': 'Việt Nam',
        'Thời gian sinh trưởng': '90-100 ngày',
        'Đặc điểm': 'Hạt gạo dài, thơm',
        'Năng suất tiềm năng': '6-8 tấn/ha',
        'Khả năng chống bệnh': 'Kháng đạo ôn',
        'Trạng thái': 'Hoạt động',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template-import-giong.xlsx');
    message.success('Tải template thành công');
  };

  const columns = [
    { title: 'Mã giống', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên giống', dataIndex: 'name', key: 'name' },
    { title: 'Tên khoa học', dataIndex: 'scientificName', key: 'scientificName' },
    { title: 'Xuất xứ', dataIndex: 'origin', key: 'origin' },
    {
      title: 'Nhóm giống',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => cat?.name || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => (
        <Tag color={val ? 'green' : 'red'}>{val ? 'Hoạt động' : 'Ngừng'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue({
                ...record,
                categoryId: record.category?.id || record.categoryId,
              });
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh mục giống</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Tải template
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>Import Excel</Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Thêm giống
          </Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo nhóm"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map((c) => ({
              label: c.name + (c.isActive ? '' : ' (Ngừng)'),
              value: c.id,
            }))}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { label: 'Hoạt động', value: 'active' },
              { label: 'Ngừng hoạt động', value: 'inactive' },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa giống' : 'Thêm giống mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label="Mã giống"
              rules={[{ required: true, message: 'Vui lòng nhập mã giống' }]}
            >
              <Input
                placeholder="VD: MG_00001"
                disabled={!!editingItem} // Không cho sửa khi edit
              />
            </Form.Item>
            <Form.Item
              name="categoryId"
              label="Nhóm giống"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
            >
              <Select
                placeholder="Chọn nhóm"
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={activeCategories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="name"
            label="Tên giống"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên giống cây" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="scientificName" label="Tên khoa học">
              <Input placeholder="Tên khoa học" />
            </Form.Item>
            <Form.Item name="localName" label="Tên địa phương">
              <Input placeholder="Tên địa phương" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="origin" label="Xuất xứ">
              <Input placeholder="Xuất xứ" />
            </Form.Item>
            <Form.Item name="growthDuration" label="Thời gian sinh trưởng">
              <Input placeholder="VD: 90-100 ngày" />
            </Form.Item>
          </div>
          <Form.Item name="characteristics" label="Đặc điểm">
            <TextArea rows={2} placeholder="Đặc điểm của giống" />
          </Form.Item>
          <Form.Item name="yieldPotential" label="Năng suất tiềm năng">
            <Input placeholder="VD: 6-8 tấn/ha" />
          </Form.Item>
          <Form.Item name="diseaseResistance" label="Khả năng chống bệnh">
            <TextArea rows={2} placeholder="Khả năng kháng bệnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
