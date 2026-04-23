import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./EmptyState.css";

interface Props {
  type: "product" | "case" | "document" | "quote" | "image";
  onAction?: () => void;
  actionText?: string;
}

const svgMap: Record<string, JSX.Element> = {
  product: (
    <svg viewBox="0 0 120 120" className="empty-svg">
      <rect x="20" y="40" width="80" height="60" rx="4" fill="none" stroke="#ddd" strokeWidth="2" />
      <line x1="20" y1="60" x2="100" y2="60" stroke="#ddd" strokeWidth="2" />
      <line x1="60" y1="60" x2="60" y2="100" stroke="#ddd" strokeWidth="2" />
      <rect x="35" y="30" width="50" height="10" rx="2" fill="none" stroke="#ddd" strokeWidth="2" />
    </svg>
  ),
  case: (
    <svg viewBox="0 0 120 120" className="empty-svg">
      <rect x="25" y="25" width="70" height="70" rx="4" fill="none" stroke="#ddd" strokeWidth="2" />
      <rect x="30" y="30" width="60" height="60" rx="2" fill="none" stroke="#eee" strokeWidth="1" />
      <circle cx="60" cy="55" r="12" fill="none" stroke="#ddd" strokeWidth="2" />
      <line x1="40" y1="75" x2="80" y2="75" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 120 120" className="empty-svg">
      <path d="M 35 20 L 75 20 L 90 35 L 90 100 L 35 100 Z" fill="none" stroke="#ddd" strokeWidth="2" />
      <path d="M 75 20 L 75 35 L 90 35" fill="none" stroke="#ddd" strokeWidth="2" />
      <line x1="45" y1="50" x2="80" y2="50" stroke="#eee" strokeWidth="2" />
      <line x1="45" y1="62" x2="75" y2="62" stroke="#eee" strokeWidth="2" />
      <line x1="45" y1="74" x2="70" y2="74" stroke="#eee" strokeWidth="2" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 120 120" className="empty-svg">
      <rect x="25" y="20" width="70" height="80" rx="4" fill="none" stroke="#ddd" strokeWidth="2" />
      <line x1="35" y1="40" x2="85" y2="40" stroke="#eee" strokeWidth="2" />
      <line x1="35" y1="55" x2="85" y2="55" stroke="#eee" strokeWidth="1" />
      <line x1="35" y1="65" x2="85" y2="65" stroke="#eee" strokeWidth="1" />
      <line x1="55" y1="80" x2="85" y2="80" stroke="#ddd" strokeWidth="2" />
      <text x="60" y="34" fontSize="10" fill="#ccc" fontFamily="JetBrains Mono">¥</text>
    </svg>
  ),
  image: (
    <svg viewBox="0 0 120 120" className="empty-svg">
      <rect x="20" y="30" width="80" height="60" rx="4" fill="none" stroke="#ddd" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx="45" cy="52" r="8" fill="none" stroke="#ddd" strokeWidth="2" />
      <polyline points="20,80 45,60 65,75 80,62 100,80" fill="none" stroke="#ddd" strokeWidth="2" />
      <path d="M 55 40 L 60 30 L 65 40" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="30" x2="60" y2="25" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const labelMap: Record<string, string> = {
  product: "还没有产品",
  case: "还没有案例",
  document: "还没有文档",
  quote: "还没有报价单",
  image: "还没有图片",
};

export default function EmptyState({ type, onAction, actionText }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-svg-wrapper">{svgMap[type]}</div>
      <p className="empty-label">{labelMap[type]}</p>
      {onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionText || "立即创建"}
        </Button>
      )}
    </div>
  );
}
