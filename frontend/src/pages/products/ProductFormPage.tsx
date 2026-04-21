import { useEffect, useState } from "react";
import { Form, Input, Select, InputNumber, Switch, Button, TreeSelect, message, Card, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import productService, { type Category } from "../../services/productService";

const { TextArea } = Input;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    productService.getCategoryTree("TYPE").then(({ data }) => setCategoryTree(data));
    if (isEdit) {
      productService.getProduct(Number(id)).then(({ data }) => {
        form.setFieldsValue({
          ...data,
          category_ids: data.category_ids || [],
        });
      });
    }
  }, [id]);

  const mapTreeData = (nodes: Category[]): any[] =>
    nodes.map((n) => ({
      title: n.name, value: n.id,
      children: n.children ? mapTreeData(n.children) : [],
    }));

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (isEdit) {
        await productService.updateProduct(Number(id), values);
        message.success("产品已更新");
      } else {
        await productService.createProduct(values);
        message.success("产品已创建");
      }
      navigate("/products");
    } catch {
      message.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 24 }}>
        {isEdit ? "编辑产品" : "新建产品"}
      </h2>
      <Card style={{ maxWidth: 720 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ origin: "DOMESTIC", is_active: true }}>
          <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="产品编号">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="产品描述">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="origin" label="产地" rules={[{ required: true }]}>
            <Select options={[
              { value: "IMPORT", label: "进口" },
              { value: "DOMESTIC", label: "国产" },
              { value: "CUSTOM", label: "定制" },
            ]} />
          </Form.Item>
          <Form.Item name="min_price" label="最低售价">
            <InputNumber style={{ width: "100%" }} min={0} precision={2} prefix="¥" />
          </Form.Item>
          <Form.Item name="category" label="主分类">
            <TreeSelect treeData={mapTreeData(categoryTree)} placeholder="选择分类" allowClear />
          </Form.Item>
          <Form.Item name="category_ids" label="关联分类">
            <TreeSelect treeData={mapTreeData(categoryTree)} placeholder="选择关联分类" multiple allowClear treeCheckable />
          </Form.Item>
          <Form.Item name="is_active" label="上架状态" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              {isEdit ? "保存" : "创建"}
            </Button>
            <Button onClick={() => navigate("/products")}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
