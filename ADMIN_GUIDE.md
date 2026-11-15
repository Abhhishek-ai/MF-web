# MEGH FOODS — EXPORT CATALOGUE & ADMIN PORTAL
## OWNER & OPERATOR GUIDE (PLAIN TEXT)

Welcome to the Megh Foods B2B Export Catalogue and Self-Service Admin Portal. This guide is written for non-technical business owners and export managers. It explains how to manage products, master carton configurations, photos, enquiries, and company information without needing a developer.

---

### TABLE OF CONTENTS
1. Accessing the Admin Portal
2. Dashboard Overview & Export Metrics
3. Adding and Editing Products
4. Configuring Carton Packs & SKUs
5. Fixing "Needs Review" Flagged Items
6. Uploading Photos (Single & Bulk Match)
7. Managing Enquiries & Exporting Shortlists
8. Updating Company Details & WhatsApp Number
9. Uploading the Master Export Catalogue PDF
10. Managing Partner Brands & Privacy Controls
11. Importing or Updating the Master CSV Catalogue

---

### 1. ACCESSING THE ADMIN PORTAL
- Portal URL: https://www.meghfoods.com/admin (or http://localhost:3000/admin during testing)
- Log in using your registered admin email and password.
- Only authorized team members listed in the `admin_users` table can access this portal. All public visitors are automatically blocked and redirected to the login page.
- Session safety: The portal automatically times out when inactive. Always click "Sign Out" in the bottom-left sidebar when working from a shared computer.

---

### 2. DASHBOARD OVERVIEW & EXPORT METRICS
Once logged in, the Dashboard displays:
- Total Live Products & Active SKU Packs in the catalogue.
- Megh Own-Brand SKU count vs. Partner Branded SKUs.
- Products needing image upload (currently using designed SVG placeholders).
- "Needs Review" count (items imported with non-standard carton specs or missing gram weights).
- Recent International Inquiries (last 10 enquiries with buyer name, country, and carton count).
- Quick shortcuts to: Upload Products, Bulk Images, CSV Re-import, and Site Settings.

---

### 3. ADDING AND EDITING PRODUCTS
To add a new product or edit an existing one:
1. Navigate to "Products" in the left sidebar menu.
2. To find an existing item, type the product name or SKU in the search bar, or filter by Brand, Category, or Group.
3. Click "Edit" on any product row, or click the "Add Product" button in the top right.
4. Complete the product details:
   - Product Name (e.g. "Toor Dal Premium Sortex")
   - URL Slug (auto-generated from the name, or customized)
   - Brand (Select "Megh" for own brand, or select a partner brand)
   - Product Group (e.g. "Megh Brand Staples", "Partner Brands", "Handicrafts & Pooja")
   - Category (e.g. "Pulses & Beans", "Flours & Atta", "Snacks & Namkeen")
   - Short Description (1-2 sentences summarizing the commodity for international buyers)
   - Detailed Description (Markdown supported for bullet points, cooking instructions, packing specs)
   - Technical Specifications: Origin ("India"), Shelf Life (e.g. "12 Months", "24 Months"), HS Code (e.g. "0713.60.00")
   - Dietary Tags: Select all that apply (100% Vegetarian, Gluten-Free, Vegan, Non-GMO, Halal-Friendly)
5. Save changes. On-demand revalidation immediately updates the public website within seconds.

---

### 4. CONFIGURING CARTON PACKS & SKUs
In international trade, buyers purchase by the master carton rather than individual retail units. Every product can have multiple pack configurations (for example: 2 lb x 20 packs per carton, and 4 lb x 10 packs per carton).

