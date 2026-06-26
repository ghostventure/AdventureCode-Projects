# Home Pro Split Search UI Template

Marketplace-style GUI skin for home-service, remodeling, design, consulting,
and field-service clients. The layout is inspired by the supplied home design
reference: white navigation, strong service search, split hero, and a darker
professional signup panel.

This is not branded to the reference site and does not reuse its copy, logo, or
imagery.

## Core Layout

- White top navigation with logo, category menus, utility links, and account CTA
- Center search bar in the header
- Wide hero split into a customer-finder side and a professional/signup side
- Left hero side includes headline, support copy, service input, location input,
  primary CTA, and service chips
- Right hero side uses a dark panel for pro/customer acquisition
- Neutral interior image area sits behind the split hero as a replaceable client
  asset slot

## Best Fits

- Home services
- Interior design
- Remodeling
- Contractor networks
- Consulting marketplaces
- Appointment-driven service businesses

## Swap Rules

- Replace `brand.displayName`, logo mark, and nav labels in `theme.json`.
- Replace the image slot with a client-approved image.
- Keep provider controls visual-only until the client selects integrations.
- Keep the service finder and pro signup paths visually separate.
- Keep the header and form density compact for marketplace usability.

## Files

- `preview.html`: static GUI preview.
- `style.css`: skin styles and layout rules.
- `theme.json`: reusable brand, route, and token metadata.
- `implementation-notes.md`: guidance for applying this skin to the app.

