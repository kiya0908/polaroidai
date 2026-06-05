---
version: alpha
name: portrait.so
description: Design system for Portrait’s light, editorial landing page and creator profile experience. Calm white surfaces, bright accent color, rounded cards, and high-contrast dark navy typography support a premium, self-expressive brand.
colors:
  background: "#f7f7f7"
  surface: "#ffffff"
  on-surface: "#08304c"
  primary: "#26c0ff"
  secondary: "#353535"
  tertiary: "#d9d9d9"
  neutral: "#ffffff"
  accent: "#26c0ff"
  text: "#08304c"
  error: "#d92d20"
typography:
  headline-display:
    fontFamily: "__basierCircle_9ca3f5"
    fontSize: "61.8013px"
    lineHeight: 1
    letterSpacing: "-3.09006px"
    fontWeight: 500
  headline-lg:
    fontFamily: "__basierCircle_9ca3f5"
    fontSize: "41.5466px"
    lineHeight: "43.2085px"
    letterSpacing: "-1.32949px"
    fontWeight: 500
  headline-md:
    fontFamily: "__basierCircle_9ca3f5"
    fontSize: "20px"
    lineHeight: "24px"
    letterSpacing: "-0.262px"
    fontWeight: 500
  body-lg:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "18px"
    lineHeight: "22px"
    letterSpacing: "0px"
    fontWeight: 500
  body-md:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "16px"
    lineHeight: "27px"
    letterSpacing: "0px"
    fontWeight: 400
  body-sm:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "16px"
    lineHeight: "27px"
    letterSpacing: "0px"
    fontWeight: 400
  label-lg:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "16px"
    lineHeight: "27px"
    letterSpacing: "0px"
    fontWeight: 400
  label-md:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "16px"
    lineHeight: "27px"
    letterSpacing: "0px"
    fontWeight: 400
  label-sm:
    fontFamily: "__switzer_c2a0a8"
    fontSize: "16px"
    lineHeight: "27px"
    letterSpacing: "0px"
    fontWeight: 400
rounded:
  none: "0px"
  sm: "6px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  xl: "160px"
components:
  button:
    primary:
      backgroundColor: "{colors.primary}"
      color: "{colors.secondary}"
      padding: "20px 28px"
      minWidth: "108px"
      minHeight: "56px"
      borderRadius: "{rounded.none}"
      borderWidth: "0px"
      boxShadow: "none"
      fontFamily: "{typography.body-md.fontFamily}"
      fontSize: "{typography.body-md.fontSize}"
      fontWeight: "{typography.body-md.fontWeight}"
      lineHeight: "{typography.body-md.lineHeight}"
      textDecoration: "none"
    secondary:
      backgroundColor: "{colors.secondary}"
      color: "{colors.on-surface}"
      padding: "20px 28px"
      minWidth: "108px"
      minHeight: "56px"
      borderRadius: "{rounded.none}"
      borderWidth: "0px"
      boxShadow: "none"
      fontFamily: "{typography.body-md.fontFamily}"
      fontSize: "{typography.body-md.fontSize}"
      fontWeight: "{typography.body-md.fontWeight}"
      lineHeight: "{typography.body-md.lineHeight}"
      textDecoration: "none"
    link:
      backgroundColor: "transparent"
      color: "{colors.on-surface}"
      padding: "0px"
      minWidth: "0px"
      minHeight: "0px"
      borderWidth: "0px"
      boxShadow: "none"
      fontFamily: "{typography.body-md.fontFamily}"
      fontSize: "{typography.body-md.fontSize}"
      fontWeight: "{typography.body-md.fontWeight}"
      lineHeight: "{typography.body-md.lineHeight}"
      textDecoration: "underline"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    borderRadius: "{rounded.xl}"
    borderWidth: "0px"
    padding: "20px 20px 44px"
    boxShadow: "oklab(0 0 0 / 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 10px 16px 14px 0px"
---

# Overview

Portrait is a light, premium, creator-focused interface built around a soft white canvas, dark navy typography, and a vivid cyan accent. The visual language combines editorial hero treatment, rounded utility surfaces, and floating content cards that feel tactile but restrained.

Use this system for:
- marketing pages
- onboarding and signup flows
- creator profile surfaces
- commerce and wallet entry points

The screenshot reinforces a spacious composition with a centered hero, pill badges, outlined CTAs, and staggered image/cards around the perimeter. Keep the interface airy and expressive, not dense or app-like.

# Colors

Use a pale background with a white content surface and strong navy text.

- `background` is the page base
- `surface` is the primary card and shell color
- `on-surface` / `text` is the main ink color
- `primary` is the bright cyan action color
- `secondary` is the dark neutral used for filled utility buttons
- `tertiary` supports subtle borders and separators
- `error` is reserved for destructive states and validation

