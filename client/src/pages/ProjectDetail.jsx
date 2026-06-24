import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm,
  Breadcrumb, Tag, Typography, message, Row, Col, Card, Badge,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { casesApi } from '../api';

const { Text } = Typography;

const PRIORITY_COLOR = { low: '#52c41a', medium: '#1677ff', high: '#fa8c16', critical: '#f5222d' };
const PRIORITY_BG    = { low: '#f6ffed', medium: '#e6f4ff', high: '#fff7e6', critical: '#fff1f0' };
const PRIORITY_LABEL = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' };
const TYPE_LABEL     = { functional: 'Fonksiyonel', regression: 'Regresyon', smoke: 'Smoke', e2e: 'E2E' };
const STATUS_COLOR   = { active: 'success', draft: 'warning', deprecated: 'default' };
const STATUS_LABEL   = { active: 'Aktif', draft: 'Taslak', deprecated: 'Geçersiz' };

const STATS = [
  { key: 'total',      label: 'Toplam',   color: '#1677ff' },
  { key: 'active',     label: 'Aktif',    color: '#52c41a' },
  { key: 'draft',      label: 'Taslak',   color: '#faad14' },
  { key: 'deprecated', label: 'Geçersiz', color: '#94a3b8' },
];

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [filters, setFilters]   = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { setAllCases(await casesApi.getByProject(projectId)); }
    catch { message.error('Senaryolar yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cases = useMemo(() => allCases.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    if (filters.type     && c.type     !== filters.type)     return false;
    if (filters.status   && c.status   !== filters.status)   return false;
    return true;
  }), [allCases, search, filters]);

  const stats = useMemo(() => ({
    total:      allCases.length,
    active:     allCases.filter(c => c.status === 'active').length,
    draft:      allCases.filter(c => c.status === 'draft').length,
    deprecated: allCases.filter(c => c.status === 'deprecated').length,
  }), [allCases]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      const created = await casesApi.create(projectId, values);
      message.success('Senaryo oluşturuldu');
      setModalOpen(false);
      form.resetFields();
      navigate(`/cases/${created.id}`);
    } catch { message.error('Kayıt hatası'); }
  };

  const handleDelete = async (id) => {
    try { await casesApi.delete(id); message.success('Silindi'); load(); }
    catch { message.error('Silinemedi'); }
  };

  const columns = [
    {
      title: 'ID', key: 'id', dataIndex: 'id', width: 72,
      render: v => <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>TC-{v}</Text>,
    },
    {
      title: 'Senaryo Başlığı', dataIndex: 'title', key: 'title',
      render: (text, record) => (
        <Text
          style={{ color: '#1677ff', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => navigate(`/cases/${record.id}`)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Öncelik', dataIndex: 'priority', key: 'priority', width: 100,
      render: v => (
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: PRIORITY_BG[v],
          color: PRIORITY_COLOR[v],
        }}>
          {PRIORITY_LABEL[v]}
        </span>
      ),
    },
    {
      title: 'Tip', dataIndex: 'type', key: 'type', width: 120,
      render: v => <Text style={{ fontSize: 13, color: '#64748b' }}>{TYPE_LABEL[v] || v}</Text>,
    },
    {
      title: 'Durum', dataIndex: 'status', key: 'status', width: 100,
      render: v => <Badge status={STATUS_COLOR[v]} text={<Text style={{ fontSize: 13 }}>{STATUS_LABEL[v]}</Text>} />,
    },
    {
      title: 'Tarih', dataIndex: 'created_at', key: 'created_at', width: 110,
      render: v => <Text style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(v).toLocaleDateString('tr-TR')}</Text>,
    },
    {
      title: '', key: 'actions', width: 72, align: 'right',
      render: (_, record) => (
        <Space size={2} onClick={e => e.stopPropagation()}>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#94a3b8' }} onClick={() => navigate(`/cases/${record.id}`)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Sil" cancelText="İptal" okType="danger">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hasFilter = search || Object.values(filters).some(Boolean);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: (
              <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate('/')}>
                <HomeOutlined style={{ marginRight: 4 }} />Projeler
              </span>
            ),
          },
          { title: <span style={{ color: '#111827', fontWeight: 500 }}>Test Senaryoları</span> },
        ]}
      />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {STATS.map(s => (
          <Col key={s.key} xs={12} sm={6}>
            <Card
              style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <div style={{ fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {stats[s.key]}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16,
        flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Space wrap size={8}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Senaryo ara..."
            style={{ width: 220 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Öncelik" allowClear style={{ width: 120 }}
            onChange={v => setFilters(f => ({ ...f, priority: v }))}
            options={Object.entries(PRIORITY_LABEL).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Select
            placeholder="Tip" allowClear style={{ width: 140 }}
            onChange={v => setFilters(f => ({ ...f, type: v }))}
            options={Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Select
            placeholder="Durum" allowClear style={{ width: 120 }}
            onChange={v => setFilters(f => ({ ...f, status: v }))}
            options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          Yeni Senaryo
        </Button>
      </div>

      <Card style={{ borderRadius: 10, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={cases}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: false, showTotal: total => `${total} senaryo` }}
          size="middle"
          onRow={record => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/cases/${record.id}`),
          })}
          locale={{
            emptyText: hasFilter ? 'Filtreyle eşleşen senaryo bulunamadı' : 'Henüz senaryo eklenmedi',
          }}
        />
      </Card>

      <Modal
        title="Yeni Senaryo"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        okText="Oluştur"
        cancelText="İptal"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}
          initialValues={{ priority: 'medium', type: 'functional', status: 'active' }}>
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input size="large" placeholder="Senaryo başlığı" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="priority" label="Öncelik">
                <Select options={Object.entries(PRIORITY_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label="Tip">
                <Select options={Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Durum">
                <Select options={Object.entries(STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Kısa açıklama" />
          </Form.Item>
          <Form.Item name="preconditions" label="Ön Koşullar" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Testin çalıştırılabilmesi için gerekli koşullar" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
