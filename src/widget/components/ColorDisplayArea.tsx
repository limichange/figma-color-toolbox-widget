const { widget } = figma

const { h } = widget

const { Rectangle } = widget

export interface ColorDisplayAreaProps {
  fill: string
}

export const ColorDisplayArea: FunctionalWidget<ColorDisplayAreaProps> = (
  props
) => {
  return h(Rectangle, {
    name: 'color',
    width: 240,
    height: 120,
    ...props,
  })
}
