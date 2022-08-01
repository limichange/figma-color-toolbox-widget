import {
  hsvaToHex,
  hsvaToHslaString,
  hsvaToHsvaString,
  hsvaToRgbaString,
  RgbaColor,
  rgbaToHsva,
} from '../utils/convert'
import { colorPickerSvg } from './images/colorPicker'
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
  const [colorFormat, setColorFormat] = useSyncedState('colorFormat', 'Hex')

  const formatOptions = [
    { option: 'Hex', label: 'Hex' },
    { option: 'RGB', label: 'RGB' },
    { option: 'HSL', label: 'HSL' },
    { option: 'HSV', label: 'HSV' },
  ]

  const menu: WidgetPropertyMenuItem[] = [
    {
      itemType: 'action',
      tooltip: 'Open Color Picker',
      propertyName: 'open',
      icon: colorPickerSvg,
    },
    {
      itemType: 'action',
      tooltip: 'Update Color',
      propertyName: 'update',
    },
    {
      itemType: 'dropdown',
      propertyName: 'update color format',
      tooltip: 'Format',
      selectedOption: colorFormat,
      options: formatOptions,
    },
  ]

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
    } else if (
      event.propertyName === 'update color format' &&
      event.propertyValue
    ) {
      setColorFormat(event.propertyValue)
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
      colorFormat === 'RGB' && h(Text, {}, hsvaToRgbaString(rgbaToHsva(color))),
      colorFormat === 'Hex' && h(Text, {}, hsvaToHex(rgbaToHsva(color))),
      colorFormat === 'HSL' && h(Text, {}, hsvaToHslaString(rgbaToHsva(color))),
      colorFormat === 'HSV' && h(Text, {}, hsvaToHsvaString(rgbaToHsva(color)))
    )
  )
}

widget.register(Widget)

export default Widget
