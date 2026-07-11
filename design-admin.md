# Admin design

## Status

This is the baseline specification for the future `/admin` implementation. There is no approved admin visual reference yet; do not infer a customer-storefront layout for operational screens.

## Direction

The admin should be calm, compact, and operationally focused. It supports stock, order, delivery-window, and payment workflows—not brand storytelling.

## Tokens

Use the shared brand tokens from `design-user.md`:

- `primary #2E7D32` for navigation, active state, and success.
- `secondary #E3F2FD` for informational/low-priority surfaces.
- `tertiary #FFF3E0` for pending/attention surfaces.
- `neutral #455A64` for supporting text and data labels.

Use white content surfaces on a very pale neutral background. Reserve red for destructive/error status and do not map operational status through colour alone.

## Planned structure

- Desktop: persistent left sidebar, page title, then concise KPI cards followed by filters and data tables.
- Mobile: compact navigation control, stacked filters, and horizontally scrollable data tables with clear row actions.
- Data views must make order status, payment status, stock count, and delivery window legible at a glance.
- Use tables for operational records; avoid decorative charts unless they answer a concrete operational question.

## Interaction and accessibility

- Filter controls, buttons, and status chips must have text labels.
- Confirm destructive operations; expose loading, empty, and error states.
- Keep touch targets at least 44px where possible and maintain visible keyboard focus.
- Use tabular figures for prices, quantities, and totals when the chosen typeface supports them.

## Before implementation

Obtain or create an approved admin screen reference and expand this document with: route-by-route requirements, table columns, status vocabulary, user roles, and empty/loading/error states.
