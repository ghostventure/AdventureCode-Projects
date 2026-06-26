export const contentCollections = Object.freeze({
  pages: "pages",
  media: "media",
  faqs: "faqs",
  navigation: "navigation",
  announcements: "announcements"
});

export const sampleContentBlocks = [
  { id: "hero", type: "hero", label: "Homepage hero", status: "draft" },
  { id: "services", type: "section", label: "Services overview", status: "draft" },
  { id: "faq", type: "faq", label: "FAQ set", status: "draft" }
];

export function createContentRevision({ collection, slug, data, authorId = "system" }) {
  return {
    collection,
    slug,
    data,
    authorId,
    status: "draft",
    createdAt: new Date().toISOString()
  };
}
