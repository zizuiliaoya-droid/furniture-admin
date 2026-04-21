import { useEffect, useState } from "react";
import { Table, Button, Select, Space, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import caseService, { type CaseItem } from "../../services/caseService";
import type { PaginatedResponse } from "../../services/productService";
import useAuthStore from "../../store/authStore";

const industries = [
  { value: "TECH", label: "科技/互联网" }, { value: "FINANCE", label: "金融/保险/财税" },
  { value: "REALESTATE", label: "地产/建筑/设计院" }, { value: "EDUCATION", label: "教育培训" },
  { value: "MEDICAL", label: "医疗/大健康" }, { value: "MEDIA", label: "广告/文创/传媒" },
  { value: "MANUFACTURE", label: "制造/实业/工厂" }, { value: "GOVERNMENT", label: "政府/国企/事业单位" },
  { value: "OTHER", label: "其他" },
];

export default function CaseListPage() {
  const [data, setData] = useState<PaginatedResponse<CaseItem>>({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState<string>();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (industry) params.industry = industry;
      const { data: res } = await caseService.getCases(params);
      setData(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, industry]);

  const columns = [
    { title: "案例标题", dataIndex: "title", render: (t: string, r: CaseItem) => <a onClick={() => navigate(`/cases/${r.id}`)}>{t}</a> },
    { title: "行业", dataIndex: "industry_display", width: 160 },
    { title: "创建人", dataIndex: "created_by_name", width: 100 },
    { title: "创建时间", dataIndex: "created_at", width: 180, render: (v: string) => new Date(v).toLocaleDateString() },
    ...(isAdmin ? [{ title: "操作", width: 150, render: (_: unknown, r: CaseItem) => (
      <Space>
        <Button type="link" size="small" onClick={() => navigate(`/cases/${r.id}/edit`)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={async () => { await caseService.deleteCase(r.id); message.success("已删除"); fetchData(); }}>
          <Button type="link" size="small" danger>删除</Button>
        </Popconfirm>
      </Space>
    )}] : []),
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>客户案例</h2>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/cases/new")}>新建案例</Button>}
      </div>
      <Select placeholder="行业筛选" allowClear style={{ width: 200, marginBottom: 16 }} value={industry} onChange={setIndustry} options={industries} />
      <Table columns={columns} dataSource={data.results} rowKey="id" loading={loading}
        pagination={{ current: page, total: data.count, pageSize: 20, onChange: setPage }} />
    </div>
  );
}
