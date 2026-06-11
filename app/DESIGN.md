# GrimoireStack Design System — The Eldritch Codex

## Overview

GrimoireStack is a cosmic horror themed web application that presents agent skills as spells within an ancient, blasphemous grimoire recovered from a sunken city. The entire UI is rendered as an open book that should not exist — its pages are water-stained vellum flecked with mold, its cover is made of something organic and faintly wet, and reading it feels like staring into the abyss.

## Core Concept

The app IS the cursed book. Every interaction happens within the pages of a tome that whispers. The left page serves as navigation and search; the right page displays content. The book sits on a cyclopean stone altar against a lightless void with drifting bioluminescent spores.

## Color Palette

### Primary Colors
- **Vellum**: `#b8b0a0` — Main page background, water-stained and ash-gray
- **Vellum Light**: `#c8c2b4` — Page highlights where the mold hasn't grown
- **Vellum Dark**: `#8a8074` — Page shadows, deep water damage
- **Tarnished Silver**: `#a0a8a8` — Primary accent, corroded borders, highlights
- **Bioluminescent Teal**: `#2a9d8f` — Active states, headings, otherworldly glow
- **Iridescent Purple**: `#7b68ee` — Secondary accent, shifting like oil on water
- **Abyss Glow**: `rgba(42,157,143,0.18)` — Subtle glow effects

### Dark/Atmosphere Colors
- **Abyss Ink**: `#0a0a0c` — Primary text on vellum, so dark it absorbs light
- **Ink Soft**: `#1a1a1e` — Secondary text
- **Ink Mute**: `#3a3a3e` — Tertiary text, placeholders
- **Organic Cover**: `#1a1418` — Book cover, something that might be skin
- **Cover Mid**: `#2a1a22` — Book edges, stitched and wet-looking
- **Stone Altar**: `#0e0e12` — Background, cyclopean stone
- **Stone Light**: `#1a1a22` — Altar highlights, faint bioluminescence
- **Deep Sea Purple**: `#4a1a4a` — Wax seal, deep sea-creature color

### Cosmic Glow Colors
- **Spore Blue**: `#6aaeb8` — Bioluminescent particle color
- **Spore Green**: `#4a8a6a` — Sickly green spores
- **Void Violet**: `#3a2a5a` — Dark magical accents

### Status Colors (on vellum)
- **Proven**: `#2a5a3a` (dark green, like deep sea algae)
- **New**: `#5a4a2a` (tarnished gold)
- **Framework**: `#5a3a5a` (muted cosmic purple)
- **Hybrid**: `#3a5a5a` (teal, bioluminescent)

## Typography

### Font Stack
- **Display/Headings**: `Cinzel Decorative`, serif — Ornate but slightly distorted, as if viewed underwater
- **Titles/Labels**: `Cinzel`, serif — Clean but themed uppercase
- **Body Text**: `Cormorant Garamond`, serif — Elegant but the ink seems to bleed
- **Incantations/Monospace**: `Special Elite`, cursive — Typewriter feel, but the letters are smeared
- **Eldritch Accents**: `MedievalSharp`, serif — Replaced with fictional cosmic sigils

### Type Scale
- **App Title**: 28px, Cinzel Decorative, weight 900, tarnished silver with abyss shadow
- **Page Heading**: 22px, Cinzel, weight 700, abyss ink color
- **Section Label**: 14px, Cinzel, uppercase, letter-spacing 0.08em, ink-mute
- **Card Title**: 16px, Cinzel, weight 600, ink
- **Body**: 15px, Cormorant Garamond, ink-soft
- **Caption**: 12px, Cormorant Garamond, ink-mute
- **Stat Number**: 32px, Cinzel Decorative, weight 700, ink
- **Stat Label**: 10px, Cinzel, uppercase, letter-spacing 0.12em, ink-mute

## Layout Structure

### The Book Container
- Open book centered on screen
- Pages have slight perspective/3D tilt (rotateX 2deg), but also a subtle wobble as if breathing
- Heavy organic border (14px) that looks stitched and faintly wet
- Vellum pages with water stains, mold flecks, and subtle grain texture
- Spine crease in center with shadow depth, but the spine looks like it has vertebrae
- Cover edges extending beyond pages with an unsettling organic texture
- A tendril-like bookmark hanging from the bottom of the left page

