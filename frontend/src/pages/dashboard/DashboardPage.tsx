import { Card, Row, Col, Button, Space, Timeline, Typography } from "antd";
import {
  AppstoreOutlined, DollarOutlined, ProjectOutlined, ShareAltOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import "./DashboardPage.css";

const { Text } = Typography;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

const statCards = [
  { key: "products", label: "产品总数", icon: <AppstoreOutlined />, hue: 210, path: "/products" },
  { key: "quotes", label: "报价单", icon: <DollarOutlined />, hue: 35, path: "/quotes" },
  { key: "cases", label: "客户案例", icon: <ProjectOutlined />, hue: 145, path: "/cases" },
  { key: "shares", label: "分享链接", icon: <ShareAltOutlined />, hue: 280, path: "/shares" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h1 className="greeting-text">{getGreeting()}，{user?.display_name}</h1>
        <Text type="secondary">欢迎回到家具软装管理平台</Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {statCards.map((card) => (
          <Col key={card.key} xs={12} sm={6}>
            <div
              className="stat-card"
              style={{ "--card-hue": String(card.hue) } as React.CSSProperties}
              onClick={() => navigate(card.path)}
            >
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-glow" />
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      {isAdmin && (
        <Card title="快捷操作" style={{ marginBottom: 24 }} styles={{ body: { padding: 16 } }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/products/new")}>新建产品</Button>
            <Button icon={<PlusOutlined />} onClick={() => navigate("/quotes/new")}>新建报价单</Button>
            <Button icon={<PlusOutlined />} onClick={() => navigate("/cases/new")}>新建案例</Button>
          </Space>
        </Card>
      )}

      {/* Recent Activity */}
      <Card title="最近动态">
        <Timeline
          items={[
            { children: <><Text strong>系统初始化</Text><br /><Text type="secondary">管理员账号已创建</Text></> },
            { children: <><Text strong>分类数据</Text><br /><Text type="secondary">产品类别和品牌分类已预置</Text></> },
            { children: <><Text strong>准备就绪</Text><br /><Text type="secondary">开始添加产品数据吧</Text></> },
          ]}
        />
      </Card>
    </div>
  );
}
