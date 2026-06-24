import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Button, Modal, Form, Input, Space, Popconfirm,
  Typography, Tag, Empty, Skeleton, Avatar, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { projectsApi } from '../api';

const { Text } = Typography;

const PALETTE = ['#1677ff', '#722ed1', '#13c2c2', '#52c41a', '#fa8c16', '#eb2f96', '#f5222d'];
const cardColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try { setProjects(await projectsApi.getAll()); }
    catch { message.error('Projeler yüklenemedi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };

  const openEdit = (e, record) => {
    e.stopPropagation();
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) { await projectsApi.update(editing.id, values); message.success('Proje güncellendi'); }
      else { await projectsApi.create(values); message.success('Proje oluşturuldu'); }
      setModalOpen(false);
      load();
    } catch { message.error('Kayıt hatası'); }
  };

  const handleDelete = async (e, id) => {
    try { await projectsApi.delete(id); message.success('Silindi'); load(); }
    catch { message.error('Silinemedi'); }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[20, 20]}>
          {[1, 2, 3].map(i => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card style={{ borderRadius: 12 }}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Projeler</div>
          <div style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>{projects.length} proje</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>
          Yeni Proje
        </Button>
      </div>

      {projects.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#6b7280' }}>Henüz proje oluşturulmadı</span>}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            İlk Projeyi Oluştur
          </Button>
        </Empty>
      ) : (
        <Row gutter={[20, 20]}>
          {projects.map(p => {
            const color = cardColor(p.name);
            return (
              <Col key={p.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  styles={{ body: { padding: 0 } }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div style={{
                    background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
                    borderLeft: `4px solid ${color}`,
                    padding: '20px 20px 18px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Avatar size={44} style={{ background: color, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                        {p.name[0].toUpperCase()}
                      </Avatar>
                      <Space size={2} onClick={e => e.stopPropagation()}>
                        <Button
                          type="text" size="small" icon={<EditOutlined />}
                          style={{ color: '#94a3b8' }}
                          onClick={e => openEdit(e, p)}
                        />
                        <Popconfirm
                          title="Bu projeyi silmek istediğinize emin misiniz?"
                          description="İlgili tüm senaryolar da silinecek."
                          onConfirm={e => handleDelete(e, p.id)}
                          okText="Sil" cancelText="İptal" okType="danger"
                        >
                          <Button
                            type="text" size="small" danger icon={<DeleteOutlined />}
                            onClick={e => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </Space>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <Text strong style={{ fontSize: 16, color: '#111827', display: 'block' }}>
                        {p.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block', lineHeight: 1.6 }}>
                        {p.description || <span style={{ fontStyle: 'italic' }}>Açıklama eklenmemiş</span>}
                      </Text>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    background: '#f8fafc',
                  }}>
                    <Space size={6}>
                      <FileTextOutlined style={{ color, fontSize: 13 }} />
                      <Text style={{ fontSize: 13, color }}>
                        <strong>{p.case_count}</strong> senaryo
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(p.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal
        title={editing ? 'Projeyi Düzenle' : 'Yeni Proje'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Proje Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input size="large" placeholder="örn: GetMobil API Tests" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Projenin kısa açıklaması (opsiyonel)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
