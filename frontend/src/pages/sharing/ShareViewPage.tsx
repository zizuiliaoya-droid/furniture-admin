import { useEffect, useState } from "react";
import { Card, Input, Button, message, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import shareService from "../../services/shareService";

export default function ShareViewPage() {
  const { token } = useParams();
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    shareService.getPublicShare(token).then(({ data }) => {
      setShareInfo(data);
      if (data.has_password) {
        setNeedPassword(true);
      } else {
        loadContent();
      }
    }).catch((e) => setError(e.response?.data?.detail || "链接无效"));
  }, [token]);

  const loadContent = async (pwd?: string) => {
    try {
      const { data } = await shareService.verifyShare(token!, pwd);
      setContent(data);
      setNeedPassword(false);
    } catch (e: any) {
      message.error(e.response?.data?.detail || "验证失败");
    }
  };

  if (error) return <Result status="error" title={error} />;
  if (!shareInfo) return null;

  if (needPassword) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8" }}>
        <Card style={{ width: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}>
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>{shareInfo.title || "受保护的分享"}</h3>
          <Input.Password prefix={<LockOutlined />} placeholder="请输入访问密码" value={password} onChange={(e) => setPassword(e.target.value)} onPressEnter={() => loadContent(password)} />
          <Button type="primary" block style={{ marginTop: 16 }} onClick={() => loadContent(password)}>验证</Button>
        </Card>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 24 }}>{shareInfo.title || "分享内容"}</h2>
      <Card>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{JSON.stringify(content.data, null, 2)}</pre>
      </Card>
    </div>
  );
}
