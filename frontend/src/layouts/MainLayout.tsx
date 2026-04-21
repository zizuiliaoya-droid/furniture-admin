import { Layout, Dropdown, Space, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Sidebar from "./Sidebar";
import GlobalSearch from "../components/GlobalSearch";

const { Header, Content, Sider } = Layout;

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user",
      label: `${user?.display_name} (${user?.role === "ADMIN" ? "管理员" : "员工"})`,
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        style={{
          background: "#fff",
          borderRight: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: "#000",
              letterSpacing: "-0.02em",
            }}
          >
            家具软装平台
          </span>
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e9ecef",
            height: 64,
          }}
        >
          <GlobalSearch />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#000" }}
              />
              <span style={{ fontSize: 14 }}>{user?.display_name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 4,
            boxShadow: "0 2px 20px rgba(0, 0, 0, 0.04)",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
