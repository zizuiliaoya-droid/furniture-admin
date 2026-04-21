import { useEffect, useState } from "react";
import { Descriptions, Card, Button, Space, Image, Upload, message, Tag, Popconfirm } from "antd";
import { EditOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import caseService, { type CaseItem } from "../../services/caseService";
import useAuthStore from "../../store/authStore";

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");

  const fetch = async () => {
    const { data } = await caseService.getCase(Number(id));
    setCaseData(data);
  };
  useEffect(() => { fetch(); }, [id]);

  if (!caseData) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{caseData.title}</h2>
        {isAdmin && <Button icon={<EditOutlined />} onClick={() => navigate(`/cases/${id}/edit`)}>编辑</Button>}
      </div>
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="行业">{caseData.industry_display}</Descriptions.Item>
          <Descriptions.Item label="创建人">{caseData.created_by_name}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{caseData.description || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="案例图片" style={{ marginBottom: 16 }} extra={
        isAdmin && <Upload showUploadList={false} beforeUpload={(f) => { caseService.uploadImages(Number(id), [f]).then(() => { message.success("已上传"); fetch(); }); return false; }}>
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
      }>
        <Space wrap>
          {caseData.images?.map((img) => (
            <div key={img.id} style={{ position: "relative" }}>
              <Image src={`/media/${img.thumbnail_path || img.image_path}`} width={120} height={120} style={{ objectFit: "cover", borderRadius: 4 }} />
              {img.is_cover && <Tag color="gold" style={{ position: "absolute", top: 4, left: 4 }}>封面</Tag>}
              {isAdmin && (
                <Popconfirm title="删除？" onConfirm={async () => { await caseService.deleteImage(img.id); message.success("已删除"); fetch(); }}>
                  <Button size="small" danger icon={<DeleteOutlined />} style={{ display: "block", margin: "4px auto 0" }} />
                </Popconfirm>
              )}
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
}
