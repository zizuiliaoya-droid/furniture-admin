import { Menu } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  ProjectOutlined,
  FileOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  ShareAltOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const menuItems = [
    {
      key: "/products",
      icon: <AppstoreOutlined />,
      label: "产品管理",
    },
    ...(isAdmin
      ? [{ key: "/categories", icon: <TagsOutlined />, label: "分类管理" }]
      : []),
    {
      key: "/catalog",
      icon: <PictureOutlined />,
      label: "产品图册",
    },
    {
      key: "/cases",
      icon: <ProjectOutlined />,
      label: "客户案例",
    },
    {
      key: "documents",
      icon: <FileOutlined />,
      label: "内部文档",
      children: [
        {
          key: "/documents/design",
          icon: <PictureOutlined />,
          label: "设计资源",
        },
        {
          key: "/documents/training",
          icon: <BookOutlined />,
          label: "培训资料",
        },
        {
          key: "/documents/certificates",
          icon: <SafetyCertificateOutlined />,
          label: "资质文件",
        },
      ],
    },
    {
      key: "/quotes",
      icon: <DollarOutlined />,
      label: "报价方案",
    },
    {
      key: "/shares",
      icon: <ShareAltOutlined />,
      label: "分享管理",
    },
    ...(isAdmin
      ? [{ key: "/users", icon: <TeamOutlined />, label: "用户管理" }]
      : []),
  ];

  const selectedKey =
    menuItems
      .flatMap((item) => ("children" in item ? item.children ?? [] : [item]))
      .find((item) => location.pathname.startsWith(item.key))?.key ||
    location.pathname;

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={["documents"]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{
        borderRight: "none",
        padding: "8px 0",
      }}
    />
  );
}
