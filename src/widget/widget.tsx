import { menu } from './menu'
import { hsvaToHex, RgbaColor, rgbaToHsva } from '../utils/convert'
import { svgSrc, svgSrc2 } from './svg'

const { widget } = figma
const {
  useEffect,
  SVG,
  AutoLayout,
  waitForTask,
  usePropertyMenu,
  useSyncedState,
  Text,
  Ellipse,
  Input,
} = widget
const h = figma.widget.h

function Widget() {
  const [styleName, setStyleName] = useSyncedState('styleName', '')
  const [hue, setHue] = useSyncedState('hue', 0)
  const [color, setColor] = useSyncedState('color', {
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  })

  const [pointerPostion, setPointerPostion] = useSyncedState('pointerPostion', {
    x: 0,
    y: 0,
  })

  const [backgroundColor, setBackgroundColor] = useSyncedState(
    'backgroundColor',
    ''
  )

  function updateWidgetColor(color: RgbaColor) {
    const hsva = rgbaToHsva(color)
    setColor(color)

    setPointerPostion({
      x: hsva.s / 100,
      y: 1 - hsva.v / 100,
    })

    const bg = hsvaToHex({ h: hsva.h, s: 100, v: 100, a: 1 })

    setBackgroundColor(bg)

    setHue(hsva.h)
  }

  function updateLocalPaintStyle(name: string, color: RgbaColor) {
    const styles = figma.getLocalPaintStyles()

    styles.forEach((style: PaintStyle) => {
      if (name === style.name) {
        style.paints = [
          {
            type: 'SOLID',
            color: {
              r: color.r / 255,
              g: color.g / 255,
              b: color.b / 255,
            },
            opacity: color.a,
          },
        ]
      }
    })
  }

  useEffect(() => {
    figma.ui.onmessage = (message) => {
      if (message.type === 'update color value') {
        const color = message.color
        updateWidgetColor(color)
        updateLocalPaintStyle(styleName, color)
      } else if (message.type === 'get current widget color') {
        figma.ui.postMessage({
          messageId: message.messageId,
          color,
        })
      }
    }
  })

  const onMenuChange: (
    event: WidgetPropertyEvent
  ) => void | Promise<void> = async (event) => {
    if (event.propertyName === 'open') {
      return new Promise(() => {
        figma.showUI(__html__, {
          width: 240,
          height: 240,
        })
      })
    } else if (event.propertyName === 'update') {
      return new Promise((resolve) => {
        updateBindStyleWidgetColor()
        resolve()
      })
    }

    return
  }

  function updateBindStyleWidgetColor(name = '') {
    const styles = figma.getLocalPaintStyles()

    styles.forEach((style: PaintStyle) => {
      if (style.name === styleName || name === style.name) {
        style.paints.forEach((fill: Paint) => {
          if (fill.type === 'SOLID') {
            const { r = 0, g = 0, b = 0 } = fill.color
            const { opacity = 1 } = fill
            const rgba = {
              r: r * 255,
              g: g * 255,
              b: b * 255,
              a: opacity,
            }

            updateWidgetColor(rgba)
          }
        })
      }
    })
  }

  usePropertyMenu(menu, onMenuChange)

  return h(
    AutoLayout,
    {
      direction: 'vertical',
      spacing: 6,
    },
    h(
      AutoLayout,
      {
        spacing: 6,
        padding: 6,
      },
      h(Text, {}, 'Style: '),
      h(Input, {
        value: styleName,
        placeholder: 'input style name',
        onTextEditEnd: (e: any) => {
          const styleName = e.characters
          setStyleName(styleName)

          waitForTask(
            new Promise((resolve) => {
              updateBindStyleWidgetColor(styleName)
              resolve(true)
            })
          )
        },
        inputBehavior: 'wrap',
      })
    ),
    h(
      AutoLayout,
      {
        direction: 'vertical',
        spacing: 6,
      },
      h(
        AutoLayout,
        {
          fill: backgroundColor,
        },
        h(SVG, {
          src: svgSrc,
          width: 256,
          height: 256,
        }),
        h(Ellipse, {
          width: 16,
          height: 16,
          positioning: 'absolute',
          x: pointerPostion.x * 256 - 8,
          y: pointerPostion.y * 256 - 8,
          stroke: '#ffffff',
          strokeWidth: 2,
        })
      ),
      h(
        AutoLayout,
        {},
        h(SVG, {
          src: svgSrc2,
          width: 256,
          height: 20,
        }),
        h(Ellipse, {
          width: 16,
          height: 16,
          positioning: 'absolute',
          x: (hue / 360) * 256 - 8,
          y: 2,
          fill: backgroundColor,
          stroke: '#ffffff',
          strokeWidth: 2,
        })
      ),
      h(
        Text,
        {},
        'R:' +
          color.r.toFixed(0) +
          ' G:' +
          color.g.toFixed(0) +
          ' B:' +
          color.b.toFixed(0) +
          ' A:' +
          color.a.toFixed(2)
      ),
      h(Text, {}, hsvaToHex(rgbaToHsva(color)))
    )

    // h(SVG, {
    //   src: `
    //   <svg width="263" height="21" viewBox="0 0 263 21" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    //   <rect y="0.229721" width="262.144" height="20" fill="url(#pattern0)"/>
    //   <defs>
    //   <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
    //   <use xlink:href="#image0_31_598" transform="translate(0 -0.0119993) scale(0.00195312 0.0256)"/>
    //   </pattern>
    //   <image id="image0_31_598" width="512" height="40" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAAoCAYAAACIGEKIAAABdWlDQ1BrQ0dDb2xvclNwYWNlRGlzcGxheVAzAAAokXWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QcXKWq8UwZBywAAAFxlWElmTU0AKgAAAAgABAEGAAMAAAABAAIAAAESAAMAAAABAAEAAAEoAAMAAAABAAIAAIdpAAQAAAABAAAAPgAAAAAAAqACAAQAAAABAAACAKADAAQAAAABAAAAKAAAAABl79/iAAACC2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KlqhK0AAAB2hJREFUeAHtnXFKHE0QxWcl5xDiRVzi398VRPEeLslFInqOiF5EwYv4+YTATM1rqCKbzs7Or0F0JjX9pn5d09PEZ+9mGIb/Pr4m7efPn8PV1dXk3MPDw3B5eTk5p4P39/fZuevr6+Hu7m5yXv2p39g2m008NTw9PQ3n5+eT8xX9i4uL4fHxcXL9Ieq/vr4OZ2dnk/vUQTb/r1+/Di8vL7Prs/n31P/+/ftwe3s7udeK/o8fP4bdbje5vpL/kvQ1pspt3Cr5q6bEdtwq+ffSf35+Hrbb7fg2P3/O6muO0LMSWzb/nvpuTq3ouzm1kn9PfTenV/Sz75RW/r30K+8Ul3/lnebGfx/6J/Hh4RgCEIAABCAAgeMnwALg+MeYDCEAAQhAAAIzAiwAZkg4AQEIQAACEDh+AiwAjn+MyRACEIAABCAwI7C5v7+fmQBlIIomIpmSojFJvUWznc65WNenYr99+6Zvk5btUxe5WNcn+vMxFT/HyjF1Ywp/6s/Viqsp9/xVasrFuj5bNe1iXZ+tmnaxrk/0/ZziWDmm8PdzimPlmFbrb/PhuJwtAP6W4zD7VwRZF7uSdY7PrIte1zvHaS99DepSXPzOcaoCzP4VQ8XF7vhXXOxu/Jekn3Wxt/hnXfSt+uul33JxZ/UrLno3/j313Zxa0Xcu8kr+PfXdnFrRd3N6Jf9e+ofg4s++Ux1/zen8CkCrABoEIAABCEBgZQRYAKxswEkXAhCAAAQgIAIsAKgDCEAAAhCAwAoJHKQJ0JkbnAlC4+VMSC7W9anrMSzNTZiOlWMK/79Tf9mabvHP1nSr/tGf7iIqTpX6h39uTll6/bl5spWTi63UlIt1fVb1tQ/vzAToDBc9DQ/OxFXRdyYyZ2ITLGc46aWvAcya6Fz+KoqlmAjXZOJz9VfJfykmvlb9HaOJ709NhG5OPVQTn6s/ZyJrmRjdnFrJv5eJr8U/q195p7j83Zyud1JPfX4FIOI0CEAAAhCAwMoIsABY2YCTLgQgAAEIQEAEWABQBxCAAAQgAIEVEmABsMJBJ2UIQAACEIDAiQwH8UvmCBk5xl9yBsc4HY9jfv8sc0iMlTP297+Pv8c4HctwM47RzxV9fe587PcQ9WUWi/dZyf/Xr18zTmKVzb+nvh61OKYVfV0fWVXyX5K+uERWlfzFJbKq5N9Lf7fbze5T953Vl7EyctJxNv+e+m5Orei7ObWSf0/9WHs6rui7Ma3k30u/8k5x+VfeaS7/fejzPwCaGWkQgAAEIACBlRFgAbCyASddCEAAAhCAgAiwAKAOIAABCEAAAiskwAJghYNOyhCAAAQgAIHNx25Gs50AtcOXvsZtH9sOxj7Vv9t2VOaG2Cr6rk+XE/rwd7VC/fV5/irPtIutPNMu1vWpOSE7/q7P1pziYtF/HcQgNvjnnj9XU9X6YyvgD9dwbGwF/DTIdTpubttKFWB2K+LKVriOv9uK9Vj13VaslfyzW/Fq8nVbUffSlzN6u92Oy+zz56y+alS1Els2/576bivYin5lK16Xf099ufhjq+jLxR9bJf9e+mwFHEeJYwhAAAIQgAAEFkHgZBF3yU1CAAIQgAAEILBXAiwA9oqTziAAAQhAAALLIHCQJkBnbsAwg2FmLYahrAlKU4yLdcZG90zpehfr+qw8f65P9OfGavgvu/4qNe1iK8+Ui3V9tmrKxarPzYfhYvZXAM5w0dPwoK1A4yRS0XcmMmdiEyxnOOmlr0HJmuhc/hpAZ+LK5t9Tv2Jic/zXZCJ0Jq5K/lkTXWv8e+kvycTn+B+ric+N/zGa+Fr1lzURVt4p//qd2tLnVwBaBdAgAAEIQAACKyPAAmBlA066EIAABCAAARFgAUAdQAACEIAABFZIgAXACgedlCEAAQhAAAInMjzEL5kj4mcqyxkc43Qc43Qsc0yMlanPxcY4HWc/z76lL8NZ7PcQ9SufZ+/4yyznmGbz76mvRy3ea0Vf18cxreS/JP3s59m38tf5yKqSfy99Gevifeo4q7/b7WY1pRrL5t9T382pFX03p1by76nvxrSiH+cJHVfy76Vfeae4/N2crnvP5r8Pff4HQDMjDQIQgAAEILAyAiwAVjbgpAsBCEAAAhAQARYA1AEEIAABCEBghQRYAKxw0EkZAhCAAAQg8MV9nKbb4Uq7hrlY93GeMjfE2Le3N/vRnzFOQ3J3dzfI4DJuFf2bm5tPI+H4evT/LX9XUxqf7Pi7mtL12+1W3ybNjf+S9GXi1C6P41bJX+ay09PT8eWfJirHyvHvpd96prP6rWc6mz/6fk7/U/6uptzz1+Lv6tTVf2v80X+aPPs6aPH/IndibHoB64Jx02C52Bina7RtbYzVtokuNsbpehVgjK3oawKI/R6ifiunbP56SURO4pfNv6e+7jPea0VfE0Ac00r+S9LXtp1uAZDNX9u2iu24VfLvpa/7iznpXFbf5aTrs/krtpe+m1Mr+m5OreTfU98xregrr9gq+ffSr7xTXP6t+S+b/z70+RVArDSOIQABCEAAAisg8D9e049tFSzYRwAAAABJRU5ErkJggg=="/>
    //   </defs>
    //   </svg>
    //   `,
    //   width: 256,
    //   height: 20,
    // })
  )
}

widget.register(Widget)

export default Widget
