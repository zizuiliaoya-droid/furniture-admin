import type { ThemeConfig } from "antd";

/**
 * Design tokens based on UI Pro Max search results:
 * - Color: Architecture/Interior palette (black + gold accent)
 * - Home Decoration palette (warm grey + amber accent)
 * - Typography: Poppins (heading) + Open Sans (body) + Noto Sans SC (CJK)
 */
export const colors = {
  // Architecture/Interior palette
  primary: "#171717",
  onPrimary: "#FFFFFF",
  secondary: "#404040",
  accent: "#A16207",        // Gold accent (WCAG 3:1 adjusted)
  accentWarm: "#D97706",    // Warm amber from Home Decoration palette
  background: "#FAF5F2",    // Warm off-white
  foreground: "#0F172A",
  card: "#FFFFFF",
  cardForeground: "#0F172A",
  muted: "#F6F6F6",
  mutedForeground: "#64748B",
  border: "#EEEDED",
  destructive: "#DC2626",
  ring: "#171717",
  // Status colors from Sales Intelligence
  success: "#22C55E",
  warning: "#D97706",
  info: "#3B82F6",
};

export const shadows = {
  level1: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
  level2: "0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
  level3: "0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
};

export const bauhausTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorBgBase: colors.background,
    colorLink: colors.accent,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.destructive,
    colorInfo: colors.info,
    borderRadius: 8,
    fontFamily: '"Open Sans", "Noto Sans SC", -apple-system, sans-serif',
    boxShadow: shadows.level1,
    boxShadowSecondary: shadows.level2,
    colorBorder: colors.border,
    colorTextSecondary: colors.mutedForeground,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      primaryShadow: "0 2px 8px rgba(23, 23, 23, 0.15)",
    },
    Card: {
      borderRadius: 12,
      boxShadow: shadows.level1,
    },
    Menu: {
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 8,
      headerBg: colors.muted,
    },
    Modal: {
      borderRadius: 12,
    },
    Tag: {
      borderRadius: 6,
    },
  },
};
