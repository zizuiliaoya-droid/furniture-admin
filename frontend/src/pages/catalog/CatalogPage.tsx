import { useEffect, useState } from "react";
import { Card, Row, Col, Input, Tree, Pagination, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import catalogService from "../../services/catalogService";
import productService, { type Product, type Category, type PaginatedResponse } from "../../services/productService";

export default function CatalogPage() {
  const [data, setData] = useState<PaginatedResponse<Product>>({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getCategoryTree("TYPE").then(({ data }) => setCategoryTree(data));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (selectedCategory) params.category = selectedCategory;
      if (search) {
        const { data: res } = await catalogService.search(search);
        setData(res);
      } else {
        const { data: res } = await catalogService.browse(params);
        setData(res);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, selectedCategory]);

  const mapTree = (nodes: Category[]): any[] =>
    nodes.map((n) => ({
      title: n.name, key: String(n.id),
      children: n.children ? mapTree(n.children) : [],
    }));

  return (
    <div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>产品图册</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <Input
            placeholder="搜索产品..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchData}
            allowClear
            style={{ marginBottom: 16 }}
          />
          <Tree
            treeData={mapTree(categoryTree)}
            onSelect={(keys) => { setSelectedCategory(keys[0] as string); setPage(1); }}
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            defaultExpandAll
          />
        </div>
        <div style={{ flex: 1 }}>
          <Spin spinning={loading}>
            {data.results.length === 0 ? (
              <Empty description="暂无产品" />
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {data.results.map((product) => (
                    <Col key={product.id} xs={12} sm={8} md={6}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/products/${product.id}`)}
                        cover={
                          product.cover_image ? (
                            <img
                              alt={product.name}
                              src={`/media/${product.cover_image.thumbnail_path || product.cover_image.image_path}`}
                              style={{ height: 180, objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ height: 180, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                              暂无图片
                            </div>
                          )
                        }
                        bodyStyle={{ padding: 12 }}
                      >
                        <Card.Meta
                          title={<span style={{ fontSize: 14 }}>{product.name}</span>}
                          description={<span style={{ fontSize: 12, color: "#6c757d" }}>{product.code || ""}</span>}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <Pagination current={page} total={data.count} pageSize={20} onChange={setPage} showTotal={(t) => `共 ${t} 件`} />
                </div>
              </>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
}
