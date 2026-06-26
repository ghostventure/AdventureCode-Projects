export const activeGuiTemplate = Object.freeze({
  id: "home-pro-split-search",
  name: "Home Pro Split Search",
  status: "active",
  sourceFolder: "templates/ui-gui/home-pro-split-search",
  mode: "plug-and-play-gui-layer",
  appliedTo: ["app/components/BasicLanding.jsx", "app/globals.css"],
  providerStatus: "provider-free-template"
});

export const guiTemplateRegistry = Object.freeze([
  {
    id: "default-portal",
    name: "Default Portal",
    status: "available",
    sourceFolder: "templates/ui-gui/default-portal",
    bestFor: ["generic client portal", "operations dashboard"]
  },
  activeGuiTemplate,
  {
    id: "luxe-remodel-marketplace",
    name: "Luxe Remodel Marketplace",
    status: "available",
    sourceFolder: "templates/ui-gui/luxe-remodel-marketplace",
    bestFor: ["premium remodeling", "interior design", "kitchen and bath", "architecture consultants"]
  },
  {
    id: "pro-network-blueprint",
    name: "Pro Network Blueprint",
    status: "available",
    sourceFolder: "templates/ui-gui/pro-network-blueprint",
    bestFor: ["contractor networks", "field service", "property maintenance", "repair and installation"]
  }
]);

export function getActiveGuiTemplate() {
  return activeGuiTemplate;
}
