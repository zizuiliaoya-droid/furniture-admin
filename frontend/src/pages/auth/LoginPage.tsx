import { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success("登录成功");
      navigate("/");
    } catch {
      message.error("用户名或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAF8",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.06)",
          borderRadius: 4,
          border: "none",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title
            level={3}
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            家具软装管理平台
          </Title>
          <Text type="secondary">请登录您的账号</Text>
        </div>
        <Form onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
