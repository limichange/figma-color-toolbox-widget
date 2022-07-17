export const menu: WidgetPropertyMenuItem[] = [
  {
    itemType: 'action',
    tooltip: 'Open Color Picker',
    propertyName: 'open',
    icon: 'open',
  },
  {
    itemType: 'separator',
  },
  {
    itemType: 'action',
    tooltip: 'Update Color',
    propertyName: 'update',
  },
]

export const onMenuChange: (
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
      console.log('update')

      resolve()
    })
  }

  return
}
