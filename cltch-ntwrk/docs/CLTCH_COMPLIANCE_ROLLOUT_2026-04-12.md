# CLTCH Compliance Rollout — April 12, 2026

## FAQ
- Legal & Compliance panel now clarifies the platform’s alignment with ADA Title III/Section 508, COPPA, CCPA/CPRA, Colorado CPA, Virginia VCDPA, Connecticut CPA, FTC guidance, and DMCA requirements.
- Added a privacy-rights question that explains how to request access, correction, deletion, or portability under multiple state privacy laws and the 45-day response timeline.
- Updated the DMCA question to point to the refreshed DMCA page and to spell out the 17 U.S.C. § 512 notice/counter timeline plus repeat infringer handling.
- Account & Privacy section now explicitly describes how to request data access/deletion, the 45-day target, and the non-discrimination commitment when residents exercise their rights.

## Terms of Service
- Expanded the compliance section to call out the specific federal and state laws (ADA, COPPA, CCPA/CPRA, Colorado CPA, Virginia VCDPA, Connecticut CPA, FTC, DMCA) that shape the platform controls.
- Added explicit language that local city, county, borough, or parish ordinances are respected when they impose additional obligations in the markets we serve.
- Documented child-specific protections referencing COPPA, FLSA child labor rules, and parental consent tracking across the Terms and Privacy sections so the platform keeps minors and child labor handling lawful.
- Added structural improvements: a reusable legal layout script, compliance snapshot cards, an accessibility banner, a policy-versioned FAQ accordion, a local-law metadata layer, and a policy log process with `scripts/policy-log.mjs` plus `docs/policy-revisions.md`.
- Introduced host and performer enhancements: availability calendar sync UI, assurance-pack checklist, command-center compliance notifications, local-law alerts, document vault, dual feedback forms, and intent-based matching filters seeded by the new metadata layer.
- Unified the color palette, spacing, and page wrapping by centralizing a `page-shell` container, shared panel styles, and consistent typography/background variables so every page (host, performer, gig radar, booking, legal sections) now renders with the same windowed layout across Windows browsers.
- Refreshed the Help Center (FAQ) with a hero panel, compliance snapshot cards, and a compact grid of callouts plus new colors so the desktop experience feels curated rather than sprawling.
- Replaced the FAQ accordion questions with a curated “new user” set (getting started steps, pricing, legal obligations, child policies, and how hosts/performers get matched or report issues) so the Help Center immediately answers the basic repeated questions you mentioned.
- Added dedicated sections for Accessibility & Non-Discrimination (with accommodation requests), Privacy Rights & Data Governance (with rights-request timelines and non-discrimination), and Copyright & DMCA Compliance (with § 512 notice/counter rules, false-notice exposure, and repeat-infringer policy).
- Contact section now references the legal team with address, phone, and `legal@cltch.ntwrk` for formal notices.

## Privacy Policy
- Mentioned that the policy aligns with CCPA/CPRA, Colorado CPA, Virginia VCDPA, Connecticut CPA, ADA guidance, and DMCA notice requirements.
- Expanded the service-provider section to describe sharing minimal data with hosting, communication, payment, and identity partners under GLBA-style safeguards.
- Your Choices section now details rights requests, marketing opt-outs, cookie controls, and our internal 10/45-day timeline.
- California privacy section now reflects CPRA, opt-out of sale/sharing, and the same timelines; added a new section covering Colorado, Connecticut, Virginia, Utah, and other state rights before the standard "Changes" and "Contact" sections.

## DMCA Policy
- Rebuilt the page around structured cards for statute-compliant notices, counter notices, repeat infringer policy, false-notice liability, and the designated agent’s contact details.
- Each card highlights the required elements, how quickly we respond (within five business days), and the procedures for restoring content after a counter notice (ten business days).
- Reiterated that we prefer email submissions (`copyright@cltch.ntwrk`) but accept mail, and that we terminate repeat infringers per 17 U.S.C. § 512(i)(1)(A).

## Testing
- `npm run build:mobile` — ✔️ Completed, generated `mobile-web` bundle after syncing the updated compliance documents.
