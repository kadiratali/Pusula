import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, Button, Space, Typography,
  Breadcrumb, message, Spin, Card, Row, Col, Badge, Tag,
} from 'antd';
import { HomeOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { casesApi } from '../api';

const { Text } = Typography;

const PRIORITY_COLOR = { low: '#52c41a', medium: '#1677ff', high: '#fa8c16', critical: '#f5222d' };
const PRIORITY_BG    = { low: '#f6ffed', medium: '#e6f4ff', high: '#fff7e6', critical: '#fff1f0' };
const PRIORITY_LABEL = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' };
const TYPE_LABEL     = { functional: 'Fonksiyonel', regression: 'Regresyon', smoke: 'Smoke', e2e: 'E2E' };
const STATUS_LABEL   = { active: 'Aktif', draft: 'Taslak', deprecated: 'Geçersiz' };
const STATUS_COLOR   = { active: 'success', draft: 'warning', deprecated: 'default' };

export default function TestCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testCase, setTestCase] = useState(null);
  const [steps, setSteps]       = useState([]);
  const [form] = Form.useForm();
  const nextKey = useRef(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await casesApi.getOne(id);
        setTestCase(data);
        form.setFieldsValue(data);
        setSteps((data.steps || []).map(s => ({ ...s, key: nextKey.current++ })));
      } catch { message.error('Senaryo yüklenemedi'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const addStep = () =>
    setSteps(prev => [...prev, { key: nextKey.current++, action: '', expected_result: '' }]);

  const removeStep = (key) => setSteps(prev => prev.filter(s => s.key !== key));

  const updateStep = (key, field, value) =>
    setSteps(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await casesApi.update(id, values);
      await casesApi.saveSteps(id, steps.map(({ action, expected_result }) => ({ action, expected_result })));
      setTestCase(prev => ({ ...prev, ...values }));
      message.success('Kaydedildi');
    } catch { message.error('Kayıt hatası'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Breadcrumb
            items={[
              {
                title: (
                  <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate('/')}>
                    <HomeOutlined />
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate(-1)}>
                    Senaryolar
                  </span>
                ),
              },
              {
                title: (
                  <Text style={{ color: '#111827', fontWeight: 500, maxWidth: 280 }} ellipsis>
                    {testCase?.title}
                  </Text>
                ),
              },
            ]}
          />
        </Space>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} size="large">
          Kaydet
        </Button>
      </div>

      {/* TC ID */}
      <div style={{ marginBottom: 20 }}>
        <Tag style={{ borderRadius: 6, fontSize: 13, padding: '4px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', fontFamily: 'monospace' }}>
          TC-{id}
        </Tag>
      </div>

      <Row gutter={24} align="top">
        {/* Left: Metadata */}
        <Col xs={24} lg={9}>
          <Card
            title={<Text style={{ fontSize: 14, fontWeight: 600 }}>Senaryo Bilgileri</Text>}
            style={{ borderRadius: 10, border: '1px solid #e2e8f0', position: 'sticky', top: 24 }}
            styles={{ header: { borderBottom: '1px solid #f1f5f9', minHeight: 48 } }}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Zorunlu alan' }]}>
                <Input size="large" />
              </Form.Item>

              <Form.Item name="priority" label="Öncelik">
                <Select
                  options={Object.entries(PRIORITY_LABEL).map(([k, v]) => ({
                    value: k,
                    label: (
                      <Space size={8}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: PRIORITY_COLOR[k], display: 'inline-block', flexShrink: 0,
                        }} />
                        {v}
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>

              <Form.Item name="type" label="Tip">
                <Select options={Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>

              <Form.Item name="status" label="Durum">
                <Select
                  options={Object.entries(STATUS_LABEL).map(([k, v]) => ({
                    value: k,
                    label: <Badge status={STATUS_COLOR[k]} text={v} />,
                  }))}
                />
              </Form.Item>

              <Form.Item name="description" label="Açıklama">
                <Input.TextArea rows={3} placeholder="Senaryonun kısa açıklaması" />
              </Form.Item>

              <Form.Item name="preconditions" label="Ön Koşullar" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={3} placeholder="Test öncesi gerekli koşullar" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right: Steps */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <Space>
                <Text style={{ fontSize: 14, fontWeight: 600 }}>Test Adımları</Text>
                <span style={{
                  padding: '1px 8px', borderRadius: 20,
                  background: '#f1f5f9', color: '#64748b', fontSize: 12,
                }}>
                  {steps.length}
                </span>
              </Space>
            }
            style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
            styles={{ header: { borderBottom: '1px solid #f1f5f9', minHeight: 48 } }}
          >
            {/* Column headers */}
            {steps.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 1fr 44px',
                marginBottom: 6,
              }}>
                <div />
                <div style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Aksiyon
                </div>
                <div style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Beklenen Sonuç
                </div>
                <div />
              </div>
            )}

            {/* Empty state */}
            {steps.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Henüz adım eklenmedi</div>
                <div style={{ fontSize: 13 }}>Aşağıdaki butona tıklayarak ilk adımı ekleyin</div>
              </div>
            )}

            {/* Step rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 1fr 44px',
                    border: '1px solid #e8ecf0',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fff',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    paddingTop: 14, background: '#f8fafc', borderRight: '1px solid #f1f5f9',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#1677ff', color: '#fff',
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ borderRight: '1px solid #f1f5f9' }}>
                    <Input.TextArea
                      value={step.action}
                      autoSize={{ minRows: 2, maxRows: 8 }}
                      placeholder="Gerçekleştirilecek adım..."
                      onChange={e => updateStep(step.key, 'action', e.target.value)}
                      variant="borderless"
                      style={{ background: 'transparent', fontSize: 13 }}
                    />
                  </div>

                  {/* Expected result */}
                  <div>
                    <Input.TextArea
                      value={step.expected_result}
                      autoSize={{ minRows: 2, maxRows: 8 }}
                      placeholder="Beklenen çıktı/sonuç..."
                      onChange={e => updateStep(step.key, 'expected_result', e.target.value)}
                      variant="borderless"
                      style={{ background: 'transparent', fontSize: 13 }}
                    />
                  </div>

                  {/* Delete */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                    <Button
                      type="text" size="small" icon={<DeleteOutlined />}
                      style={{ color: '#cbd5e1' }}
                      onClick={() => removeStep(step.key)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addStep}
              style={{ width: '100%', marginTop: 12, borderRadius: 8, height: 40, color: '#64748b' }}
            >
              Adım Ekle
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
