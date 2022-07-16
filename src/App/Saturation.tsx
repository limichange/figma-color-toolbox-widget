import { FC, ReactNode } from 'react'

export interface SaturationProps {
  children?: ReactNode
}

export const Saturation: FC<SaturationProps> = (props) => {
  const { children } = props

  return (
    <div
      style={{
        width: 256,
        height: 256,
      }}>
      <div style={{ background: 'red', width: 256, height: 256 }}>
        <div
          style={{
            width: 256,
            height: 256,
            background: `linear-gradient(to right, #fff, rgba(255,255,255,0))`,
          }}>
          <div
            style={{
              width: 256,
              height: 256,
              background: `linear-gradient(to top, #000, rgba(0,0,0,0))`,
            }}></div>
        </div>
      </div>
      {children}
    </div>
  )
}
