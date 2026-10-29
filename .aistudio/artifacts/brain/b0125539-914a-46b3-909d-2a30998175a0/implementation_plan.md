# Market Event Inventory & Point of Sale (POS) System

A unified retail and pop-up market solution embedded into DuoSync: master barcode catalog creation and mobile thermal printing in the Heart section, barcode-driven packout logging for market events, and an on-site Point of Sale Register supporting Cash, Card scanning, and Venmo QR payments.

> [!IMPORTANT]
> **Key Integration & Flow Decisions:**
> 1. **Payment Processing**: For mobile pop-up markets, Square-style card workflows paired with Venmo QR codes and instant cash calculation provide the best field reliability without blocking checkout if off-grid. Card payments will feature an optical camera card reader / chip tap interface with real transaction receipt logging.
> 2. **Mobile Printer Formatting**: Thermal and mobile Bluetooth label printers (e.g. Munbyn, Rollo, Phomemo 2"x1" labels) require dedicated print stylesheets (`@media print`) and vector SVG barcode rendering to ensure barcodes scan cleanly under handheld laser and camera scanners.
> 3. **Market Event State**: Each market event will retain its own packed inventory snapshot and live sales log, automatically updating the event's `actualRevenue` and calculating profitability against the `boothFee`.

---

## 1. Overview & Core Concept

### What It Does
- **Heart Section Inventory Studio**: A dedicated Inventory management hub inside the pastel Heart modal (Unified Workspace) where couples can manage product catalogs, categorize items (art prints, ceramics, apparel, preserves, etc.), set pricing, generate unique standard barcodes (Code 128 / UPC), and print barcode labels optimized for mobile label printers.
- **Event Packout Inventory Scanner**: On any Market-type event (alongside the booth fee and financial targets), an "Inventory" button opens an expedited packout interface. Users can scan physical item barcodes via camera or rapid barcode entry to log exact quantities brought to that market.
- **On-Site Market Register (POS)**: A prominent "Register" button on market events opens a full-screen point-of-sale checkout console. Vendors can scan barcodes as customers purchase items, tap quick-add categories, and process payments across Cash (with change calculator), Card (with camera card scanner & terminal flow), or Venmo (with dynamic QR code).

### Target Audience & Persona
Couples and creators running craft fairs, farmers' markets, pop-up artisan booths, and community markets who need frictionless item tracking, physical barcode labeling, and rapid booth checkout directly inside their shared calendar.

### Key Value
Eliminates separate cumbersome POS apps and inventory spreadsheets by marrying calendar planning, booth expenses, mobile inventory packing, and register revenue directly into each market day.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. HEART SECTION (Master Catalog & Barcode Printing)                    │
│    Open Heart Modal ──> "Inventory" Tab ──> Add/Edit Items              │
│    • Set Category, SKU, Barcode, Price, Default Stock                   │
│    • Click "Print Labels" ──> Format for Mobile 2"x1" Thermal Roll      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. MARKET EVENT PACKOUT (Before Leaving for Market)                     │
│    Calendar Day ──> Market Event Card ──> Click "Inventory"            │
│    • Camera opens in Scan Mode                                          │
│    • Scan barcode on product ──> Auto-increments "Packed" count         │
│    • Shows total pieces packed and total booth retail inventory value   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. AT THE MARKET (Point of Sale Register & Checkout)                    │
│    Market Event Card ──> Click "Register"                               │
│    • Rapid Barcode Scanner or Quick-Tap Product Grid                    │
│    • Cart Drawer updates with line items, tax, and discount options     │
│    • Checkout Modal:                                                    │
│      ├── [Cash] : Quick bill buttons ($5, $10, $20, $50) + Change Due   │
│      ├── [Card] : Optical Card Scanner + Simulated Terminal Reader      │
│      └── [Venmo]: Instant QR Code + Deep Link + Receipt Confirmed       │
│    • Sale completes ──> Updates Event Actual Revenue & Inventory Count  │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Color Palette**: Neutral stone canvas (`#faf8f5` light, `#1a1d22` dark) with warm amber and emerald accents for retail telemetry.
  - Active checkout total: Crisp bold tabular figures.
  - Category tags: Clean typographic labels without candy badge clutter.
  - Barcode preview: High-contrast monochrome SVG rendering with human-readable numbers beneath.
- **Typography & Hierarchy**:
  - Primary Headers: SemiBold Title Case (`font-sans`).
  - Money & Quantities: Tabular figures (`tabular-nums font-mono`).
  - Barcode readout: Clean monospace lettering (`font-mono tracking-widest`).
