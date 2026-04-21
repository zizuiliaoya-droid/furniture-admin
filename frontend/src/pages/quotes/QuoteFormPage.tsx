import { useEffect, useState } from "react";
import { Form, Input, Select, Button, Card, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import quoteService from "../../services/quoteService";

const { TextArea } = Input;

export default function QuoteFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) quoteService.getQuote(Number(id)).then(({ data }) => form.setFieldsValue(data));
  }, [id]);

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (isEdit) {
        await quoteService.updateQuote(Number(id), values);
        message.success("已更新");
      } else {
        const { data } = await quoteService.createQuote(values);
        message.success("已创建");
        navigate(`/quotes/${data.id}`);
        return;
      }
      navigate("/quotes");
    } catch { message.error("操作失败"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 24 }}>{isEdit ? "编辑报价单" : "新建报价单"}</h2>
      <Card style={{ maxWidth: 720 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "DRAFT" }}>
          <Form.Item name="title" label="报价单标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="customer_name" label="客户名称"><Input /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[
              { value: "DRAFT", label: "草稿" }, { value: "SENT", label: "已发送" },
              { value: "CONFIRMED", label: "已确认" }, { value: "CANCELLED", label: "已取消" },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="备注"><TextArea rows={3} /></Form.Item>
          <Form.Item name="terms" label="条款"><TextArea rows={3} /></Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>{isEdit ? "保存" : "创建"}</Button>
            <Button onClick={() => navigate("/quotes")}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
