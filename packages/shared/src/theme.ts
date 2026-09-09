import palette from "../colors.json";

/** React Native ActivityIndicator / StyleSheet için düz renkler */
export const colors = {
  brand: palette.brand.DEFAULT,
  brandHover: palette.brand.hover,
  brandSoft: palette.brand.soft,
  primary: palette.primary.DEFAULT,
  paper: palette.paper,
  surface: palette.surface,
  ink: palette.ink,
  navy: palette.navy.DEFAULT,
  navyMid: palette.navy.mid,
  rule: palette.rule.DEFAULT,
  success: palette.success.DEFAULT,
  danger: palette.danger.DEFAULT,
  media: palette.media.DEFAULT,
  svDark: palette.sv.dark,
} as const;

export { palette };
