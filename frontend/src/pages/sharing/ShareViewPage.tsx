import { useEffect, useState, useRef } from "react";
import { message, Result } from "antd";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import shareService from "../../services/shareService";
import "./ShareViewPage.css";

function randomHue() { return Math.floor(Math.random() * 360); }

export default function ShareViewPage() {
  const { token } = useParams();
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState("");
  const [hue, setHue] = useState(200);
  const [unlocked, setUnlocked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shackleRef = useRef<SVGPathElement>(null);

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
      const newHue = randomHue();
      setHue(newHue);
      // Unlock animation
      setUnlocked(true);
      if (shackleRef.current) {
        gsap.to(shackleRef.current, { y: -8, rotation: -30, transformOrigin: "left bottom", duration: 0.5, ease: "back.out(2)" });
      }
      setTimeout(() => {
        if (contentRef.current) {
          gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)" });
        }
      }, 400);
    } catch (e: any) {
      // Shake animation on wrong password
      if (formRef.current) {
        gsap.fromTo(formRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      }
      message.error(e.response?.data?.detail || "验证失败");
    }
  };

  if (error) return <div className="share-dark-page"><Result status="error" title={error} /></div>;
  if (!shareInfo) return null;

  if (needPassword && !content) {
    return (
      <div className="share-dark-page" style={{ "--shade-hue": String(hue) } as React.CSSProperties}>
        <div className="share-center">
          {/* Lock SVG */}
          <div className="share-lock-wrapper">
            <svg viewBox="0 0 120 160" className="share-lock-svg">
              <path ref={shackleRef} d="M 35 65 L 35 40 Q 35 15 60 15 Q 85 15 85 40 L 85 65"
                fill="none" stroke={unlocked ? `hsl(${hue}, 70%, 60%)` : "#555"} strokeWidth="8" strokeLinecap="round" />
              <rect x="20" y="65" width="80" height="70" rx="8" fill="#2a2a3a"
                stroke={unlocked ? `hsl(${hue}, 60%, 50%)` : "#3a3a4a"} strokeWidth="3" />
              <circle cx="60" cy="95" r="8" fill={unlocked ? `hsl(${hue}, 70%, 60%)` : "#555"} />
              <rect x="57" y="95" width="6" height="15" rx="3" fill={unlocked ? `hsl(${hue}, 70%, 60%)` : "#555"} />
            </svg>
          </div>

          {/* Password form */}
          <div ref={formRef} className="share-form-card" style={{
            borderColor: `hsla(${hue}, 60%, 50%, 0.3)`,
            boxShadow: `0 0 40px hsla(${hue}, 70%, 50%, 0.1)`,
          }}>
            <h3 className="share-form-title">{shareInfo.title || "受保护的分享"}</h3>
            <p className="share-form-hint">请输入访问密码查看内容</p>
            <input
              type="password"
              className="share-input"
              placeholder="访问密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadContent(password)}
              style={{ "--focus-hue": hue } as React.CSSProperties}
            />
            <button className="share-btn" onClick={() => loadContent(password)}
              style={{ background: `hsl(${hue}, 60%, 45%)` }}>
              验证
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="share-dark-page" style={{ "--shade-hue": String(hue) } as React.CSSProperties}>
      <div ref={contentRef} className="share-content" style={{ opacity: 0 }}>
        <h2 className="share-content-title">{shareInfo.title || "分享内容"}</h2>
        <div className="share-content-card" style={{
          borderColor: `hsla(${hue}, 60%, 50%, 0.2)`,
          boxShadow: `0 0 30px hsla(${hue}, 70%, 50%, 0.08)`,
        }}>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#ccc" }}>
            {JSON.stringify(content.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