To configure packs for a product:
1. In the Product Editor drawer, scroll down to the "Pack Configurations & Master Cartons" section.
2. Click "Add Pack".
3. Enter the carton details:
   - SKU: Unique catalogue identifier (e.g. `MF-0123`). This must be unique across the entire catalogue.
   - Pack Size: Label size (e.g. `2LB`, `400G`, `1KG`, `500ML`).
   - Units Per Carton: Number of packets inside each master carton (e.g. `20`, `24`, `12`).
   - Carton Spec: Brief notation (e.g. `2LB x 20`, `400G x 24`).
   - Pack Size in Grams or ML: Numeric weight used for container tonnage and CBM calculations.
   - India MRP Pack: Check this box if this pack carries an Indian domestic retail printed MRP price; uncheck for neutral export plain packs.
4. Click Save. The pack is immediately selectable by buyers on the product page and in the Enquiry Basket.

---

### 5. FIXING "NEEDS REVIEW" FLAGGED ITEMS
When catalogue data is imported from legacy spreadsheets, certain rows may be flagged with "Needs Review" due to ambiguous carton text or non-standard weights.

To clean up these items:
1. In the Products screen, click the "Needs Review" filter tab.
2. Open any flagged product. You will see warning tags such as:
   - `ambiguous_carton_spec`: The units-per-carton could not be verified automatically.
   - `missing_grams`: The pack weight in grams is empty.
   - `unmatched_pack_format`: Non-standard container notation.
3. Review the pack numbers, correct the units per carton and gram weights, and uncheck the "Needs Review" toggle.
4. Click Save. The review flag disappears from the dashboard counter.

---

### 6. UPLOADING PHOTOS (SINGLE & BULK MATCH)
The website displays custom designed gradient placeholders with category icons and Megh brand badges for products that do not yet have photography. When photos are uploaded, they replace the placeholder automatically.

#### Option A: Uploading Photos for a Single Product
1. Open the product in the Product Editor.
2. In the "Product Photography" section, drag and drop up to 5 JPG, PNG, or WebP images.
3. The first image in the list is automatically the primary cover shown in the catalogue grid. You can reorder images by clicking the arrows, or remove unwanted images.
4. Click Save.

#### Option B: Bulk Photo Upload (Auto-Matching by SKU or Slug)
If you have product photos from your photographer or factory:
1. Name the photo files after either the SKU or the product slug:
   - Example 1 (by SKU): `MF-0001.jpg`, `MF-0145.png`, `MF-1200.webp`
   - Example 2 (by Slug): `toor-dal-premium.jpg`, `chana-besan.jpg`
2. Navigate to "Bulk Images" in the left sidebar menu.
3. Drag and drop 50 to 100 photo files at once into the upload box.
4. The system automatically reads the filename, matches it against all catalogue SKUs and product slugs, uploads the file to the high-speed CDN, and attaches it to the correct product.
5. Review the results:
   - "Matched" list shows the product name linked to each file.
   - "Unmatched" list highlights any filenames that did not match an active catalogue SKU or slug.

---

### 7. MANAGING ENQUIRIES & EXPORTING SHORTLISTS
When international buyers shortlist cartons and submit their Enquiry Basket:
1. An instant email notification is delivered to the owner's inbox (`OWNER_NOTIFY_EMAIL`) with an attached Excel-ready CSV packing sheet.
2. The enquiry is saved in the portal under "Enquiries".
3. Click on any enquiry reference (e.g. `ENQ-20261113-ABCD`) to view:
   - Buyer details: Contact name, company, email, WhatsApp, destination country, target discharge port (e.g. Felixstowe, Jebel Ali, New York), preferred trade terms (FOB Mundra, CIF), and container preference (20ft FCL, 40ft HC, or mixed LCL).
   - Shortlisted line items: Every SKU, product name, brand, carton specification, and carton quantity requested.
   - Total carton count and total estimated gross weight in metric tonnes.
4. Workflow statuses: Update status from `New` &rarr; `In Review` &rarr; `Quoted` &rarr; `Confirmed` &rarr; `Archived` to keep your sales desk organized.
5. "Export to CSV": Click this button on any enquiry to download a clean UTF-8 CSV packing list ready to import directly into your invoicing software or email to the client.

