---
name: Rockshill Campground Admin
colors:
  surface: '#fff8ef'
  surface-dim: '#dfd9d0'
  surface-bright: '#fff8ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3e9'
  surface-container: '#f3ede3'
  surface-container-high: '#eee7dd'
  surface-container-highest: '#e8e2d8'
  on-surface: '#1e1b16'
  on-surface-variant: '#504538'
  inverse-surface: '#33302a'
  inverse-on-surface: '#f6f0e6'
  outline: '#827566'
  outline-variant: '#d4c4b3'
  surface-tint: '#825508'
  primary: '#7f5305'
  on-primary: '#ffffff'
  primary-container: '#9b6b20'
  on-primary-container: '#fffbff'
  inverse-primary: '#f7bc6a'
  secondary: '#49654c'
  on-secondary: '#ffffff'
  secondary-container: '#cbebcb'
  on-secondary-container: '#4f6b52'
  tertiary: '#76553b'
  on-tertiary: '#ffffff'
  tertiary-container: '#916d52'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#f7bc6a'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#cbebcb'
  secondary-fixed-dim: '#afcfb0'
  on-secondary-fixed: '#06200d'
  on-secondary-fixed-variant: '#324d36'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#e9be9e'
  on-tertiary-fixed: '#2c1603'
  on-tertiary-fixed-variant: '#5e4028'
  background: '#fff8ef'
  on-background: '#1e1b16'
  surface-variant: '#e8e2d8'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 280px
  max-content-width: 1440px
---

## Brand & Style
The design system for this admin dashboard balances premium hospitality with the rugged, organic textures of the outdoors. The personality is grounded, sophisticated, and warm, designed to reduce the stress of high-volume campground management while maintaining a "high-end retreat" aesthetic.

The style is **Modern Corporate with Tactile accents**. It utilizes a clean, card-based interface for data density but introduces "human" elements—like jagged-edge "receipt" treatments for modals and rich, earthy tones—to evoke a sense of physical connection to the campsite. The goal is to make the administrative process feel as premium as the guest experience itself.

## Colors
The palette is deeply rooted in a natural, earthy landscape. The background uses a creamy off-white (`#F8F4EC`) to reduce eye strain compared to pure white. 

- **Primary Brown (#A7752A):** Used for primary actions, active states, and high-level branding elements.
- **Forest Green (#2F4A33):** Used for success states, "Available" status indicators, and eco-centric metrics.
- **Dark Brown (#4A2F18):** Reserved for primary text and deep structural elements to ensure high contrast.
- **Soft Beige (#E8D8C3):** Applied to secondary containers, card borders, and subtle backgrounds to create depth without harshness.
- **Warm Gray (#77736B):** Used for secondary text, metadata, and inactive iconography.

## Typography
The system employs a dual-font strategy. **Outfit** provides a geometric, modern, and high-end feel for headings and display stats, while **Inter** ensures maximum legibility for dense data tables, reservation details, and administrative controls.

For mobile devices, display headings scale down to maintain vertical space, while body text remains consistent at 14px-16px to ensure accessibility in outdoor lighting conditions. All labels utilize a slightly increased letter-spacing and uppercase styling for clear categorization in complex forms.

## Layout & Spacing
The layout follows a **Fluid Grid with Fixed Constraints**. On desktop, a persistent 280px sidebar provides global navigation, while the main content area utilizes a 12-column grid with 24px gutters.

**Responsive Behavior:**
- **Desktop:** Multi-column layouts for dashboard widgets. Cards are grouped logically to maximize screen real estate.
- **Tablet:** Sidebar collapses into an icon-only rail or a hidden drawer.
- **Mobile:** A 1-column layout. Tables are discarded in favor of rich "Reservation Cards" that stack vertically, prioritizing the Guest Name and Site Number. Margin reduces to 16px to allow content to breathe on smaller screens.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a structured but soft hierarchy. 

- **Level 0 (Background):** `#F8F4EC` — The base canvas.
- **Level 1 (Cards):** White or `#E8D8C3` with a subtle 2px border and a very soft, low-opacity shadow (4% opacity `#4A2F18`, 8px blur) to define the interactive surface.
- **Level 2 (Modals/Popovers):** These use a higher elevation with a 16px blur shadow. 
- **The "Receipt" Effect:** Transactional modals and booking summaries feature a "jagged-edge" bottom border, mimicking a physical paper slip. This is achieved via a CSS mask-image or a repeating SVG path, reinforcing the tactile nature of the brand.

## Shapes
The shape language is "Medium-Rounded." Standard components use an 8px radius, while primary containers and cards use a more pronounced 12px or 16px radius to feel welcoming and modern. 

The jagged edge styling is exclusively reserved for the bottom of "summary" components (like booking confirmation modals) to act as a distinctive visual anchor. Buttons use a consistent 8px radius to maintain a professional, sturdy appearance.

## Components
- **Buttons:** Primary buttons are Solid Primary Brown (`#A7752A`) with White text. Secondary buttons use the Soft Beige background with Dark Brown text. All buttons feature a 300ms hover transition that slightly deepens the background color.
- **Status Chips:** Use a soft-tinted background with a high-contrast label. Example: "Available" is a light tint of Forest Green with Dark Forest Green text.
- **Cards:** The primary vehicle for information. Cards have a 1px border (`#E8D8C3`) and 24px internal padding. In mobile views, cards become the "rows" of data.
- **Inputs:** Fields are outlined in Warm Gray, shifting to Primary Brown on focus. The background is white to ensure text clarity.
- **Jagged Modals:** Modals for check-out or receipt viewing must include the sawtooth bottom edge.
- **Lists:** Mobile-optimized card lists include a left-border "accent" stripe that matches the status of the reservation (e.g., Green for Checked-In, Brown for Pending).