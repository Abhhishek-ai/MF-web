'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Trash2,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useBasket, basketToCsv, basketToWhatsApp } from '@/lib/basket/store'
import { submitEnquiry } from '@/app/actions/enquiry'
import { toast } from 'sonner'

interface BasketClientProps {
  whatsappNumber?: string
}

export function BasketClient({ whatsappNumber = '+91 98250 00000' }: BasketClientProps) {
  const { lines, setQty, remove, clear } = useBasket()
  const [mounted, setMounted] = React.useState(false)

  // RFQ Form State
  const [fullName, setFullName] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [city, setCity] = React.useState('')
  const [buyerType, setBuyerType] = React.useState<
    'Importer' | 'Distributor' | 'Retailer' | 'Other'
  >('Importer')
  const [shippingTerms, setShippingTerms] = React.useState<
    'EXW' | 'FOB' | 'CIF' | 'CFR' | 'Not sure'
  >('FOB')
  const [containerPref, setContainerPref] = React.useState<
    'FCL' | 'LCL / mixed' | 'Not sure'
  >('FCL')
  const [message, setMessage] = React.useState('')
  const [honeypot, setHoneypot] = React.useState('')
  const [startedAt] = React.useState(() => Date.now() - 5000)

  const [submitting, setSubmitting] = React.useState(false)
  const [submittedReference, setSubmittedReference] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-megh-primary mb-2" />
        <p className="text-xs">Loading your enquiry basket...</p>
      </div>
    )
  }

  const totalCartons = lines.reduce((sum, item) => sum + item.quantity, 0)

  // Client-side CSV Download for Excel
  const handleDownloadCsv = () => {
    if (!lines.length) return
    const csvData = '\uFEFF' + basketToCsv(lines)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Megh_Foods_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded enquiry shortlist as Excel CSV')
  }

  // Direct WhatsApp Forward
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '')
  const waLink = basketToWhatsApp(lines, cleanPhone)

  // Form Submit Handler
  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lines.length) {
      toast.error('Your basket is empty')
      return
    }

    if (honeypot) {
      // Bot detected silently
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Submitting enquiry shortlist...')

    try {
      const payload = {
        full_name: fullName.trim(),
        company: company.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        country: country.trim(),
        city: city.trim() || undefined,
        buyer_type: buyerType,
        shipping_terms: shippingTerms,
        container_pref: containerPref,
        message: message.trim() || undefined,
        items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
        website: honeypot || undefined,
        started_at: startedAt,
      }

      const res = await submitEnquiry(payload)
      if (res.ok) {
        setSubmittedReference(res.reference || 'ENQ-CONFIRMED')
        clear() // Clear basket on success
        toast.success('Enquiry received! Proforma quote will be issued within 24h.', {
          id: toastId,
        })
      } else {
        toast.error(res.error || 'Failed to submit enquiry', { id: toastId })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting enquiry'
      toast.error(msg, { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  // SUCCESS CONFIRMATION SCREEN
  if (submittedReference) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="text-xs px-3 py-1">
            Enquiry Received Successfully
          </Badge>
          <h1 className="text-3xl font-extrabold font-montserrat text-megh-navy">
            Thank you, {fullName}
          </h1>
          <p className="text-sm text-slate-600">
            Your container shortlist has been logged under enquiry reference:
          </p>
          <div className="font-mono text-xl font-bold text-megh-primary bg-blue-50 py-2.5 px-6 rounded-xl inline-block border border-blue-200 shadow-2xs">
            {submittedReference}
          </div>
        </div>

        {/* What Happens Next Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left space-y-4 text-xs text-slate-700 leading-relaxed">
          <h3 className="font-montserrat font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            What Happens Next?
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="font-bold text-megh-primary">1.</span>
              <span>
                <strong>CBM & Weight Estimation:</strong> Our export engineering team in Changodar
                calculates container volume, weight distributions, and packing specifications.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-megh-primary">2.</span>
              <span>
                <strong>Formal Indicative Quote:</strong> We issue a detailed CIF/FOB proforma
                invoice to <strong>{email}</strong> within 24 to 48 business hours.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-megh-primary">3.</span>
              <span>
                <strong>Instant Clarification:</strong> Feel free to ping us directly on WhatsApp
                quoting reference <code>{submittedReference}</code> for accelerated handling.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/products">
            <Button className="bg-megh-primary text-white font-semibold text-xs h-10 px-6 rounded-xl">
              Return to Catalogue
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="text-xs h-10 px-6 rounded-xl">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // EMPTY BASKET STATE
  if (!lines.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-montserrat text-slate-900">
            Your Enquiry Basket is Empty
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our 2,140+ SKU export catalogue and add required products and carton quantities
            to your container shortlist.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/products">
            <Button className="bg-megh-primary hover:bg-megh-primary/90 text-white font-semibold text-xs h-11 px-7 rounded-xl flex items-center gap-2 mx-auto">
              Explore Product Catalogue <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // POPULATED BASKET VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-montserrat text-megh-navy">
            Enquiry Basket & Container Shortlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your shortlisted products, export as Excel spreadsheet, or submit for an
            indicative CIF / FOB quote.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            className="h-9 text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel CSV
          </Button>

          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold bg-[#25D366]/10 text-emerald-800 border-emerald-300 hover:bg-[#25D366]/20 flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Send via WhatsApp
            </Button>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Clear all items from your enquiry basket?')) clear()
            }}
            className="h-9 text-xs text-slate-500 hover:text-red-600"
          >
            Clear Basket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Table of Shortlisted Lines (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Shortlisted Items ({lines.length})
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Total Cartons: <strong className="text-megh-primary font-mono text-sm">{totalCartons}</strong>
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead className="w-24 text-center">Cartons</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.sku}>
                    <TableCell className="font-mono text-xs font-bold text-megh-navy">
                      {line.sku}
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/products/${line.productSlug}`}
                        className="font-medium text-xs text-slate-900 hover:text-megh-primary transition-colors block"
                      >
                        {line.productName}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {line.brand || 'Megh Brand'}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="font-mono text-slate-700">{line.packSize || '—'}</span>
                      {line.unitsPerCarton && (
                        <span className="block text-[10px] text-slate-400">
                          {line.unitsPerCarton} units/ctn
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        value={line.quantity}
                        onChange={(e) => setQty(line.sku, parseInt(e.target.value, 10))}
                        className="h-8 w-18 text-center text-xs font-mono font-bold mx-auto"
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => remove(line.sku)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span>Want to add more items to this container?</span>
            <Link
              href="/products"
              className="font-bold text-megh-primary hover:underline flex items-center gap-1"
            >
              Continue Browsing →
            </Link>
          </div>
        </div>

        {/* Right: RFQ Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-montserrat text-megh-navy flex items-center gap-2">
              <Send className="w-4 h-4 text-megh-primary" /> Request Indicative Quote
            </h2>
            <p className="text-xs text-slate-500">
              Zero payment required. Our export desk in Ahmedabad will prepare an itemized quote.
            </p>
          </div>

          <form onSubmit={handleSubmitRfq} className="space-y-4 text-xs">
            {/* Honeypot field (hidden from real users) */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="rfq-fullname" className="font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <Input
                  id="rfq-fullname"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label htmlFor="rfq-company" className="font-semibold text-slate-700 block mb-1">
                  Company Name
                </label>
                <Input
                  id="rfq-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Miller Foods LLC"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="rfq-email" className="font-semibold text-slate-700 block mb-1">
                  Business Email *
                </label>
                <Input
                  id="rfq-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@company.com"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label htmlFor="rfq-phone" className="font-semibold text-slate-700 block mb-1">
                  Phone / WhatsApp
                </label>
                <Input
                  id="rfq-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="rfq-country" className="font-semibold text-slate-700 block mb-1">
                  Destination Country *
                </label>
                <Input
                  id="rfq-country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, UAE, UK"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label htmlFor="rfq-city" className="font-semibold text-slate-700 block mb-1">
                  Port of Discharge / City
                </label>
                <Input
                  id="rfq-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, Jebel Ali"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="rfq-buyertype" className="font-semibold text-slate-700 block mb-1">Buyer Type</label>
                <select
                  id="rfq-buyertype"
                  value={buyerType}
                  onChange={(e) =>
                    setBuyerType(
                      e.target.value as 'Importer' | 'Distributor' | 'Retailer' | 'Other'
                    )
                  }
                  className="w-full h-9 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="Importer">Importer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="rfq-terms" className="font-semibold text-slate-700 block mb-1">Terms</label>
                <select
                  id="rfq-terms"
                  value={shippingTerms}
                  onChange={(e) =>
                    setShippingTerms(
                      e.target.value as 'EXW' | 'FOB' | 'CIF' | 'CFR' | 'Not sure'
                    )
                  }
                  className="w-full h-9 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="FOB">FOB India</option>
                  <option value="CIF">CIF Port</option>
                  <option value="CFR">CFR</option>
                  <option value="EXW">EXW Factory</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              <div>
                <label htmlFor="rfq-container" className="font-semibold text-slate-700 block mb-1">Container</label>
                <select
                  id="rfq-container"
                  value={containerPref}
                  onChange={(e) =>
                    setContainerPref(
                      e.target.value as 'FCL' | 'LCL / mixed' | 'Not sure'
                    )
                  }
                  className="w-full h-9 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
                >
                  <option value="FCL">FCL Container</option>
                  <option value="LCL / mixed">LCL / Mixed</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rfq-message" className="font-semibold text-slate-700 block mb-1">
                Additional Instructions or Port Notes
              </label>
              <Textarea
                id="rfq-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Mention target shipment timeline, custom packaging marks, or any special documentation required..."
                className="text-xs"
                aria-describedby="rfq-notes-hint"
              />
              <span id="rfq-notes-hint" className="sr-only">
                Optional additional trade details for the export desk.
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-megh-primary hover:bg-megh-primary/90 text-white font-bold rounded-xl shadow-md shadow-megh-primary/20 text-xs"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Shortlist...
                </span>
              ) : (
                `Send Enquiry for ${totalCartons} Cartons`
              )}
            </Button>

            <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
              <div>Protected by reCAPTCHA & secure encrypted SSL.</div>
              <div>No credit card required. Prices provided as indicative quote.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
