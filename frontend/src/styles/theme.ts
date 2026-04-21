import type { ThemeConfig } from "antd";

export const colors = {
  primary: "#000000",
  white: "#FFFFFF",
  bgBase: "#FAFAF8",
  accentRed: "#E63946",
  accentBlue: "#1D3557",
  accentYellow: "#F4A261",
  gray50: "#F8F9FA",
  gray200: "#E9ECEF",
  gray500: "#6C757D",
  gray800: "#343A40",
};

export const shadows = {
  level1: "0 2px 20px rgba(0, 0, 0, 0.04)",
  level2: "0 4px 30px rgba(0, 0, 0, 0.06)",
  level3: "0 8px 40px rgba(0, 0, 0, 0.08)",
};

export const bauhausTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorBgBase: colors.bgBase,
    colorLink: colors.accentBlue,
    borderRadius: 4,
    fontFamily:
      '"DM Sans", "Inter", "Noto Sans SC", -apple-system, sans-serif',
    boxShadow: shadows.level1,
    boxShadowSecondary: shadows.level2,
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 38,
    },
    Card: {
      borderRadius: 4,
      boxShadow: shadows.level1,
    },
    Menu: {
      itemBorderRadius: 4,
    },
    Input: {
      borderRadius: 4,
    },
    Table: {
      borderRadius: 4,
    },
    Modal: {
      borderRadius: 4,
    },
  },
};
