'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

interface WhatsAppFloatProps {
  number?: string
}

export function WhatsAppFloat({ number = '+91 98250 00000' }: WhatsAppFloatProps) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null
  }

  const cleanNumber = number.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(
    'Hello Megh Foods export team, I am interested in sourcing mixed containers of Indian food and grocery products.'
  )
  const href = `https://wa.me/${cleanNumber}?text=${message}`

  return (
    <aside
      aria-label="Direct WhatsApp Enquiry"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group"
    >
      <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-megh-navy text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
        Chat with Megh Export Desk
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Megh Foods on WhatsApp"
        className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 hover:shadow-[#25D366]/40"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </aside>
  )
}
