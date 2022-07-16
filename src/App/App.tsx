import { useState } from 'react'
import { RgbaColorPicker } from 'react-colorful'

export const App = () => {
  const [color, setColor] = useState({
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  })

  return (
    <div>
      <RgbaColorPicker color={color} onChange={setColor} />
    </div>
  )
}

export default App