---

### 8. UPDATING COMPANY DETAILS & WHATSAPP NUMBER
All company details, telephone lines, and the floating WhatsApp quote number are editable directly from the admin panel without touching code:
1. Navigate to "Settings" in the left sidebar menu.
2. Under "Company & Legal Details", you can update:
   - Registered Corporate Name (Megh Overseas Private Limited)
   - Brand Name (Megh Foods)
   - Corporate Identification Number (CIN)
   - Registered Head Office Address (Ahmedabad)
   - Manufacturing & Consolidation Facility Address (Changodar)
   - Official Export Desk Email Address
   - Office Phone Lines (add multiple lines)
3. Under "WhatsApp Integration":
   - Enter your international WhatsApp phone number in pure international format without spaces or symbols (e.g. `919898255500`).
   - All WhatsApp buttons on product pages, the basket page, and the floating quote pill immediately route enquiries to this new number.
4. Under "Export Markets Served": Add or remove target destination regions (e.g. United States, United Kingdom, European Union, UAE, Saudi Arabia, South Africa, Australia).
5. Under "Quality Certifications": Add official licenses and registration numbers (e.g. FSSAI, APEDA, US FDA, ISO 22000, Halal). If none are listed, the certifications section is hidden from the public footer automatically.
6. Click "Save Settings".

---

### 9. UPLOADING THE MASTER EXPORT CATALOGUE PDF
Buyers frequently ask for a downloadable PDF catalogue:
1. Navigate to "Settings" &rarr; "Export Catalogue PDF".
2. Drag and drop your compiled PDF file (e.g. `Megh_Foods_Export_Catalogue_2026.pdf`).
3. Set the public display label (e.g. "Download 2026 Master Export Catalogue PDF").
4. Click "Upload & Save".
5. The "Download PDF Catalogue" button in the website header and footer automatically delivers the new PDF file.

---

### 10. MANAGING PARTNER BRANDS & PRIVACY CONTROLS
Megh Foods consolidates partner brands (such as Parle, Haldiram's, MDH, Everest, Balaji, etc.). In international export trade, you may occasionally want to hide certain supplier or partner brand names from public discovery while continuing to supply them privately.

To manage brand privacy:
1. Navigate to "Brands" in the left sidebar menu.
2. Toggle "Public Visibility" switch:
   - ON (Public): The brand name appears in the mega menu, the catalogue brand filters, brand archive pages, and search index.
   - OFF (Hidden): The brand name is completely hidden from the public website, search index, and Google JSON-LD schema. Products under this brand remain active and can be shared via direct link or added to quotes, but the partner brand name remains private.

---

### 11. IMPORTING OR UPDATING THE MASTER CSV CATALOGUE
When adding hundreds of new items or updating carton specifications:
1. Navigate to "Import" in the left sidebar menu.
2. Choose from two methods:
   - Method A (Server File): Click "Run Dry Run from Server File" to test `data/megh_products_clean.csv`.
   - Method B (File Upload): Drag and drop any updated `.csv` export file from Excel.
3. Always check "Dry Run" first:
   - A dry run verifies every row, checks for duplicate SKUs, validates required columns, and shows you exactly how many new products and packs will be added without modifying the live database.
4. Live Import:
   - "Overwrite Existing Records" OFF: Safe mode. Only adds brand-new products and packs. All previous manual edits made by the owner in the admin portal are preserved.
   - "Overwrite Existing Records" ON: Updates existing product descriptions, carton specifications, and categories to match the newly uploaded CSV.
5. Click "Execute Live Import". When finished, the import job is logged in your history and the public website is revalidated automatically.

---

### SUPPORT & ASSISTANCE
For technical questions or hosting assistance, contact your engineering lead or server administrator. All database records are backed up automatically in your Supabase project dashboard.
