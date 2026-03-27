# Mobiris WordPress Theme — Installation, Setup & Assumptions

This comprehensive technical guide covers everything needed to install, configure, and launch the Mobiris WordPress theme. It includes requirements, step-by-step installation, recommended plugins, pre-launch checklists, key assumptions made during development, and file structure reference.

---

## 1. Requirements

Before installing the Mobiris theme, ensure your hosting environment meets these minimum requirements:

### 1.1 WordPress Version
- **Minimum:** WordPress 6.0 or later
- **Recommended:** WordPress 6.4 or latest stable version
- **Reason:** The theme uses WordPress block editor features, customizer APIs, and REST APIs from WordPress 6.0+

### 1.2 PHP Version
- **Minimum:** PHP 8.0 or later
- **Recommended:** PHP 8.2 or later
- **Reason:** The theme may use modern PHP syntax and type hints
- **Check your PHP version:** Most hosting providers show this in the control panel under "PHP Information" or you can create a test file with `<?php phpinfo(); ?>`

### 1.3 Database
- **MySQL:** 8.0 or later
- **MariaDB:** 10.6 or later
- **Reason:** Ensures compatibility with WordPress core and plugins
- **Check:** Usually configured automatically when WordPress is installed

### 1.4 HTTPS (SSL Certificate)
- **Required:** Yes, HTTPS is mandatory
- **Why:** The Mobiris product uses JWT authentication and biometric flows which require secure (encrypted) connections
- **Setup:** Use Let's Encrypt (free) via Certbot or your hosting provider's auto-SSL feature
- **Verify:** Your site URL should start with `https://`, not `http://`
- **Check browser:** Lock icon should appear in the browser address bar

### 1.5 Storage & Bandwidth
- **Minimum disk space:** 500 MB (for WordPress core, theme, plugins, and initial content)
- **Recommended:** 1-2 GB (for media library, backups, future growth)
- **Bandwidth:** No specific minimum, but 100 GB/month recommended for small traffic

### 1.6 Additional Recommendations
- **Server type:** VPS or dedicated (avoid shared hosting for production)
- **Caching:** Server-level caching support (most hosts support this)
- **CDN:** Cloudflare (free tier available) for faster global delivery
- **Email:** A mail server or transactional email service (ZeptoMail, SendGrid, Mailgun)

---

## 2. Installation Steps

### Step 1: Upload and Activate the Theme

#### Option A: Upload via WordPress Admin
1. Log into your WordPress dashboard at `https://yoursite.com/wp-admin`
2. Navigate to **Appearance** in the left sidebar
3. Click **Themes**
4. Click the **Add New** button at the top
5. Click **Upload Theme** at the top of the page
6. Select the `mobiris-theme.zip` file from your computer
7. Click **Install Now**
8. Once installation completes, click **Activate**
9. The theme is now active

#### Option B: Upload via SFTP/FTP
1. Connect to your website via SFTP (ask your hosting provider for credentials)
2. Navigate to `/wp-content/themes/`
3. Upload the `mobiris-theme` folder
4. Log into WordPress admin
5. Go to **Appearance > Themes**
6. Find "Mobiris" in the theme list
7. Click **Activate**

#### Option C: Upload via Command Line (Advanced)
```bash
cd /path/to/wordpress/wp-content/themes/
unzip mobiris-theme.zip
# Then activate in WordPress admin
```

### Step 2: Theme Activation Setup (Automatic)

When you activate the Mobiris theme, WordPress automatically creates and configures:

**Pages Created (14 total):**
- Home (set as front page)
- About
- Platform
- Features
- Solutions
- Pricing
- Guides
- FAQ
- Contact
- Get the App
- Access & Login
- Blog (set as posts page)
- Privacy Policy
- Terms of Service

**Menus Created (3 total):**
- Primary Menu (header navigation with all pages)
- Footer Menu - Product
- Footer Menu - Company
- Footer Menu - Legal

**Customizer Options:**
- 89 customizable settings added to WordPress Customizer
- All default values are sensible placeholders

**Important Note:** If you're activating on an existing WordPress site with existing pages, the theme **will not** create duplicates. It only creates pages if they don't already exist.

### Step 3: Configure Global Settings in Customizer

After activation, the first step is to configure your company information.

1. Navigate to **Appearance > Customize** in WordPress admin
2. Click **Mobiris Theme Settings** in the left panel
3. You'll see multiple sections to configure:

**Essential configurations (configure first):**

#### Company Information
1. Expand "Company Information"
2. Enter your company name (e.g., "Mobiris")
3. Enter a tagline (e.g., "Biometric fleet operations platform")
4. Upload your company logo (dark version for light backgrounds)
5. Upload your logo (light version for dark backgrounds)
6. Upload your favicon (512px × 512px minimum)
7. Click "Publish" to save

#### Contact & Communication
1. Expand "Contact & Communication"
2. Enter Primary Email (where contact form submissions go)
3. Enter Secondary Email (optional, for CC)
4. Enter Phone Number (with country code, e.g., "+234 805 310 8039")
5. Enter WhatsApp Number (without + symbol, e.g., "2348053108039")
6. Enter Office Address
7. Click "Publish"

#### Social Media Links
1. Expand "Social Media Links"
2. For each platform you use:
   - Enable the toggle (checkbox)
   - Enter the full URL to your profile
3. Leave disabled any platforms you don't use
4. Click "Publish"

#### App & Platform Links
1. Expand "App & Platform Links"
2. Enter your web app URL (e.g., `https://app.mobiris.ng`)
3. Enter login URL (e.g., `https://app.mobiris.ng/login`)
4. Enter signup URL (e.g., `https://app.mobiris.ng/signup`)
5. Enter demo booking URL (e.g., `https://calendly.com/mobiris/demo`)
6. Leave iOS/Android URLs blank for now (will show "Coming Soon")
7. Click "Publish"

#### Header & Navigation
1. Expand "Header & Navigation"
2. Set Primary CTA Label (e.g., "Get Started")
3. Set Primary CTA URL (e.g., `https://app.mobiris.ng/signup`)
4. Set Secondary CTA Label (e.g., "Login")
5. Set Secondary CTA URL (e.g., `https://app.mobiris.ng/login`)
6. Optionally enable Announcement Bar with message
7. Click "Publish"

