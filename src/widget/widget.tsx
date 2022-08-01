import { hsvaToHex, RgbaColor, rgbaToHsva } from '../utils/convert'
import { colorPickerIcon } from './images/colorPickerIcon'
import { horizontalSmallLayoutIcon } from './images/horizontalSmallLayoutIcon'
import { updateIcon } from './images/updateIcon'
import { verticalLargeLayoutIcon } from './images/verticalLargeLayoutIcon'
import { verticalSmallLayoutIcon } from './images/verticalSmallLayoutIcon'

const { widget } = figma
const {
  useEffect,
  AutoLayout,
  // waitForTask,
  usePropertyMenu,
  useSyncedState,
  // Text,
  // Input,
  Rectangle,
} = widget
const h = figma.widget.h

function Widget() {
  const [styleName] = useSyncedState('styleName', 'test')
  const [, setHue] = useSyncedState('hue', 0)
  const [color, setColor] = useSyncedState('color', {
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  })

  const [backgroundColor, setBackgroundColor] = useSyncedState(
    'backgroundColor',
    ''
  )

  const menu: WidgetPropertyMenuItem[] = [
    {
      itemType: 'action',
      tooltip: 'Open Color Picker',
      propertyName: 'open',
      icon: colorPickerIcon,
    },
    {
      itemType: 'separator',
    },
    {
      itemType: 'action',
      tooltip: 'Vertical Layout',
      propertyName: 'update',
      icon: verticalSmallLayoutIcon,
    },
    {
      itemType: 'action',
      tooltip: 'Horizontal Layout',
      propertyName: 'update',
      icon: horizontalSmallLayoutIcon,
    },
    {
      itemType: 'action',
      tooltip: 'Vertical Large Layout',
      propertyName: 'update',
      icon: verticalLargeLayoutIcon,
    },
    {
      itemType: 'separator',
    },
    {
      itemType: 'action',
      tooltip: 'Update Color',
      propertyName: 'update',
      icon: updateIcon,
    },
  ]

  function updateWidgetColor(color: RgbaColor) {
    const hsva = rgbaToHsva(color)
    setColor(color)

    setBackgroundColor(hsvaToHex(hsva))

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

  console.log(backgroundColor)

  return h(
    AutoLayout,
    {
      direction: 'vertical',
      spacing: 6,
    },
    // h(
    //   AutoLayout,
    //   {
    //     spacing: 6,
    //     padding: 6,
    //   },
    //   h(Text, {}, 'Style: '),
    //   h(Input, {
    //     value: styleName,
    //     placeholder: 'input style name',
    //     onTextEditEnd: (e: any) => {
    //       const styleName = e.characters
    //       setStyleName(styleName)

    //       waitForTask(
    //         new Promise((resolve) => {
    //           updateBindStyleWidgetColor(styleName)
    //           resolve(true)
    //         })
    //       )
    //     },
    //     inputBehavior: 'wrap',
    //   })
    // ),
    h(
      AutoLayout,
      {
        direction: 'vertical',
        spacing: 6,
      },
      // main color display area
      h(Rectangle, {
        name: 'color',
        fill: backgroundColor,
        width: 240,
        height: 120,
      })

      // colorFormat === 'RGB' && h(Text, {}, hsvaToRgbaString(rgbaToHsva(color))),
      // colorFormat === 'Hex' && h(Text, {}, hsvaToHex(rgbaToHsva(color))),
      // colorFormat === 'HSL' && h(Text, {}, hsvaToHslaString(rgbaToHsva(color))),
      // colorFormat === 'HSV' && h(Text, {}, hsvaToHsvaString(rgbaToHsva(color)))
    )
  )
}

widget.register(Widget)

export default Widget
