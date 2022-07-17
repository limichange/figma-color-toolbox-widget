import { round } from './round'

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HsvColor {
  h: number
  s: number
  v: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export interface HslaColor extends HslColor {
  a: number
}

export interface HsvaColor extends HsvColor {
  a: number
}

export interface RgbaColor extends RgbColor {
  a: number
}

const format = (number: number) => {
  const hex = number.toString(16)
  return hex.length < 2 ? '0' + hex : hex
}

export const hsvaToHex = (hsva: HsvaColor): string =>
  rgbaToHex(hsvaToRgba(hsva))

export const hsvaToRgba = ({ h, s, v, a }: HsvaColor): RgbaColor => {
  h = (h / 360) * 6
  s = s / 100
  v = v / 100

  const hh = Math.floor(h),
    b = v * (1 - s),
    c = v * (1 - (h - hh) * s),
    d = v * (1 - (1 - h + hh) * s),
    module = hh % 6

  return {
    // @ts-ignore
    r: round([v, c, b, b, d, v][module] * 255),
    // @ts-ignore
    g: round([d, v, v, c, b, b][module] * 255),
    // @ts-ignore
    b: round([b, b, d, v, v, c][module] * 255),
    a: round(a, 2),
  }
}

export const rgbaToHex = ({ r, g, b }: RgbaColor): string => {
  return '#' + format(r) + format(g) + format(b)
}

export const hsvaToHslString = (hsva: HsvaColor): string => {
  const { h, s, l } = hsvaToHsla(hsva)
  return `hsl(${h}, ${s}%, ${l}%)`
}

export const hsvaToHsla = ({ h, s, v, a }: HsvaColor): HslaColor => {
  const hh = ((200 - s) * v) / 100

  return {
    h: round(h),
    s: round(
      hh > 0 && hh < 200
        ? ((s * v) / 100 / (hh <= 100 ? hh : 200 - hh)) * 100
        : 0
    ),
    l: round(hh / 2),
    a: round(a, 2),
  }
}

export const rgbaToHsva = ({ r, g, b, a }: RgbaColor): HsvaColor => {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)

  // prettier-ignore
  const hh = delta
    ? max === r
      ? (g - b) / delta
      : max === g
        ? 2 + (b - r) / delta
        : 4 + (r - g) / delta
    : 0;

  return {
    h: round(60 * (hh < 0 ? hh + 6 : hh)),
    s: round(max ? (delta / max) * 100 : 0),
    v: round((max / 255) * 100),
    a,
  }
}
