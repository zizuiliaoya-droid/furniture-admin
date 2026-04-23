import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tweenCtx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Kill all previous animations immediately
    if (tweenCtx.current) {
      tweenCtx.current.revert();
    }

    // Reset all children to visible (in case previous animation was mid-flight)
    el.style.opacity = "1";
    el.style.transform = "none";

    tweenCtx.current = gsap.context(() => {
      // Container fade in — short and snappy
      gsap.fromTo(el,
        { opacity: 0.4, y: 6 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );

      // Stagger children — use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const targets = el.querySelectorAll(
          "h2, .ant-card, .ant-table-wrapper, .stat-card, .dashboard-greeting"
        );
        // Only animate if there are targets and limit to 12
        const items = Array.from(targets).slice(0, 12);
        if (items.length > 0) {
          gsap.fromTo(items,
            { opacity: 0, y: 10 },
            {
              opacity: 1, y: 0,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.04,
              delay: 0.05,
              clearProps: "all",
            }
          );
        }
      });
    }, el);

    return () => {
      if (tweenCtx.current) {
        tweenCtx.current.revert();
        tweenCtx.current = null;
      }
    };
  }, [location.pathname]);

  // Modal / Dropdown / Message animations (unchanged)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const modal = node.querySelector?.(".ant-modal");
          if (modal) {
            gsap.fromTo(modal, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });
          }
          const dropdown = node.querySelector?.(".ant-dropdown");
          if (dropdown) {
            gsap.fromTo(dropdown, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
          }
          const msg = node.querySelector?.(".ant-message-notice");
          if (msg) {
            gsap.fromTo(msg, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
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