- **Interactive Feedback**:
  - Scan confirmation: Subtle audio beep synthesis via Web Audio API + visual laser flash.
  - Mobile Print View: Clean CSS `@page { size: 50mm 25mm; margin: 0; }` preventing margin bloat.
  - Payment success: Full receipt summary with printable slip and "Next Sale" shortcut.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Camera Barcode Scanning vs. Manual Fallback
- **Chosen Approach**: Dual-mode input combining live camera barcode scanning (using the browser's `BarcodeDetector` API with fallback video canvas analysis) and an auto-focused barcode text input for physical Bluetooth / USB laser scanners.
- **Why**: Field conditions at outdoor markets can range from bright sunlight to low-light evening tents. Providing both camera scanning and rapid text-input keyboard wedge scanning ensures 100% scanning reliability.

### Decision 2: Payment Gateway Simulation & Venmo QR Integration
- **Chosen Approach**: Built-in Venmo QR code generator matching the couple's handle and sale total, alongside an optical camera card scanner and simulated terminal checkout with printable receipts.
- **Why**: Direct Stripe/Square API keys should not be hardcoded in client-side prototypes without user-configured cloud webhooks. This provides an immediate, fully functional end-to-end POS workflow that supports live Venmo payments and card capture without requiring external API setup.

### Decision 3: Thermal Mobile Label Printing
- **Chosen Approach**: Pure client-side SVG barcode generation (Code 128 standard) rendered in an iframe/print modal with standard mobile thermal presets (2" x 1", 2.25" x 1.25", and continuous rolls).
- **Why**: Works natively with iOS AirPrint, Android Bluetooth print services, and desktop USB label printers without requiring third-party proprietary print SDKs.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Auth & Hub Context                            │
│                 (User profiles, Hub state, Event storage)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│   UnifiedWorkspaceModal       │               │      Calendar & Schedules     │
│   (Heart Section)             │               │   (InteractiveDaySchedule)    │
│  ┌─────────────────────────┐  │               │  ┌─────────────────────────┐  │
│  │ Inventory Tab           │  │               │  │ Market Event Card       │  │
│  │ • Catalog Management    │  │               │  │ • Booth Fee & Target    │  │
│  │ • Barcode Generator     │  │               │  │ • [Inventory] Button    │  │
│  │ • Thermal Label Print   │  │               │  │ • [Register] (POS) Btn  │  │
│  └─────────────────────────┘  │               │  └───────────┬─────────────┘  │
└──────────────┬────────────────┘               └──────────────┼────────────────┘
               │                                               │
               ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│ Master Inventory Storage      │               │ Market Event Active Modals    │
│ • localStorage / Firestore    │◀──────────────┤ • MarketPackoutModal (Scan)   │
│ • Item ID, SKU, Barcode,      │               │ • PointOfSaleRegisterModal    │
│   Price, Category, Stock      │               │   (Cart, Cash, Card, Venmo)   │
└───────────────────────────────┘               └───────────────────────────────┘
```

### Data Entities & Schema Extensions

```typescript
// Master Inventory Item in Heart Section
export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string; // E.g. "DUO-100234" or numeric
  category: string;
  price: number;
  cost?: number;
  defaultStock: number;
  description?: string;
  createdAt: string;
}

// Market Event Specific Packout and Sales Log
export interface MarketPackoutItem {
  productId: string;
  name: string;
  barcode: string;
  price: number;
  category: string;
  quantityPacked: number;
  quantitySold: number;
}

export interface MarketSaleRecord {
  id: string;
  timestamp: string;
  items: Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'venmo';
  cashTendered?: number;
  changeDue?: number;
}

// CalendarEvent extension:
// marketDetails?: {
//   boothFee?: number;
//   targetRevenue?: number;
//   actualRevenue?: number;
//   inventory?: MarketPackoutItem[];
//   sales?: MarketSaleRecord[];
// }
```

### Component Breakdown
1. **`InventoryManager.tsx`** (Heart Section):
   - Inventory item table with filtering, search, and stock stats.
   - Item add/edit modal with automatic barcode / SKU generator.
   - Mobile label print dialog with SVG barcode render and preset dimensions.
2. **`MarketPackoutModal.tsx`** (Event Inventory Button):
   - Camera scanner overlay and rapid scan text box.
   - Displays items packed for this event, retail value, and quick $+1 / -1$ adjustment.
3. **`PointOfSaleRegisterModal.tsx`** (Event Register Button):
   - Left pane: Barcode scanner + quick-tap product grid categorized by tabs.
   - Right pane: Active order cart with subtotal, tax toggle, and "Checkout" CTA.
   - Checkout overlay:
     - **Cash**: Preset dollar bills, quick change calculator.
     - **Card**: Camera optical card scanner + touch terminal confirmation.
     - **Venmo**: Dynamically generated SVG QR code with vendor handle & exact amount.
     - Completion screen with sales receipt printing.
