import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

/**
 * 全局动效增强器 — 轻量版
 * 
 * 设计原则：
 * - 绝不动容器的 opacity（避免整页闪烁）
 * - 只对弹出层（Modal/Dropdown/Message）做入场动画
 * - 页面内容的过渡交给 CSS animation，不用 GSAP
 */
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // 给 body 加一个 data 属性，CSS 可以用它触发动画
  useEffect(() => {
    document.body.setAttribute("data-page-key", location.pathname);
  }, [location.pathname]);

  // 弹出层动画（这些是新增 DOM 节点，不会闪）
  useEffect(() => {
    const obs = new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        const modal = n.querySelector?.(".ant-modal");
        if (modal) gsap.fromTo(modal, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });
        const dd = n.querySelector?.(".ant-dropdown");
        if (dd) gsap.fromTo(dd, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
        const msg = n.querySelector?.(".ant-message-notice");
        if (msg) gsap.fromTo(msg, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "back.out(1.7)" });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return <>{children}</>;
}