#### Footer Settings
1. Expand "Footer Settings"
2. Enter footer tagline/description
3. Enter copyright text (year auto-fills)
4. Check toggles for what to show in footer (app links, social icons, newsletter)
5. Click "Publish"

**All changes are published immediately in the preview panel on the right.**

### Step 4: Configure Navigation Menus

After customizer setup, configure your website menus.

1. Go to **Appearance > Menus** in WordPress admin
2. Click on **Primary Menu** to edit
3. Add pages to the menu:
   - Expand "Pages" section
   - Check the box next to each page you want in the menu
   - Click "Add to Menu"
4. Reorder by dragging items up/down
5. Create dropdowns by dragging items to the right (indenting them)
6. Click **Save Menu**

**Example Primary Menu structure:**
```
Home
Product
  - Platform
  - Features
  - Solutions
  - Pricing
Resources
  - Guides
  - Blog
  - FAQ
About
Contact
Get the App
```

7. Repeat the process for:
   - **Footer Menu - Product** (add product-related pages)
   - **Footer Menu - Company** (add company pages)
   - **Footer Menu - Legal** (add Privacy Policy, Terms, etc.)

### Step 5: Populate Initial Content

Before launch, add some initial content to make the site look lived-in.

#### Add Blog Posts
1. Go to **Posts > Add New Post**
2. Add a title, content, featured image
3. Add categories and tags
4. Click **Publish**
5. Repeat 3-4 times for initial blog content

**Example blog posts:**
- "Introduction to Biometric Fleet Verification"
- "5 Ways to Reduce Driver Fraud"
- "Mobiris Platform Release v2.0"
- "Case Study: ABC Transport Services"

#### Add FAQs
1. Go to **Posts > FAQs > Add New FAQ**
2. Question as title, answer as content
3. Assign FAQ Category
4. Click **Publish**
5. Add 5-10 FAQs minimum

**Example FAQs:**
- "How does biometric verification work?"
- "What devices are supported?"
- "Is my data secure?"
- "What is the cost?"
- "How long is onboarding?"

#### Add Testimonials
1. Go to **Posts > Testimonials > Add New Testimonial**
2. Person's name as title, quote as content
3. Add custom fields: testimonial_role, testimonial_company
4. Upload headshot as featured image
5. Click **Publish**
6. Add 3-5 initial testimonials

