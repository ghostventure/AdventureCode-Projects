import Image from "next/image";
import Link from "next/link";

export default function BasicLanding() {
  return (
    <section className="marketplace-landing" aria-label="Home service marketplace preview">
      <div className="marketplace-image-slot" aria-hidden="true">
        <Image
          src="/images/home-services/kitchen-cabinet-repair.webp"
          alt=""
          width={1672}
          height={941}
          priority
          sizes="(min-width: 821px) 44vw, 100vw"
        />
      </div>

      <div className="marketplace-consumer-panel">
        <p className="eyebrow">Home service finder</p>
        <h1>Book trusted help for repairs, installs, and home projects.</h1>
        <p>
          Join to compare local pros, save project details, upload photos, and
          keep estimates, scheduling, messages, and service history in one
          homeowner portal.
        </p>

        <form className="marketplace-search-form">
          <label>
            <span>Service</span>
            <input placeholder="What service do you need?" />
          </label>
          <label>
            <span>Location</span>
            <input placeholder="Zip Code" />
          </label>
          <Link className="marketplace-submit" href="/auth#signup">Get Started</Link>
        </form>

        <div className="marketplace-chip-row" aria-label="Popular service categories">
          <strong>Hire a pro:</strong>
          <Link href="/client">Handyman</Link>
          <Link href="/client">Repairs</Link>
          <Link href="/client">Installations</Link>
          <Link href="/platform">See More</Link>
        </div>
      </div>

      <aside className="marketplace-pro-panel" aria-label="Professional signup preview">
        <div className="marketplace-pro-lockup">
          <span aria-hidden="true">h</span>
          <strong>Home Services Pro</strong>
        </div>
        <h2>Turn visitors into booked service requests.</h2>
        <p>
          Give homeowners a reason to sign up: saved projects, faster quotes,
          photo-backed requests, appointment holds, and a clean message thread
          for every job.
        </p>
        <Link className="marketplace-learn-link" href="/platform">See the Portal</Link>
        <label>
          <span>Email</span>
          <input placeholder="Email" />
        </label>
        <Link className="marketplace-pro-submit" href="/auth#signup">Start Free</Link>
        <small>
          Template mode keeps billing and provider APIs off until a home-service
          client chooses the final setup.
        </small>
      </aside>
    </section>
  );
}
