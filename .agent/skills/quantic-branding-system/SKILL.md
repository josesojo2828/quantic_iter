# Quantic Branding & Style System

This skill defines the visual identity and aesthetic guidelines for the Quantic Ecosystem.

## 1. Visual Philosophy: "Antigravity & Racing"
The system aims for a high-performance, weightless, and premium look. It combines the intensity of professional facilitatoral mentors with the futuristic feel of spatial glassmorphism.

## 2. Color Palette (Racing Team)
- **Primary**: `#608A25` (Racing Green). High-action items, primary branding.
- **Primary-Content**: `#C3CEA2` (Cream/Light Sage). Primary text on dark backgrounds.
- **Secondary**: `#C3CEA2`. Subheadings and secondary elements.
- **Accent**: `#896C2C` (Gold Bronze). Highlighting specialized features, currency, or badges.
- **Neutral**: `#433C1F` (Deep Bronze/Brown). Shadows and intermediate background layers.
- **Base-100**: `#020601` (Absolute Black). Global background lienzo.
- **Base-200**: `#1B2723` (Deep Forest Green). Component containers and cards.

## 3. Topography & Surfaces
- **Glassmorphism Contract**:
  - Background: `rgba(27, 39, 35, 0.4)` (Base-200 tinted).
  - Blur: `16px`.
  - Border: `0.5px solid rgba(195, 206, 162, 0.1)`.
- **Borders**: All interactive elements (buttons, inputs) must use a fine border of `0.5px`.
- **Radius**: Large radius of `24px` for main containers, `12px` for small inputs.

## 4. Typography
- **Font Face**: Inter (Default for English/Latin).
- **Headings**: Semi-bold to Bold, using `text-gradient` (Primary to Secondary).
- **Body**: Regular, usage of `opacity` rather than lighter colors to maintain the "glassy" look.

## 5. UI Elements Code Snippets
- **Gradient Text**:
  ```css
  .text-gradient {
    background: linear-gradient(135deg, #608a25 0%, #c3cea2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  ```
- **The "Space" Background**:
  Always use as a fixed, absolute-positioned decorative layer at the root of the document.