#### Add Guides
1. Go to **Posts > Guides > Add New Guide**
2. Title and detailed content
3. Use Heading 2 (##) and Heading 3 (###) for structure (auto-generates TOC)
4. Add featured image
5. Assign Resource Category
6. Click **Publish**
7. Add 2-3 initial guides

### Step 6: Install Recommended Plugins

Recommended plugins enhance functionality, security, SEO, and email reliability.

#### Step 6a: Install Yoast SEO (Strongly Recommended)

1. Go to **Plugins > Add New**
2. Search for **"Yoast SEO"**
3. Click **Install Now** on the official "Yoast SEO" plugin
4. Click **Activate**
5. A new "SEO" menu appears in the left sidebar
6. Go to **SEO > General** to configure:
   - Enter your website name
   - Set homepage title and meta description
   - Configure social profiles

**Why:** Full SEO control, XML sitemaps, per-page meta descriptions, keyword optimization.

#### Step 6b: Install WP Mail SMTP (Strongly Recommended)

1. Go to **Plugins > Add New**
2. Search for **"WP Mail SMTP"**
3. Click **Install Now**
4. Click **Activate**
5. Go to **WP Mail SMTP** in the left sidebar
6. Click **Settings**
7. Choose your email service:
   - **Gmail:** For Gmail accounts
   - **SendGrid:** Free tier available
   - **Mailgun:** Free tier available
   - **ZeptoMail:** Recommended (used in Mobiris product)
   - **Other SMTP:** For custom email providers
8. Follow setup instructions to authenticate
9. Send a test email to verify configuration

**Why:** Ensures contact form emails are reliably delivered (not spam-filtered).

#### Step 6c: Install Wordfence Security (Recommended)

1. Go to **Plugins > Add New**
2. Search for **"Wordfence Security"**
3. Click **Install Now**
4. Click **Activate**
5. Go to **Wordfence** in the left sidebar
6. Complete initial setup (creates free account)
7. Run a security scan
8. Enable real-time threat intelligence

**Why:** Firewall protection, malware scanning, brute force protection.

#### Step 6d: Install W3 Total Cache or WP Super Cache (Recommended)

Choose one (not both):

**Option 1: W3 Total Cache**
1. Go to **Plugins > Add New**
2. Search for **"W3 Total Cache"**
3. Click **Install Now > Activate**
4. Go to **Performance > General Settings**
5. Enable Page Cache, Browser Cache, and CDN caching
6. Save settings

**Option 2: WP Super Cache**
1. Go to **Plugins > Add New**
2. Search for **"WP Super Cache"**
3. Click **Install Now > Activate**
4. Go to **Settings > WP Super Cache**
5. Click "Enable Caching (Recommended)"
6. Save changes

**Why:** Dramatically improves page load speed by caching pages.

#### Step 6e: Install Smush or ShortPixel (Recommended)

Choose one:

**Option 1: Smush (Free)**
1. Go to **Plugins > Add New**
2. Search for **"Smush"**
3. Click **Install Now > Activate**
4. Go to **Smush > Bulk Smush**
5. Click **Start Smushing** to optimize all images
6. Enable Auto Smush for future uploads

**Option 2: ShortPixel (Free tier)**
1. Go to **Plugins > Add New**
2. Search for **"ShortPixel Image Optimizer"**
3. Click **Install Now > Activate**
4. Get a free API key from shortpixel.com
5. Go to **ShortPixel > Settings** and enter your API key
6. Click **Bulk Process** to optimize all images

**Why:** Compresses images without quality loss, improving page speed.

#### Optional Plugins

These are optional but useful:

- **Classic Editor:** If you prefer the classic editor over block editor
- **Contact Form 7:** For more complex form features (theme has built-in form)
- **Cookiebot or Cookie Notice:** Required if using Google Analytics (GDPR compliance)
- **Yoast SEO Premium:** Not required; free version is sufficient
- **Updraft Plus:** For backup automation

### Step 7: Configure Permalinks (Important for SEO)

1. Go to **Settings > Permalinks** in WordPress admin
2. Select **Post name** (should show as `/%postname%/`)
3. Click **Save Changes**

**Why:** Creates SEO-friendly URLs instead of `?p=123` format.

### Step 8: Upload Your Logo

If you haven't already done so:

1. Go to **Appearance > Customize**
2. Click **Mobiris Theme Settings > Company Information**
3. Upload Logo (Dark) — your logo on light backgrounds
4. Upload Logo (Light) — your logo on dark backgrounds
5. Click **Publish**

**Logo requirements:**
- Format: SVG or PNG with transparent background
- Size: At least 200px × 50px
- Must work on both light and dark backgrounds
- Recommended: Create two versions (one dark, one light)

---

## 3. Performance Checklist (Pre-Launch)

Before launching to production, work through this checklist to ensure optimal performance.

### Core Web Vitals & Speed

- [ ] **Enable caching plugin**
  - [ ] Install W3 Total Cache or WP Super Cache (see Step 6d)
  - [ ] Configure page caching
  - [ ] Configure browser caching
  - [ ] Test homepage load time (should be < 3 seconds)

- [ ] **Optimize and compress all images**
  - [ ] Install Smush or ShortPixel (see Step 6e)
  - [ ] Run bulk optimization on all media
  - [ ] Ensure no image exceeds 200KB uncompressed
  - [ ] Use WebP format where possible (auto-converted by optimization plugins)

- [ ] **Set up a CDN (Cloudflare)**
  - [ ] Create free Cloudflare account at cloudflare.com
  - [ ] Change DNS to Cloudflare nameservers (ask your host for instructions)
  - [ ] Enable "Automatic Minification" under Speed > Optimization
  - [ ] Enable "Brotli" compression under Speed > Optimization
  - [ ] CDN caches images and static files globally

- [ ] **Enable server-side compression**
  - [ ] Ask your hosting provider to enable GZIP compression
  - [ ] Verify via Chrome DevTools (Network tab, check Content-Encoding)
  - [ ] Most modern hosts have this enabled by default

- [ ] **Test with Google PageSpeed Insights**
  - [ ] Go to pagespeed.web.dev
  - [ ] Enter your homepage URL
  - [ ] Review recommendations
  - [ ] Target: LCP (Largest Contentful Paint) < 2.5 seconds
  - [ ] Address any "Critical Issues"
  - [ ] Repeat for top 5 pages

- [ ] **Test with GTmetrix**
  - [ ] Go to gtmetrix.com
  - [ ] Enter your homepage URL
  - [ ] Review waterfall and grade
  - [ ] Address any "Errors" and "Warnings"

### Mobile Responsiveness

- [ ] **Test on iPhone and iPad**
  - [ ] Use Safari or Chrome
  - [ ] Check all pages render correctly
  - [ ] Verify navigation menu works (hamburger menu on mobile)
  - [ ] Test all buttons and forms
  - [ ] Check images display at right size

- [ ] **Test on Android phone and tablet**
  - [ ] Use Chrome browser
  - [ ] Same tests as iPhone above
  - [ ] Verify touch targets are large enough (minimum 44x44px)

- [ ] **Test responsive design breakpoints**
  - [ ] Desktop (1920px wide)
  - [ ] Tablet (768px wide)
  - [ ] Mobile (375px wide)
  - [ ] Use Chrome DevTools responsive design mode

### Forms & Functionality

- [ ] **Test contact form**
  - [ ] Fill out completely
  - [ ] Submit the form
  - [ ] Check that submission email arrives within 2 minutes
  - [ ] If not, verify WP Mail SMTP configuration
  - [ ] Reply to test email to confirm address works

- [ ] **Test newsletter signup (if enabled)**
  - [ ] Fill in email address
  - [ ] Submit form
  - [ ] Verify subscriber is added to your email service

- [ ] **Test all internal links**
  - [ ] Navigate through all menus
  - [ ] Click on all CTAs
  - [ ] All links should work and not return 404 errors
  - [ ] Broken Link Checker plugin can help: Plugins > Add New > search "Broken Link Checker"

- [ ] **Test external links**
  - [ ] Test links to web app (login, signup, demo booking)
  - [ ] Test social media links
  - [ ] Test app store links (if active)
  - [ ] All should open in new tabs or correct destinations

### Visual & Design

- [ ] **Verify logo displays correctly**
  - [ ] Check header on desktop
  - [ ] Check header on mobile
  - [ ] Check footer on desktop
  - [ ] Logo should not be blurry or distorted
  - [ ] Both light and dark versions should be crisp

- [ ] **Check color scheme & branding**
  - [ ] Colors match your brand guide
  - [ ] Announcement bar (if enabled) has good contrast
  - [ ] CTA buttons are visually prominent
  - [ ] Text is readable on all background colors

- [ ] **Verify homepage sections**
  - [ ] Hero section displays correctly (text + image aligned properly)
  - [ ] Stats bar shows all 4 metrics
  - [ ] Feature grid displays feature cards correctly
  - [ ] Testimonials grid shows headshots and quotes
  - [ ] Blog/Guides preview shows latest posts

- [ ] **Check footer**
  - [ ] Footer text correct (company name, copyright)
  - [ ] Social icons appear and link correctly
  - [ ] Footer menus are organized and clickable
  - [ ] Footer is visible and not cut off on mobile

### Security

- [ ] **SSL certificate verified**
  - [ ] All pages load via HTTPS (lock icon in browser)
  - [ ] No mixed content warnings (check Chrome DevTools console)
  - [ ] SSL certificate is valid and not expired

- [ ] **WordPress security hardened**
  - [ ] Wordfence plugin installed and active (see Step 6c)
  - [ ] Remove default `admin` username (see developer)
  - [ ] All plugins updated to latest versions
  - [ ] WordPress core updated to latest stable
  - [ ] Strong admin password (16+ characters, mixed case, symbols, numbers)

- [ ] **File permissions**
  - [ ] WordPress files readable but not world-writable
  - [ ] Ask hosting provider to verify CHMOD permissions
  - [ ] wp-config.php should not be publicly accessible

---

## 4. SEO Checklist (Pre-Launch)

Search engine optimization helps your site rank in Google results. Work through this checklist before launch.

### SEO Plugin Setup

- [ ] **Install SEO plugin**
  - [ ] Install either Yoast SEO or Rank Math (see Step 6a)
  - [ ] Configure with your website name
  - [ ] Set homepage title and description

### Homepage SEO

- [ ] **Homepage title**
  - [ ] Go to Yoast/Rank Math settings for home page
  - [ ] Set a title (60 characters max)
  - [ ] Include main keyword
  - [ ] Example: "Mobiris | Biometric Fleet Operations Platform"

- [ ] **Homepage meta description**
  - [ ] Set a 155-160 character description
  - [ ] Include main keywords
  - [ ] Make it compelling (appears in Google results)
  - [ ] Example: "Real-time biometric verification for transport operators. Track vehicles, prevent fraud, ensure compliance."

- [ ] **Homepage featured image**
  - [ ] Set a featured image for OpenGraph (social sharing)
  - [ ] Size: 1200px × 630px recommended
  - [ ] Must be professional and branded

### Key Pages SEO

For each of these pages, configure SEO metadata:

Pages to configure:
- [ ] About page — set title and meta description
- [ ] Platform page — set title and meta description
- [ ] Features page — set title and meta description
- [ ] Pricing page — set title and meta description
- [ ] Solutions page — set title and meta description
- [ ] Contact page — set title and meta description
- [ ] Guides page — set title and meta description
- [ ] FAQ page — set title and meta description
- [ ] Blog page — set title and meta description

**For each page:**
1. Edit the page
2. Look for Yoast/Rank Math settings
3. Set SEO title (under 60 characters)
4. Set meta description (155-160 characters)
5. Include target keywords naturally
6. Update the page

### Sitemap & Indexing

- [ ] **Verify XML sitemap is generated**
  - [ ] With Yoast/Rank Math installed, go to Settings > General > Sitemaps
  - [ ] Verify that the sitemap URL works: `yoursite.com/sitemap.xml`
  - [ ] The sitemap should list all pages and posts

- [ ] **Submit to Google Search Console**
  - [ ] Go to search.google.com/search-console
  - [ ] Add your website property
  - [ ] Verify ownership (add TXT record to DNS or HTML tag)
  - [ ] Go to Sitemaps
  - [ ] Add your sitemap URL (`yoursite.com/sitemap.xml`)
  - [ ] Google will crawl and index your site

- [ ] **Submit to Bing Webmaster Tools**
  - [ ] Go to bing.com/webmasters
  - [ ] Add your website
  - [ ] Verify ownership
  - [ ] Submit sitemap
  - [ ] Bing will index your content

### Rich Snippets & Schema

- [ ] **Verify FAQ schema**
  - [ ] Go to Google Rich Results Test (search.google.com/test/rich-results)
  - [ ] Enter your FAQ page URL
  - [ ] Verify FAQPage schema is detected
  - [ ] If not detected, Yoast may not be outputting it (contact developer)

- [ ] **Verify Organization schema**
  - [ ] Use Rich Results Test with your homepage URL
  - [ ] Should detect Organization schema
  - [ ] Verify company name, contact info, etc. are correct

- [ ] **Test Open Graph tags**
  - [ ] Go to Facebook Sharing Debugger (facebook.com/sharing/debugger)
  - [ ] Enter your homepage URL
  - [ ] Verify that OG title, description, and image appear correctly
  - [ ] This is how your site looks when shared on social media

### Canonical URLs

- [ ] **Verify canonical URLs are set**
  - [ ] Yoast/Rank Math automatically set canonical URLs
  - [ ] Check a few pages in browser source (right-click > View Page Source)
  - [ ] Look for `<link rel="canonical" href="..."`
  - [ ] Should match the current page URL

### Keywords & Metadata

- [ ] **Ensure each page targets specific keywords**
  - [ ] Homepage: "Biometric fleet operations", "fleet management Africa"
  - [ ] Features: "biometric verification features", "fleet tracking"
  - [ ] Pricing: "mobiris pricing", "fleet software cost"
  - [ ] Contact: "contact Mobiris", "get support"
  - [ ] Use Yoast keyword focus feature for guidance

---

## 5. Key Assumptions Made During Development

The Mobiris WordPress theme was developed with certain assumptions about your infrastructure, product, and business. Verify all of these assumptions before launch, as they could affect how the site functions or what appears to users.

### 5.1 Web Application URLs

**Assumption: Login URL Structure**
- **Assumed URL:** `https://app.mobiris.ng/login`
- **Basis:** Derived from Next.js App Router path `/(auth)/login` in the Mobiris SaaS application
- **What uses this:** Header "Login" button, Access & Login page, login CTAs throughout site
- **Action required:**
  - [ ] Verify this exact URL exists in your app
  - [ ] Test the link before launch
  - [ ] If URL is different, update in Customizer > App & Platform Links > Login URL

**Assumption: Signup/Register URL Structure**
- **Assumed URL:** `https://app.mobiris.ng/signup`
- **Basis:** Standard signup route pattern
- **What uses this:** "Get Started" buttons, signup CTAs
- **Action required:**
  - [ ] Verify this exact URL exists and is functional
  - [ ] Test the signup flow before launch
  - [ ] If URL is different, update in Customizer > App & Platform Links > Signup URL

**Assumption: Web App Main URL**
- **Assumed URL:** `https://app.mobiris.ng`
- **Basis:** Standard SaaS subdomain convention
- **What uses this:** General app links, CTAs
- **Action required:**
  - [ ] Verify your app domain
  - [ ] Ensure it's accessible and has proper SSL
  - [ ] Update in Customizer if different

### 5.2 Mobile App Status

**Assumption: iOS and Android Apps Not Yet Published**
- **Current status:** No App Store or Google Play URLs exist in the codebase
- **What the site shows:** "Coming Soon" badges on app download buttons
- **When you're ready to publish:**
  1. Publish your iOS app to Apple App Store
  2. Get the full App Store link (e.g., `https://apps.apple.com/ng/app/mobiris/id1234567890`)
  3. Go to Customizer > App & Platform Links > iOS App Store URL
  4. Paste the link and publish
  5. Repeat for Android/Google Play Store

**Assumption: Mobile App Bundle ID**
- **Found in codebase:** `com.discipledeckapp.mobilityos`
- **Purpose:** Used to construct deep linking URLs and identify the app
- **Action required:**
  - [ ] Confirm if this is the final bundle ID
  - [ ] If different, it needs to be updated in the codebase (developer task)
  - [ ] This is not user-configurable in the theme

**Assumption: App Screenshots Placeholder**
- **Current state:** Hero section and app download section use placeholder SVG graphics
- **Action required before launch:**
  - [ ] Capture real screenshots of your mobile app
  - [ ] Crop to 1200px × 630px for hero section (landscape)
  - [ ] Crop to 500px × 800px for app section (portrait)
  - [ ] Upload via Customizer > Homepage Hero Section > Hero Image
  - [ ] Upload via Customizer > Homepage App Download > App Download Screenshot
  - [ ] Replace placeholder images with real product screenshots

---

### 5.3 Driver Self-Service Portal

**Assumption: Driver Portal URL**
- **Found in codebase:** `/driver-self-service` route
- **Purpose:** Allows drivers to manage their own information (invitations, documents, etc.)
- **What the site says:** "Invitation-only" on the Access & Login page
- **Action required:**
  - [ ] Verify the full URL (e.g., `https://app.mobiris.ng/driver-self-service`)
  - [ ] Confirm this route exists in your application
  - [ ] Test before launch
  - [ ] If URL differs, update via theme developer

---

### 5.4 Typography & Fonts

**Assumption: Primary Font is DM Sans**
- **Source:** Theme's `mobiris-brand.ts` file specifies `DM Sans` as the primary font
- **Loaded via:** Google Fonts in the theme's enqueue.php
- **What the brand guide said:** Earlier documentation mentioned `Inter` as primary
- **Resolution:** `DM Sans` is the authoritative choice (from codebase)
- **Action required:**
  - [ ] Verify DM Sans is the font you want
  - [ ] If you prefer `Inter` or another font, contact developer to update
  - [ ] Current implementation: DM Sans for all text, works across all browsers

**Why this matters:** Typography is foundational to brand identity. Ensure the font matches your brand guidelines.

---

### 5.5 Pricing Data

**Assumption: Pricing is Hardcoded**
- **Current prices (NGN):**
  - Starter: ₦15,000/month
  - Professional: ₦35,000/month
  - Enterprise: ₦1,500/vehicle/month
- **Location in theme:** Hardcoded in:
  - `/page-templates/template-pricing.php`
  - `/template-parts/home/pricing.php`
- **Why hardcoded:** Pricing is a strategic decision; not meant to be user-configurable
- **Action required if pricing changes:**
  - [ ] Contact developer to update pricing template files
  - [ ] Cannot be changed via WordPress admin customizer
  - [ ] Pricing includes plans and feature lists (all hardcoded)

**Note:** Price changes require theme file updates. If you anticipate frequent price changes, this should be refactored into a custom data structure (developer task).

---

### 5.6 Country-Specific Information

**Assumption: Multi-country References**
- **Primary market:** Nigeria (₦ Nigerian Naira currency)
- **Secondary markets referenced in codebase:**
  - Ghana (GHS - Ghanaian Cedi)
  - Kenya (KES - Kenyan Shilling)
  - South Africa (ZAR - South African Rand)
- **How it appears:** Some pages reference multiple countries; pricing in these countries shows "Contact us" instead of set prices
- **WhatsApp number:** `+2348053108039` (Nigerian number)
- **Action required:**
  - [ ] Verify the WhatsApp number is correct
  - [ ] If you operate in other countries, confirm currency references are accurate
  - [ ] Update WhatsApp number in Customizer if different

---

### 5.7 Legal & Compliance Documents

**Assumption: Blank Legal Pages Created**
- **Pages created:** Privacy Policy, Terms of Service
- **Current state:** Pages exist but are blank (no content)
- **Why blank:** Legal documents are company-specific; must be written by your legal team or counsel
- **Action required before launch:**
  - [ ] Do NOT launch with blank legal pages
  - [ ] Consult with your legal team
  - [ ] Write or obtain your company's Privacy Policy
  - [ ] Write or obtain your Terms of Service
  - [ ] Edit these pages in WordPress admin and paste the content
  - [ ] Ensure they comply with:
    - GDPR (if serving EU customers)
    - CCPA (if serving US customers)
    - Local laws in each country you serve

**Note:** Using template legal documents from competitors is not recommended. Use your own company-specific documents.

---

### 5.8 Contact Form Configuration

**Assumption: Email Service via WordPress wp_mail()**
- **Current implementation:** Contact form uses WordPress's built-in email function
- **Default mail method:** Uses server sendmail command (unreliable)
- **Best practice:** Install WP Mail SMTP plugin (see Step 6b) and configure with:
  - **Gmail** (if using company Gmail)
  - **ZeptoMail** (already used in Mobiris product stack)
  - **SendGrid** (free tier: 40,000 emails/month)
  - **Mailgun** (free tier: 5,000 emails/month)
- **Action required:**
  - [ ] Install WP Mail SMTP plugin
  - [ ] Configure with your email service
  - [ ] Test contact form before launch
  - [ ] Verify submissions arrive in inbox (not spam)

---

### 5.9 SEO & Schema Markup

**Assumption: Baseline SEO Markup Included**
- **What's automatic:** Open Graph tags, Twitter Card, Organization schema, FAQ schema
- **What's NOT included:** Per-page SEO customization
- **What to add:** Install Yoast SEO or Rank Math for full control (see Step 6a)
- **FAQ Schema:** The theme automatically outputs `FAQPage` schema when FAQs are present
- **Why it matters:** Rich snippet markup helps Google display your content better in search results

---

### 5.10 No Paid WordPress Plugins Required

**Assumption: Free plugins sufficient for launch**
- **Confirmed:** The Mobiris theme is fully functional without any paid plugins
- **Recommended paid plugins (optional, not required):**
  - Yoast SEO Premium (free version is sufficient)
  - WP Rocket (premium caching; free alternative W3 Total Cache works)
  - Elementor Pro (not needed; theme uses blocks)
- **For launch:** Use all free plugins listed in Step 6

---

### 5.11 Newsletter Integration Not Pre-configured

**Assumption: Newsletter tool integration is optional**
- **Current state:** Footer has optional "Show Newsletter Signup" toggle
- **What's NOT included:** Pre-configured integration with MailChimp, Brevo, etc.
- **If you want newsletter signup:**
  1. Install a newsletter plugin (MailerLite, Brevo, Constant Contact, etc.)
  2. Configure the plugin's settings
  3. The form will work with that plugin's backend
  4. Enable "Show Newsletter Signup in Footer" toggle in Customizer

---

### 5.12 No Analytics Pre-installed

**Assumption: Privacy-first approach (no cookies by default)**
- **Current state:** No analytics script is embedded in the theme
- **Why:** Mobiris product is privacy-focused; WordPress theme follows same philosophy
- **If you want analytics:**
  1. Choose privacy-first (Plausible) OR standard (Google Analytics)
  2. Configure via WP Mail SMTP or by adding script to header.php
  3. See section 5.14 below for implementation

---

## 6. Theme File Structure Reference

The Mobiris theme is organized into a clear directory structure. This reference shows every file and folder with a one-line description.

```
mobiris-theme/
│
├── style.css                          # Theme identification header (name, author, version)
├── functions.php                      # Main theme bootstrap file
├── index.php                          # Fallback template
├── front-page.php                     # Homepage template
├── home.php                           # Blog archives template
├── page.php                           # Default page template
├── single.php                         # Single blog post template
├── single-guide.php                   # Single guide/resource post template
├── single-testimonial.php             # Single testimonial template
├── archive.php                        # Generic archive (categories, tags, dates)
├── archive-guide.php                  # Guide custom post type archive
├── search.php                         # Search results template
├── 404.php                            # Not found (404 error) template
│
├── header.php                         # HTML <head> and <header> (navigation)
├── footer.php                         # Site footer and closing HTML </body>
├── screenshot.png                     # Theme screenshot for WordPress themes page
│
├── inc/                               # Theme include files (functions)
│   ├── theme-setup.php                # Theme supports, menus, image sizes, sidebar registration
│   ├── enqueue.php                    # Enqueue CSS/JS files and Google Fonts
│   ├── customizer.php                 # WordPress Customizer settings (89 customizable options)
│   ├── custom-post-types.php          # CPT registration: guide, faq, testimonial, solution, feature
│   ├── template-functions.php         # Helper functions (mobiris_render_button, mobiris_get_posts, etc.)
│   ├── seo.php                        # SEO output: Open Graph, Twitter Card, JSON-LD schema
│   └── walker-nav.php                 # Custom nav menu walker for dropdown menu markup
│
├── assets/
│   ├── css/
│   │   └── main.css                   # All theme styles (~2100 lines, comprehensive styling)
│   ├── js/
│   │   ├── navigation.js              # Navigation toggle, dropdown menus, sticky header
│   │   └── main.js                    # FAQ accordion, form handling, scroll effects
│   └── images/                        # Static images (fallback favicon, placeholder SVGs, etc.)
│
├── template-parts/                    # Reusable template partials
│   ├── home/                          # Homepage section components
│   │   ├── hero.php                   # Hero banner section (headline, CTA, background image)
│   │   ├── stats.php                  # Statistics bar (4 metrics display)
│   │   ├── problem.php                # Problem statement section (3 pain points)
│   │   ├── features.php               # Feature grid (displays feature CPT or fallback)
│   │   ├── intelligence.php           # Intelligence plane differentiator section
│   │   ├── how-it-works.php           # 3-step process section
│   │   ├── testimonials.php           # Testimonials carousel/grid (CPT-driven)
│   │   ├── pricing.php                # Pricing cards (3 tiers, hardcoded pricing)
│   │   ├── app-download.php           # App CTA section with app store buttons
│   │   ├── blog-preview.php           # Latest blog posts preview grid
│   │   ├── guides-preview.php         # Latest guides preview grid
│   │   └── cta-band.php               # Bottom call-to-action banner
│   ├── content/                       # Content card partials
│   │   ├── post.php                   # Blog post preview card (title, excerpt, image, date)
│   │   ├── guide.php                  # Guide preview card (title, excerpt, image)
│   │   └── testimonial.php            # Testimonial card (quote, name, company, image)
│   └── global/                        # Globally reusable partials
│       ├── breadcrumbs.php            # Breadcrumb navigation (for hierarchical context)
│       └── social-share.php           # Social media share buttons
│
└── page-templates/                    # WordPress page templates (one per key page)
    ├── template-about.php             # About page template
    ├── template-platform.php          # Platform overview page template
    ├── template-features.php          # Features listing page template
    ├── template-solutions.php         # Solutions/use cases page template
    ├── template-pricing.php           # Pricing page with ROI calculator and feature matrix
    ├── template-contact.php           # Contact form page template
    ├── template-app-download.php      # Get the App / downloads page template
    ├── template-access.php            # Access & Login portal page template
    ├── template-resources.php         # Guides & Resources archive template
    └── template-faq-page.php          # FAQ page with accordion and FAQPage schema
```

### 6.1 File Descriptions in Detail

#### Core Files

**functions.php**
- Main theme bootstrap file
- Loads all files from `/inc/` directory
- Registers AJAX handlers for dynamic functionality
- Initializes shortcodes
- ~50 lines; delegates most logic to /inc/ files

**header.php**
- Outputs HTML `<head>` tag with meta tags, title, stylesheets
- Contains site header markup (logo, navigation, CTA buttons)
- Includes announcement bar if enabled
- Sticky header implementation

**footer.php**
- Site footer with company info, menus, social icons, copyright
- Newsletter signup form (optional)
- Closes all HTML tags (body, html)
- ~60 lines

#### Inc Files

**inc/theme-setup.php**
- `add_theme_support()` for features (post thumbnails, title tag, HTML5, custom logo, etc.)
- `register_nav_menus()` for Primary, Footer menus
- Image size registration (thumbnail, medium, large, hero, etc.)
- Sidebar/widget area registration

**inc/enqueue.php**
- `wp_enqueue_style()` — Load main.css and Google Fonts (DM Sans)
- `wp_enqueue_script()` — Load navigation.js and main.js
- Conditional loading (load on specific pages only)
- Version strings for cache busting

**inc/customizer.php**
- Defines all 89 customizable settings
- Grouped into sections: Company Info, Contact, Social, Header, Footer, etc.
- Each setting: title, description, type (text, color, image, toggle)
- Default values and sanitization functions
- ~1000+ lines; core customizer configuration

**inc/custom-post-types.php**
- Register 5 custom post types:
  - `guide` — Longer-form educational content
  - `faq` — Question/answer pairs with FAQPage schema
  - `testimonial` — Customer quotes with custom meta fields
  - `solution` — Industry use cases / problem solutions
  - `feature` — Product feature highlights
- Each CPT includes custom taxonomy (category) definitions

**inc/template-functions.php**
- Helper functions used throughout templates:
  - `mobiris_render_button()` — Render styled buttons with consistent markup
  - `mobiris_get_posts()` — Fetch posts of a specific type with filters
  - `mobiris_get_hero_image()` — Get hero section image from customizer or fallback
  - `mobiris_format_stat_value()` — Format stat numbers (add thousands separator, suffix)
  - And 10+ more utility functions

**inc/seo.php**
- Outputs all SEO metadata in `<head>`:
  - `<meta name="description">` — Meta description for Google
  - `<meta property="og:title">` — Open Graph title (social sharing)
  - `<meta property="og:description">` — Open Graph description
  - `<meta property="og:image">` — Featured image for social sharing
  - `<meta name="twitter:card">` — Twitter Card for Twitter sharing
  - `<script type="application/ld+json">` — FAQ schema, Organization schema
- Dynamically pulls from post/page meta and customizer settings
- Fallback to homepage data if page-specific data unavailable

**inc/walker-nav.php**
- Custom nav menu walker class
- Outputs semantic HTML for menu items
- Handles dropdown menu structure (wraps submenus in `<ul>` with class)
- Adds active states to current page menu item

#### CSS & JS

**assets/css/main.css**
- Single comprehensive stylesheet (~2100 lines)
- Variables section (colors, fonts, spacing)
- Base typography and reset rules
- Layout utilities (grid, flexbox helpers)
- Component styles (buttons, cards, sections, hero, testimonials, etc.)
- Responsive breakpoints (mobile, tablet, desktop)
- No CSS framework; custom written from scratch

**assets/js/navigation.js**
- Mobile hamburger menu toggle logic
- Dropdown menu hover/click handlers
- Sticky header scroll detection
- Click-outside detection to close menus
- Mobile menu animation

**assets/js/main.js**
- FAQ accordion expand/collapse
- Contact form validation and submission handling
- Stat counter animation (number increments on scroll)
- Scroll reveal animations for sections
- Form field validation

#### Page Templates

**page-templates/template-about.php**
- About page layout
- Mission statement section
- Company values section
- Call-to-action section
- Pulls editable content from page body

**page-templates/template-platform.php**
- Platform overview page
- Three-plane diagram section
- Module/feature overview
- CTA for demo booking
- Mostly hardcoded layout; body content editable

**page-templates/template-features.php**
- Lists all published features (from Feature CPT)
- Displays feature cards in a grid
- Each card: feature name, description, optional icon
- Click to expand or link to detail

**page-templates/template-pricing.php**
- Three pricing tiers (hardcoded: Starter, Professional, Enterprise)
- Each tier: price, features list, CTA button
- Feature comparison matrix
- FAQs related to pricing section
- **WARNING:** Prices are hardcoded; requires developer to update

**page-templates/template-contact.php**
- Page title and description
- Embedded contact form via `[mobiris_contact_form]` shortcode
- Form fields: name, email, message
- Form submission email configuration

**page-templates/template-faq-page.php**
- Fetches all published FAQs
- Displays in accordion (collapsible Q&A)
- FAQPage JSON-LD schema for Google rich snippets
- Optional category filtering
- Search functionality (built-in by WordPress)

#### Homepage Sections

All homepage sections are in `template-parts/home/`:

**hero.php**
- Hero banner at top of homepage
- Headline, subheading, CTA buttons
- Background image from customizer or fallback
- Layout options: centered, split-left, split-right
- Optional text overlay color

**stats.php**
- 4 key metrics display (animated counters on scroll)
- Stat label, number value, optional suffix
- All stats configured in customizer
- Responsive grid (2 columns mobile, 4 columns desktop)

**problem.php**
- "Problems We Solve" section
- 3 pain points displayed as cards
- Each card: icon, title, description
- Hardcoded content (requires developer to change)

**features.php**
- Feature cards grid
- Pulls from Feature CPT or displays hardcoded fallbacks
- Each card: icon/image, title, description
- Responsive (1-2 columns mobile, 3 columns desktop)

**intelligence.php**
- Differentiator section (intelligence plane concept)
- Headline and description
- Toggleable in customizer (Show/Hide)

**testimonials.php**
- Carousel or grid of customer testimonials
- Pulls from Testimonial CPT
- Each testimonial: quote, name, role, company, headshot
- Navigation arrows or pagination

**pricing.php**
- 3 pricing tiers (hardcoded)
- Each card: tier name, price, feature list, CTA
- Emphasis on middle tier (Professional)
- "Contact us for custom plans" section

**app-download.php**
- "Get the App" CTA section
- App headline, description, screenshot
- iOS and Android download buttons
- Links pull from customizer App & Platform Links

**blog-preview.php**
- Latest blog posts grid
- Number of posts configurable in customizer
- Each post card: thumbnail, title, excerpt, date, read more link
- Links to blog archive page

**guides-preview.php**
- Latest guides/resources grid
- Number of guides configurable in customizer
- Each guide card: thumbnail, title, excerpt, read more link
- Links to guides archive page

**cta-band.php**
- Call-to-action banner (typically near bottom of homepage)
- Title, subtitle, CTA button
- All text and button URL configurable in customizer
- Full-width background color section

---

## 7. Creating a Theme Screenshot

WordPress displays a screenshot.png file on the Themes page. The theme needs a professional screenshot to look complete.

**Screenshot requirements:**
- Size: 1200px × 900px (4:3 aspect ratio)
- Format: PNG or JPEG
- Location: Root of mobiris-theme folder (same level as style.css)

### Option 1: Browser Screenshot Method (Easiest)

1. Activate the Mobiris theme
2. Go to the homepage (yoursite.com)
3. Configure customizer with your logo and colors
4. Open browser developer tools (F12)
5. Press Ctrl+Shift+M (Windows) or Cmd+Shift+M (Mac) for responsive view
6. Set width to 1200px
7. Take a full-page screenshot using a tool:
   - Chrome: More tools > Take screenshot (Ctrl+Shift+S)
   - Firefox: Right-click > Take Screenshot
8. Crop the screenshot to 1200px × 900px
9. Save as screenshot.png
10. Upload to mobiris-theme folder

### Option 2: Design Tool Method (Best Quality)

1. Open Figma or Adobe XD
2. Create a 1200px × 900px artboard
3. Design a mockup showing:
   - Your logo
   - Hero section with headline
   - Feature cards or stats
   - Color scheme
   - Call-to-action buttons
4. Export as PNG
5. Save as screenshot.png
6. Upload to mobiris-theme folder

### Option 3: Screenshot Tool (WordPress.org)

1. Install "Theme Screenshots" plugin
2. Go to the homepage
3. Click the camera icon to capture
4. Select the hero section area
5. Download the screenshot
6. Save as screenshot.png

---

## 8. Recommended Production Stack

This section recommends the hosting, services, and tools to use for production deployment.

### Hosting & Infrastructure

| Layer | Recommendation | Details |
|-------|---------------|---------|
| **Web Server** | Render, Railway, or Hostinger (VPS) | Avoid shared hosting; SSD required, auto-scaling preferred |
| **WordPress Installation** | Self-hosted (wordpress.org) | Not WordPress.com (that's limited managed hosting) |
| **Database** | Managed PostgreSQL or MySQL | Most hosts provide this; verify PostgreSQL 16+ or MySQL 8.0+ |
| **PHP** | PHP 8.2+ | Verify with hosting provider; test before deployment |
| **SSL Certificate** | Let's Encrypt (free via Certbot) | Required for HTTPS; most hosts auto-configure |
| **CDN** | Cloudflare (free tier) | Global content delivery, DDoS protection, image optimization |

### Email Delivery

| Service | Cost | Notes |
|---------|------|-------|
| **ZeptoMail** | Free tier or paid | Already used in Mobiris product; consistent choice |
| **SendGrid** | Free tier: 40k/month | Reliable; good integration with WP Mail SMTP |
| **Mailgun** | Free tier: 5k/month | Flexible; good for high volume |
| **Gmail** | Free (with company account) | Simple setup but limited; works via WP Mail SMTP |

**Setup:** Install WP Mail SMTP plugin and configure with your chosen service.

### Analytics & Monitoring

| Service | Type | Cost |
|---------|------|------|
| **Plausible** | Privacy-first analytics | €20/month (recommended for brand consistency) |
| **Google Analytics** | Standard analytics | Free (requires cookie banner) |
| **Sentry** | Error tracking | Free tier available (for JavaScript errors) |
| **UptimeRobot** | Uptime monitoring | Free tier (sends alerts if site goes down) |

### Backup & Security

| Service | Purpose | Cost |
|---------|---------|------|
| **UpdraftPlus** | WordPress backups | Free plugin (cloud storage optional) |
| **Wordfence** | Security & firewall | Free plugin (premium tier for advanced features) |
| **Akismet** | Spam protection | Free for personal sites, ~$10/month for commercial |

### Domain & DNS

| Service | Notes |
|---------|-------|
| **GoDaddy, Namecheap, Cloudflare** | Domain registrar (choose any; Cloudflare DNS is recommended) |
| **Cloudflare Nameservers** | Free global DNS with DDoS protection, SSL, caching |

---

## 9. Pre-Launch Deployment Checklist

Final checklist before making your site live to the public:

### Functional Testing
- [ ] Contact form sends emails correctly
- [ ] All internal links work (no 404s)
- [ ] All external links work (app, demo, social)
- [ ] Navigation menus work on desktop and mobile
- [ ] Search functionality works (if enabled)
- [ ] Blog, guides, FAQs, testimonials all display

### Performance
- [ ] Homepage load time < 3 seconds (PageSpeed Insights)
- [ ] LCP (Largest Contentful Paint) < 2.5 seconds
- [ ] Images optimized and compressed
- [ ] Caching plugin enabled
- [ ] CDN configured (Cloudflare)

### Security
- [ ] HTTPS enabled (lock icon in browser)
- [ ] No mixed content warnings
- [ ] SSL certificate valid and not expired
- [ ] Wordfence security scan passing
- [ ] No vulnerable plugins
- [ ] Strong admin password set

### SEO
- [ ] Homepage meta description set
- [ ] Key pages have SEO titles and descriptions
- [ ] Sitemap.xml accessible
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Open Graph tags verified (Facebook Sharing Debugger)

### Content
- [ ] Legal pages (Privacy, Terms) have content
- [ ] At least 3-4 blog posts published
- [ ] At least 5-10 FAQs added
- [ ] At least 3 testimonials added
- [ ] At least 1-2 guides published
- [ ] Homepage sections all configured and display correctly

### Configuration
- [ ] Logo appears correctly in header and footer
- [ ] Company name and contact info configured
- [ ] All app/platform links set correctly
- [ ] Email configuration verified
- [ ] WhatsApp number correct
- [ ] Social media links correct

### Analytics (if implementing)
- [ ] Analytics code installed (Plausible or Google Analytics)
- [ ] Test event tracking works
- [ ] Dashboard accessible from your account

### Final Verification
- [ ] Mobile responsiveness verified on real devices
- [ ] Browser compatibility checked (Chrome, Firefox, Safari, Edge)
- [ ] Dark mode (if applicable) tested
- [ ] Form submissions tested
- [ ] Share buttons tested (LinkedIn, Facebook, Twitter)

---

**End of Installation, Setup & Assumptions Guide**

This guide provides everything needed to install, configure, and launch the Mobiris WordPress theme on a production server. For any issues not covered here, contact your theme developer or the Mobiris team.

