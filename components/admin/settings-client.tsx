'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Phone,
  FileText,
  Globe,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { saveSiteSetting, uploadCataloguePdf } from '@/app/admin/actions/settings'
import { toast } from 'sonner'

interface SettingsClientProps {
  settings: Record<string, unknown>
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState('company')
  const [saving, setSaving] = React.useState(false)

  // 1. Company details state
  interface CompanyConfig {
    name?: string
    cin?: string
    registered_office?: string
    factory_address?: string
    email?: string
    website?: string
    whatsapp?: string
    phones?: string[]
  }
  const companyData = (settings.company as CompanyConfig) || {}
  const [companyName, setCompanyName] = React.useState(companyData.name || 'Megh Overseas Private Limited')
  const [cin, setCin] = React.useState(companyData.cin || 'U15400GJ2020PTC118123')
  const [officeAddress, setOfficeAddress] = React.useState(
    companyData.registered_office ||
      '301-304, Corporate Park, Near Pakwan Dining Hall, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054, India'
  )
  const [factoryAddress, setFactoryAddress] = React.useState(
    companyData.factory_address ||
      'Plot No. 42-45, Changodar Industrial Estate, Sarkhej-Bavla Highway, Changodar, Ahmedabad, Gujarat 382213, India'
  )
  const [email, setEmail] = React.useState(companyData.email || 'export@meghfoods.com')
  const [website, setWebsite] = React.useState(companyData.website || 'https://meghfoods.com')
  const [whatsapp, setWhatsapp] = React.useState(companyData.whatsapp || '+91 98250 00000')
  const [phones, setPhones] = React.useState<string[]>(
    companyData.phones || ['+91 79 4000 0000', '+91 98250 00000']
  )
  const [newPhone, setNewPhone] = React.useState('')

  // 2. Markets state
  const [markets, setMarkets] = React.useState<string[]>(
    (settings.markets as string[]) || [
      'United States',
      'Canada',
      'United Kingdom',
      'European Union',
      'United Arab Emirates',
      'Saudi Arabia',
      'Australia & New Zealand',
      'East Africa',
    ]
  )
  const [newMarket, setNewMarket] = React.useState('')

  // 3. Certifications state
  const [certifications, setCertifications] = React.useState<
    Array<{ label: string; number: string; image_url?: string }>
  >(
    (settings.certifications as Array<{ label: string; number: string; image_url?: string }>) || [
      { label: 'FSSAI Central Export License', number: '10020021000123' },
      { label: 'APEDA Registration', number: 'RCMC/APEDA/2021/4590' },
      { label: 'US FDA Registered Facility', number: 'FDA-REG-1928374' },
      { label: 'ISO 22000:2018 Certified', number: 'FSMS-IND-2022-89' },
    ]
  )
  const [newCertLabel, setNewCertLabel] = React.useState('')
  const [newCertNumber, setNewCertNumber] = React.useState('')

  // 4. Catalogue PDF state
  const catalogueData = (settings.catalogue as { pdf_url?: string }) || {}
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(catalogueData.pdf_url || null)
  const [pdfUploading, setPdfUploading] = React.useState(false)

  // 5. Feature Flags state
  const featuresData = (settings.features as { show_partner_brands?: boolean }) || {}
  const [showPartnerBrands, setShowPartnerBrands] = React.useState(
    featuresData.show_partner_brands !== undefined ? featuresData.show_partner_brands : true
  )

  // Phone helper
  const addPhone = () => {
    if (newPhone.trim() && !phones.includes(newPhone.trim())) {
      setPhones([...phones, newPhone.trim()])
      setNewPhone('')
    }
  }
  const removePhone = (p: string) => {
    setPhones(phones.filter((x) => x !== p))
  }

  // Market helper
  const addMarket = () => {
    if (newMarket.trim() && !markets.includes(newMarket.trim())) {
      setMarkets([...markets, newMarket.trim()])
      setNewMarket('')
    }
  }
  const removeMarket = (m: string) => {
    setMarkets(markets.filter((x) => x !== m))
  }

  // Cert helper
  const addCert = () => {
    if (newCertLabel.trim() && newCertNumber.trim()) {
      setCertifications([
        ...certifications,
        { label: newCertLabel.trim(), number: newCertNumber.trim() },
      ])
      setNewCertLabel('')
      setNewCertNumber('')
    }
  }
  const removeCert = (idx: number) => {
    setCertifications(certifications.filter((_, i) => i !== idx))
  }

