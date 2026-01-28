'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ImportOutlined,
  ExportOutlined,
  SwapOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { inventoryService } from '@/services/warehouse.service';
import { warehousesService, categoriesService } from '@/services/catalog.service';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function StatisticsPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [warehouseId, setWarehouseId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs(),
  ]);
  const [chartGroupBy, setChartGroupBy] = useState<'day' | 'week' | 'month'>('month');

  const loadDropdownData = async () => {
    try {
      const [warehousesRes, categoriesRes] = await Promise.all([
        warehousesService.getAll({ page: 1, limit: 500 }),
        categoriesService.getAll({ page: 1, limit: 500 }),
      ]);
      setWarehouses(warehousesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        warehouseId,
        categoryId,
        fromDate: dateRange[0].format('YYYY-MM-DD'),
        toDate: dateRange[1].format('YYYY-MM-DD'),
      };

      const [reportRes, summaryRes, chartRes] = await Promise.all([
        inventoryService.getReport(params),
        inventoryService.getSummary(params),
        inventoryService.getChart({ ...params, groupBy: chartGroupBy }),
      ]);

      setReportData(reportRes || []);
      setSummary(summaryRes || {});
      setChartData(chartRes || []);
    } catch (error: any) {
      console.error('Fetch statistics error:', error);
      message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [warehouseId, categoryId, dateRange, chartGroupBy]);

  const handleExportExcel = () => {
    // Tạo CSV từ dữ liệu
    const headers = ['Mã mẫu', 'Tên giống', 'Loại', 'Kho', 'Tổng nhập', 'Tổng xuất', 'Điều chỉnh', 'Biến động'];
    const rows = reportData.map(r => [
      r.sampleCode,
      r.varietyName,
      r.categoryName,
      r.warehouseName,
      r.totalIn,
      r.totalOut,
      r.adjustment,
      r.netChange,
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-nhap-xuat-ton_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();

    message.success('Đã xuất file CSV');
  };

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 140,
    },
    {
      title: 'Tên giống',
      dataIndex: 'varietyName',
      key: 'varietyName',
    },
    {
      title: 'Loại',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Tổng nhập',
      dataIndex: 'totalIn',
      key: 'totalIn',
      width: 100,
      align: 'right' as const,
      render: (val: number) => <span style={{ color: '#52c41a' }}>+{val}</span>,
    },
    {
      title: 'Tổng xuất',
      dataIndex: 'totalOut',
      key: 'totalOut',
      width: 100,
      align: 'right' as const,
      render: (val: number) => <span style={{ color: '#ff4d4f' }}>-{val}</span>,
    },
    {
      title: 'Điều chỉnh',
      dataIndex: 'adjustment',
      key: 'adjustment',
      width: 100,
      align: 'right' as const,
      render: (val: number) => val !== 0 ? <span style={{ color: '#faad14' }}>{val > 0 ? '+' : ''}{val}</span> : '-',
    },
    {
      title: 'Biến động',
      dataIndex: 'netChange',
      key: 'netChange',
      width: 100,
      align: 'right' as const,
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {val >= 0 ? '+' : ''}{val}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Thống kê nhập - xuất - tồn</Title>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
          Xuất Excel
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <div>
            <span style={{ marginRight: 8 }}>Kỳ báo cáo:</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD/MM/YYYY"
            />
          </div>
          <div>
            <span style={{ marginRight: 8 }}>Kho:</span>
            <Select
              placeholder="Tất cả kho"
              style={{ width: 200 }}
              allowClear
              value={warehouseId}
              onChange={setWarehouseId}
            >
              {warehouses.map(w => (
                <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <span style={{ marginRight: 8 }}>Loại giống:</span>
            <Select
              placeholder="Tất cả loại"
              style={{ width: 200 }}
              allowClear
              value={categoryId}
              onChange={setCategoryId}
            >
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nhập"
              value={summary.totalImport || 0}
              prefix={<ImportOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng xuất"
              value={summary.totalExport || 0}
              prefix={<ExportOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số phiếu chuyển"
              value={summary.transferCount || 0}
              prefix={<SwapOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số mẫu có biến động"
              value={summary.totalSamples || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Card title="Biểu đồ biến động" style={{ marginBottom: 16 }} extra={
        <Select value={chartGroupBy} onChange={setChartGroupBy} style={{ width: 120 }}>
          <Select.Option value="day">Theo ngày</Select.Option>
          <Select.Option value="week">Theo tuần</Select.Option>
          <Select.Option value="month">Theo tháng</Select.Option>
        </Select>
      }>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalIn" name="Nhập" fill="#52c41a" />
            <Bar dataKey="totalOut" name="Xuất" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Bảng dữ liệu chi tiết */}
      <Card title="Chi tiết nhập - xuất theo mẫu">
        <Table
          dataSource={reportData}
          columns={columns}
          rowKey="sampleId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} mẫu`,
          }}
          summary={(pageData) => {
            const totalIn = pageData.reduce((sum, r) => sum + (r.totalIn || 0), 0);
            const totalOut = pageData.reduce((sum, r) => sum + (r.totalOut || 0), 0);
            const totalAdj = pageData.reduce((sum, r) => sum + (r.adjustment || 0), 0);
            const totalNet = pageData.reduce((sum, r) => sum + (r.netChange || 0), 0);

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}><strong>Tổng cộng</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ color: '#52c41a' }}>+{totalIn}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong style={{ color: '#ff4d4f' }}>-{totalOut}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong style={{ color: '#faad14' }}>{totalAdj}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <strong style={{ color: totalNet >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {totalNet >= 0 ? '+' : ''}{totalNet}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
}
