# Customer storefront design

## Goal

Create a trustworthy, warm online storefront for **ลูกชิ้นล้อเลื่อน**. It should feel like a clean local favourite: freshly made food, clear delivery windows, and an effortless path from product discovery to checkout.

The approved visual reference is `docs/Generated image 1.png`. Use it as a composition reference, not as an image to embed or crop. The intended customer route is `/` in `frontend/`.

## Brand tokens

| Token | Value | Role |
| --- | --- | --- |
| `primary` | `#2E7D32` | Primary CTAs, header accents, selected state, cart |
| `secondary` | `#E3F2FD` | Morning delivery surface |
| `tertiary` | `#FFF3E0` | Afternoon delivery surface |
| `neutral` | `#455A64` | Secondary text and utility information |
| `ink` | `#183326` | High-contrast headings and body text |
| `canvas` | `#FFFDF9` | Page background |

Use the primary colour sparingly but decisively. Keep large surfaces warm white, use secondary/tertiary only to distinguish delivery options, and never use colour as the only status signal.

## Page hierarchy

1. **Header:** brand lockup, cart count, and login action only. Keep it visually light on every viewport.
2. **Announcement bar:** a CSS ticker-style strip, not a `<marquee>` element. Keep the megaphone icon fixed at the far left, animate recent-order details through the remaining space, provide no action button, and stop the motion for `prefers-reduced-motion`.
3. **Hero:** a two-slide, full-width image carousel: the green food truck and a fried-snacks-and-drinks scene. It uses a 1000ms fade transition, touch swipe, keyboard navigation, visible pagination dots, and a seven-second autoplay that stops for `prefers-reduced-motion`. The image height is 520px on desktop and 260px on mobile. Do not place copy, proof points, or a CTA over the images.
4. **Recent orders:** immediately under the hero, show a full hero-width `รายการสั่งซื้อ` section with a table icon. The table header uses primary green with white text. The columns are nickname, ordered items, delivery period, order time, and payment status. Morning uses blue text, afternoon uses orange text; unpaid and paid use pastel red and green badges respectively. Use 12 sample orders, show 5 orders per page, and provide an accessible paginator below the table.
5. **Delivery picker:** use a clock icon with the sole heading `เลือกช่วงเวลาจัดส่ง`, then show two equally prominent cards. Its content aligns directly with the hero width, with no coloured section surface. Use the labels `ช่วงเช้า` and `ช่วงบ่าย` without colour descriptors; the text within both cards is large and readable. Morning is `secondary`; afternoon is `tertiary`. A selected card has a large coloured ring and glow matching its card (blue for morning, orange for afternoon), plus a 56px checkmark control with a 24px tick; selected state also uses `aria-pressed`, not colour alone.
6. **Menu:** use a chef-hat icon with `เลือกเมนูที่ชอบ` as the sole menu heading; show only three category pills—`ทั้งหมด`, `ลูกชิ้นทอด`, and `เครื่องดื่ม`—with `ทั้งหมด` active initially; use a two-column mobile / four-column desktop product grid.
7. **Sticky cart:** always reachable, shows item count and total, and disables checkout until an item exists. Its order-summary button uses a brown surface with white text; the disabled state retains this treatment at reduced contrast.
8. **Footer:** a full-width green footer with a white transparent logo mark and brand name, `จัดส่งช่วงเช้า (08:00–11:00)`, `จัดส่งช่วงบ่าย (14:00–17:00)`, and `© 2024 ลูกชิ้นล้อเลื่อน - Fresh Meatballs Daily`.

## Components and interaction

### Header and hero

- Use `docs/logo.png` as the logo asset. Keep it circular and never stretch it.
- Header remains visually light; cart icons use primary green, while the login action uses a brown surface with white text.
- The hero is image-only, with no shadow or coloured surface behind it; use descriptive alt text and do not place a text panel or CTA on it.
- Do not place generated or rasterized text in image assets.

### Delivery picker

- Show `08:00–11:00` for the morning window and `14:00–17:00` for afternoon.
- Each entire card is a button with a 44px-or-larger actionable area.
- Switching the selection must update the visible selected state without losing keyboard focus.

### Product cards

- Each product card must use its own image file, never a CSS sprite or a shared background image with different positions.
- Show badge, name, stock label, price, and an accessible `+` action. The four initial products are: ไส้กรอกอีสานย่าง (เหลือ 25 ไม้), ลูกชิ้นเนื้อเอ็น (เหลือ 16 ไม้), น้ำเก๊กฮวยเย็น (เหลือ 5 แก้ว/ใกล้หมด), and ลูกชิ้นปลาระเบิด (สินค้าหมด/หมดแล้ว).
- Low-stock labels/badges use red. Sold-out cards are visibly desaturated and muted, and their add control is disabled with a clear unavailable icon.
- Names should stay within two lines; reserve space so price rows align.
- Product image crop should not obscure the food. Available cards lift subtly on hover; pressed controls scale briefly rather than flashing.
- On mobile show two columns; do not reduce text below a comfortably readable size merely to preserve four columns.

### Cart

- Aggregate repeated additions into product quantity rather than adding duplicate visual rows.
- The total must be computed from product price × quantity.
- The floating bar stays above mobile browser chrome and has a clear disabled empty state.

## Type, spacing, motion, accessibility

- Use loopless `Kanit` for headings and looped `Sarabun` for all supporting/detail text. The customer storefront uses only four accessible type-size tokens: 16px, 18px, 20px, and a responsive 32–48px display size.
- Build with an 8px spacing rhythm; use generous whitespace rather than extra card borders.
- Motion is subtle: 120–160ms for buttons/cards. Respect `prefers-reduced-motion` when adding nonessential animation.
- Normal text needs 4.5:1 contrast. Every image has useful alt text. Every icon-only action has an `aria-label`.
- Test at 320px, 768px, and desktop widths. Do not cause horizontal page scrolling.

## Assets

- Brand source: `docs/logo.png`; the footer uses the white transparent variant `frontend/public/images/logo-white.png`.
- Composition reference: `docs/Generated image 1.png`
- Runtime assets belong in `frontend/public/images/` and must use filenames that describe their purpose. The customer hero uses `hero-truck-clean-grille.png`, with a centred three-quarter truck angle, a sloped canopy that covers above the cab, clean rectangular grille/headlights with no badge or round marks, and no license plate; its second slide is `hero-fried-snacks-drinks.png`, showing fried meatballs, fried sausage, iced cocoa, and brewed coffee with no vehicle or embedded text.
