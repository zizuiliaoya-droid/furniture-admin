import { useEffect, useState } from "react";
import { Descriptions, Card, Button, Table, Tag, Space, Modal, Form, Input, InputNumber, message, Popconfirm } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import quoteService, { type Quote, type QuoteItem } from "../../services/quoteService";

const statusColors: Record<string, string> = { DRAFT: "default", SENT: "blue", CONFIRMED: "green", CANCELLED: "red" };

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetch = async () => {
    const { data } = await quoteService.getQuote(Number(id));
    setQuote(data);
  };
  useEffect(() => { fetch(); }, [id]);

  const handleItemSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingItem) {
        await quoteService.updateItem(editingItem.id, values);
      } else {
        await quoteService.addItem(Number(id), values);
      }
      message.success("已保存");
      setItemModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetch();
    } catch { message.error("操作失败"); }
  };

  if (!quote) return null;

  const itemColumns = [
    { title: "产品名称", dataIndex: "product_name" },
    { title: "配置", dataIndex: "config_name", width: 120 },
    { title: "单价", dataIndex: "unit_price", width: 100, render: (v: number) => <span className="font-mono">¥{v}</span> },
    { title: "数量", dataIndex: "quantity", width: 80 },
    { title: "折扣(%)", dataIndex: "discount", width: 90, render: (v: number) => <span className="font-mono">{v}%</span> },
    { title: "小计", dataIndex: "subtotal", width: 120, render: (v: number) => <span className="font-mono">¥{v}</span> },
    { title: "操作", width: 120, render: (_: unknown, r: QuoteItem) => (
      <Space>
        <Button size="small" onClick={() => { setEditingItem(r); form.setFieldsValue(r); setItemModalOpen(true); }}>编辑</Button>
        <Popconfirm title="删除？" onConfirm={async () => { await quoteService.deleteItem(r.id); message.success("已删除"); fetch(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{quote.title}</h2>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/quotes/${id}/edit`)}>编辑</Button>
      </div>
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="客户">{quote.customer_name || "-"}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[quote.status]}>{quote.status_display}</Tag></Descriptions.Item>
          <Descriptions.Item label="总金额"><span className="font-mono" style={{ fontSize: 18, fontWeight: 700 }}>¥{quote.total_amount}</span></Descriptions.Item>
          <Descriptions.Item label="创建人">{quote.created_by_name}</Descriptions.Item>
          {quote.notes && <Descriptions.Item label="备注" span={2}>{quote.notes}</Descriptions.Item>}
          {quote.terms && <Descriptions.Item label="条款" span={2}>{quote.terms}</Descriptions.Item>}
        </Descriptions>
      </Card>
      <Card title="报价明细" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setItemModalOpen(true); }}>添加明细</Button>
      }>
        <Table columns={itemColumns} dataSource={quote.items} rowKey="id" pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} align="right"><strong>合计</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={5}><strong className="font-mono">¥{quote.total_amount}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={6} />
            </Table.Summary.Row>
          )}
        />
      </Card>
      <Modal title={editingItem ? "编辑明细" : "添加明细"} open={itemModalOpen} onOk={handleItemSubmit}
        onCancel={() => { setItemModalOpen(false); setEditingItem(null); }} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" initialValues={{ quantity: 1, discount: 0 }}>
          <Form.Item name="product_name" label="产品名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="config_name" label="配置名称"><Input /></Form.Item>
          <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={0} precision={2} prefix="¥" /></Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
          <Form.Item name="discount" label="折扣(%)"><InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
