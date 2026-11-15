'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BasketLine = {
  sku: string
  productSlug: string
  productName: string
  brand: string | null
  packSize: string | null
  unitsPerCarton: number | null
  quantity: number
}

type State = {
  lines: BasketLine[]
  add: (l: Omit<BasketLine, 'quantity'>, qty?: number) => void
  setQty: (sku: string, qty: number) => void
  remove: (sku: string) => void
  clear: () => void
}

export const useBasket = create<State>()(
  persist(
    (set) => ({
      lines: [],
      add: (l, qty = 1) =>
        set((s) => {
          const i = s.lines.findIndex((x) => x.sku === l.sku)
          if (i >= 0) {
            const lines = [...s.lines]
            lines[i] = {
              ...lines[i],
              quantity: Math.min(10000, lines[i].quantity + qty),
            }
            return { lines }
          }
          return { lines: [...s.lines, { ...l, quantity: qty }] }
        }),
      setQty: (sku, qty) =>
        set((s) => ({
          lines: s.lines.map((x) =>
            x.sku === sku
              ? { ...x, quantity: Math.max(1, Math.min(10000, qty)) }
              : x
          ),
        })),
      remove: (sku) =>
        set((s) => ({ lines: s.lines.filter((x) => x.sku !== sku) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'megh-enquiry-basket-v1' }
  )
)

export const basketToCsv = (lines: BasketLine[]) =>
  [
    'SKU,Product,Brand,Pack,Units per carton,Cartons',
    ...lines.map((l) =>
      [
        l.sku,
        l.productName,
        l.brand ?? '',
        l.packSize ?? '',
        l.unitsPerCarton ?? '',
        l.quantity,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n')

export const basketToWhatsApp = (lines: BasketLine[], number: string) => {
  const body = lines
    .slice(0, 25)
    .map(
      (l, i) =>
        `${i + 1}. ${l.productName}${
          l.packSize
            ? ` (${l.packSize}${l.unitsPerCarton ? ` x ${l.unitsPerCarton}` : ''})`
            : ''
        } - ${l.quantity} carton(s)`
    )
    .join('\n')
  const more =
    lines.length > 25 ? `\n...and ${lines.length - 25} more items` : ''
  return `https://wa.me/${number}?text=${encodeURIComponent(
    `Hello Megh Foods, I would like a quote for:\n${body}${more}`
  )}`
}
