import { useState, useRef } from "react";
import { Input, Dropdown, Empty, Spin, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import searchService, { type SearchResults } from "../services/searchService";

const { Text } = Typography;

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const { data } = await searchService.search(q);
      setResults(data);
      setOpen(true);
    } finally { setLoading(false); }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleClick = (type: string, id: number) => {
    setOpen(false);
    setQuery("");
    const routes: Record<string, string> = {
      product: `/products/${id}`, case: `/cases/${id}`,
      document: `/documents/design`, quote: `/quotes/${id}`,
    };
    navigate(routes[type] || "/");
  };

  const hasResults = results && (
    results.products.length || results.cases.length || results.documents.length || results.quotes.length
  );

  const dropdownContent = (
    <div style={{ background: "#fff", borderRadius: 4, boxShadow: "0 4px 30px rgba(0,0,0,0.06)", padding: 8, minWidth: 360, maxHeight: 400, overflow: "auto" }}>
      {loading ? <Spin style={{ display: "block", textAlign: "center", padding: 16 }} /> :
        !hasResults ? <Empty description="无结果" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
          <>
            {results!.products.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, padding: "0 8px" }}>产品</Text>
                {results!.products.map((p) => (
                  <div key={p.id} onClick={() => handleClick("product", p.id)} style={{ padding: "6px 8px", cursor: "pointer", borderRadius: 4 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {p.name} {p.code && <Text type="secondary">({p.code})</Text>}
                  </div>
                ))}
              </div>
            )}
            {results!.cases.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, padding: "0 8px" }}>案例</Text>
                {results!.cases.map((c) => (
                  <div key={c.id} onClick={() => handleClick("case", c.id)} style={{ padding: "6px 8px", cursor: "pointer", borderRadius: 4 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {c.title}
                  </div>
                ))}
              </div>
            )}
            {results!.documents.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, padding: "0 8px" }}>文档</Text>
                {results!.documents.map((d) => (
                  <div key={d.id} onClick={() => handleClick("document", d.id)} style={{ padding: "6px 8px", cursor: "pointer", borderRadius: 4 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {d.name}
                  </div>
                ))}
              </div>
            )}
            {results!.quotes.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 12, padding: "0 8px" }}>报价单</Text>
                {results!.quotes.map((q) => (
                  <div key={q.id} onClick={() => handleClick("quote", q.id)} style={{ padding: "6px 8px", cursor: "pointer", borderRadius: 4 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {q.title} <Text type="secondary">- {q.customer_name}</Text>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      }
    </div>
  );

  return (
    <Dropdown dropdownRender={() => dropdownContent} open={open} onOpenChange={setOpen} trigger={["click"]}>
      <Input
        placeholder="搜索产品、案例、文档..."
        prefix={<SearchOutlined style={{ color: "#6c757d" }} />}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        style={{ width: 360, borderRadius: 4 }}
        allowClear
        onClear={() => { setResults(null); setOpen(false); }}
      />
    </Dropdown>
  );
}
