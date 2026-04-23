import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

/**
 * 全局动效增强器
 * 放在 MainLayout 中，监听路由变化自动触发页面过渡
 * 同时为全局交互元素注入微动效
 */
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // 路由切换时的页面过渡
  useEffect(() => {
    // 内容区域淡入
    const content = document.querySelector(".ant-layout-content");
    if (content) {
      gsap.fromTo(content,
        { opacity: 0.6, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [location.pathname]);

  // 全局：为 Modal 打开添加弹簧动画
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Modal 弹出动画
            const modal = node.querySelector?.(".ant-modal");
            if (modal) {
              gsap.fromTo(modal,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.5)" }
              );
            }
            // Dropdown 弹出动画
            const dropdown = node.querySelector?.(".ant-dropdown");
            if (dropdown) {
              gsap.fromTo(dropdown,
                { opacity: 0, y: -4, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
              );
            }
            // Message 弹出动画
            const msg = node.querySelector?.(".ant-message-notice");
            if (msg) {
              gsap.fromTo(msg,
                { y: -20, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.7)" }
              );
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
