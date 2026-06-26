export function createPageMetadata({ title, description, path = "/", image } = {}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sample-demo-website-2026.web.app";
  const url = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      type: "website"
    }
  };
}

export function createLocalBusinessSchema({ name, url, telephone, address = {} } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
    telephone,
    address: {
      "@type": "PostalAddress",
      ...address
    }
  };
}

export function createFaqSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
