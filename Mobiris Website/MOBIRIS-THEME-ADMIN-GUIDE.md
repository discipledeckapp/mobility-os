# Mobiris WordPress Theme — Admin Configurability Guide

This comprehensive guide is written for WordPress site administrators who know how to use WordPress but are not developers. Every section includes step-by-step instructions to help you configure and manage the Mobiris website.

---

## 1. Getting Started

### 1.1 Overview: What You Can Configure vs. What Requires a Developer

**You can configure (via the WordPress admin panel):**
- Company information (name, logos, contact details)
- Website text and messaging across all pages
- Navigation menus
- Blog posts, guides, FAQs, testimonials, and case studies
- Homepage sections (enable/disable specific sections, update headlines and images)
- Footer settings and links
- SEO metadata
- Contact form destination email

**What requires a developer:**
- Changing the overall website layout or design
- Adding new page templates or homepage sections
- Changing pricing data (currently hardcoded)
- Modifying JavaScript functionality
- Setting up custom integrations (API connections, webhooks)
- Installing or configuring plugins beyond the recommended list

### 1.2 Accessing WordPress Customizer

The WordPress Customizer is where you'll configure most Mobiris settings:

1. Log in to your WordPress admin dashboard at `yoursite.com/wp-admin`
2. Click **Appearance** in the left sidebar
3. Click **Customize**
4. You'll see the Mobiris Theme Settings panel on the left side
5. Click any section to expand it and view its options
6. Changes are saved immediately (you'll see "Publishing..." then "Saved" status)
7. You can preview changes on the right side as you make them

### 1.3 Navigating the Mobiris Theme Settings Panel

When you open Appearance > Customize, you'll see these main sections in the Mobiris Theme Settings panel:

- **Site Identity** — Logo, site name, tagline (WordPress default)
- **Company Information** — Extended company details
- **Contact & Communication** — Email, phone, WhatsApp
- **Social Media Links** — Links to all social platforms
- **App & Platform Links** — Links to your web app, mobile apps, and signup
- **Header & Navigation** — CTA buttons, announcement bar
- **Footer Settings** — Footer text and toggles
- **Homepage Hero Section** — Headline, subheading, CTA buttons, hero image
- **Homepage Stats** — Key metrics to display
- **Homepage Intelligence Section** — Differentiators
- **Homepage App Download** — Mobile app CTA section
- **Homepage CTA Band** — Bottom call-to-action
- **Homepage Trust & Partners** — Enable/disable partners section
- **Blog & Guides Preview** — Blog and guides settings

Each section is collapsible. Click the section name to expand it and see all available options for that section.

---

## 2. Global Settings (Customizer > Mobiris Theme Settings)

This section explains every global setting in the Customizer and where it appears on your website.

### 2.1 Company Information

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Company Information

**Company Name**
- **What it does:** Sets the official name of your company
- **Where it appears:** In the header, footer, browser tab title, and legal documents
- **What to enter:** Your full company name (e.g., "Mobiris")
- **Example:** "Mobiris Nigeria Limited"
- **Constraints:** Keep to 50 characters or less for the browser tab display

**Company Tagline**
- **What it does:** Short description of what your company does
- **Where it appears:** Below the company name in the header and footer, and in site-wide SEO metadata
- **What to enter:** A one-line description of your core service
- **Example:** "Biometric fleet operations platform"
- **Constraints:** Keep to 100 characters for best display

**Logo (Dark Version)**
- **What it does:** Your main logo, used on light backgrounds
- **Where it appears:** Header (against white background), pages with light backgrounds
- **What to enter:** Upload an SVG or PNG file with a transparent background
- **Recommended size:** 200px × 50px (logo height should be ~40-50px)
- **Format:** SVG preferred (scales perfectly), or PNG with transparency
- **How to upload:**
  1. Click "Select Logo"
  2. Choose an image from your computer or media library
  3. Click "Select" to confirm
  4. The logo will display in the preview pane on the right

**Logo (Light Version)**
- **What it does:** Alternate logo for dark backgrounds
- **Where it appears:** Footer, dark sections of the website
- **What to enter:** A lighter/white version of your logo
- **Recommended size:** Same as dark version (200px × 50px)
- **Format:** SVG or PNG with transparency
- **Why two versions:** The light version is essential for visibility on dark footer backgrounds

**Favicon**
- **What it does:** The small icon that appears in browser tabs
- **Where it appears:** Browser tab, bookmarks bar, address bar
- **What to enter:** A small square image (at least 512px × 512px)
- **Recommended format:** PNG or ICO
- **How to upload:** Click "Select Favicon" > choose your image > click "Select"

---

### 2.2 Contact & Communication

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Contact & Communication

**Primary Email Address**
- **What it does:** The email where contact form submissions will be sent
- **Where it appears:** Used by the contact form on the Contact page and via [mobiris_contact_form] shortcode
- **What to enter:** The email address that should receive inquiries
- **Example:** "support@mobiris.ng" or "sales@mobiris.ng"
- **Important:** Make sure this email account exists and you can access it

**Secondary Email Address (optional)**
- **What it does:** An additional email to receive copies of contact form submissions
- **Where it appears:** Contact form notifications only
- **What to enter:** Another email address (e.g., for a manager or support team member)
- **Example:** "admin@mobiris.ng"
- **Constraints:** Must be a valid email format

**Phone Number**
- **What it does:** Your main business phone number
- **Where it appears:** Contact page, footer, and anywhere phone contact is displayed
- **What to enter:** Full phone number with country code
- **Example:** "+234 805 310 8039"
- **Format tip:** Include the + and country code for international clarity

**WhatsApp Number**
- **What it does:** Business WhatsApp for Click-to-Chat links
- **Where it appears:** WhatsApp button in header, contact sections, contact page
- **What to enter:** Phone number in international format (without + symbol in this field)
- **Example:** "2348053108039"
- **Important:** This must be a valid WhatsApp Business account. When someone clicks the WhatsApp button, they'll open a chat with this number.
- **How it works:** The theme creates a link in the format `https://wa.me/2348053108039` — messages are not pre-populated, just the chat window opens

**Office Address**
- **What it does:** Your physical office location
- **Where it appears:** Footer, contact page, and location maps
- **What to enter:** Full street address with building name, street, area, city
- **Example:** "123 Lekki Phase 1, Lagos, Nigeria"

---

### 2.3 Social Media Links

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Social Media Links

The theme supports 5 social media platforms. For each platform, you'll see two fields:

**[Platform] Enable/Disable Toggle**
- Check the box to show the icon in the header/footer
- Uncheck to hide it
- Only add links for platforms where you actually have an active account

**[Platform] URL**
- What to enter: The full URL to your profile on that platform
- Always include `https://` at the start

**LinkedIn**
- **Where it appears:** Header social icons, footer social icons, in-page linking
- **URL format:** `https://linkedin.com/company/mobiris` (for company page) or `https://linkedin.com/in/yourprofile`
- **Example:** `https://linkedin.com/company/mobiris-ng`

**Twitter/X**
- **Where it appears:** Header social icons, footer social icons
- **URL format:** `https://twitter.com/mobiris` or `https://x.com/mobiris`
- **Example:** `https://twitter.com/mobirisng`

**Facebook**
- **Where it appears:** Header social icons, footer social icons
- **URL format:** `https://facebook.com/mobiris` or `https://facebook.com/pages/.../`
- **Example:** `https://facebook.com/mobirisng`

**Instagram**
- **Where it appears:** Header social icons, footer social icons
- **URL format:** `https://instagram.com/mobiris`
- **Example:** `https://instagram.com/mobirisng`

**YouTube**
- **Where it appears:** Header social icons, footer social icons
- **URL format:** `https://youtube.com/@mobiris` or `https://youtube.com/c/mobiris`
- **Example:** `https://youtube.com/@mobirisng`

**Best Practices:**
- Only enable platforms you actively post to
- Update these links regularly if your handle changes
- Test each link to make sure it goes to the correct profile
- Remove links to profiles you no longer maintain

---

### 2.4 App & Platform Links

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > App & Platform Links

This section controls links to your web application and mobile apps.

**Web App URL**
- **What it does:** Link to your main SaaS application
- **Where it appears:** Header CTA button, multiple CTAs throughout the site
- **What to enter:** Full URL to your app login/dashboard
- **Example:** `https://app.mobiris.ng`
- **Important:** This should be the main entry point for users to access the platform

**Login URL**
- **What it does:** Direct link to login page
- **Where it appears:** "Login" button in header, Access page
- **What to enter:** Full URL to the login page
- **Example:** `https://app.mobiris.ng/login`
- **Verify before launch:** Ensure this exact URL exists in your application

**Signup/Register URL**
- **What it does:** Link where new users can create an account
- **Where it appears:** "Get Started" CTAs, signup callouts
- **What to enter:** Full URL to signup page
- **Example:** `https://app.mobiris.ng/signup`
- **Verify before launch:** Make sure this URL exists and the signup form is functional

**iOS App Store URL**
- **What it does:** Link to download the app from Apple App Store
- **Where it appears:** App Download page, app CTA buttons throughout site
- **What to enter:** Full URL from App Store (starting with https://apps.apple.com)
- **Example:** `https://apps.apple.com/ng/app/mobiris/id1234567890`
- **Status:** Currently shown as "Coming Soon" if left blank
- **How to get:** Publish your app to App Store, then copy the link from the app listing page

**Google Play Store URL**
- **What it does:** Link to download the app from Google Play
- **Where it appears:** App Download page, app CTA buttons throughout site
- **What to enter:** Full URL from Google Play Store
- **Example:** `https://play.google.com/store/apps/details?id=com.mobiris.app`
- **Status:** Currently shown as "Coming Soon" if left blank
- **How to get:** Publish your app to Play Store, then copy the link from the app listing

**Demo Booking URL**
- **What it does:** Link to schedule a product demo
- **Where it appears:** Header, CTAs throughout site
- **What to enter:** Full URL to your demo booking/scheduling tool
- **Example:** `https://calendly.com/mobiris/demo` or `https://meetings.hubspot.com/sales`
- **Options for demo scheduling:**
  - Calendly (free tier available at calendly.com)
  - HubSpot Meetings (if you use HubSpot CRM)
  - Acuity Scheduling
  - Any scheduling tool you prefer

---

### 2.5 Header & Navigation

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Header & Navigation

**Primary CTA Label (Header)**
- **What it does:** Text on the main call-to-action button in the header
- **Where it appears:** Top right of header, visible on all pages
- **What to enter:** Action-oriented text, typically 2-3 words
- **Examples:** "Get Started", "Book Demo", "Try Now", "Login"
- **Constraints:** Keep to 20 characters or less for mobile display

**Primary CTA URL (Header)**
- **What it does:** Where the CTA button links to
- **Where it appears:** Linked from the header CTA button
- **What to enter:** Full URL
- **Examples:**
  - `https://app.mobiris.ng/signup` (for signup)
  - `https://calendly.com/mobiris/demo` (for demo booking)
  - `https://app.mobiris.ng/login` (for login)

**Secondary CTA Label (Header)**
- **What it does:** Text on the secondary CTA button (usually "Login")
- **Where it appears:** Header, next to primary CTA
- **What to enter:** Usually "Login" or "Access Platform"
- **Constraints:** Keep to 20 characters or less

**Secondary CTA URL (Header)**
- **What it does:** Where secondary button links to
- **Where it appears:** Linked from secondary header button
- **What to enter:** Usually your login URL
- **Example:** `https://app.mobiris.ng/login`

**Show Announcement Bar**
- **What it does:** Toggle for a banner message at the very top of the site
- **Where it appears:** Above the header on all pages
- **Check to enable:** Announcement bar will display with custom message
- **Uncheck to disable:** No announcement banner shown
- **Usage ideas:** "We're hiring!", "New feature launched!", "Limited time offer"

**Announcement Bar Text**
- **What it does:** The message content shown in the announcement bar
- **Where it appears:** In the announcement banner at the top of the site
- **What to enter:** Your announcement message (plain text, no HTML)
- **Example:** "Introducing Biometric Verification — Secure your fleet today"
- **Constraints:** Keep to 100-150 characters for best display
- **Only appears if:** "Show Announcement Bar" toggle is enabled

**Announcement Bar Background Color**
- **What it does:** Background color of the announcement banner
- **Where it appears:** Behind the announcement text
- **What to enter:** Click the color picker and choose a color
- **Recommended:** Use a color that contrasts with your text (dark background for light text or vice versa)
- **Default:** Usually a brand color or dark shade

**Announcement Bar Text Color**
- **What it does:** Color of the announcement text
- **What to enter:** Click the color picker and choose a text color
- **Recommendation:** White or light gray on dark background, or dark text on light background
- **Contrast:** Make sure the text is readable against the background color you chose

---

### 2.6 Footer Settings

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Footer Settings

**Footer Tagline/Description**
- **What it does:** Text that appears in the footer about your company
- **Where it appears:** Left side of footer (above or next to logo)
- **What to enter:** 1-2 sentences about your company
- **Example:** "Biometric fleet operations platform for transport operators across Africa"
- **Constraints:** Keep to 150 characters for best layout

**Footer Copyright Text**
- **What it does:** Custom copyright notice
- **Where it appears:** Bottom of footer
- **What to enter:** Usually "Copyright © [Year] [Company Name]. All rights reserved."
- **Example:** "Copyright © 2026 Mobiris. All rights reserved."
- **Auto-features:** The current year is automatically added to any text you enter
- **Tip:** Leave blank for WordPress default copyright format

**Show App Links in Footer**
- **What it does:** Toggle to display iOS/Android app store buttons in footer
- **Where it appears:** Footer, next to social icons
- **Check to enable:** App download buttons will show
- **Uncheck to disable:** App buttons hidden from footer

**Show Social Icons in Footer**
- **What it does:** Toggle to show social media icons in footer
- **Where it appears:** Footer social icon section
- **Check to enable:** Social icons display (only those you've enabled in Social Media Links section)
- **Uncheck to disable:** No social icons in footer

**Show Newsletter Signup in Footer**
- **What it does:** Toggle for email newsletter subscription form
- **Where it appears:** Footer, usually in its own column
- **Check to enable:** Newsletter signup form displays
- **Uncheck to disable:** Newsletter form hidden
- **Note:** This requires a newsletter plugin (like MailerLite, Mailchimp, or Brevo) to be installed and configured separately

**Footer Menus**
- **What it does:** Organize footer links into columns (Product, Company, Legal)
- **How to configure:** See section 3.4 (Navigation Menus) below
- **Where it appears:** Center and right side of footer

---

## 3. Homepage Configuration (Customizer > Mobiris Theme Settings)

The Mobiris homepage is built from modular sections, each of which you can customize.

### 3.1 Hero Section

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage Hero Section

The Hero Section is the large banner at the very top of your homepage.

**Hero Headline**
- **What it does:** Main headline text for the hero
- **What to enter:** Your primary value proposition in 5-10 words
- **Example:** "Biometric Fleet Operations Made Simple"
- **Constraints:** Keep to 80 characters for desktop display
- **Tips:** Use action-oriented language; focus on the customer benefit, not features

**Hero Subheading**
- **What it does:** Supporting text below the headline
- **What to enter:** A one-sentence clarification or benefit
- **Example:** "Real-time biometric verification for transport operators across Africa"
- **Constraints:** Keep to 150 characters
- **Tips:** Explain what problem you solve or the main benefit

**Hero Primary CTA Label**
- **What it does:** Text on the main CTA button in hero
- **What to enter:** Action text, 2-3 words
- **Example:** "Get Started", "Book Demo", "Try Now"

**Hero Primary CTA URL**
- **What it does:** Where the primary button links
- **What to enter:** Full URL to signup, demo booking, or app
- **Example:** `https://app.mobiris.ng/signup`

**Hero Secondary CTA Label**
- **What it does:** Text on the secondary CTA button
- **What to enter:** Usually "Learn More" or "Explore Platform"
- **Example:** "Learn More"

**Hero Secondary CTA URL**
- **What it does:** Where secondary button links (usually to Platform page)
- **What to enter:** Full URL
- **Example:** `/platform` or `https://yoursite.com/platform`

**Hero Background Image**
- **What it does:** The background visual for the hero section
- **Where it appears:** Behind the hero text
- **What to enter:** Click "Select Image" and choose or upload a product screenshot, illustration, or branded image
- **Recommended size:** 1200px × 600px or larger (landscape orientation)
- **Format:** PNG or JPG
- **Design tips:** Use a professional product screenshot or sleek illustration; avoid cluttered images
- **Placeholder:** The theme provides a placeholder SVG; replace it with a real product screenshot for launch

**Hero Layout Style**
- **What it does:** How the hero content is positioned
- **Options:**
  - **Centered**: Text and image centered, hero takes full width
  - **Split Left**: Text on left, image on right
  - **Split Right**: Image on left, text on right
- **Recommendation:** Use "Split Left" for best visual balance with text on the left

**Hero Overlay/Background Color (optional)**
- **What it does:** Tint or overlay color over the hero image
- **What to enter:** Click color picker to choose a color
- **Recommendation:** Use a semi-transparent dark overlay (black at 20-30% opacity) to ensure text legibility over the image
- **When needed:** If your hero image is busy or has light colors that make text hard to read

---

### 3.2 Stats Bar

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage Stats

The Stats Bar displays 4 key metrics about your business/product.

You'll see 4 identical sets of fields (Stat 1, Stat 2, Stat 3, Stat 4):

**Stat [#] Label**
- **What it does:** The metric name
- **What to enter:** Brief label for the stat
- **Examples:** "Active Users", "Vehicles Tracked", "Countries", "Years in Operation"
- **Constraints:** Keep to 30 characters

**Stat [#] Value**
- **What it does:** The number to display
- **What to enter:** Just the number (no commas, no units)
- **Examples:** "2500", "50000", "12"
- **Tips:** Use round numbers or short thousands (e.g., "5K" is fine, type as "5000")
- **Formatting note:** The theme will automatically add thousands separators in display

**Stat [#] Suffix (optional)**
- **What it does:** Unit or symbol after the number
- **What to enter:** Units like "+", "%", "K", "M", etc.
- **Examples:** "+", "%", "K", "years"
- **Leave blank if:** The number stands alone

**Stat [#] Description (optional)**
- **What it does:** Longer explanation of the stat
- **What to enter:** One sentence about what this stat means
- **Example:** "Trusted by operators from Lagos to Accra"
- **Optional:** Can be left blank; not displayed in all layouts

---

### 3.3 Intelligence Section (Differentiators)

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage Intelligence Section

This section highlights what makes your platform unique.

**Intelligence Section Title**
- **What it does:** Heading for the differentiators section
- **What to enter:** A headline for your key strengths
- **Example:** "Purpose-Built for African Transport"
- **Constraints:** Keep to 60 characters

**Intelligence Section Subtitle**
- **What it does:** Supporting text under the title
- **What to enter:** Clarification or benefit statement
- **Example:** "Three integrated planes of intelligence"
- **Constraints:** Keep to 120 characters

**Show Intelligence Section**
- **Check to enable:** This section displays on homepage
- **Uncheck to disable:** Section is hidden
- **Use when:** You have unique differentiators or features to highlight

---

### 3.4 App Download Section

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage App Download

This section promotes your mobile app.

**App Download Headline**
- **What it does:** Main heading for the app CTA section
- **What to enter:** Compelling text about your mobile app
- **Example:** "Manage Your Fleet on the Go"
- **Constraints:** Keep to 50 characters

**App Download Subheading**
- **What it does:** Supporting text about the app
- **What to enter:** Key benefit or feature of the mobile app
- **Example:** "Complete biometric verification and vehicle tracking from your pocket"
- **Constraints:** Keep to 120 characters

**App Download Screenshot**
- **What it does:** Visual showing the mobile app interface
- **Where it appears:** Beside the app download text
- **What to enter:** Click "Select Image" and upload a screenshot of your mobile app
- **Recommended size:** 500px × 800px or tall rectangular format
- **Format:** PNG with transparent background works best
- **Placeholder:** The theme includes a placeholder SVG; replace with real app screenshots for launch
- **Tip:** Show the most impressive or important screen of your app

**Show App Download Section**
- **Check to enable:** App download section displays on homepage
- **Uncheck to disable:** Section hidden
- **Note:** You should have iOS or Android app links configured in "App & Platform Links" section for this to be useful

---

### 3.5 CTA Band (Bottom Call-to-Action)

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage CTA Band

A simple but attention-grabbing section near the bottom of the homepage.

**CTA Band Title**
- **What it does:** Main headline for the CTA band
- **What to enter:** A compelling closing argument or offer
- **Example:** "Ready to Transform Your Fleet Operations?"
- **Constraints:** Keep to 60 characters

**CTA Band Subtitle**
- **What it does:** Supporting text
- **What to enter:** Brief supporting message
- **Example:** "Book a free demo and see the platform in action"
- **Constraints:** Keep to 100 characters

**CTA Band Primary Button Label**
- **What it does:** Text on the CTA button
- **What to enter:** Action text, 2-3 words
- **Example:** "Book Demo", "Get Started", "Request Trial"

**CTA Band Primary Button URL**
- **What it does:** Where the button links
- **What to enter:** Full URL (signup, demo booking, app login, etc.)
- **Example:** `https://calendly.com/mobiris/demo`

**CTA Band Background Color**
- **What it does:** Background color of the entire CTA section
- **What to enter:** Click color picker and choose a color
- **Recommendation:** Use a brand color or contrasting color that stands out from the rest of the page
- **Tips:** Make sure any text on this background is readable

---

### 3.6 Trust & Partners Section

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Homepage Trust & Partners

Display logos of companies you work with or trust badges.

**Show Trust & Partners Section**
- **Check to enable:** This section displays on homepage
- **Uncheck to disable:** Section is hidden
- **Use when:** You have partner companies, investor logos, or industry certifications to display

**Trust & Partners Title**
- **What it does:** Heading for the section
- **What to enter:** Title like "Trusted By" or "Our Partners" or "Industry Leaders"
- **Example:** "Trusted by leading transport operators"
- **Constraints:** Keep to 50 characters

**Note:** Adding actual partner logos requires editing the theme files or using WordPress media. See a developer if you need to add more than the placeholder logos.

---

### 3.7 Blog & Guides Preview

**Location in Customizer:** Appearance > Customize > Mobiris Theme Settings > Blog & Guides Preview

Configure how blog posts and guides appear on the homepage.

**Show Blog Section on Homepage**
- **Check to enable:** Latest blog posts display on homepage
- **Uncheck to disable:** Blog preview section hidden
- **Recommendation:** Keep enabled to encourage content discovery

**Blog Preview Title**
- **What it does:** Heading for the blog section
- **What to enter:** Usually "Latest Insights", "Blog", "News & Updates"
- **Example:** "Latest Insights"
- **Constraints:** Keep to 40 characters

**Number of Blog Posts to Display**
- **What it does:** How many recent blog posts to show
- **What to enter:** Number between 2 and 6
- **Recommended:** 3 or 4 posts
- **Note:** The theme will automatically show your most recent published posts

**Show Guides Section on Homepage**
- **Check to enable:** Latest guides/resources display on homepage
- **Uncheck to disable:** Guides preview section hidden

**Guides Preview Title**
- **What it does:** Heading for the guides section
- **What to enter:** Usually "Guides", "Resources", "Learning Hub"
- **Example:** "Resources & Guides"
- **Constraints:** Keep to 40 characters

**Number of Guides to Display**
- **What it does:** How many recent guides to show
- **What to enter:** Number between 2 and 6
- **Recommended:** 3 or 4 guides
- **Note:** Guides are published separately from blog posts (see section 4.6)

---

## 4. Navigation Menus (Appearance > Menus)

Navigation menus control how visitors browse your website.

### 4.1 Managing the Primary Navigation (Header Menu)

The Primary Menu appears in the header of every page.

**Step 1: Access the Menu Manager**
1. Log into WordPress admin
2. Click **Appearance** in the left sidebar
3. Click **Menus**
4. Click on the "Primary Menu" to edit it

**Step 2: Add a Page to the Menu**
1. On the Menus page, look for "Add items" section
2. Expand the section that contains the page you want to add (usually "Pages")
3. Check the checkbox next to the page name
4. Click "Add to Menu"
5. The page now appears in the menu structure on the left

**Step 3: Remove a Page from the Menu**
1. Find the page in the menu structure on the left
2. Click the "Remove" link (appears on hover)
3. The page is removed from the menu (but not deleted from your site)

**Step 4: Reorder Menu Items**
1. Click and drag menu items to rearrange them
2. Items drag up/down to change their position
3. Drag an item slightly to the right to make it a "child" (submenu) of another item
4. Release to save the position
5. Click "Save Menu" when finished

**Step 5: Rename a Menu Item**
1. Hover over the menu item and click the arrow to expand it
2. Change the "Navigation Label" (this is different from the page title)
3. This allows you to use a shorter or different name in the menu than the page title
4. Click "Save Menu"

**Example Primary Menu Structure:**
```
Home
Product
  - Platform Overview
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
Login
```

### 4.2 Creating Dropdown Menus

Dropdown (submenu) items appear when visitors hover over a parent item.

**To Create a Dropdown:**
1. Open Appearance > Menus
2. Click on "Primary Menu"
3. Add items to the menu as shown above
4. Drag a menu item slightly to the RIGHT and below its parent item
5. The indented item becomes a child/dropdown
6. Click "Save Menu"

**Example:**
- If you drag "Features" to be under and indented from "Product", then "Features" becomes a dropdown
- When a visitor hovers over "Product" in the header, a submenu appears showing "Features" and other child items

### 4.3 Footer Menus

The footer has three columns of links: Product, Company, and Legal.

**To Edit Footer Menus:**
1. Go to Appearance > Menus
2. You'll see separate menus for:
   - Footer Menu - Product
   - Footer Menu - Company
   - Footer Menu - Legal
3. Follow the same process as Primary Menu to add, remove, and reorder items
4. Click "Save Menu" after each change

**Recommended Footer Menu Structure:**

**Footer Menu - Product:**
- Platform Overview
- Features
- Solutions
- Pricing
- Get the App

**Footer Menu - Company:**
- About
- Blog
- Guides
- Contact
- Careers (if applicable)

**Footer Menu - Legal:**
- Privacy Policy
- Terms of Service
- Data Protection
- Compliance

### 4.4 Mobile Navigation

The mobile navigation automatically mirrors your Primary Menu. When the website is viewed on a phone or tablet, a hamburger menu (☰) appears that shows the same items as your Primary Menu.

**No separate configuration needed:** Mobile menu updates automatically when you update the Primary Menu.

---

## 5. Content Types — Blog Posts

Blog posts are articles about your company, product, industry trends, case studies, or tips.

### 5.1 Publishing a New Blog Post

**Step 1: Create the Post**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **Add New** or **Add New Post**
4. The post editor opens

**Step 2: Add the Post Title**
1. Click in the "Title" field at the top
2. Enter your post title
3. Example: "5 Ways Biometric Verification Reduces Fleet Fraud"
4. Keep titles under 70 characters for SEO

**Step 3: Write the Post Content**
1. Click in the main content area (below the title)
2. Start typing your post body
3. WordPress uses a block-based editor — as you type, you're creating a "Paragraph" block
4. To add different block types, click the + icon on the left:
   - **Heading**: For section titles (use Heading 2 for subsections)
   - **Paragraph**: For body text
   - **Image**: To add photos or graphics
   - **List**: For bulleted or numbered lists
   - **Quote**: For pull quotes or testimonials
   - **Code**: For technical code snippets

**Step 4: Add a Featured Image**
1. On the right sidebar, look for "Featured image"
2. Click "Set featured image"
3. Upload a new image or choose from your media library
4. Click "Set as featured image"
5. Recommended size: 1200px × 630px (landscape orientation)
6. This image appears when the post is shared on social media and in blog grids

**Step 5: Categorize Your Post**
1. On the right sidebar, find "Categories"
2. Check one or more categories that match your post
3. If no suitable category exists, you can create one (ask your developer if needed)
4. Example categories: "Product Updates", "Industry News", "Best Practices", "Case Studies"

**Step 6: Add Tags**
1. On the right sidebar, find "Tags"
2. Type tag keywords separated by commas
3. Tags help readers find related posts
4. Example tags: "biometric", "fleet management", "fraud prevention", "Africa"

**Step 7: Add an Excerpt (Optional)**
1. On the right sidebar, look for "Excerpt"
2. Click "Edit" if the Excerpt section is collapsed
3. Write a 1-2 sentence summary of your post
4. If left blank, WordPress auto-generates an excerpt from your post
5. The excerpt appears in blog archives and social sharing

**Step 8: Publish the Post**
1. On the right sidebar, click the "Publish" button
2. The post is immediately live on your website
3. Alternatively, click the down arrow next to "Publish" to "Schedule" a post for a future date/time

**Post Publishing Options:**
- **Publish** — Post goes live immediately
- **Schedule** — Click the date/time next to "Publish" to schedule for a future date
- **Draft** — Save as a draft without publishing (visible only to logged-in admins)
- **Preview** — Click "Preview" to see how the post looks before publishing

### 5.2 Editing an Existing Blog Post

1. Go to **Posts** in the left sidebar
2. Click on the post title to edit it
3. Make your changes
4. Click "Update" (instead of "Publish") to save changes
5. Changes are live immediately

### 5.3 Blog Post Best Practices

- **Title:** Use action-oriented, specific titles (e.g., "5 Ways..." instead of "Ways to...")
- **Length:** Aim for 800-1500 words for good SEO and reader engagement
- **Headings:** Use Heading 2 (H2) for section headers; this helps with readability and SEO
- **Images:** Add at least one featured image and 1-2 images in the body
- **Links:** Link to other relevant posts or pages on your site
- **Publishing frequency:** Aim to publish 2-4 posts per month for consistent audience engagement

---

## 6. Content Types — Guides & Resources

Guides are longer-form, structured content like tutorials, ebooks, or comprehensive how-to articles.

### 6.1 Publishing a New Guide

**Step 1: Access the Guides Section**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **Guides** (or look for it in the Posts submenu)
4. Click **Add New Guide**

**Step 2: Add the Guide Title**
1. Click in the "Title" field
2. Enter your guide title
3. Example: "The Complete Guide to Biometric Fleet Verification"

**Step 3: Write the Guide Content**
1. Use the block editor to write your guide content
2. **For guides, structure is important:**
   - Use Heading 2 (##) for main sections
   - Use Heading 3 (###) for subsections
   - These headings auto-generate a Table of Contents that appears at the top of the guide page
3. Example structure:
   ```
   [Title: Complete Guide to Biometric Fleet Verification]

   ## What is Biometric Verification?
   [Content...]

   ## Why It Matters for Fleet Operations
   [Content...]

   ### Fraud Prevention
   [Content...]

   ### Compliance & Regulation
   [Content...]

   ## Getting Started with Mobiris
   [Content...]
   ```

**Step 4: Add a Featured Image**
1. On the right sidebar, click "Set featured image"
2. Upload or choose a guide cover image
3. Recommended size: 1200px × 630px
4. This is the guide's cover image

**Step 5: Set Resource Category**
1. On the right sidebar, find "Resource Category"
2. Choose a category (or ask a developer to add new categories)
3. Example categories: "Guides", "Whitepapers", "Tutorials"

**Step 6: Add an Excerpt**
1. On the right sidebar, find "Excerpt"
2. Write a 2-3 sentence summary
3. This appears in guide archives and social sharing

**Step 7: Publish the Guide**
1. Click "Publish" on the right sidebar
2. The guide is immediately live and appears on the Guides/Resources page

### 6.2 Guide Page Display

Guides automatically appear on your website in two places:
1. **Guides Page** (`/resources` or `/guides`) — All published guides appear in a grid
2. **Via [mobiris_guides] shortcode** — You can embed guides anywhere using a shortcode (see section 8)

---

## 7. Content Types — FAQs

FAQs are Question & Answer pairs that appear on the FAQ page and can be embedded anywhere.

### 7.1 Adding a New FAQ

**Step 1: Access FAQs**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **FAQs**
4. Click **Add New FAQ**

**Step 2: Add the Question (Title)**
1. Click in the "Title" field
2. Enter the question
3. Example: "How does biometric verification prevent fraud?"
4. This is the question that appears in the FAQ

**Step 3: Add the Answer (Content)**
1. Click in the main content area
2. Type the answer to the question
3. Keep answers concise (2-3 sentences for best readability)
4. You can use bold, italics, and links in answers
5. Use lists (•) if the answer has multiple points

**Step 4: Assign to FAQ Category**
1. On the right sidebar, find "FAQ Category"
2. Select a category
3. Example categories: "Pricing", "Features", "Onboarding", "Billing", "General"
4. If you need new categories, contact your developer
5. FAQs from the same category can be filtered using shortcodes (see section 8)

**Step 5: Publish the FAQ**
1. Click "Publish" on the right sidebar
2. The FAQ is immediately live
3. It appears on the FAQ page and in any [mobiris_faqs] shortcode

### 7.2 FAQ Page

Your website has a dedicated FAQ page at `/faq`. All published FAQs appear automatically in an accordion format on this page.

Visitors can:
- Expand/collapse questions
- See the full answer
- Search/filter by category

**No additional setup needed** — FAQs appear automatically as you publish them.

---

## 8. Content Types — Testimonials

Testimonials are customer quotes with the customer's name, job title, and company.

### 8.1 Adding a Testimonial

**Step 1: Access Testimonials**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **Testimonials**
4. Click **Add New Testimonial**

**Step 2: Add Person's Name (Title)**
1. Click in the "Title" field
2. Enter the person's full name
3. Example: "John Adebayo"

**Step 3: Add the Testimonial Quote (Content)**
1. Click in the main content area
2. Type the customer's quote or testimonial
3. Example: "Mobiris transformed how we verify driver identity. We've eliminated 95% of fraudulent claims."
4. Keep it to 1-3 sentences

**Step 4: Add Custom Fields (Meta Information)**
1. On the right sidebar, scroll down to find custom fields
2. Look for "Testimonial Role" — enter the person's job title
3. Example: "Fleet Operations Manager"
4. Look for "Testimonial Company" — enter their company name
5. Example: "ABC Transport Services"

**Step 5: Add a Profile Photo (Featured Image)**
1. On the right sidebar, click "Set featured image"
2. Upload a headshot or profile photo
3. Recommended size: 400px × 400px (square)
4. This appears next to the testimonial

**Step 6: Publish the Testimonial**
1. Click "Publish" on the right sidebar
2. The testimonial is immediately live
3. It appears on the homepage and other pages that display testimonials

### 8.2 Testimonials Display

Published testimonials appear in:
1. **Homepage** — In the testimonials grid section
2. **Via [mobiris_testimonials] shortcode** — Can be embedded anywhere

---

## 9. Content Types — Solutions (Use Cases)

Solutions represent specific industry use cases or problem statements your product solves.

### 9.1 Adding a Solution

**Step 1: Access Solutions**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **Solutions**
4. Click **Add New Solution**

**Step 2: Add the Use Case Title**
1. Click in the "Title" field
2. Enter a descriptive title
3. Example: "Urban Last-Mile Delivery Operations"
4. This should describe the industry vertical or use case

**Step 3: Add Detailed Description**
1. Click in the main content area
2. Write a detailed description of the use case
3. Include:
   - The problem the industry faces
   - How Mobiris solves it
   - Expected benefits and ROI
4. Use headings and lists to organize content
5. Example structure:
   ```
   ## The Challenge
   Last-mile delivery faces high driver fraud rates...

   ## The Solution
   Biometric verification ensures only verified drivers...

   ## Results
   - 95% fraud reduction
   - 40% faster onboarding
   - Improved insurance rates
   ```

**Step 4: Add a Featured Image**
1. On the right sidebar, click "Set featured image"
2. Upload an industry-relevant image
3. Recommended size: 1200px × 630px
4. Example: Image of delivery fleet, logistics, etc.

**Step 5: Assign to Industry**
1. On the right sidebar, find "Industry"
2. Select the relevant industry
3. Example categories: "Ride-Hailing", "Logistics", "Public Transport", "Long-Distance"
4. Contact developer to add new industries if needed

**Step 6: Publish the Solution**
1. Click "Publish"
2. The solution appears on the Solutions page automatically

### 9.2 Solutions Page

Your Solutions page displays all published solutions in a grid. Visitors can click to read the full use case. No additional configuration needed.

---

## 10. Content Types — Features

Features are specific product capabilities or differentiators.

### 10.1 Adding a Feature

**Step 1: Access Features**
1. Log into WordPress admin
2. Click **Posts** in the left sidebar
3. Click **Features**
4. Click **Add New Feature**

**Step 2: Add the Feature Name (Title)**
1. Click in the "Title" field
2. Enter the feature name
3. Example: "Biometric Fingerprint Verification"
4. Keep to 50 characters or less

**Step 3: Add the Feature Description (Content)**
1. Click in the main content area
2. Write a description of the feature
3. What it does, why it matters, how it works
4. Keep to 2-3 short paragraphs
5. Example:
   ```
   Unique biometric fingerprint matching ensures only verified drivers can access vehicles.
   Our system captures and matches fingerprints in real-time, with 99.9% accuracy.

   Prevents unauthorized vehicle access and eliminates identity fraud in a single tap.
   ```

**Step 4: Assign to Module**
1. On the right sidebar, find "Module"
2. Select which product module this feature belongs to
3. Example categories: "Verification", "Vehicle Management", "Analytics", "Integration"
4. Contact developer to add new modules if needed

**Step 5: Publish the Feature**
1. Click "Publish"
2. The feature appears on the Features page automatically

### 10.2 Features Page

Your Features page displays all published features organized by module. Features also appear on the homepage in the features section. No additional configuration needed.

---

## 11. Key Pages — Updating Content

Your website has several key pages with mostly fixed templates. You can edit the text content in these pages using the block editor.

### 11.1 About Page

**What's editable:**
- The main page content/body text
- The mission statement and values section (editable via block editor)
- The hero image/background

**What's NOT editable (requires developer):**
- The page layout and template structure
- The team member section (if present)
- The company timeline

**How to edit:**
1. Go to Pages in admin
2. Click "About"
3. Edit the content blocks as needed
4. Click "Update"
5. Changes appear immediately on the website

---

### 11.2 Platform Page

**What's editable:**
- Main page content explaining the platform
- Section descriptions
- CTA buttons and links

**What's NOT editable:**
- The three-plane visual diagram
- Module/feature listings (use the Features CPT instead)

**How to edit:**
1. Go to Pages
2. Click "Platform"
3. Edit content blocks
4. Click "Update"

---

### 11.3 Features Page

**What's editable:**
- The page headline and subheading
- Feature listings are automatically pulled from the Features CPT

**How it works:**
- Features you add via Posts > Features automatically appear here
- No need to manually add them to this page

---

### 11.4 Solutions Page

**What's editable:**
- Page headline and subheading
- Solution/use case listings are automatically pulled from the Solutions CPT

**How it works:**
- Solutions you add via Posts > Solutions automatically appear here
- Just add solutions and they appear on this page

---

### 11.5 Pricing Page

**What's editable:**
- The page headline and descriptions above the pricing table

**What's NOT editable (requires developer):**
- The pricing tiers and prices (₦15,000, ₦35,000, etc.)
- Plan features and descriptions

**If you need to change pricing:**
- Contact your developer to update the pricing template
- The prices are hardcoded in the theme file

---

### 11.6 Contact Page

**What's editable:**
- Page headline and description text
- The contact form displays automatically

**How the contact form works:**
- The form is built-in to the theme
- Submissions are sent to the email you configured in Customizer > Contact & Communication > Primary Email
- No additional setup needed

**To test the form:**
1. Visit /contact on your website
2. Fill out and submit the form
3. Check your email inbox for the submission
4. If you don't receive an email, install and configure WP Mail SMTP (see section 12)

---

### 11.7 FAQ Page

**What's editable:**
- Page headline and description

**How FAQs appear:**
- All FAQs you add via Posts > FAQs automatically appear here
- They're displayed in an accordion format
- Visitors can expand/collapse questions

**No additional setup needed** — just add FAQs and they appear automatically.

---

### 11.8 Guides/Resources Page

**What's editable:**
- Page headline and description

**How guides appear:**
- All Guides you publish via Posts > Guides automatically appear here
- They're displayed in a grid

**No additional setup needed** — just add guides and they appear automatically.

---

### 11.9 Blog Page

**What's editable:**
- Page headline and description

**How posts appear:**
- All blog posts you publish automatically appear here
- Most recent posts appear first
- Visitors can browse and search posts

**No additional setup needed** — just publish posts and they appear automatically.

---

### 11.10 Get the App Page

**What's editable:**
- Page headline and description
- CTA buttons and app store links pull from Customizer > App & Platform Links

**How it works:**
- The iOS and Android app links are configured in Customizer
- If no links are set, "Coming Soon" is displayed
- Update the links in Customizer when apps are published

---

### 11.11 Access & Login Page

**What's editable:**
- Page headline and description
- The login and signup links pull from Customizer > App & Platform Links

**How it works:**
- Login and signup URLs are configured in Customizer
- Update them there if your app URLs change

---

### 11.12 Privacy Policy & Terms of Service

These pages are created as blank pages when the theme is activated.

**How to add content:**
1. Go to Pages in admin
2. Click "Privacy Policy" (or "Terms of Service")
3. Paste your full legal text into the content area
4. Click "Update"

**Where to find legal documents:**
- Check your company's existing legal documents
- Ask your legal team for the approved versions
- Don't copy from competitors — use your own legal documents

---

## 12. Shortcodes Reference

Shortcodes are special codes you can paste into any page or post to display dynamic content.

### 12.1 FAQ Shortcode

**Display all FAQs:**
```
[mobiris_faqs]
```
This shows all published FAQs in an accordion format.

**Display FAQs from a specific category:**
```
[mobiris_faqs category="pricing"]
```
Replace "pricing" with your FAQ category slug.

**How to use:**
1. Go to any page or post
2. Click in the content area
3. Add a new block (press "+")
4. Select "Shortcode" block
5. Paste the shortcode code
6. Click "Update"

---

### 12.2 Testimonials Shortcode

**Display all testimonials:**
```
[mobiris_testimonials]
```
Shows all published testimonials in a grid.

**Display a specific number of testimonials:**
```
[mobiris_testimonials count="3"]
```
Shows only 3 most recent testimonials.

**Usage:**
1. Add a Shortcode block to any page
2. Paste the code
3. Testimonials display immediately

---

### 12.3 Contact Form Shortcode

**Embed the contact form:**
```
[mobiris_contact_form]
```
Displays the built-in contact form with name, email, message, and submit button.

**Usage:**
- Already embedded on the Contact page
- Can be added to any page using a Shortcode block
- Form submissions are sent to your Primary Email (configured in Customizer)

---

### 12.4 CTA Band Shortcode

**Embed a call-to-action banner:**
```
[mobiris_cta_band title="Ready to Get Started?" subtitle="Book a demo today" cta_label="Book Now" cta_url="https://calendly.com/mobiris/demo"]
```

**Parameters:**
- `title` — Main headline
- `subtitle` — Supporting text
- `cta_label` — Button text
- `cta_url` — Where button links to

**Usage:**
1. Add a Shortcode block to any page
2. Paste the code with your custom values
3. Update the parameters as needed

---

### 12.5 App Store Buttons Shortcode

**Display app store download buttons:**
```
[mobiris_app_buttons]
```
Shows iOS and Android download buttons. Links pull from Customizer > App & Platform Links.

**Usage:**
- Already on the "Get the App" page
- Can be added anywhere using a Shortcode block

---

## 13. App Store Links

Your mobile apps are not yet published. Here's how to add app store links when they become available.

### 13.1 iOS App Store

**Status:** Coming Soon (placeholder shown until link is added)

**When your app is published:**
1. Go to the App Store listing for your app
2. Copy the full URL from the browser
3. Log into WordPress admin
4. Go to Appearance > Customize > Mobiris Theme Settings > App & Platform Links
5. Paste the URL in "iOS App Store URL"
6. Click "Publish" to save
7. iOS download buttons now link to the App Store

**Example iOS App Store URL:**
```
https://apps.apple.com/ng/app/mobiris/id1234567890
```

### 13.2 Google Play Store

**Status:** Coming Soon (placeholder shown until link is added)

**When your app is published:**
1. Go to the Play Store listing for your app
2. Copy the full URL from the browser
3. Log into WordPress admin
4. Go to Appearance > Customize > Mobiris Theme Settings > App & Platform Links
5. Paste the URL in "Google Play Store URL"
6. Click "Publish" to save
7. Android download buttons now link to the Play Store

**Example Google Play URL:**
```
https://play.google.com/store/apps/details?id=com.mobiris.app
```

### 13.3 What's Shown Until Links Are Added

Until you add app store links:
- "Coming Soon" badges appear on download buttons
- Clicking the buttons shows a message: "Available soon on iOS/Android"
- No action needed from you — this is automatic

---

## 14. SEO Management

SEO helps your website rank in Google search results.

### 14.1 Built-in SEO Features

The Mobiris theme includes basic SEO features:
- **Meta descriptions** — Summary text that appears under your site name in Google results
- **Open Graph tags** — Controls how your pages look when shared on social media (Facebook, LinkedIn, Twitter)
- **FAQ schema** — Structured data that helps Google understand your FAQs and show them in rich results
- **Organization schema** — Tells Google who you are and your company details
- **Mobile-friendly** — The theme is fully responsive and ranks well on mobile

### 14.2 Installing an SEO Plugin

For full SEO control, install a free SEO plugin. Two best options:

**Option 1: Yoast SEO (Free)**
1. Go to Plugins > Add New
2. Search for "Yoast SEO"
3. Click "Install Now"
4. Click "Activate"
5. Yoast appears in the left admin menu

**Option 2: Rank Math (Free)**
1. Go to Plugins > Add New
2. Search for "Rank Math"
3. Click "Install Now"
4. Click "Activate"
5. Rank Math appears in the left admin menu

**After installing, both plugins:**
- Add a "SEO" panel to every page and post editor
- Let you set custom meta descriptions for each page
- Auto-generate XML sitemaps
- Provide SEO scoring and recommendations

### 14.3 Setting Meta Descriptions

**With Yoast SEO:**
1. Edit a page or post
2. Scroll down to the "Yoast SEO" box at the bottom
3. Find "Meta description"
4. Write a 155-160 character description
5. This appears in Google search results under your page title

**With Rank Math:**
1. Edit a page or post
2. Look for the Rank Math panel on the right sidebar
3. Click "Focus Keyword"
4. Enter your target keyword
5. Click "Edit Snippet"
6. Write your meta description (155-160 characters)

**Meta Description Tips:**
- 155-160 characters (including spaces)
- Include your main keyword if possible
- Make it compelling — it's what appears in Google results
- Example: "Mobiris biometric fleet operations platform. Verify drivers in seconds. Prevent fraud, reduce costs, improve compliance."

### 14.4 Sitemaps

**What's a sitemap:** A list of all pages on your website that helps Google find and index them.

**Auto-generated by SEO plugins:**
- Yoast and Rank Math automatically create a sitemap
- Usually located at `yoursite.com/sitemap.xml`
- Updated automatically as you add pages and posts

**Submit to Google:**
1. Go to Google Search Console (search.google.com/search-console)
2. Add your website
3. Submit your sitemap URL (`yoursite.com/sitemap.xml`)
4. Google will crawl and index your site

---

### 14.5 Open Graph & Social Sharing

When someone shares your page on LinkedIn, Facebook, Twitter, etc., they see:
- Your featured image (og:image)
- Your page title
- Your meta description

**To optimize social sharing:**
1. Always add a featured image to pages and posts
2. Use images that are 1200px × 630px (recommended)
3. Make sure featured images are relevant and branded
4. Write a compelling meta description

**Test how your page looks when shared:**
1. Use Facebook Sharing Debugger: facebook.com/sharing/debugger
2. Paste your page URL
3. See exactly how it will appear when shared
4. Make adjustments if needed

---

## 15. Contact Form Responses

When visitors submit the contact form on your Contact page, where do those submissions go?

### 15.1 How Contact Forms Work

**The form is automatic:**
1. Visitors fill out the contact form with Name, Email, and Message
2. They click "Send Message"
3. The form submission is emailed to your configured email address (Customizer > Contact & Communication > Primary Email)
4. No additional setup needed

### 15.2 Where Submissions Go

**Submissions are sent via email:**
- Primary Email: Receives all submissions
- Secondary Email (optional): Also receives a copy

**To configure emails:**
1. Go to Appearance > Customize
2. Go to Contact & Communication section
3. Enter Primary Email address
4. Optionally add Secondary Email
5. Click "Publish"

### 15.3 Testing the Contact Form

**Before launch, test that emails are being delivered:**

1. Visit yoursite.com/contact
2. Fill out the form:
   - Name: "Test User"
   - Email: "your-email@gmail.com"
   - Message: "This is a test"
3. Click "Send Message"
4. Check your email inbox (including spam folder)
5. You should receive the form submission within 1-2 minutes

**If you don't receive the email:**
1. Check your spam/junk folder
2. Install WP Mail SMTP (see section 15.4)
3. Test again after setup

### 15.4 Ensuring Reliable Email Delivery (WP Mail SMTP)

For production, ensure emails are reliably delivered using WP Mail SMTP:

**Installation:**
1. Go to Plugins > Add New
2. Search for "WP Mail SMTP"
3. Click "Install Now"
4. Click "Activate"
5. WP Mail SMTP appears in the admin menu

**Configuration:**
1. Click **WP Mail SMTP** in the left admin menu
2. Go to Settings
3. Choose your email service from the dropdown:
   - **Gmail** (if using a Gmail account)
   - **SendGrid** (free tier available)
   - **Mailgun** (free tier available)
   - **ZeptoMail** (recommended — already used in Mobiris product)
   - **Other SMTP** (for custom email providers)
4. Follow the plugin's instructions to authenticate with your email service
5. Send a test email to confirm setup

**Why this matters:**
- Without WP Mail SMTP, emails may be flagged as spam or not delivered
- WP Mail SMTP uses trusted email services to ensure deliverability
- Highly recommended before launching to production

---

## 16. Analytics

Analytics help you understand who visits your site, what they look at, and how they behave.

### 16.1 Analytics Philosophy

The Mobiris product is privacy-focused. The WordPress theme follows the same philosophy:
- **No analytics are pre-installed** — respects visitor privacy
- **No tracking cookies** — no user consent banner needed
- **You choose what to track** — optional setup of privacy-first or standard analytics

### 16.2 Option 1: Plausible Analytics (Recommended for Privacy)

Plausible is a privacy-first analytics service that doesn't use cookies or require consent banners.

**Setup:**
1. Go to plausible.io
2. Create an account and add your website
3. Copy your Plausible tracking script
4. Go to Appearance > Theme File Editor in WordPress
5. Find header.php in the right sidebar
6. Scroll to the closing `</head>` tag
7. Paste your Plausible script just before `</head>`
8. Click "Update File"

**Alternative: Use Plausible plugin**
1. Go to Plugins > Add New
2. Search for "Plausible Analytics"
3. Install and activate
4. Go to Plausible Analytics settings
5. Enter your domain
6. Done — it's automatically active

**What you get:**
- Page views, unique visitors, bounce rate
- Traffic sources (search, direct, referrals, social)
- Top pages
- No personal data collection — fully privacy compliant

---

### 16.3 Option 2: Google Analytics (Standard)

Google Analytics is free and widely used, but does use cookies and requires a cookie consent banner.

**Setup:**
1. Go to google.com/analytics
2. Sign in with a Google account
3. Create a new property for your website
4. Copy your Measurement ID (usually starts with "G-")
5. Install **MonsterInsights** plugin:
   - Go to Plugins > Add New
   - Search "MonsterInsights"
   - Install and activate
   - Connect to your Google Analytics account
   - Enter your Measurement ID
6. Done — Google Analytics is now active

**What you get:**
- Detailed audience demographics
- Conversion tracking
- Ecommerce tracking (if selling products)
- More detailed insights than Plausible

**Cookie notice:** Recommend installing **Cookiebot** or **Cookie Notice** to comply with GDPR/privacy laws when using Google Analytics.

---

## 17. Regular Maintenance Checklist

Use this checklist monthly to keep your website healthy and engaging.

### Monthly Tasks

- [ ] **Publish 2-4 blog posts** — Keep content fresh and improve SEO
  - Ideas: Industry news, case studies, tips, updates about your product
  - Distribute these posts on social media after publishing

- [ ] **Check contact form submissions** — Respond to inquiries promptly
  - Check your Primary Email account
  - Reply to each contact form submission within 24-48 hours
  - Track which inquiries convert to customers (helps with content strategy)

- [ ] **Add new testimonials** — As you get customer feedback
  - Reach out to successful customers for testimonials
  - Photograph them or get headshots
  - Add to Posts > Testimonials
  - Feature on homepage and/or about page

- [ ] **Update statistics/stats bar (if needed)** — Keep metrics current
  - Review your actual metrics (active users, vehicles tracked, etc.)
  - Update Customizer > Homepage Stats if numbers have significantly changed
  - Only update if there's a material change (don't update monthly by default)

- [ ] **Review all app/platform links** — Ensure they're working
  - Test the Web App URL link
  - Test the Login URL
  - Test the Signup URL
  - Test any app store links (iOS/Android)
  - Test the demo booking link
  - Go to each link and confirm it works and looks professional

- [ ] **Run WordPress updates** — Keep everything secure and up to date
  - Log into admin
  - Check Dashboard > Updates
  - Update WordPress core if available
  - Update all plugins if available
  - Click "Update" for each
  - Test your website after updates to ensure nothing broke
  - Theme updates are rare, but update if available

- [ ] **Review analytics (if installed)** — Understand traffic patterns
  - Check how many visitors you received
  - See which pages got the most traffic
  - Identify which CTAs are working
  - Look for pages with high bounce rate (might need improvement)

### Quarterly Tasks

- [ ] **Backup your website** — Protect against data loss
  - Install UpdraftPlus plugin (free)
  - Configure automatic weekly backups
  - Test restoring from a backup

- [ ] **Security check** — Ensure your site is secure
  - Install Wordfence plugin (free)
  - Run a security scan
  - Check for vulnerabilities
  - Update any flagged plugins or WordPress

- [ ] **Refresh featured images** — Keep visuals current
  - Review featured images on pages and posts
  - Replace outdated screenshots or images
  - Ensure all images are professional and branded

- [ ] **Review and update meta descriptions** — Improve search visibility
  - Check top 10 pages in Google Analytics
  - Make sure each has a compelling meta description
  - Update via Yoast SEO or Rank Math if needed

- [ ] **Check all external links** — Prevent broken links
  - Review pages that link to external sites
  - Test each link to confirm it still works
  - Update any broken links

- [ ] **Refresh homepage sections** — Keep the homepage current
  - Update hero image if it's outdated
  - Review testimonials and make sure they're relevant
  - Add new guides or blog posts to preview sections

---

**End of Admin Configurability Guide**

This guide covers everything a non-technical WordPress admin needs to manage the Mobiris website. For any tasks not covered here or any issues during setup, contact your theme developer.

