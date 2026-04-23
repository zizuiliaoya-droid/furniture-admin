import { useState } from "react";
import { Layout, Dropdown, Space, Avatar } from "antd";
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Sidebar from "./Sidebar";
import GlobalSearch from "../components/GlobalSearch";
import AnimationProvider from "../components/AnimationProvider";
import "./MainLayout.css";

const { Header, Content, Sider } = Layout;

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    { key: "user", label: `${user?.display_name} (${user?.role === "ADMIN" ? "管理员" : "员工"})`, disabled: true },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        collapsedWidth={64}
        collapsed={collapsed}
        style={{ background: "#fff", borderRight: "1px solid #e9ecef", transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)" }}
      >
        {/* Brand area with breathing glow */}
        <div className="sider-brand">
          <div className="brand-glow" />
          <span className={`brand-text ${collapsed ? "brand-text-collapsed" : ""}`}>
            {collapsed ? "ZK" : "家具软装平台"}
          </span>
        </div>
        <Sidebar collapsed={collapsed} />
        <div className="sider-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>
      <Layout>
        <Header style={{
          background: "#fff", padding: "0 24px", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #e9ecef", height: 64,
        }}>
          <GlobalSearch />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: "#000" }} />
              <span style={{ fontSize: 14 }}>{user?.display_name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 24, padding: 24, background: "#fff", borderRadius: 4,
          boxShadow: "0 2px 20px rgba(0,0,0,0.04)", minHeight: 280,
        }}>
          <AnimationProvider>
            <Outlet />
          </AnimationProvider>
        </Content>
      </Layout>
    </Layout>
  );
}
