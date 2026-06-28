import { ImageResponse } from 'next/og'

export const alt = 'Zolarux — Buy Gadgets Online Without Fear'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '90px',
          background: 'linear-gradient(135deg, #2E4FBF 0%, #4064D7 55%, #5B7BE8 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 40,
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          🛡️ Verified vendors · Escrow-protected
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 96,
            fontWeight: 800,
            marginTop: 28,
            lineHeight: 1.05,
          }}
        >
          <span>Buy Gadgets Online</span>
          <span>Without Fear</span>
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 40, opacity: 0.95 }}>
          Zolarux
        </div>
      </div>
    ),
    { ...size },
  )
}
