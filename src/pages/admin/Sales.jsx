import React, { useState, useEffect } from 'react';
import { Table, Input, Card, theme, Select, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';

const { Search } = Input;
const { Option } = Select;

const Sales = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSales();
    // Fetch unique categories
    const uniqueCategories = [...new Set(salesData.map(sale => sale.category))];
    setCategories(uniqueCategories);
  }, [pagination.current, pagination.pageSize, searchText, selectedCategory]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/sale/sales`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          name: searchText,
          category: selectedCategory
        }
      });
      if (response.data.status) {
        setSalesData(response.data.sales);
        // Update total count if available in response
        if (response.data.total) {
          setPagination(prev => ({
            ...prev,
            total: response.data.total
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, current: 1 })); 
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Medicine Name',
      dataIndex: ['medicineId', 'name'],
      key: 'medicineName',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Batch Number',
      dataIndex: ['batchId', 'batchNumber'],
      key: 'batchNumber',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantitySold',
      key: 'quantity',
    },
    {
      title: 'Purchase Price',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (price) => `Rs. ${price}`,
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (price) => `Rs. ${price}`,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => `Rs. ${profit}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      render: (date) => new Date(date).toLocaleTimeString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green">
          SOLD
        </Tag>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>Sales Records</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Select
            placeholder="Select Category"
            style={{ width: 200 }}
            onChange={handleCategoryChange}
            allowClear
          >
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
          <Search
            placeholder="Search by medicine name"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={salesData}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default Sales;