  // Save Company Settings
  const handleSaveCompany = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving company details...')
    try {
      const payload = {
        name: companyName,
        cin,
        registered_office: officeAddress,
        factory_address: factoryAddress,
        email,
        website,
        whatsapp,
        phones,
      }
      const res = await saveSiteSetting('company', payload)
      if (res.ok) {
        toast.success('Company details updated', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // Save Markets
  const handleSaveMarkets = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving export markets...')
    try {
      const res = await saveSiteSetting('markets', markets)
      if (res.ok) {
        toast.success('Export markets updated', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // Save Certifications
  const handleSaveCertifications = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving certifications...')
    try {
      const res = await saveSiteSetting('certifications', certifications)
      if (res.ok) {
        toast.success('Certifications updated', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // Save Features
  const handleSaveFeatures = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving feature toggles...')
    try {
      const payload = {
        show_partner_brands: showPartnerBrands,
        enable_checkout: false, // strictly false
      }
      const res = await saveSiteSetting('features', payload)
      if (res.ok) {
        toast.success('Feature flags saved', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // PDF Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPdfUploading(true)
    const toastId = toast.loading('Uploading catalogue PDF to Supabase Storage...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadCataloguePdf(formData)
      if (res.ok && res.pdfUrl) {
        setPdfUrl(res.pdfUrl)
        toast.success('Catalogue PDF uploaded and published successfully!', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to upload PDF', { id: toastId })
      }
    } catch {
      toast.error('Network error uploading PDF', { id: toastId })
    } finally {
      setPdfUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-montserrat text-megh-navy">Site Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Self-service settings for contact information, factory address, export markets, certifications, and catalogue PDF.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-5">
          <TabsTrigger value="company">Company & Contact</TabsTrigger>
          <TabsTrigger value="markets">Export Markets</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="catalogue">Catalogue PDF</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        {/* TAB 1: COMPANY & CONTACT */}
        <TabsContent value="company" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-megh-primary" /> Corporate & Legal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Legal Entity Name
                </label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  CIN (Corporate Identification Number)
                </label>
                <Input value={cin} onChange={(e) => setCin(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Registered Head Office Address
              </label>
              <Textarea
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Changodar Manufacturing & Consolidation Facility Address
              </label>
              <Textarea
                value={factoryAddress}
                onChange={(e) => setFactoryAddress(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Export Sales Email
                </label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Official Website
                </label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp Shortlist Number
                </label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </div>

            {/* Phone numbers list */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phone Numbers
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {phones.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full border border-slate-200"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    {p}
                    <button
                      type="button"
                      onClick={() => removePhone(p)}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 79 4000 0000"
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                  className="h-8 text-xs"
                >
                  Add Phone
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                disabled={saving}
                onClick={handleSaveCompany}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[130px]"
              >
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save Company Details'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: EXPORT MARKETS */}
        <TabsContent value="markets" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-megh-primary" /> Active Export Markets
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Countries and regions where Megh Foods regularly exports mixed FCL containers.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {markets.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-2 bg-blue-50 text-megh-navy text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => removeMarket(m)}
                    className="text-slate-400 hover:text-red-600 p-0.5"
                    title="Remove market"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-md pt-2">
              <Input
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                placeholder="e.g. South Africa, Japan, Singapore"
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMarket}
                className="h-9 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Market
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                disabled={saving}
                onClick={handleSaveMarkets}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[130px]"
              >
                Save Markets List
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: CERTIFICATIONS */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-megh-accent" /> Quality Certifications & Export Licenses
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Display verified quality compliance badges to foreign buyers on the homepage and footer.
              </p>
            </div>

            <div className="space-y-2">
              {certifications.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{c.label}</div>
                    <div className="font-mono text-[11px] text-slate-500">{c.number}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCert(idx)}
                    className="text-slate-400 hover:text-red-600 p-1.5"
                    title="Remove certification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                value={newCertLabel}
                onChange={(e) => setNewCertLabel(e.target.value)}
                placeholder="Certification Name (e.g. Halal India Certified)"
                className="h-9 text-xs"
              />
              <div className="flex gap-2">
                <Input
                  value={newCertNumber}
                  onChange={(e) => setNewCertNumber(e.target.value)}
                  placeholder="License or Registration Number"
                  className="h-9 text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCert}
                  className="h-9 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                disabled={saving}
                onClick={handleSaveCertifications}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[130px]"
              >
                Save Certifications
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: CATALOGUE PDF */}
        <TabsContent value="catalogue" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-megh-primary" /> Master Product Catalogue PDF
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload your official 65-page brochure / export catalogue PDF. Importers can download
                this directly from the header navigation.
              </p>
            </div>

            {pdfUrl ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      Active Catalogue Document
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono truncate max-w-sm">
                      {pdfUrl}
                    </div>
                  </div>
                </div>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> View PDF
                  </Button>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
                No catalogue PDF uploaded yet.
              </div>
            )}

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Upload New Catalogue PDF
              </label>
              <input
                type="file"
                accept="application/pdf"
                disabled={pdfUploading}
                onChange={handlePdfUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-megh-primary file:text-white hover:file:bg-megh-primary/90"
              />
            </div>

            {pdfUploading && (
              <div className="text-xs text-megh-primary flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading document to storage...
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 5: FEATURE FLAGS */}
        <TabsContent value="features" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Feature Flags & System Toggles</h2>
              <p className="text-xs text-slate-500 mt-1">
                Control public site behaviour and optional modules.
              </p>
            </div>

            <div className="space-y-4">
              {/* Partner Brands Visibility Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">
                    Display Partner Brands on Public Site
                  </div>
                  <div className="text-xs text-slate-500">
                    When enabled, partner brand logos and chips appear in homepage navigation and
                    filter bars.
                  </div>
                </div>
                <Switch
                  checked={showPartnerBrands}
                  onCheckedChange={setShowPartnerBrands}
                />
              </div>

              {/* Disabled Checkout Switch as per specs */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70 opacity-70">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Lock className="w-3.5 h-3.5" /> Online Payment & Checkout
                  </div>
                  <div className="text-xs text-slate-500">
                    Not available in this version (B2B Enquiry Basket model operates without credit card checkout).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-slate-500">
                    Disabled
                  </Badge>
                  <Switch checked={false} disabled />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                disabled={saving}
                onClick={handleSaveFeatures}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[130px]"
              >
                Save Feature Toggles
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
