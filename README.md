# 🧸 TOYXIMA Toys — Immersive Magical Toy Wonderland

A unique, premium, playful, and modern website built for **TOYXIMA**. Instead of a generic ecommerce store, TOYXIMA invites parents and children into an immersive miniature toy world filled with handcrafted wooden speedsters, huggable organic cotton bears, and architectural building blocks.

---

## 🎨 Visual Design & Concept
- **Palette**: Warm cream background (`#FAF7EE`) accented with playful tangerine orange (`#FF6E40`), sunny yellow (`#FBBF24`), sky blue (`#38BDF8`), mint green, and soft lavender.
- **Hero Section**: An interactive **3D Miniature Toy World Diorama** rendered via Three.js with soft shadows, orbiting camera, driving wooden racer, waving teddy bear, bouncing castle blocks, and twinkling stars.
- **Tactile Delight**: Web Audio API sound synthesis (playful pops, sparkle chimes, and toy car honks with a 1-click sound mute toggle in the navigation bar) and festive confetti celebrations upon cart additions and checkout.
- **Typography & Layout**: Fredoka display typography paired with Plus Jakarta Sans body copy, rounded bouncy corners (`rounded-3xl`), clean whitespace, and responsive mobile-first grid layouts.

---

## 🚀 Pages & Features Built

1. **Home Page (`#home`)**:
   - Memorable hero headline: *"Where Every Toy Holds a World of Pure Wonder"*
   - Interactive 3D toy diorama with action triggers (*Honk Car, Wave Bear, Bounce Blocks, Confetti*)
   - Whimsical categories showcase (Plushies & Bears, Building Blocks, Vehicles & Racers, STEM & Learning, Creative & Pretend)
   - Interactive **Magic Toy Matchmaker Quiz** (find gifts instantly by child's age)
   - Featured toys showcase with ribbon badges (*Bestseller, Montessori Pick, STEM Star, Eco Choice*)
   - The Toymaker's Workshop guarantees (*100% Non-Toxic, Screen-Free Joy, Free Gift Wrapping, WhatsApp Concierge*)
   - Verified parent testimonials with playful kid quotes
   - Secret Toy Club newsletter sign-up with instant discount voucher

2. **Toy Shop Page (`#shop`)**:
   - Live instantaneous search bar across title, tagline, description, and categories
   - Category filter pills with product counts
   - Child age group filter (*0-3 Years, 3-6 Years, 6+ Years*)
   - Sort dropdown (*Featured, Price Low-to-High, Price High-to-Low, Highest Rated, Alphabetical*)
   - Interactive product cards with hover zoom, quick view modals, wishlist heart buttons, and instant add-to-cart buttons
   - Empty state handler with 1-click filter reset

3. **Product Details View (`#product/:id`)**:
   - High-resolution gallery with image thumbnails
   - In-stock availability badge & child age recommendation
   - Original price vs. discounted price display
   - Storytelling description and verified toy feature checklist
   - Materials and safety certifications (*ASTM F963, EN71, FSC-Certified Beechwood, BPA-Free*)
   - Quantity selector controls
   - Add to Wonder Cart with sound and confetti celebration
   - Direct WhatsApp enquiry button with pre-filled toy name & price
   - "More Treasures You May Love" related toys recommendations

4. **Shopping Cart Drawer & Checkout Flow**:
   - Slide-out animated drawer with live item count badge
   - Dynamic **Free Shipping Progress Meter** (*"Add $X more for free shipping"*)
   - Quantity controls (+, -, and delete item)
   - Whimsical Gift Wrapping checkbox with custom message card
   - Promo code box with real discounts (Try `MAGIC10` for 10% off, `WONDER20` for 20% off, or `FREESHIP`)
   - **Direct WhatsApp Order Placement**: Generates a pre-formatted WhatsApp message detailing the customer's items, quantities, totals, and gift notes sent directly to the store!
   - **Interactive Demo Checkout Simulation**: Allows customers to enter shipping information and generates a complete order receipt and order ID stored in local order history.

5. **Our Story Page (`#about`)**:
   - The heartwarming heritage of the toymaker and the mission to bring tactile, screen-free wonder back to children
   - The Four Sacred Play Rules (*Open-Ended Magic, Planet Kind, Safety Above All, Heartfelt Care*)
   - The Toymaker's Workshop peek and sustainability metrics

6. **Contact & WhatsApp Concierge (`#contact`)**:
   - Dedicated direct WhatsApp Concierge card
   - Interactive message form with validation and confirmation toast
   - Workshop hours, physical location mockup, and email
   - Interactive FAQ accordion (*Materials, Shipping times, WhatsApp ordering*)

7. **Toy Inventory Manager (`#admin`)**:
   - Built-in portal accessible via the header's *"Manage Toys"* button
   - View all existing toys in an organized inventory table
   - **Add New Toy**: Form to input name, category, price, age recommendation, stock count, and image URL
   - **Edit & Delete Toys**: Modify prices or remove discontinued items live
   - **Persistent Storage**: All changes persist in `localStorage` immediately
   - **Export Catalog (JSON)**: 1-click download of the entire toy catalog backup
   - **Reset to Default**: 1-click restoration of the original 12 curated toys

---

## 💻 How to Run the Website Locally

You can run and test this website locally using any of the following simple methods:

### Option 1: 1-Click Batch File (Recommended on Windows)
Simply double-click:
```
C:\Users\HP\.gemini\antigravity\scratch\wonderland-toys\run-local.bat
```
This automatically launches a lightweight PowerShell local server on `http://localhost:3000` and opens your default browser!

### Option 2: PowerShell Server Script
Open PowerShell in the project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

### Option 3: VS Code / Live Server
If you use VS Code, open the folder `wonderland-toys` and click **"Go Live"** using the Live Server extension.

### Option 4: Direct Browser Double-Click
Because TOYXIMA uses modern standard ES Modules and high-speed CDNs (Tailwind CSS, Lucide, Three.js, Canvas Confetti), you can also run it via any local static server like `npx serve` or `python -m http.server 3000` if you install them later.

---

## 🌐 How to Publish for 100% FREE Hosting

You do not need to pay for web hosting or databases. Here are the 3 easiest free hosting platforms:

### 1. Netlify Drop (Easiest — Zero Commands)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) (free account).
2. Drag and drop the `wonderland-toys` folder into the upload box on Netlify.
3. Your site is live in 10 seconds with a free `.netlify.app` domain and free SSL!

### 2. GitHub Pages (100% Free & Open Source)
1. Create a free repository on [GitHub](https://github.com).
2. Upload the files from `wonderland-toys` to the repository.
3. Go to **Settings > Pages > Branch**, select `main` (root) and click **Save**.
4. Your website will be live at `https://<your-username>.github.io/<repo-name>/`.

### 3. Vercel
1. Install or visit [https://vercel.com](https://vercel.com).
2. Import the GitHub repository or drag and drop via Vercel CLI.
3. Select static site and click Deploy.

---

## 🛡️ Transparency & Zero Paid Services Guarantee
- **No Paid APIs or Subscriptions**: Built entirely with free, open-source libraries and public CDNs (Three.js, Tailwind CSS, Lucide Icons, Canvas Confetti).
- **Honest Order System**: Checkout is provided as both a **100% functional WhatsApp Order Generator** (ideal for small boutique businesses without transaction processing fees) and a simulated demo checkout that stores orders locally. Real payment gateways (like Stripe or Shopify) are not pre-assumed or falsely simulated.
