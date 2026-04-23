import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

const SAME_GROUP = [
  ["/documents/design", "/documents/training", "/documents/certificates"],
];

function isSameGroup(a: string, b: string) {
  return SAME_GROUP.some((g) => g.includes(a) && g.includes(b));
}

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const animatedEls = useRef<Element[]>([]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const from = prevPath.current;
    const to = location.pathname;
    prevPath.current = to;

    // Kill previous tweens on tracked elements, then force them visible
    if (animatedEls.current.length > 0) {
      animatedEls.current.forEach((target) => {
        gsap.killTweensOf(target);
        gsap.set(target, { clearProps: "all" });
      });
      animatedEls.current = [];
    }
    gsap.killTweensOf(el);
    gsap.set(el, { clearProps: "all" });

    // Same-group: no animation
    if (isSameGroup(from, to)) return;

    // Container quick fade
    gsap.fromTo(el,
      { opacity: 0.6 },
      { opacity: 1, duration: 0.2, ease: "power1.out" }
    );

    // Stagger lightweight elements only (no tables, no heavy stuff)
    requestAnimationFrame(() => {
      if (!wrapRef.current) return;
      const targets = wrapRef.current.querySelectorAll(
        ":scope > div > h2, :scope > h2, .stat-card, .dashboard-greeting, :scope > .ant-card"
      );
      const items = Array.from(targets).slice(0, 10);
      animatedEls.current = items;

      if (items.length > 0) {
        gsap.fromTo(items,
          { opacity: 0, y: 10 },
          {
            opacity: 1, y: 0,
            duration: 0.3, ease: "power2.out",
            stagger: 0.04,
            onComplete: () => {
              // Ensure everything is fully visible after animation
              items.forEach((t) => gsap.set(t, { clearProps: "all" }));
              animatedEls.current = [];
            },
          }
        );
      }
    });
  }, [location.pathname]);

  // Modal / Dropdown / Message
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

  return <div ref={wrapRef}>{children}</div>;
}
