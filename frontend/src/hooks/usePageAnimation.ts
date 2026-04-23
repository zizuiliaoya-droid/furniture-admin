import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * 页面入场动画 hook
 * 自动为页面容器内的子元素添加交错入场动画
 */
export function usePageAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 页面容器淡入
    gsap.fromTo(el, { opacity: 0, y: 12 }, {
      opacity: 1, y: 0, duration: 0.4, ease: "power2.out",
    });

    // 子卡片/区块交错入场
    const children = el.querySelectorAll(
      ".ant-card, .ant-table-wrapper, .stat-card, h2, .dashboard-greeting"
    );
    if (children.length > 0) {
      gsap.fromTo(children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, delay: 0.1 }
      );
    }
  }, []);

  return containerRef;
}

/**
 * 列表项交错入场
 * 用于表格数据加载完成后的行动画
 */
export function useListAnimation(deps: any[]) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const rows = el.querySelectorAll(".ant-table-tbody > tr, .ant-card");
    if (rows.length > 0) {
      gsap.fromTo(rows,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 }
      );
    }
  }, deps);

  return listRef;
}

/**
 * 数字跳动动画
 * 用于仪表盘数据卡片的数字从 0 跳到目标值
 */
export function animateNumber(
  el: HTMLElement,
  target: number,
  duration = 0.8
) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toLocaleString();
    },
  });
}
