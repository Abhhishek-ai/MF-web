'use client'

import React, { useState } from 'react'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Download,
  Send,
  CheckCircle,
  X,
} from 'lucide-react'
import { useBasket, basketToCsv, basketToWhatsApp } from '@/lib/basket/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitEnquiry } from '@/app/actions/enquiry'

interface BasketSheetProps {
  isOpen: boolean
  onClose: () => void
}

type BuyerType = 'Importer' | 'Distributor' | 'Retailer' | 'Other'
type ShippingTerm = 'FOB' | 'CIF' | 'CFR' | 'EXW' | 'Not sure'
type ContainerPreference = 'FCL' | 'LCL / mixed' | 'Not sure'

export function BasketSheet({ isOpen, onClose }: BasketSheetProps) {
  const lines = useBasket((s) => s.lines)
  const setQty = useBasket((s) => s.setQty)
  const remove = useBasket((s) => s.remove)
  const clear = useBasket((s) => s.clear)

  const [showRfqForm, setShowRfqForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [buyerType, setBuyerType] = useState<BuyerType>('Importer')
  const [shippingTerms, setShippingTerms] = useState<ShippingTerm>('FOB')
  const [containerPref, setContainerPref] = useState<ContainerPreference>('FCL')
  const [message, setMessage] = useState('')
  const [startedAt] = useState(Date.now() - 5000)

  if (!isOpen) return null

  const totalCartons = lines.reduce((acc, curr) => acc + curr.quantity, 0)

  const handleDownloadCsv = () => {
    const csvContent = basketToCsv(lines)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `MeghFoods-Enquiry-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleWhatsApp = () => {
    const waUrl = basketToWhatsApp(lines, '919898255500')
    window.open(waUrl, '_blank')
  }

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const payload = {
        full_name: fullName,
        company,
        email,
        phone,
        country,
        city,
        buyer_type: buyerType,
        shipping_terms: shippingTerms,
        container_pref: containerPref,
        message,
        items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
        started_at: startedAt,
      }

      const res = await submitEnquiry(payload)
      if (res.ok && res.reference) {
        setSubmittedRef(res.reference)
        clear()
      } else {
        setErrorMessage(res.error || 'Failed to submit enquiry. Please try WhatsApp.')
      }
    } catch {
      setErrorMessage('Network error. Please contact us via WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-brand-navy">
                Enquiry Basket ({totalCartons} Cartons)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {submittedRef ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-brand-navy">RFQ Submitted Successfully!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Your reference number is <strong className="text-brand-blue">{submittedRef}</strong>. Our export desk in Ahmedabad will review your items and send a proforma invoice.
                </p>
                <div className="pt-4 flex flex-col gap-3 max-w-xs mx-auto">
                  <a
                    href={`https://wa.me/919898255500?text=Hello%20Megh%20Foods%2C%20I%20just%20submitted%20RFQ%20reference%20${submittedRef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2 border-emerald-300 text-emerald-700">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Confirm via WhatsApp</span>
                    </Button>
                  </a>
                  <Button
                    onClick={() => {
                      setSubmittedRef(null)
                      setShowRfqForm(false)
                      onClose()
                    }}
                    variant="default"
                  >
                    Close Basket
                  </Button>
                </div>
              </div>
            ) : lines.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy">Your Basket is Empty</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Browse the catalogue and add master cartons of Megh pulses, snacks, spices, or partner brands.
                </p>
                <Button onClick={onClose} variant="default" className="mt-2">
                  Browse Catalogue
                </Button>
              </div>
            ) : showRfqForm ? (
              /* RFQ Submission Form */
              <form onSubmit={handleSubmitRfq} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-base text-brand-navy">Buyer & Shipping Details</h3>
                  <button
                    type="button"
                    onClick={() => setShowRfqForm(false)}
                    className="text-xs font-semibold text-brand-blue hover:underline"
                  >
                    Back to Items
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company / Business</label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Indo-Global Foods Ltd."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Business Email *</label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buyer@company.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Phone *</label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Buyer Type</label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                      className="w-full text-xs h-10 px-2.5 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="Importer">Importer</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Destination Country *</label>
                    <Input
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Discharge Port / City</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New York"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Shipping Terms</label>
                    <select
                      value={shippingTerms}
                      onChange={(e) => setShippingTerms(e.target.value as ShippingTerm)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="FOB">FOB (Mundra / Nhava Sheva)</option>
                      <option value="CIF">CIF (Port of Destination)</option>
                      <option value="CFR">CFR</option>
                      <option value="EXW">EXW (Changodar Factory)</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Container Preference</label>
                    <select
                      value={containerPref}
                      onChange={(e) => setContainerPref(e.target.value as ContainerPreference)}
                      className="w-full text-xs h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="FCL">20ft / 40ft Full Container (FCL)</option>
                      <option value="LCL / mixed">LCL / Palletized Mixed</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Special Instructions / Requirements</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide any private labeling, barcode, or special inspection needs..."
                    className="w-full text-xs p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-bold gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Official RFQ'}</span>
                  </Button>
                </div>
              </form>
            ) : (
              /* Items List */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lines.length} Unique SKUs
                  </span>
                  <button
                    onClick={clear}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {lines.map((l) => (
                    <div
                      key={l.sku}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-brand-blue font-bold">
                            {l.sku}
                          </span>
                          {l.brand && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {l.brand}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-brand-navy truncate mt-1">
                          {l.productName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Pack: <strong>{l.packSize || 'Standard'}</strong>
                          {l.unitsPerCarton && ` • ${l.unitsPerCarton} units/ctn`}
                        </p>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() => setQty(l.sku, l.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-brand-navy">
                            {l.quantity}
                          </span>
                          <button
                            onClick={() => setQty(l.sku, l.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(l.sku)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (When not submitted and items > 0) */}
          {!submittedRef && lines.length > 0 && !showRfqForm && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-brand-navy pb-1">
                <span>Total Master Cartons:</span>
                <span className="text-brand-blue text-base">{totalCartons} Cartons</span>
              </div>

              {/* Primary action */}
              <Button
                onClick={() => setShowRfqForm(true)}
                className="w-full font-bold gap-2 shadow-md"
                size="lg"
              >
                <Send className="w-4 h-4" />
                <span>Request Proforma Quotation</span>
              </Button>

              {/* Secondary options */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send via WhatsApp</span>
                </Button>

                <Button
                  onClick={handleDownloadCsv}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
