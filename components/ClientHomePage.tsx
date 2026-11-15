'use client'

import React, { useState } from 'react'
import type { Product } from '@/lib/types'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { ConsolidationSection } from '@/components/ConsolidationSection'
import { CatalogSection } from '@/components/CatalogSection'
import { ExportMarketsSection } from '@/components/ExportMarketsSection'
import { CompanyCredentials } from '@/components/CompanyCredentials'
import { Footer } from '@/components/Footer'
import { BasketSheet } from '@/components/BasketSheet'

interface ClientHomePageProps {
  products: Product[]
}

export function ClientHomePage({ products }: ClientHomePageProps) {
  const [isBasketOpen, setIsBasketOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface selection:bg-brand-blue selection:text-white">
      {/* Sticky Header */}
      <Navbar onOpenBasket={() => setIsBasketOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        <Hero onOpenBasket={() => setIsBasketOpen(true)} />
        <ConsolidationSection />
        <CatalogSection
          initialProducts={products}
          onOpenBasket={() => setIsBasketOpen(true)}
        />
        <ExportMarketsSection />
        <CompanyCredentials />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Basket Sheet / Drawer */}
      <BasketSheet
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
      />
    </div>
  )
}

