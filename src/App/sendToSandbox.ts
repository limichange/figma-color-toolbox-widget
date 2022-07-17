import { nanoid } from 'nanoid'

export function postMessage(pluginMessage: any) {
  const messageId = nanoid()

  parent.postMessage(
    {
      pluginMessage: {
        messageId,
        ...pluginMessage,
      },
    },
    '*'
  )

  return new Promise((resolve) => {
    const callback = (event: any) => {
      if (event.data.pluginMessage.messageId === messageId) {
        window.removeEventListener('message', callback)

        resolve(event.data.pluginMessage)
      }
    }

    window.addEventListener('message', callback)
  })
}
