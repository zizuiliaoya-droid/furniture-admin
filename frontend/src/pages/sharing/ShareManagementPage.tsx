import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Popconfirm } from "antd";
import { PlusOutlined, CopyOutlined } from "@ant-design/icons";
import shareService, { type ShareLink } from "../../services/shareService";

const contentTypeLabels: Record<string, string> = { PRODUCT: "产品", CASE: "案例", QUOTE: "报价单", CATALOG: "图册" };

export default function ShareManagementPage() {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await shareService.getShares();
      setShares(data.results);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    if (values.expires_at) values.expires_at = values.expires_at.toISOString();
    await shareService.createShare(values);
    message.success("分享链接已创建");
    setModalOpen(false);
    form.resetFields();
    fetchData();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    message.success("链接已复制");
  };

  const columns = [
    { title: "标题", dataIndex: "title", render: (t: string) => t || "-" },
    { title: "类型", dataIndex: "content_type", width: 80, render: (v: string) => contentTypeLabels[v] },
    { title: "密码", dataIndex: "has_password", width: 60, render: (v: boolean) => v ? <Tag>有</Tag> : "-" },
    { title: "访问", dataIndex: "access_count", width: 80, render: (v: number, r: ShareLink) => `${v}${r.max_access_count ? `/${r.max_access_count}` : ""}` },
    { title: "状态", dataIndex: "is_active", width: 60, render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "启用" : "禁用"}</Tag> },
    { title: "操作", width: 150, render: (_: unknown, r: ShareLink) => (
      <Space>
        <Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(r.token)}>复制</Button>
        <Popconfirm title="删除？" onConfirm={async () => { await shareService.deleteShare(r.id); message.success("已删除"); fetchData(); }}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>分享管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>创建分享</Button>
      </div>
      <Table columns={columns} dataSource={shares} rowKey="id" loading={loading} pagination={false} />
      <Modal title="创建分享链接" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="content_type" label="内容类型" rules={[{ required: true }]}>
            <Select options={[{ value: "PRODUCT", label: "产品" }, { value: "CASE", label: "案例" }, { value: "QUOTE", label: "报价单" }, { value: "CATALOG", label: "产品图册" }]} />
          </Form.Item>
          <Form.Item name="object_id" label="对象ID"><InputNumber style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="title" label="分享标题"><Input /></Form.Item>
          <Form.Item name="password" label="访问密码"><Input.Password placeholder="留空则无密码" /></Form.Item>
          <Form.Item name="expires_at" label="过期时间"><DatePicker showTime style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="max_access_count" label="最大访问次数"><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