Recommended usage:
- Body text and headings: `{colors.text}`
- Main CTA accents and highlights: `{colors.primary}`
- Secondary filled buttons: `{colors.secondary}`
- Card backgrounds: `{colors.surface}`
- Page backdrop: `{colors.background}`

Avoid introducing saturated brand colors that compete with the cyan accent. Preserve the calm, airy palette.

# Typography

Portrait uses two type voices:
- Basier Circle for display and headline hierarchy
- Switzer for body, UI, and navigation labels

Token guidance:
- `headline-display` for the main hero title
- `headline-lg` for section headings
- `headline-md` for small headings, feature titles, and card headlines
- `body-md` for most paragraph copy
- `body-lg` for supporting lead copy or strong labels
- `label-md` / `label-sm` for nav, badges, and controls

Rules:
- Headings should be visually tight with negative tracking.
- Body copy should stay open and readable at 16px.
- Do not mix additional display fonts into the hierarchy.
- Keep icon labels and navigation in Switzer for consistency.

# Layout

The layout is centered, spacious, and marketing-led.

- Prefer a large hero block with centered alignment.
- Use generous outer margins and wide breathing room around floating visual elements.
- Keep the main container broad, with a soft framed shell and subtle edge glow or shadow.
- Group utility content into pills, badges, and compact cards rather than long text columns.
- Use large vertical separation between major sections, approximating `{spacing.xl}`.

Observed structure:
- Top navigation sits in a rounded white bar with logo left, announcement center, and auth actions right.
- Hero content is centered with a small pill above the headline, subcopy below, and a signup input/action row.
- Decorative image cards float around the hero and lean slightly; they should feel spontaneous but controlled.
- Secondary profile/composer content appears in large rounded cards below the fold.

# Elevation & Depth

Depth is subtle and mostly achieved through soft shadows and stacking.

- Use card shadow for elevated content surfaces.
- Use minimal or no shadow on buttons.
- Keep the hero shell and cards distinct through white-on-background contrast, not heavy elevation.
- Floating cards may overlap the page edge slightly to create motion.

Preferred shadow usage:
- Cards: `{components.card.boxShadow}`
- Small UI elements: very soft shadow only if needed
- Do not use harsh drop shadows, bevels, or dark outlines

# Shapes

Shapes are rounded but not bubbly.

- `rounded.xl` is the default for cards and large panels.
- `rounded.full` is for pills, chips, and badge capsules.
- `rounded.none` is used by buttons and rectangular utility surfaces.
- Use subtle curvature for inputs and shells when matching the screenshot.
- Keep image cards slightly rotated for a casual, collage-like feel.

# Components

## Button
Primary and secondary buttons are compact, rectangular, and text-forward.

- `primary` uses cyan fill with dark text.
- `secondary` uses dark fill with light-leaning surface contrast.
- `link` is underlined text only.

Implementation notes:
- Minimum size should remain `108px × 56px`.
- Use 16px Switzer text.
- Avoid pill-shaped buttons unless they are explicitly badge-like.
- Keep button copy short: `Sign up`, `Donate`, `Get Plus`.

## Card
Cards are white, rounded, and lightly elevated.

- Use `borderRadius: 28px`.
- Keep padding asymmetric when content includes media and metadata.
- Cards may contain avatars, thumbnails, wallet promos, or content previews.
- Maintain clear internal hierarchy with title, supporting text, and action row.

## Badge / pill
The screenshot shows small pill badges such as `New`.

- Use capsule shapes with compact padding.
- Keep labels short and status-oriented.
- Use cyan-tinted or neutral fills, not noisy gradients.

## Input / signup row
The hero signup row is a wide rounded field with embedded action.

- The field should read as a single composite control.
- The action button may sit inside the right end of the field.
- Preserve high contrast for the URL/handle sample text.
- Avoid dense form chrome; this is a landing-page conversion element, not a dashboard input.

# Do's and Don'ts

## Do
- Do center the hero and keep generous whitespace around it.
- Do use Basier Circle for prominent headlines and Switzer for everything functional.
- Do use the cyan accent sparingly, to focus attention on sign-up and key actions.
- Do keep cards white, rounded, and softly shadowed.
- Do let supporting media cards overlap the frame for energy and personality.
- Do write short CTAs and labels that match the screenshot tone.

## Don't
- Don't add dark backgrounds or high-contrast neon gradients as page fills.
- Don't replace the headline stack with a geometric sans that lacks the editorial feel.
- Don't turn buttons into fully pill-shaped capsules unless they are badges.
- Don't crowd the hero with multiple competing primary actions.
- Don't use dense grid systems or cramped spacing; Portrait should feel open and premium.
- Don't overstate elevation with large shadows or hard borders.