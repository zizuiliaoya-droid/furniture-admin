import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

// 路由分组：同组内切换不触发入场动画
const ROUTE_GROUPS = [
  ["/documents/design", "/documents/training", "/documents/certificates"],
];

function isSameGroup(prev: string, next: string): boolean {
  return ROUTE_GROUPS.some((group) => group.includes(prev) && group.includes(next));
}

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const from = prevPath.current;
    const to = location.pathname;
    prevPath.current = to;

    // Kill any in-flight animations
    if (ctx.current) {
      ctx.current.revert();
      ctx.current = null;
    }

    // Same-group switch: skip animation entirely
    if (isSameGroup(from, to)) return;

    ctx.current = gsap.context(() => {
      // Only animate the container — no child stagger for tables
      gsap.fromTo(el,
        { opacity: 0.5 },
        { opacity: 1, duration: 0.2, ease: "power1.out", clearProps: "opacity" }
      );

      // Stagger only lightweight elements (skip table-wrapper to avoid layout thrash)
      requestAnimationFrame(() => {
        const targets = el.querySelectorAll("h2, .stat-card, .dashboard-greeting");
        const items = Array.from(targets).slice(0, 8);
        if (items.length > 0) {
          gsap.fromTo(items,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", stagger: 0.03, clearProps: "all" }
          );
        }
      });
    }, el);

    return () => {
      if (ctx.current) {
        ctx.current.revert();
        ctx.current = null;
      }
    };
  }, [location.pathname]);

  // Modal / Dropdown / Message pop-in
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const modal = node.querySelector?.(".ant-modal");
          if (modal) gsap.fromTo(modal, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });
          const dd = node.querySelector?.(".ant-dropdown");
          if (dd) gsap.fromTo(dd, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
          const msg = node.querySelector?.(".ant-message-notice");
          if (msg) gsap.fromTo(msg, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "back.out(1.7)" });
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
