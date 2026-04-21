import { useEffect, useState } from "react";
import { Table, Button, Input, Select, Space, Tag, message, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, CopyOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import quoteService, { type Quote } from "../../services/quoteService";
import type { PaginatedResponse } from "../../services/productService";
import useAuthStore from "../../store/authStore";

const statusColors: Record<string, string> = { DRAFT: "default", SENT: "blue", CONFIRMED: "green", CANCELLED: "red" };

export default function QuoteListPage() {
  const [data, setData] = useState<PaginatedResponse<Quote>>({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data: res } = await quoteService.getQuotes(params);
      setData(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleDuplicate = async (id: number) => {
    await quoteService.duplicateQuote(id);
    message.success("已复制");
    fetchData();
  };

  const handlePDF = async (id: number) => {
    const { data: blob } = await quoteService.exportPDF(id);
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");
    a.href = url; a.download = `quote_${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { title: "标题", dataIndex: "title", render: (t: string, r: Quote) => <a onClick={() => navigate(`/quotes/${r.id}`)}>{t}</a> },
    { title: "客户", dataIndex: "customer_name", width: 150 },
    { title: "状态", dataIndex: "status", width: 100, render: (s: string, r: Quote) => <Tag color={statusColors[s]}>{r.status_display}</Tag> },
    { title: "总金额", dataIndex: "total_amount", width: 120, render: (v: number) => <span className="font-mono">¥{v}</span> },
    { title: "明细数", dataIndex: "item_count", width: 80 },
    { title: "操作", width: 200, render: (_: unknown, r: Quote) => (
      <Space>
        <Button size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(r.id)}>复制</Button>
        <Button size="small" icon={<FilePdfOutlined />} onClick={() => handlePDF(r.id)}>PDF</Button>
        {isAdmin && <Popconfirm title="删除？" onConfirm={async () => { await quoteService.deleteQuote(r.id); message.success("已删除"); fetchData(); }}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>报价方案</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/quotes/new")}>新建报价单</Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={fetchData} style={{ width: 240 }} allowClear />
        <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
          options={[{ value: "DRAFT", label: "草稿" }, { value: "SENT", label: "已发送" }, { value: "CONFIRMED", label: "已确认" }, { value: "CANCELLED", label: "已取消" }]} />
      </Space>
      <Table columns={columns} dataSource={data.results} rowKey="id" loading={loading}
        pagination={{ current: page, total: data.count, pageSize: 20, onChange: setPage }} />
    </div>
  );
}
