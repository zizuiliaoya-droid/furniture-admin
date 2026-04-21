import { useEffect, useState } from "react";
import { Table, Button, Input, Select, Space, Tag, Image, message, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import productService, { type Product, type PaginatedResponse } from "../../services/productService";
import useAuthStore from "../../store/authStore";

const originMap: Record<string, string> = { IMPORT: "进口", DOMESTIC: "国产", CUSTOM: "定制" };

export default function ProductListPage() {
  const [data, setData] = useState<PaginatedResponse<Product>>({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState<string>();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (origin) params.origin = origin;
      const { data: res } = await productService.getProducts(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, origin]);

  const handleDelete = async (id: number) => {
    await productService.deleteProduct(id);
    message.success("已删除");
    fetchData();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data: result } = await productService.importProducts(file);
      message.success(`导入完成: 成功 ${result.success} 条`);
      fetchData();
    } catch {
      message.error("导入失败");
    }
    e.target.value = "";
  };

  const columns = [
    {
      title: "封面", dataIndex: "cover_image", width: 80,
      render: (img: Product["cover_image"]) =>
        img ? <Image src={`/media/${img.thumbnail_path || img.image_path}`} width={48} height={48} style={{ objectFit: "cover", borderRadius: 4 }} /> : <div style={{ width: 48, height: 48, background: "#f0f0f0", borderRadius: 4 }} />,
    },
    { title: "产品名称", dataIndex: "name", render: (name: string, r: Product) => <a onClick={() => navigate(`/products/${r.id}`)}>{name}</a> },
    { title: "编号", dataIndex: "code", width: 120 },
    { title: "产地", dataIndex: "origin", width: 80, render: (v: string) => originMap[v] || v },
    { title: "最低售价", dataIndex: "min_price", width: 100, render: (v: number | null) => v != null ? <span className="font-mono">¥{v}</span> : "-" },
    { title: "状态", dataIndex: "is_active", width: 80, render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "上架" : "下架"}</Tag> },
    ...(isAdmin ? [{
      title: "操作", width: 150,
      render: (_: unknown, r: Product) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/products/${r.id}/edit`)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>产品管理</h2>
        {isAdmin && (
          <Space>
            <label>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: "none" }} />
              <Button icon={<UploadOutlined />}>Excel 导入</Button>
            </label>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/products/new")}>新建产品</Button>
          </Space>
        )}
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索产品..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={fetchData} style={{ width: 240 }} allowClear />
        <Select placeholder="产地" allowClear style={{ width: 120 }} value={origin} onChange={setOrigin}
          options={[{ value: "IMPORT", label: "进口" }, { value: "DOMESTIC", label: "国产" }, { value: "CUSTOM", label: "定制" }]}
        />
      </Space>
      <Table columns={columns} dataSource={data.results} rowKey="id" loading={loading}
        pagination={{ current: page, total: data.count, pageSize: 20, onChange: setPage, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  );
}
