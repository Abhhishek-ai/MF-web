export type CompanySettings = {
  name: string
  brand: string
  cin: string
  registered_office: string
  factory: string
  phones: string[]
  email: string
  website: string
}

export type WhatsAppSettings = {
  number: string
}

export type CertificationItem = {
  label: string
  number?: string
  image_url?: string
}

export type CatalogueSettings = {
  pdf_url: string | null
  label: string
  updated: string
}

export type FeatureSettings = {
  show_partner_brands: boolean
  enable_checkout: boolean
}

export type SiteSettingsMap = {
  company: CompanySettings
  whatsapp: WhatsAppSettings
  markets: string[]
  certifications: CertificationItem[]
  catalogue: CatalogueSettings
  features: FeatureSettings
}

export type SiteSettings = SiteSettingsMap

export type ProductGroup = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  group_id: string | null
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  group?: ProductGroup | null
}

export type Brand = {
  id: string
  name: string
  slug: string
  is_megh: boolean
  is_public: boolean
  logo_url: string | null
  sort_order: number
}

export type ProductPack = {
  id: string
  product_id: string
  sku: string
  pack_size: string | null
  units_per_carton: number | null
  carton_spec_raw: string | null
  pack_size_grams: number | null
  pack_size_ml: number | null
  india_mrp_pack: boolean
  original_listing: string | null
  review_flags: string[]
  is_active: boolean
  sort_order: number
}

export type Product = {
  id: string
  slug: string
  name: string
  brand_id: string | null
  category_id: string | null
  group_id: string | null
  is_megh_brand: boolean
  short_description: string
  description_md: string
  ingredients: string | null
  shelf_life: string | null
  hs_code: string | null
  origin: string
  dietary_tags: string[]
  images: string[]
  catalogue_pages: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  needs_review: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  brand?: Brand | null
  category?: Category | null
  group?: ProductGroup | null
  packs?: ProductPack[]
}

export type EnquiryStatus = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost' | 'spam'

export type EnquiryItem = {
  id: string
  enquiry_id: string
  pack_id: string | null
  sku: string
  product_name: string
  brand_name: string | null
  pack_size: string | null
  units_per_carton: number | null
  quantity_cartons: number
}

export type Enquiry = {
  id: string
  reference: string
  full_name: string
  company: string | null
  email: string
  phone: string | null
  country: string
  city: string | null
  buyer_type: string | null
  shipping_terms: string | null
  container_pref: string | null
  message: string | null
  status: EnquiryStatus
  internal_notes: string | null
  source: string | null
  created_at: string
  updated_at: string
  items?: EnquiryItem[]
}
