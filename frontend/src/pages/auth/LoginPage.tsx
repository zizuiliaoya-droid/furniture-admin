import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import gsap from "gsap";
import useAuthStore from "../../store/authStore";
import "./LoginPage.css";

function randomHue() {
  return Math.floor(Math.random() * 360);
}

export default function LoginPage() {
  const [isOn, setIsOn] = useState(false);
  const [hue, setHue] = useState(45);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const ropeRef = useRef<SVGLineElement>(null);
  const pullRef = useRef<SVGCircleElement>(null);
  const pullDotRef = useRef<SVGCircleElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const isOnRef = useRef(false);

  const toggleLamp = useCallback(() => {
    const newOn = !isOnRef.current;
    const newHue = randomHue();
    isOnRef.current = newOn;
    setHue(newHue);
    setIsOn(newOn);

    // Direct DOM updates for instant visual feedback (no React re-render wait)
    if (pageRef.current) {
      pageRef.current.style.setProperty("--on", newOn ? "1" : "0");
      pageRef.current.style.setProperty("--shade-hue", String(newHue));
    }
  }, []);

  // Rope drag — pure DOM manipulation, zero React state during drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    (e.target as Element).setPointerCapture(e.pointerId);
    if (pullRef.current) pullRef.current.style.fill = "#999";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = Math.min(Math.max(e.clientY - dragStartY.current, 0), 80);
    // Direct attribute manipulation — bypasses React entirely
    const rope = ropeRef.current;
    const pull = pullRef.current;
    const dot = pullDotRef.current;
    if (rope) rope.setAttribute("y2", String(200 + dy));
    if (pull) pull.setAttribute("cy", String(200 + dy));
    if (dot) dot.setAttribute("cy", String(200 + dy));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (pullRef.current) pullRef.current.style.fill = "#666";
    const dy = e.clientY - dragStartY.current;

    // Elastic spring-back with GSAP — targets DOM directly
    const targets = [ropeRef.current, pullRef.current, pullDotRef.current].filter(Boolean);
    targets.forEach((el) => {
      if (!el) return;
      const attr = el.tagName === "line" ? "y2" : "cy";
      gsap.to(el, {
        attr: { [attr]: 200 },
        duration: 0.5,
        ease: "elastic.out(1.2, 0.35)",
        overwrite: true,
      });
    });

    if (dy > 50) toggleLamp();
  }, [toggleLamp]);

  // Form animation
  useEffect(() => {
    if (!formRef.current) return;
    if (isOn) {
      gsap.to(formRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.7)",
        clearProps: "pointerEvents",
      });
    } else {
      gsap.to(formRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (formRef.current) formRef.current.style.pointerEvents = "none";
        },
      });
    }
  }, [isOn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      message.error("请输入账号和密码");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      message.success("登录成功");
      navigate("/");
    } catch {
      message.error("账号或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="lamp-login-page"
      style={{ "--on": isOn ? "1" : "0", "--shade-hue": String(hue) } as React.CSSProperties}
    >
      <div className="lamp-login-container">
        {/* Desk Lamp SVG */}
        <div className="lamp-wrapper">
          <svg viewBox="0 0 300 400" className="lamp-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="150" cy="370" rx="60" ry="12" fill="#2a2a3a" />
            <rect x="140" y="250" width="20" height="120" rx="4" fill="#3a3a4a" />
            <line x1="150" y1="250" x2="150" y2="120" stroke="#4a4a5a" strokeWidth="6" strokeLinecap="round" />
            <path d="M 90 120 Q 150 80 210 120 L 200 130 Q 150 100 100 130 Z" fill="#3a3a4a" />

            {/* Light glow — CSS transition handles color change */}
            <ellipse cx="150" cy="135" rx="50" ry="15" className="lamp-glow"
              style={{ fill: `hsla(${hue}, 80%, 60%, ${isOn ? 0.6 : 0})` }} />
            <ellipse cx="150" cy="200" rx="80" ry="60" className="lamp-cone"
              style={{ fill: `hsla(${hue}, 70%, 50%, ${isOn ? 0.08 : 0})` }} />

            {/* Eyes */}
            <g className={`lamp-eyes ${isOn ? "lamp-eyes-on" : "lamp-eyes-off"}`}>
              <circle cx="138" cy="108" r="5" fill={isOn ? `hsl(${hue}, 80%, 70%)` : "#555"} />
              <circle cx="162" cy="108" r="5" fill={isOn ? `hsl(${hue}, 80%, 70%)` : "#555"} />
              <circle cx="139" cy="106" r="2" fill="#fff" opacity={isOn ? 1 : 0.3} />
              <circle cx="163" cy="106" r="2" fill="#fff" opacity={isOn ? 1 : 0.3} />
            </g>

            {/* Pull rope — touch-action:none for smooth pointer events */}
            <line ref={ropeRef} x1="150" y1="130" x2="150" y2="200"
              stroke="#888" strokeWidth="2" strokeDasharray="4 2" />
            <circle ref={pullRef} cx="150" cy="200" r="10" fill="#666" stroke="#888" strokeWidth="2"
              className="lamp-pull" style={{ touchAction: "none", cursor: "grab" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp} />
            <circle ref={pullDotRef} cx="150" cy="200" r="3" fill="#aaa" style={{ pointerEvents: "none" }} />
          </svg>
          <p className="lamp-hint">↓ 拖拽拉绳开灯</p>
        </div>

        {/* Login Form */}
        <div ref={formRef} className="login-form-wrapper" style={{ opacity: 0, transform: "scale(0.85)", pointerEvents: "none" }}>
          <form className="login-form" onSubmit={handleLogin} style={{
            borderColor: `hsla(${hue}, 60%, 50%, 0.4)`,
            boxShadow: `0 0 40px hsla(${hue}, 70%, 50%, 0.15), 0 0 80px hsla(${hue}, 70%, 50%, 0.05)`,
          }}>
            <h2 className="login-title">欢迎回来</h2>
            <div className="input-group">
              <input type="text" placeholder="账号" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input" style={{ "--focus-hue": hue } as React.CSSProperties} />
            </div>
            <div className="input-group">
              <input type="password" placeholder="密码" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input" style={{ "--focus-hue": hue } as React.CSSProperties} />
            </div>
            <button type="submit" className="login-btn" disabled={loading}
              style={{ background: `hsl(${hue}, 60%, 45%)` }}>
              {loading ? "登录中..." : "登录"}
            </button>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>忘记密码？</a>
          </form>
        </div>
      </div>
    </div>
  );
}
