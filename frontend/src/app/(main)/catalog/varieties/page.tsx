'use client';

import { useState, useEffect } from 'react';
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
  Image,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { seedVarietiesService, seedCategoriesService } from '@/services/catalog.service';
import { uploadService } from '@/services/upload.service';
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      // Handle paginated response
      setData(result.data || []);
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

  // Handle image upload
  const handleImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file as File);
      setImageUrl(result.url);
      form.setFieldValue('imageUrl', result.url);
      onSuccess?.(result);
      message.success('Tải ảnh thành công');
    } catch (error: any) {
      onError?.(error);
      message.error(error.response?.data?.message || 'Lỗi khi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    form.setFieldValue('imageUrl', null);
  };

  // Filter data - search all fields
  const filteredData = data.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchSearch =
      !searchText ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower) ||
      item.scientificName?.toLowerCase().includes(searchLower) ||
      item.localName?.toLowerCase().includes(searchLower) ||
      item.origin?.toLowerCase().includes(searchLower) ||
      item.category?.name?.toLowerCase().includes(searchLower) ||
      item.characteristics?.toLowerCase().includes(searchLower) ||
      item.growthDuration?.toLowerCase().includes(searchLower) ||
      item.yieldPotential?.toLowerCase().includes(searchLower) ||
      item.diseaseResistance?.toLowerCase().includes(searchLower);
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
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url: string) =>
        url ? (
          <Image
            src={uploadService.getImageUrl(url) || ''}
            alt="Ảnh giống"
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,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"
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 12,
            }}
          >
            N/A
          </div>
        ),
    },
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
              setImageUrl(record.imageUrl || null);
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
              setImageUrl(null);
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
          setImageUrl(null);
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

          <Form.Item name="imageUrl" label="Ảnh giống" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh nhận dạng">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {imageUrl && (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={uploadService.getImageUrl(imageUrl) || ''}
                    alt="Ảnh giống"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              )}
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={handleImageUpload}
                disabled={uploading}
              >
                <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
                  {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                </Button>
              </Upload>
            </div>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              Hỗ trợ: JPG, PNG, GIF, WebP. Tối đa 5MB.
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
