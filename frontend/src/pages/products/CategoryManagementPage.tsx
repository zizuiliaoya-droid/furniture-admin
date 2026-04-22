import { useEffect, useState } from "react";
import { Tree, Button, Modal, Form, Input, Space, message, Popconfirm, Tabs } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import productService, { type Category } from "../../services/productService";

const dimensionLabels: Record<string, string> = { TYPE: "产品类别", BRAND: "品牌" };

export default function CategoryManagementPage() {
  const [dimension, setDimension] = useState<"TYPE" | "SPACE" | "ORIGIN">("TYPE");
  const [treeData, setTreeData] = useState<Category[]>([]);
  const [_loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchTree = async () => {
    setLoading(true);
    try {
      const { data } = await productService.getCategoryTree(dimension);
      setTreeData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTree(); }, [dimension]);

  const mapTree = (nodes: Category[]): any[] =>
    nodes.map((n) => ({
      title: (
        <Space>
          <span>{n.name}</span>
          <Button size="small" type="text" icon={<PlusOutlined />}
            onClick={(e) => { e.stopPropagation(); setParentId(n.id); form.resetFields(); setModalOpen(true); }} />
          <Popconfirm title="确认删除？" onConfirm={async () => { await productService.deleteCategory(n.id); message.success("已删除"); fetchTree(); }}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
      key: n.id,
      children: n.children ? mapTree(n.children) : [],
    }));

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      await productService.createCategory({
        name: values.name,
        dimension,
        parent: parentId,
      });
      message.success("分类已创建");
      setModalOpen(false);
      form.resetFields();
      setParentId(null);
      fetchTree();
    } catch {
      message.error("创建失败");
    }
  };

  const handleDrop = async (_info: any) => {
    // Reorder based on current tree state
    const flatNodes = treeData.flatMap((n) => [n, ...(n.children || [])]);
    const reorderData = flatNodes.map((n, i) => ({ id: n.id, sort_order: i }));
    await productService.reorderCategories(reorderData);
    fetchTree();
  };

  const tabItems = Object.entries(dimensionLabels).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>分类管理</h2>
      <Tabs activeKey={dimension} onChange={(key) => setDimension(key as "TYPE" | "SPACE" | "ORIGIN")} items={tabItems} />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => { setParentId(null); form.resetFields(); setModalOpen(true); }}
      >
        新建顶级分类
      </Button>
      <Tree
        treeData={mapTree(treeData)}
        draggable
        onDrop={handleDrop}
        defaultExpandAll
        blockNode
      />
      <Modal
        title={parentId ? "新建子分类" : "新建顶级分类"}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); setParentId(null); }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