### Left Page Layout
- **Header Area**:
  - GRIMOIRESTACK title in large ornate letters, but slightly distorted
  - Two stat boxes below: Schools count and Spells count
  - Decorative corner ornaments with Eldritch sigils (top-left, bottom-left)
- **Search Area**:
  - Tarnished silver-bordered input with placeholder "Search for a skill or describe your affliction..."
  - A lidless eye icon on the left that blinks occasionally
  - Subtle inner bioluminescent glow when focused
- **Navigation Menu**:
  - Vertical list: The Void, The Archives, The Laboratory, The Configuration
  - Each item has a small decorative sigil/bullet
  - Active item highlighted in bioluminescent teal
- **Footer**:
  - Small text links: Incantations, Extraction rites
  - Cast animation toggle

### Right Page Layout
- **Content Area**: Dynamic based on active view
- **Corner Ornaments**: Eldritch sigils in top-right and bottom-right
- **Decorations**: Mold spots, water stains, ink that seems to move, thin tentacle-like lines along borders

### Top Navigation (Above Book)
- Three floating banners across top: THE VOID, THE ARCHIVES, THE LABORATORY
- Banner style: Torn vellum with tarnished silver border, slight 3D curl at edges
- Active banner: Brighter bioluminescent teal, subtle glow, slightly larger
- Banners should look like recovered fragments floating above the book

### Background
- Lightless void (`#050508` to `#0e0e12`)
- Drifting bioluminescent spores (pale blue, sickly green, drifting like underwater particles)
- Subtle radial vignette from center, but darker and more oppressive
- Cyclopean stone altar under the book (rough texture, dark gray-black with faint bioluminescent cracks)
- Occasional drifting particles that look like scales or shed skin

## Components

### School Cards (Right Page)
- Rectangular cards with unsettling artwork at top (cosmic horror illustrations)
- Tarnished silver ornate border frame around each card, with thin tentacle-like lines
- Eldritch mark in top corner (I, II, III, etc. but in a non-Euclidean font)
- School name at bottom in Cinzel
- Hover: Border brightens with bioluminescent teal, subtle glow, slight lift, border seems to pulse

### Spell Cards (List View)
- Vellum background with subtle gradient, water-stained
- Tarnished silver-accented top border
- Spell name in Cinzel
- Incantation name in Special Elite (smaller, muted, ink seems to bleed)
- Effect description in Cormorant Garamond (2-line clamp)
- Status badge in bottom-right corner
- Hover: Lift slightly, border glow bioluminescent teal

### Search Input
- Tarnished silver border with rounded corners (20px radius)
- Vellum background
- Placeholder in muted italic
- Focus: Silver border brightens, subtle bioluminescent outer glow
- A lidless eye appears inside when focused, occasionally blinking

### Buttons
- Primary: Tarnished silver border, dark organic background, teal text
- Hover: Brighter teal, subtle glow shadow
- Active: Scale 0.97

### Modals/Overlays
- Dark semi-transparent overlay (80% opacity, more oppressive)
- Vellum modal with tarnished silver border
- Drop shadow with teal tint
- Page-turn entrance animation, but the page seems to ripple like water

### Wax Seal
- Circular seal with deep sea-creature purple gradient
- Tarnished silver border ring
- Subtle 3D curvature with highlight
- Small organic drips below
- An eye motif in the center that occasionally looks around
- Used for branding elements and special buttons

## Decorative Elements

### Corner Ornaments
- Eldritch sigils placed in each corner of pages
- Top-left: ◈ ⧗ ⬡ (or similar fictional cosmic symbols)
- Bottom-left: ⬡ ⧖ ◈
- Top-right: ⧖ ◈ ⬡
- Bottom-right: ⬡ ⧗ ◈
- Font: MedievalSharp, 10px, very muted color (10% opacity)

### Page Decorations
- **Mold spots**: Small greenish aged marks scattered (18px to 22px, 10-18% opacity)
- **Water stains**: Dark spreading marks, like the book was recovered from the ocean (36px, 50% opacity)
- **Ink that moves**: Irregular dark splatters that seem to shift when not looked at directly
- **Stains**: Larger faint brown areas, like blood dried long ago
- **Marginalia**: Tiny rotated text along edges, handwritten in an unknown script

