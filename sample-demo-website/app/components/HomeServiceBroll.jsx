import Image from "next/image";
import { homeServiceBrollImages } from "../../lib/home-service-broll";

export function HomeServiceBrollShowcase() {
  return (
    <section className="broll-showcase" aria-label="Home services b-roll imagery">
      <div className="broll-showcase-heading">
        <p className="eyebrow">Home services b-roll</p>
        <h2>Real service moments for the demo surface.</h2>
        <p>These local images keep the placeholder site grounded in repairs, installs, maintenance, and service calls.</p>
      </div>
      <div className="broll-grid">
        {homeServiceBrollImages.map((image) => (
          <article className="broll-card" key={image.src}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 821px) 33vw, 100vw" />
            <div>
              <strong>{image.label}</strong>
              <span>{image.detail}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GlobalBrollStrip() {
  return (
    <section className="global-broll-strip" aria-label="Home services visual examples">
      <div className="global-broll-copy">
        <p className="component-label">Home services imagery</p>
        <strong>Local b-roll assets are installed throughout the template.</strong>
      </div>
      <div className="global-broll-images">
        {homeServiceBrollImages.map((image) => (
          <figure key={image.src}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 821px) 14vw, 50vw" />
            <figcaption>{image.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
