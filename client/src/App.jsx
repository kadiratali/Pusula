import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import trTR from 'antd/locale/tr_TR';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TestCaseDetail from './pages/TestCaseDetail';

const { Header, Content } = Layout;

const PRIMARY = '#1677ff';

function AppHeader() {
  const navigate = useNavigate();
  return (
    <Header
      onClick={() => navigate('/')}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        height: 80,
        lineHeight: '80px',
        width: '100%',
        background: `linear-gradient(135deg, #0d47a1 0%, ${PRIMARY} 100%)`,
        boxShadow: '0 4px 12px rgba(13,71,161,0.4)',
        borderBottom: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <CompassOutlined style={{ fontSize: 28, color: '#fff', marginRight: 12 }} />
      <span style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
        Pusula
      </span>
      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginLeft: 10, fontWeight: 400 }}>
        Test Management
      </span>
    </Header>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        token: { colorPrimary: PRIMARY, borderRadius: 8 },
        components: { Layout: { headerHeight: 80, headerBg: '#0d47a1' } },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh', width: '100%', border: 'none' }}>
          <AppHeader />
          <Content style={{ background: '#eef2f7' }}>
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/cases/:id" element={<TestCaseDetail />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
