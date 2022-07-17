import { useState } from 'react'
import { RgbaColorPicker } from 'react-colorful'
import { postMessage } from './postMessage'
import './app.css'

export const App = () => {
  const [color, setColor] = useState({
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <RgbaColorPicker
        color={color}
        onChange={(color) => {
          setColor(color)
          postMessage({
            type: 'update color value',
            color,
          })
        }}
      />
    </div>
  )
}

export default App
