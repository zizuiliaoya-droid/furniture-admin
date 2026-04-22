import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Tag, message, Switch,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import authService, { type User } from "../../services/authService";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await authService.getUsers();
      setUsers(data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingUser) {
        if (!values.password) delete values.password;
        await authService.updateUser(editingUser.id, values);
        message.success("用户已更新");
      } else {
        await authService.createUser(values);
        message.success("用户已创建");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch {
      message.error("操作失败");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await authService.toggleUserStatus(id);
      message.success("状态已更新");
      fetchUsers();
    } catch {
      message.error("操作失败");
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      display_name: user.display_name,
    });
    setModalOpen(true);
  };

  const columns = [
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "显示名称", dataIndex: "display_name", key: "display_name" },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "ADMIN" ? "black" : "default"}>
          {role === "ADMIN" ? "管理员" : "员工"}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean, record: User) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: User) => (
        <Button type="link" onClick={() => openEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>用户管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          新建用户
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title={editingUser ? "编辑用户" : "新建用户"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingUser(null); }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, min: 6 }]}
          >
            <Input.Password placeholder={editingUser ? "留空则不修改" : ""} />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "ADMIN", label: "管理员" },
                { value: "STAFF", label: "普通员工" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
