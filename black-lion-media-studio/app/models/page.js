import Link from "next/link";
import { ModelApplicationForm } from "../../components/model-application-form";
import {
  DetailPairGrid,
  ShortcutRail,
  SupportNotice
} from "../../components/shared-ui";
import { modelFaqPreviewItems } from "../../lib/model-faq";

export const metadata = {
  title: "Model Sign-up",
  description: "Apply to be considered for Black Lion Studios modeling projects, brand shoots, editorial work, video productions, and casting opportunities.",
  alternates: { canonical: "/models" }
};

const premiumSignals = [
  { label: "Eligibility", value: "18+", note: "Adult-only applicant review" },
  { label: "Work type", value: "1099", note: "Project-based contractor opportunities" },
  { label: "Review pace", value: "Fast", note: "Speed, prep, and communication matter" },
  { label: "Profile lane", value: "Separate", note: "Model profiles are not client profiles" }
];

const modelFitLanes = [
  {
    title: "Camera presence",
    copy: "Portfolio, presentation, comfort with direction, and how well your look fits a project brief.",
    tags: ["Portrait", "Editorial", "Lifestyle"]
  },
  {
    title: "Production readiness",
    copy: "Availability, travel range, prep habits, call-time reliability, and ability to move quickly on set.",
    tags: ["Speed", "Reliability", "Travel"]
  },
  {
    title: "Usage comfort",
    copy: "Comfort with commercial usage, social cuts, product/merch work, release terms, and wardrobe expectations.",
    tags: ["Usage", "Wardrobe", "Release"]
  },
  {
    title: "Brand alignment",
    copy: "Interest in fashion, streetwear, beauty, music video, product, event promo, or campaign-style work.",
    tags: ["Fashion", "Campaign", "Video"]
  }
];

const modelReadinessItems = [
  { label: "Portfolio", value: "Current samples", note: "Use Instagram, website, or public work links that represent you now." },
  { label: "Contact", value: "Reachable details", note: "Use information you can keep current in the model profile." },
  { label: "Boundaries", value: "Usage and wardrobe", note: "State comfort levels before a project is considered." },
  { label: "Compensation", value: "Expectation range", note: "Share starting expectations so scope can be reviewed cleanly." }
];

const reviewStandards = [
  "Clear adult eligibility and contact information.",
  "Reliable scheduling for fast production windows.",
  "Portfolio or social links that represent current presentation.",
  "Specific modeling interests, comfort boundaries, and usage expectations.",
  "Reliable communication, preparation habits, and no-show awareness."
];

export default function ModelsPage() {
  return (
    <div className="page-shell">
      <main className="stack">
        <section className="panel legal-hero models-hero">
          <p className="label">Model Sign-up</p>
          <h1>Apply for Black Lion Studios modeling opportunities.</h1>
          <p>
            Submit your contact details, portfolio, availability, and project interests to be
            considered for contracted shoots, campaigns, videos, editorial work, and casting pools.
          </p>
          <div className="legal-action-row">
            <a href="#model-application" className="button">Start application</a>
            <Link href="/portfolio" className="button button-secondary">View studio work</Link>
          </div>
        </section>

        <section className="model-premium-suite" aria-label="Model application overview">
          <div className="model-premium-head panel">
            <div>
              <p className="label">Premium review lane</p>
              <h2 className="editorial-heading">Built for models who can move with production.</h2>
              <p className="muted">
                BLS screens for fit, speed, quality, reliability, and project comfort before contacting
                applicants for contracted shoots or campaign work.
              </p>
            </div>
            <div className="model-signal-grid">
              {premiumSignals.map((item) => (
                <div className="model-signal-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="model-fit-grid">
            {modelFitLanes.map((lane) => (
              <article className="panel model-fit-card" key={lane.title}>
                <strong>{lane.title}</strong>
                <p>{lane.copy}</p>
                <div className="model-pill-row">
                  {lane.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="two-column quote-layout">
          <div className="panel" id="model-application">
            <p className="label">Application</p>
            <h2 className="editorial-heading">Send your model profile.</h2>
            <p className="muted">
              Confirm the application matches how you want to be considered. The details you enter
              feed the separate model profile used for manager review.
            </p>
            <ModelApplicationForm />
          </div>

          <div className="stack-small">
            <section className="panel model-readiness-panel">
              <p className="label">Before you apply</p>
              <h2 className="editorial-heading">Make the profile easy to review.</h2>
              <DetailPairGrid items={modelReadinessItems} />
            </section>
            <section className="panel model-review-panel">
              <p className="label">Review standards</p>
              <h2 className="editorial-heading">What managers look for.</h2>
              <ul>
                {reviewStandards.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <SupportNotice
              title="Important terms"
              copy="Submission creates or updates a separate model profile. It does not create a booking, employment relationship, agency representation, exclusivity, or guaranteed paid work. Opportunities are project-based 1099 contractor opportunities, not full-time W-2 employment. Reapplication is limited to once every 3 months, and missed confirmed calls or bookings may lower future priority."
            />
            <section className="panel">
              <p className="label">Related paths</p>
              <ShortcutRail
                items={[
                  { href: "/photography", label: "Photo", value: "Production work", note: "Portraits, events, and campaigns" },
                  { href: "/videography", label: "Video", value: "Shoot support", note: "Music videos, promos, and content" },
                  { href: "/contact", label: "Contact", value: "Ask first", note: "Use for routing questions" }
                ]}
                className="ui-shortcut-tight"
              />
            </section>
          </div>
        </section>
        <section className="panel">
          <p className="label">Model FAQ</p>
          <h2 className="editorial-heading">Quick questions before signing up.</h2>
          <div className="model-faq-grid">
            {modelFaqPreviewItems.map((item) => (
              <details className="model-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className="section-action-row">
            <Link href="/models/faq" className="button button-secondary">Full Model FAQ</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