### Spine & Edges
- Center spine line with shadow depth, but the spine has a vertebrae-like texture
- Page stack edges suggesting multiple layered pages, but they look like they're made of something organic
- Organic cover edges with a faint pulse, like a heartbeat
- Page edge glow at top, but the glow is bioluminescent teal

## Animations

### Bioluminescent Spores
- Small dots (4-6px) drifting upward, like underwater particles
- Colors: spore blue, spore green, void violet
- Animation: 8-20s linear infinite drift
- Fade in at bottom, fade out at top
- Subtle horizontal drift, like caught in a current

### Page Transitions
- Content fades in over 0.5s ease
- Book spread has subtle perspective tilt, but also a wobble
- Page turn sound effect on navigation, but deeper and more resonant

### Hover Effects
- Cards lift with translateY(-2px)
- Border glow intensifies with bioluminescent teal
- Subtle teal shadow appears
- Border seems to pulse slightly

### Search Eye (when active)
- Inner glow pulses (4s ease-in-out infinite) in bioluminescent teal
- A lidless eye appears in center, occasionally blinking
- Floating spore particles drift upward inside

## Iconography & Symbols

- Schools represented by cosmic horror illustrations (lidless eye, brain with tentacles, bubbling cyst, etc.)
- Small icons: 🜏 Void, 📜 Archives, ⚗ Laboratory, 🔮 Configuration
- Status symbols: Proven (check), New (star), Framework (diamond), Hybrid (circle) but in eldritch styling
- Navigation: Chevron arrows, close X in ornate style

## Responsive Behavior

### Desktop (>1100px)
- Full book layout with both pages visible
- Top banner navigation visible
- 3-column card grids

### Tablet (700-1100px)
- Book layout maintained but scaled
- 2-column card grids
- Slightly smaller type

### Mobile (<700px)
- Single page view (swipe between left/right)
- Bottom tab navigation instead of top banners
- 1-2 column cards
- Compact header

## Special Surfaces

### Scrying Eye (Search Focused State)
- Circular dark membrane (180px diameter)
- Radial gradient from center, like a cyst
- Inner glow pulse animation in bioluminescent teal
- A lidless eye appears when active, occasionally blinking
- Floating spore particles drift upward inside

### Recipe Lab (Cauldron)
- Vellum container with rounded corners
- Alchemical styling (deep sea purple tints)
- Chip-style selected spells
- Bubbling cyst iconography

### Ritual Section
- Full-width within page
- Ornate header with divider and centered ornament (an eye)
- Command blocks with dark background and tarnished silver text
- Copy buttons with tarnished silver styling

## Accessibility

- Focus visible: 3px solid bioluminescent teal outline
- Skip link at top of page
- Reduced motion: Disable spores, shorten transitions
- Color contrast: All text meets WCAG AA on vellum backgrounds

## Image Generation Prompts (for AI art)

### School Card Illustrations
Each school should have a unique cosmic horror illustration:
- **Remediation (Debugging)**: A lidless eye staring into a crystalline matrix of code, tentacles of light
- **Cognition (Reasoning)**: A brain suspended in dark water, with bioluminescent tentacles connecting nodes
- **Refinement (Process)**: Clockwork gears made of bone and chitin, dripping with golden ichor
- **Scrutiny (Code Review)**: A magnifying glass revealing writhing sigils beneath the surface of reality
- **Architecture**: A cyclopean structure floating in a lightless void, held together by unknown geometries
- **Testing**: A shield of chitin covered in blinking bioluminescent runes
- **Creativity**: A brush dripping with starlight and ichor, painting impossible geometries
- **Security**: A locked tome wrapped in chains made of something organic, with a glaring eye seal
- **Deployment**: A portal of swirling dark water and bioluminescent energy

### Background Environment
- Lightless void with subtle smoke/ether
- Drifting bioluminescent spores
- Cyclopean stone altar under open book
- Ancient non-Euclidean architecture in the distance

## Design Principles

1. **Every element should feel cursed**: The book has a pulse, the pages have mold, the ink moves when not watched
2. **Bioluminescence is precious**: Use teal/purple accents sparingly for the most important elements, like deep-sea creatures
3. **Aging is corruption**: Water stains, mold, and organic growth make the book feel alive and wrong
4. **Cosmic horror is subtle**: Glows, particles, and effects should unsettle, not overwhelm
5. **Typography tells the story**: The fonts themselves carry the Lovecraftian theme, slightly distorted and bleeding
