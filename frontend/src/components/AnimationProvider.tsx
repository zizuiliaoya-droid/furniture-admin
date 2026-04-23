import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

/**
 * 全局动效增强器
 * 每次路由切换时自动为内容区子元素添加交错入场动画
 */
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 整体容器淡入
    gsap.fromTo(el,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );

    // 扫描所有可动画的子元素，交错入场
    requestAnimationFrame(() => {
      const targets = el.querySelectorAll([
        "h2",
        ".dashboard-greeting",
        ".ant-card",
        ".ant-table-wrapper",
        ".stat-card",
        ".ant-space",
        ".ant-tree",
        ".ant-tabs",
        ".ant-form",
        ".ant-descriptions",
        ".ant-row",
        ":scope > div > div", // 直接子容器
      ].join(", "));

      // 去重 + 只取前 20 个（性能保护）
      const unique = Array.from(new Set(targets)).slice(0, 20);

      if (unique.length > 0) {
        gsap.fromTo(unique,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.05,
            delay: 0.08,
            clearProps: "transform",  // 动画结束后清除 transform，避免影响布局
          }
        );
      }
    });

    isFirstRender.current = false;
  }, [location.pathname]);

  // 全局：Modal / Dropdown / Message 弹出动画
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          const modal = node.querySelector?.(".ant-modal");
          if (modal) {
            gsap.fromTo(modal,
              { scale: 0.92, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }
            );
          }

          const dropdown = node.querySelector?.(".ant-dropdown");
          if (dropdown) {
            gsap.fromTo(dropdown,
              { opacity: 0, y: -4 },
              { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
            );
          }

          const msg = node.querySelector?.(".ant-message-notice");
          if (msg) {
            gsap.fromTo(msg,
              { y: -16, opacity: 0, scale: 0.96 },
              { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: "100%" }}>
      {children}
    </div>
  );
}
