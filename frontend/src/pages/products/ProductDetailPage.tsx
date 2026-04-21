import { useEffect, useState } from "react";
import { Descriptions, Tag, Image, Card, Button, Space, Upload, message, Table, Popconfirm } from "antd";
import { EditOutlined, UploadOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService, { type Product } from "../../services/productService";
import useAuthStore from "../../store/authStore";

const originMap: Record<string, string> = { IMPORT: "进口", DOMESTIC: "国产", CUSTOM: "定制" };

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await productService.getProduct(Number(id));
      setProduct(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const handleUpload = async (file: File) => {
    await productService.uploadImages(Number(id), [file]);
    message.success("图片已上传");
    fetchProduct();
    return false;
  };

  const handleDeleteImage = async (imageId: number) => {
    await productService.deleteImage(imageId);
    message.success("图片已删除");
    fetchProduct();
  };

  const handleSetCover = async (imageId: number) => {
    await productService.setCoverImage(imageId);
    message.success("封面已设置");
    fetchProduct();
  };

  if (loading || !product) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{product.name}</h2>
        {isAdmin && (
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/products/${id}/edit`)}>编辑</Button>
        )}
      </div>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="产品编号">{product.code || "-"}</Descriptions.Item>
          <Descriptions.Item label="产地">{originMap[product.origin]}</Descriptions.Item>
          <Descriptions.Item label="最低售价">{product.min_price != null ? <span className="font-mono">¥{product.min_price}</span> : "-"}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={product.is_active ? "green" : "default"}>{product.is_active ? "上架" : "下架"}</Tag></Descriptions.Item>
          <Descriptions.Item label="主分类">{product.category_name || "-"}</Descriptions.Item>
          <Descriptions.Item label="创建人">{product.created_by_name}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{product.description || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="产品图片" style={{ marginBottom: 16 }} extra={
        isAdmin && <Upload showUploadList={false} beforeUpload={handleUpload}><Button icon={<UploadOutlined />}>上传图片</Button></Upload>
      }>
        <Space wrap>
          {product.images?.map((img) => (
            <div key={img.id} style={{ position: "relative", display: "inline-block" }}>
              <Image src={`/media/${img.thumbnail_path || img.image_path}`} width={120} height={120} style={{ objectFit: "cover", borderRadius: 4 }} />
              {img.is_cover && <Tag color="gold" style={{ position: "absolute", top: 4, left: 4 }}>封面</Tag>}
              {isAdmin && (
                <Space style={{ display: "flex", justifyContent: "center", marginTop: 4 }} size={4}>
                  {!img.is_cover && <Button size="small" icon={<StarOutlined />} onClick={() => handleSetCover(img.id)} />}
                  <Popconfirm title="删除图片？" onConfirm={() => handleDeleteImage(img.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )}
            </div>
          ))}
        </Space>
      </Card>

      <Card title="产品配置" style={{ marginBottom: 16 }}>
        <Table dataSource={product.configs} rowKey="id" pagination={false} columns={[
          { title: "配置名称", dataIndex: "config_name" },
          { title: "指导价格", dataIndex: "guide_price", render: (v: number | null) => v != null ? <span className="font-mono">¥{v}</span> : "-" },
          { title: "属性", dataIndex: "attributes", render: (v: Record<string, string>) => Object.entries(v || {}).map(([k, val]) => <Tag key={k}>{k}: {val}</Tag>) },
        ]} />
      </Card>

      <Card title="相关资源">
        <Space>
          <Link to="/documents/design"><Button>设计资源</Button></Link>
          <Link to="/documents/training"><Button>培训资料</Button></Link>
          <Link to="/documents/certificates"><Button>资质文件</Button></Link>
        </Space>
      </Card>
    </div>
  );
}
