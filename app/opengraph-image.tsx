import { ImageResponse } from 'next/og'

export const alt = 'Megh Foods | B2B Indian Grocery Exporter'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0B1B3F',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            MEGH FOODS
          </div>
          <div
            style={{
              marginLeft: 16,
              backgroundColor: '#9CCB3B',
              color: '#0B1B3F',
              fontSize: 16,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 20,
            }}
          >
            EXPORTER & CONSOLIDATOR
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            One container. 2,000+ Indian products.
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#94A3B8',
              marginTop: 16,
              maxWidth: 800,
            }}
          >
            Megh Staples • Partner Brands • Pooja & Handicraft Items • Mixed Container Shipments
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid #1E293B',
            paddingTop: 24,
            color: '#64748B',
            fontSize: 18,
          }}
        >
          <span>Ahmedabad, Gujarat, India</span>
          <span>export@meghfoods.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
