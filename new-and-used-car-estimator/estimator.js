const currentYear = Math.max(2026, new Date().getFullYear());
const earliestModelYear = currentYear - 24;
const antiqueCutoffYear = currentYear - 25;
const earliestAntiqueYear = 1900;
const latestModelYear = currentYear + 1;
const currentInflationRate = 0.042;
const softMarketRate = -0.025;
const marketModeReference = "May 2026: CPI-U 335.123 (+4.2% y/y); new vehicles -0.3% m/m; used +0.1% m/m; KBB ATP $49,220; Manheim +3.6% y/y";
const firstProductionAutomobileYear = 1886;
const currentCpiIndex = 335.123;
const historicalCpiAnchors = [
  [1886, 8.2],
  [1890, 9.1],
  [1900, 8.4],
  [1910, 9.5],
  [1913, 9.9],
  [1920, 20.0],
  [1930, 16.7],
  [1937, 14.4],
  [1940, 14.0],
  [1950, 24.1],
  [1960, 29.6],
  [1970, 38.8],
  [1980, 82.4],
  [1990, 130.7],
  [2000, 172.2],
  [2010, 218.1],
  [2020, 258.8],
  [2025, 322.6],
  [2026, currentCpiIndex]
];
const estimatorStorageKey = "vehicleEstimator.lastSafeState";
const comparisonStorageKey = "vehicleEstimator.savedComparisons";
const visitorCounterStorageKey = "vehicleEstimator.visitorCounted.v1";
const visitorCounterUrl = "https://new-and-used-car-estimator-default-rtdb.firebaseio.com/siteStats/visits.json";
const suvSegments = new Set(["compact-suv", "midsize-suv"]);
const nonCrossoverPattern = /\b(4runner|astro|bronco|cargo van|caravan|defender|econoline|e-series|express|fj cruiser|g-class|grand caravan|grand wagoneer|h1|h2|h3|jimmy|land cruiser|lx|metris|mpv|nv|odyssey|patriot|patrol|quest|range rover|savana|sequoia|sienna|sprinter|suburban|tahoe|town and country|transit|wagoneer|wrangler|xterra|yukon|armada|expedition|excursion|ramcharger|series i|series ii|series iii|cj|k5|blazer k5)\b/i;
const nonCrossoverModels = new Set(["5", "borrego", "carnival", "entourage", "matrix", "rondo", "sedona"]);
const operationState = {
  events: [],
  lastSnapshot: "Not saved",
  lastRecovery: "Not needed",
  lastRender: "Pending",
  copy: "Ready",
  failsafe: "Standby",
  tamper: "Clean"
};
const defaultEstimateState = {
  categorySelect: "all",
  makeSelect: "Toyota",
  modelProfileId: "toyota-rav4-xle",
  vehicleType: "used",
  modelYear: "2022",
  mileage: "42000",
  condition: "2",
  trim: "1",
  region: "1",
  sellerType: "2",
  history: "3",
  ownerCount: "1",
  fleetUse: false,
  demand: "1",
  askingPrice: "",
  fuelType: "gas",
  drivetrain: "standard",
  powertrain: "base",
  transmission: "automatic",
  optionPackage: "standard",
  colorDemand: "neutral",
  warrantyStatus: "none",
  serviceRecords: "complete",
  wearItems: "good",
  recallStatus: "none",
  titleBrand: "clean",
  rustLevel: "none",
  repairQuality: "none",
  accessoryCompleteness: "complete",
  rentalUse: "no",
  dealerAddons: "none",
  incentiveLevel: "none",
  daysMarket: "normal",
  inventorySupply: "balanced",
  seasonality: "neutral",
  shippingDistance: "local",
  commercialIntensity: "normal",
  evBatteryHealth: "notApplicable",
  taxCredit: "none",
  importStatus: "domestic",
  modificationLevel: "stock",
  aftermarketQuality: "none",
  rarity: "common",
  matchingNumbers: "notApplicable",
  marketMode: "1"
};

const segments = {
  "compact-sedan": {
    label: "Compact sedan",
    usedBase: 16900,
    newBase: 24800,
    annualMileage: 12000,
    note: "Commuter-friendly and usually price-sensitive.",
    example: "Honda Civic EX"
  },
  "midsize-sedan": {
    label: "Midsize sedan",
    usedBase: 20100,
    newBase: 31200,
    annualMileage: 12000,
    note: "Family sedan baseline with moderate depreciation.",
    example: "Toyota Camry LE"
  },
  "compact-suv": {
    label: "Compact SUV",
    usedBase: 24100,
    newBase: 34500,
    annualMileage: 12000,
    note: "High shopper demand and broad inventory.",
    example: "Toyota RAV4 XLE"
  },
  "midsize-suv": {
    label: "Midsize SUV",
    usedBase: 29800,
    newBase: 43100,
    annualMileage: 13000,
    note: "Three-row and family utility can lift the benchmark.",
    example: "Honda Pilot EX-L"
  },
  "pickup": {
    label: "Pickup truck",
    usedBase: 32900,
    newBase: 48900,
    annualMileage: 14000,
    note: "Capability, cab, bed, and drivetrain heavily affect value.",
    example: "Ford F-150 XLT"
  },
  "cargo-van": {
    label: "Commercial / box truck",
    usedBase: 35800,
    newBase: 62800,
    annualMileage: 18000,
    note: "Commercial upfit, box length, liftgate, wheelbase, duty cycle, and fleet use carry extra weight.",
    example: "Ford E-Series Cutaway Box Truck"
  },
  "hybrid": {
    label: "Hybrid",
    usedBase: 26600,
    newBase: 36500,
    annualMileage: 12000,
    note: "Fuel economy demand can support stronger pricing.",
    example: "Toyota Prius XLE"
  },
  "ev": {
    label: "Electric vehicle",
    usedBase: 28600,
    newBase: 43800,
    annualMileage: 11000,
    note: "Battery condition, charging access, and incentives matter.",
    example: "Tesla Model Y Long Range"
  },
  "luxury": {
    label: "Luxury vehicle",
    usedBase: 38200,
    newBase: 61200,
    annualMileage: 11000,
    note: "Options and warranty status can move the number quickly.",
    example: "BMW 330i"
  },
  "motorcycle-cruiser": {
    label: "Motorcycle - cruiser",
    usedBase: 11200,
    newBase: 18900,
    annualMileage: 4200,
    note: "Brand, engine size, accessories, and seasonal demand matter.",
    example: "Harley-Davidson Street Bob"
  },
  "motorcycle-sport": {
    label: "Motorcycle - sport",
    usedBase: 9800,
    newBase: 16400,
    annualMileage: 3600,
    note: "Condition, modifications, track use, and tire/brake wear can move price quickly.",
    example: "Yamaha YZF-R7"
  },
  "motorcycle-touring": {
    label: "Motorcycle - touring",
    usedBase: 16200,
    newBase: 28600,
    annualMileage: 5200,
    note: "Touring equipment, luggage, electronics, and service records carry extra value.",
    example: "Honda Gold Wing"
  },
  "motorcycle-adventure": {
    label: "Motorcycle - adventure",
    usedBase: 12400,
    newBase: 19700,
    annualMileage: 4800,
    note: "Adventure bikes depend on luggage, crash protection, off-road wear, and service records.",
    example: "BMW R 1300 GS"
  },
  "motorcycle-dual-sport": {
    label: "Motorcycle - dual sport",
    usedBase: 5700,
    newBase: 8900,
    annualMileage: 2600,
    note: "Street legality, trail wear, tires, suspension, and title status heavily affect value.",
    example: "Honda XR650L"
  },
  "motorcycle-scooter": {
    label: "Motorcycle - scooter / mini",
    usedBase: 3200,
    newBase: 5200,
    annualMileage: 2200,
    note: "Small-displacement pricing is sensitive to miles, storage condition, and local demand.",
    example: "Honda Grom"
  },
  "motorcycle-electric": {
    label: "Motorcycle - electric",
    usedBase: 9700,
    newBase: 17400,
    annualMileage: 3000,
    note: "Battery health, range, charging gear, and incentives matter.",
    example: "Zero SR/F"
  },
  "motorcycle-offroad": {
    label: "Motorcycle - off-road",
    usedBase: 5400,
    newBase: 9100,
    annualMileage: 1800,
    note: "Hours, race use, rebuild records, suspension, and title limitations drive value.",
    example: "Yamaha YZ450F"
  }
};

const curatedVehicleProfiles = [
  { id: "acura-mdx-technology", make: "Acura", model: "MDX", trimName: "Technology", segment: "luxury", usedBase: 38200, newBase: 54800 },
  { id: "audi-q5-premium-plus", make: "Audi", model: "Q5", trimName: "Premium Plus", segment: "luxury", usedBase: 33700, newBase: 51200 },
  { id: "bmw-330i", make: "BMW", model: "3 Series", trimName: "330i", segment: "luxury", usedBase: 18800, newBase: 61200 },
  { id: "bmw-x5-xdrive40i", make: "BMW", model: "X5", trimName: "xDrive40i", segment: "luxury", usedBase: 47200, newBase: 71500 },
  { id: "buick-envision-essence", make: "Buick", model: "Envision", trimName: "Essence", segment: "compact-suv", usedBase: 24700, newBase: 38400 },
  { id: "cadillac-xt5-premium-luxury", make: "Cadillac", model: "XT5", trimName: "Premium Luxury", segment: "luxury", usedBase: 32900, newBase: 52300 },
  { id: "chevrolet-equinox-lt", make: "Chevrolet", model: "Equinox", trimName: "LT", segment: "compact-suv", usedBase: 18900, newBase: 31200 },
  { id: "chevrolet-malibu-lt", make: "Chevrolet", model: "Malibu", trimName: "LT", segment: "midsize-sedan", usedBase: 17600, newBase: 29800 },
  { id: "chevrolet-silverado-lt", make: "Chevrolet", model: "Silverado 1500", trimName: "LT", segment: "pickup", usedBase: 33700, newBase: 48900 },
  { id: "chrysler-pacifica-touring-l", make: "Chrysler", model: "Pacifica", trimName: "Touring L", segment: "midsize-suv", usedBase: 28600, newBase: 45200 },
  { id: "dodge-durango-gt", make: "Dodge", model: "Durango", trimName: "GT", segment: "midsize-suv", usedBase: 30100, newBase: 44100 },
  { id: "ford-bronco-big-bend", make: "Ford", model: "Bronco", trimName: "Big Bend", segment: "midsize-suv", usedBase: 37200, newBase: 46200 },
  { id: "ford-escape-se", make: "Ford", model: "Escape", trimName: "SE", segment: "compact-suv", usedBase: 19700, newBase: 31600 },
  { id: "ford-f150-xlt", make: "Ford", model: "F-150", trimName: "XLT", segment: "pickup", usedBase: 34900, newBase: 51500 },
  { id: "ford-mustang-ecoboost", make: "Ford", model: "Mustang", trimName: "EcoBoost", segment: "compact-sedan", usedBase: 27100, newBase: 33200 },
  { id: "toyota-gr86-premium", make: "Toyota", model: "GR86", trimName: "Premium", segment: "compact-sedan", usedBase: 28700, newBase: 33900 },
  { id: "toyota-gr-supra-30", make: "Toyota", model: "GR Supra", trimName: "3.0", segment: "luxury", usedBase: 48900, newBase: 58200 },
  { id: "honda-civic-si", make: "Honda", model: "Civic", trimName: "Si", segment: "compact-sedan", usedBase: 27200, newBase: 31800 },
  { id: "honda-civic-type-r", make: "Honda", model: "Civic", trimName: "Type R", segment: "compact-sedan", usedBase: 42100, newBase: 46900 },
  { id: "mazda-mx5-miata-club", make: "Mazda", model: "MX-5 Miata", trimName: "Club", segment: "compact-sedan", usedBase: 26900, newBase: 34700 },
  { id: "nissan-z-performance", make: "Nissan", model: "Z", trimName: "Performance", segment: "compact-sedan", usedBase: 43100, newBase: 54100 },
  { id: "subaru-wrx-premium", make: "Subaru", model: "WRX", trimName: "Premium", segment: "compact-sedan", usedBase: 28600, newBase: 36100 },
  { id: "volkswagen-golf-gti-se", make: "Volkswagen", model: "Golf GTI", trimName: "SE", segment: "compact-sedan", usedBase: 28100, newBase: 38900 },
  { id: "dodge-charger-rt", make: "Dodge", model: "Charger", trimName: "R/T", segment: "midsize-sedan", usedBase: 31900, newBase: 45900 },
  { id: "dodge-challenger-rt", make: "Dodge", model: "Challenger", trimName: "R/T", segment: "compact-sedan", usedBase: 30500, newBase: 43900 },
  { id: "chevrolet-camaro-lt1", make: "Chevrolet", model: "Camaro", trimName: "LT1", segment: "compact-sedan", usedBase: 34400, newBase: 42100 },
  { id: "chevrolet-corvette-stingray", make: "Chevrolet", model: "Corvette", trimName: "Stingray", segment: "luxury", usedBase: 68900, newBase: 78400 },
  { id: "ford-bronco-raptor", make: "Ford", model: "Bronco", trimName: "Raptor", segment: "midsize-suv", usedBase: 78500, newBase: 92200 },
  { id: "ford-f150-raptor", make: "Ford", model: "F-150", trimName: "Raptor", segment: "pickup", usedBase: 74100, newBase: 88200 },
  { id: "jeep-wrangler-rubicon", make: "Jeep", model: "Wrangler", trimName: "Rubicon", segment: "midsize-suv", usedBase: 42100, newBase: 54100 },
  { id: "genesis-gv70-25t", make: "Genesis", model: "GV70", trimName: "2.5T", segment: "luxury", usedBase: 38900, newBase: 51200 },
  { id: "gmc-sierra-sle", make: "GMC", model: "Sierra 1500", trimName: "SLE", segment: "pickup", usedBase: 36200, newBase: 52800 },
  { id: "honda-accord-ex", make: "Honda", model: "Accord", trimName: "EX", segment: "midsize-sedan", usedBase: 25700, newBase: 32100 },
  { id: "honda-civic-ex", make: "Honda", model: "Civic", trimName: "EX", segment: "compact-sedan", usedBase: 22400, newBase: 28900 },
  { id: "honda-crv-ex", make: "Honda", model: "CR-V", trimName: "EX", segment: "compact-suv", usedBase: 28700, newBase: 35600 },
  { id: "honda-pilot-exl", make: "Honda", model: "Pilot", trimName: "EX-L", segment: "midsize-suv", usedBase: 34100, newBase: 43100 },
  { id: "hyundai-elantra-sel", make: "Hyundai", model: "Elantra", trimName: "SEL", segment: "compact-sedan", usedBase: 17800, newBase: 24700 },
  { id: "hyundai-santa-fe-sel", make: "Hyundai", model: "Santa Fe", trimName: "SEL", segment: "midsize-suv", usedBase: 29200, newBase: 37100 },
  { id: "hyundai-tucson-sel", make: "Hyundai", model: "Tucson", trimName: "SEL", segment: "compact-suv", usedBase: 22800, newBase: 31800 },
  { id: "jeep-wrangler-unlimited-sport", make: "Jeep", model: "Wrangler Unlimited", trimName: "Sport", segment: "midsize-suv", usedBase: 28400, newBase: 41200 },
  { id: "kia-k5-gt-line", make: "Kia", model: "K5", trimName: "GT-Line", segment: "midsize-sedan", usedBase: 22900, newBase: 30400 },
  { id: "kia-sorento-ex", make: "Kia", model: "Sorento", trimName: "EX", segment: "midsize-suv", usedBase: 28600, newBase: 38300 },
  { id: "kia-sportage-ex", make: "Kia", model: "Sportage", trimName: "EX", segment: "compact-suv", usedBase: 23900, newBase: 32900 },
  { id: "lexus-es350", make: "Lexus", model: "ES", trimName: "350", segment: "luxury", usedBase: 33400, newBase: 49100 },
  { id: "lexus-rx350-premium", make: "Lexus", model: "RX", trimName: "350 Premium", segment: "luxury", usedBase: 43800, newBase: 58900 },
  { id: "lincoln-nautilus-reserve", make: "Lincoln", model: "Nautilus", trimName: "Reserve", segment: "luxury", usedBase: 35400, newBase: 56900 },
  { id: "mazda-cx5-preferred", make: "Mazda", model: "CX-5", trimName: "Preferred", segment: "compact-suv", usedBase: 23700, newBase: 32800 },
  { id: "mazda3-select", make: "Mazda", model: "Mazda3", trimName: "Select", segment: "compact-sedan", usedBase: 18900, newBase: 26300 },
  { id: "mercedes-c300", make: "Mercedes-Benz", model: "C-Class", trimName: "C 300", segment: "luxury", usedBase: 33800, newBase: 51400 },
  { id: "mercedes-glc300", make: "Mercedes-Benz", model: "GLC", trimName: "300", segment: "luxury", usedBase: 39700, newBase: 55600 },
  { id: "nissan-altima-sv", make: "Nissan", model: "Altima", trimName: "SV", segment: "midsize-sedan", usedBase: 19100, newBase: 30200 },
  { id: "nissan-rogue-sv", make: "Nissan", model: "Rogue", trimName: "SV", segment: "compact-suv", usedBase: 14900, newBase: 32100 },
  { id: "ram-1500-big-horn", make: "Ram", model: "1500", trimName: "Big Horn", segment: "pickup", usedBase: 34800, newBase: 50600 },
  { id: "chevrolet-express-cargo-2500-work-van", make: "Chevrolet", model: "Express Cargo Van", trimName: "2500 Work Van", segment: "cargo-van", usedBase: 29800, newBase: 45200 },
  { id: "ford-transit-cargo-van-250-medium-roof", make: "Ford", model: "Transit Cargo Van", trimName: "250 Medium Roof", segment: "cargo-van", usedBase: 34100, newBase: 51700 },
  { id: "ford-e-transit-cargo-van-medium-roof", make: "Ford", model: "E-Transit Cargo Van", trimName: "Medium Roof", segment: "ev", usedBase: 37200, newBase: 54400 },
  { id: "gmc-savana-cargo-2500-work-van", make: "GMC", model: "Savana Cargo Van", trimName: "2500 Work Van", segment: "cargo-van", usedBase: 30900, newBase: 46600 },
  { id: "mercedes-benz-sprinter-cargo-van-2500", make: "Mercedes-Benz", model: "Sprinter Cargo Van", trimName: "2500 Standard Roof", segment: "cargo-van", usedBase: 42100, newBase: 57900 },
  { id: "mercedes-benz-esprinter-cargo-van-standard-roof", make: "Mercedes-Benz", model: "eSprinter Cargo Van", trimName: "Standard Roof", segment: "ev", usedBase: 51900, newBase: 74200 },
  { id: "ram-promaster-cargo-van-2500-high-roof", make: "Ram", model: "ProMaster Cargo Van", trimName: "2500 High Roof", segment: "cargo-van", usedBase: 33200, newBase: 48900 },
  { id: "ram-promaster-ev-cargo-van-delivery", make: "Ram", model: "ProMaster EV Cargo Van", trimName: "Delivery", segment: "ev", usedBase: 44900, newBase: 70600 },
  { id: "chevrolet-low-cab-forward-4500-box-truck", make: "Chevrolet", model: "Low Cab Forward 4500 Box Truck", trimName: "16-20 ft body", segment: "cargo-van", usedBase: 51200, newBase: 68400 },
  { id: "chevrolet-silverado-5500hd-box-truck", make: "Chevrolet", model: "Silverado 5500HD Box Truck", trimName: "Medium duty", segment: "cargo-van", usedBase: 64900, newBase: 84200 },
  { id: "ford-e-series-cutaway-box-truck", make: "Ford", model: "E-Series Cutaway Box Truck", trimName: "E-350/E-450", segment: "cargo-van", usedBase: 38900, newBase: 59400 },
  { id: "ford-f650-box-truck", make: "Ford", model: "F-650 Box Truck", trimName: "Medium duty", segment: "cargo-van", usedBase: 68400, newBase: 91800 },
  { id: "freightliner-m2-106-box-truck", make: "Freightliner", model: "M2 106 Box Truck", trimName: "Class 6-8", segment: "cargo-van", usedBase: 78200, newBase: 118900 },
  { id: "gmc-savana-cutaway-box-truck", make: "GMC", model: "Savana Cutaway Box Truck", trimName: "3500/4500", segment: "cargo-van", usedBase: 37400, newBase: 56800 },
  { id: "hino-l6-box-truck", make: "Hino", model: "L6 Box Truck", trimName: "Medium duty", segment: "cargo-van", usedBase: 72100, newBase: 104800 },
  { id: "hino-l7-box-truck", make: "Hino", model: "L7 Box Truck", trimName: "Medium duty", segment: "cargo-van", usedBase: 79500, newBase: 116400 },
  { id: "international-cv-series-box-truck", make: "International", model: "CV Series Box Truck", trimName: "Class 4/5", segment: "cargo-van", usedBase: 57400, newBase: 79200 },
  { id: "international-mv-series-box-truck", make: "International", model: "MV Series Box Truck", trimName: "Class 6/7", segment: "cargo-van", usedBase: 76400, newBase: 111900 },
  { id: "isuzu-npr-hd-box-truck", make: "Isuzu", model: "NPR-HD Box Truck", trimName: "Gas/Diesel", segment: "cargo-van", usedBase: 46800, newBase: 64200 },
  { id: "isuzu-nqr-box-truck", make: "Isuzu", model: "NQR Box Truck", trimName: "Diesel", segment: "cargo-van", usedBase: 52900, newBase: 71800 },
  { id: "mitsubishi-fuso-canter-box-truck", make: "Mitsubishi Fuso", model: "Canter Box Truck", trimName: "Light duty", segment: "cargo-van", usedBase: 39800, newBase: 57800 },
  { id: "ram-promaster-cutaway-box-truck", make: "Ram", model: "ProMaster Cutaway Box Truck", trimName: "3500", segment: "cargo-van", usedBase: 35600, newBase: 54600 },
  { id: "bmw-r1250gs-adventure", make: "BMW Motorrad", model: "R 1250 GS Adventure", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 16900, newBase: 0, lastYear: 2024, categories: ["Motorcycle", "Lux", "Rugged"] },
  { id: "bmw-r1300gs", make: "BMW Motorrad", model: "R 1300 GS", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 20400, newBase: 22600, categories: ["Motorcycle", "Lux", "Rugged"] },
  { id: "bmw-r1300gs-adventure", make: "BMW Motorrad", model: "R 1300 GS Adventure", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 22400, newBase: 23900, categories: ["Motorcycle", "Lux", "Rugged"] },
  { id: "bmw-f900gs", make: "BMW Motorrad", model: "F 900 GS", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 12200, newBase: 13900, categories: ["Motorcycle", "Rugged"] },
  { id: "bmw-c400gt", make: "BMW Motorrad", model: "C 400 GT", trimName: "Scooter", segment: "motorcycle-scooter", usedBase: 6400, newBase: 8900, categories: ["Motorcycle", "Lux", "Niche"] },
  { id: "bmw-s1000rr", make: "BMW Motorrad", model: "S 1000 RR", trimName: "Sport", segment: "motorcycle-sport", usedBase: 17300, newBase: 19300, categories: ["Motorcycle", "Lux", "Sport"] },
  { id: "bmw-s1000xr", make: "BMW Motorrad", model: "S 1000 XR", trimName: "Sport touring", segment: "motorcycle-touring", usedBase: 16100, newBase: 18100, categories: ["Motorcycle", "Lux", "Sport", "Touring"] },
  { id: "can-am-ryker-900", make: "Can-Am", model: "Ryker", trimName: "900", segment: "motorcycle-cruiser", usedBase: 7200, newBase: 10400, categories: ["Motorcycle", "Niche"] },
  { id: "can-am-spyder-rt", make: "Can-Am", model: "Spyder RT", trimName: "Touring", segment: "motorcycle-touring", usedBase: 18300, newBase: 26700, categories: ["Motorcycle", "Touring", "Niche"] },
  { id: "ducati-monster-plus", make: "Ducati", model: "Monster", trimName: "Plus", segment: "motorcycle-sport", usedBase: 10400, newBase: 13200, categories: ["Motorcycle", "Sport", "Exotic"] },
  { id: "ducati-monster-v2", make: "Ducati", model: "Monster V2", trimName: "2026", segment: "motorcycle-sport", usedBase: 11900, newBase: 13900, categories: ["Motorcycle", "Sport", "Exotic"] },
  { id: "ducati-multistrada-v4-s", make: "Ducati", model: "Multistrada V4", trimName: "S", segment: "motorcycle-adventure", usedBase: 21800, newBase: 28400, categories: ["Motorcycle", "Sport", "Exotic", "Rugged"] },
  { id: "ducati-panigale-v4", make: "Ducati", model: "Panigale V4", trimName: "Superbike", segment: "motorcycle-sport", usedBase: 24200, newBase: 25900, categories: ["Motorcycle", "Sport", "Exotic"] },
  { id: "ducati-panigale-v4-r", make: "Ducati", model: "Panigale V4 R", trimName: "Superbike", segment: "motorcycle-sport", usedBase: 38800, newBase: 45900, categories: ["Motorcycle", "Sport", "Exotic"] },
  { id: "ducati-desmo450-mx", make: "Ducati", model: "Desmo450 MX", trimName: "Motocross", segment: "motorcycle-offroad", usedBase: 9800, newBase: 11900, categories: ["Motorcycle", "Sport", "Rugged", "Exotic"] },
  { id: "harley-davidson-fat-boy", make: "Harley-Davidson", model: "Fat Boy", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 17800, newBase: 22600, categories: ["Motorcycle", "Cruiser", "Muscle"] },
  { id: "harley-davidson-low-rider-s", make: "Harley-Davidson", model: "Low Rider S", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 14900, newBase: 19000, categories: ["Motorcycle", "Cruiser", "Muscle"] },
  { id: "harley-davidson-road-glide", make: "Harley-Davidson", model: "Road Glide", trimName: "Touring", segment: "motorcycle-touring", usedBase: 23600, newBase: 26000, categories: ["Motorcycle", "Cruiser", "Touring"] },
  { id: "harley-davidson-street-bob", make: "Harley-Davidson", model: "Street Bob", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 12100, newBase: 15000, categories: ["Motorcycle", "Cruiser"] },
  { id: "honda-africa-twin", make: "Honda Powersports", model: "Africa Twin", trimName: "Adventure Sports", segment: "motorcycle-adventure", usedBase: 11800, newBase: 14900, categories: ["Motorcycle", "Rugged"] },
  { id: "honda-transalp-xl750", make: "Honda Powersports", model: "Transalp", trimName: "XL750", segment: "motorcycle-adventure", usedBase: 8600, newBase: 10200, categories: ["Motorcycle", "Rugged"] },
  { id: "honda-cbr1000rr", make: "Honda Powersports", model: "CBR1000RR", trimName: "Fireblade", segment: "motorcycle-sport", usedBase: 13800, newBase: 16900, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "honda-cbr1000rr-r-fireblade-sp", make: "Honda Powersports", model: "CBR1000RR-R", trimName: "Fireblade SP", segment: "motorcycle-sport", usedBase: 21800, newBase: 28900, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "honda-cbr600rr", make: "Honda Powersports", model: "CBR600RR", trimName: "Supersport", segment: "motorcycle-sport", usedBase: 9700, newBase: 12900, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "honda-gold-wing-tour", make: "Honda Powersports", model: "Gold Wing", trimName: "Tour", segment: "motorcycle-touring", usedBase: 23900, newBase: 29600, categories: ["Motorcycle", "Touring", "Lux"] },
  { id: "honda-grom-abs", make: "Honda Powersports", model: "Grom", trimName: "ABS", segment: "motorcycle-scooter", usedBase: 3100, newBase: 3900, categories: ["Motorcycle", "Niche"] },
  { id: "honda-monkey-abs", make: "Honda Powersports", model: "Monkey", trimName: "ABS", segment: "motorcycle-scooter", usedBase: 3600, newBase: 4400, categories: ["Motorcycle", "Niche"] },
  { id: "honda-rebel-500", make: "Honda Powersports", model: "Rebel", trimName: "500", segment: "motorcycle-cruiser", usedBase: 5200, newBase: 6700, categories: ["Motorcycle", "Cruiser"] },
  { id: "honda-xr650l", make: "Honda Powersports", model: "XR650L", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 5400, newBase: 7000, categories: ["Motorcycle", "Rugged"] },
  { id: "indian-chief-dark-horse", make: "Indian Motorcycle", model: "Chief Dark Horse", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 15100, newBase: 19000, categories: ["Motorcycle", "Cruiser", "Muscle"] },
  { id: "indian-scout-bobber", make: "Indian Motorcycle", model: "Scout Bobber", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 10400, newBase: 13900, categories: ["Motorcycle", "Cruiser"] },
  { id: "indian-challenger", make: "Indian Motorcycle", model: "Challenger", trimName: "Bagger", segment: "motorcycle-touring", usedBase: 21800, newBase: 27900, categories: ["Motorcycle", "Touring", "Cruiser"] },
  { id: "indian-chieftain", make: "Indian Motorcycle", model: "Chieftain", trimName: "Touring", segment: "motorcycle-touring", usedBase: 19800, newBase: 24500, categories: ["Motorcycle", "Cruiser", "Touring"] },
  { id: "indian-roadmaster", make: "Indian Motorcycle", model: "Roadmaster", trimName: "Touring", segment: "motorcycle-touring", usedBase: 24700, newBase: 32900, categories: ["Motorcycle", "Touring", "Cruiser"] },
  { id: "kawasaki-klr650", make: "Kawasaki", model: "KLR650", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 5300, newBase: 7200, categories: ["Motorcycle", "Rugged"] },
  { id: "kawasaki-klx300", make: "Kawasaki", model: "KLX300", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 4300, newBase: 6200, categories: ["Motorcycle", "Rugged"] },
  { id: "kawasaki-kx450", make: "Kawasaki", model: "KX450", trimName: "Motocross", segment: "motorcycle-offroad", usedBase: 6100, newBase: 10400, categories: ["Motorcycle", "Rugged", "Sport"] },
  { id: "kawasaki-ninja-500", make: "Kawasaki", model: "Ninja", trimName: "500", segment: "motorcycle-sport", usedBase: 5200, newBase: 5700, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "kawasaki-ninja-zx10r", make: "Kawasaki", model: "Ninja ZX-10R", trimName: "Supersport", segment: "motorcycle-sport", usedBase: 12600, newBase: 18000, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "kawasaki-vulcan-900", make: "Kawasaki", model: "Vulcan", trimName: "900 Classic", segment: "motorcycle-cruiser", usedBase: 5700, newBase: 9400, categories: ["Motorcycle", "Cruiser"] },
  { id: "ktm-390-adventure", make: "KTM", model: "390 Adventure", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 5200, newBase: 7400, categories: ["Motorcycle", "Rugged", "Sport"] },
  { id: "ktm-500-exc-f", make: "KTM", model: "500 EXC-F", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 8900, newBase: 12900, categories: ["Motorcycle", "Rugged", "Sport"] },
  { id: "ktm-890-adventure-r", make: "KTM", model: "890 Adventure", trimName: "R", segment: "motorcycle-adventure", usedBase: 11800, newBase: 15900, categories: ["Motorcycle", "Rugged", "Sport"] },
  { id: "royal-enfield-classic-350", make: "Royal Enfield", model: "Classic", trimName: "350", segment: "motorcycle-cruiser", usedBase: 3600, newBase: 4700, categories: ["Motorcycle", "Cruiser", "International"] },
  { id: "royal-enfield-himalayan-450", make: "Royal Enfield", model: "Himalayan", trimName: "450", segment: "motorcycle-adventure", usedBase: 4700, newBase: 5900, categories: ["Motorcycle", "Rugged", "International"] },
  { id: "suzuki-burgman-400", make: "Suzuki", model: "Burgman", trimName: "400", segment: "motorcycle-scooter", usedBase: 5100, newBase: 8800, categories: ["Motorcycle", "Niche"] },
  { id: "suzuki-dr650s", make: "Suzuki", model: "DR650S", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 5300, newBase: 7200, categories: ["Motorcycle", "Rugged"] },
  { id: "suzuki-gsx-r750", make: "Suzuki", model: "GSX-R750", trimName: "Sport", segment: "motorcycle-sport", usedBase: 9300, newBase: 13100, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "triumph-bonneville-t120", make: "Triumph", model: "Bonneville", trimName: "T120", segment: "motorcycle-cruiser", usedBase: 9300, newBase: 13200, categories: ["Motorcycle", "Cruiser", "International"] },
  { id: "triumph-bonneville-speedmaster", make: "Triumph", model: "Bonneville Speedmaster", trimName: "Cruiser", segment: "motorcycle-cruiser", usedBase: 9800, newBase: 14200, categories: ["Motorcycle", "Cruiser", "International"] },
  { id: "triumph-daytona-660", make: "Triumph", model: "Daytona", trimName: "660", segment: "motorcycle-sport", usedBase: 7900, newBase: 9300, categories: ["Motorcycle", "Sport", "International"] },
  { id: "triumph-speed-triple-1200-rs", make: "Triumph", model: "Speed Triple", trimName: "1200 RS", segment: "motorcycle-sport", usedBase: 13200, newBase: 19000, categories: ["Motorcycle", "Sport", "International"] },
  { id: "triumph-tiger-900-rally-pro", make: "Triumph", model: "Tiger 900", trimName: "Rally Pro", segment: "motorcycle-adventure", usedBase: 11800, newBase: 16700, categories: ["Motorcycle", "Rugged", "International"] },
  { id: "triumph-tiger-1200-rally-pro", make: "Triumph", model: "Tiger 1200", trimName: "Rally Pro", segment: "motorcycle-adventure", usedBase: 15600, newBase: 22900, categories: ["Motorcycle", "Rugged", "International"] },
  { id: "vespa-gts-300", make: "Vespa", model: "GTS", trimName: "300", segment: "motorcycle-scooter", usedBase: 5200, newBase: 7900, categories: ["Motorcycle", "Niche", "International"] },
  { id: "yamaha-bolt-r-spec", make: "Yamaha", model: "Bolt", trimName: "R-Spec", segment: "motorcycle-cruiser", usedBase: 6100, newBase: 9000, categories: ["Motorcycle", "Cruiser"] },
  { id: "yamaha-fjr1300es", make: "Yamaha", model: "FJR1300ES", trimName: "Touring", segment: "motorcycle-touring", usedBase: 12900, newBase: 0, lastYear: 2024, categories: ["Motorcycle", "Touring", "Sport"] },
  { id: "yamaha-mt07", make: "Yamaha", model: "MT-07", trimName: "Naked", segment: "motorcycle-sport", usedBase: 6800, newBase: 8600, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "yamaha-tenere-700", make: "Yamaha", model: "Tenere 700", trimName: "Adventure", segment: "motorcycle-adventure", usedBase: 8900, newBase: 11000, categories: ["Motorcycle", "Rugged"] },
  { id: "yamaha-tw200", make: "Yamaha", model: "TW200", trimName: "Dual Sport", segment: "motorcycle-dual-sport", usedBase: 3800, newBase: 5000, categories: ["Motorcycle", "Rugged"] },
  { id: "yamaha-yz450f", make: "Yamaha", model: "YZ450F", trimName: "Motocross", segment: "motorcycle-offroad", usedBase: 5900, newBase: 10100, categories: ["Motorcycle", "Sport", "Rugged"] },
  { id: "yamaha-yzf-r7", make: "Yamaha", model: "YZF-R7", trimName: "Sport", segment: "motorcycle-sport", usedBase: 7200, newBase: 9200, categories: ["Motorcycle", "Sport", "Tuner"] },
  { id: "zero-dsr-x", make: "Zero Motorcycles", model: "DSR/X", trimName: "Adventure EV", segment: "motorcycle-electric", usedBase: 14300, newBase: 22900, categories: ["Motorcycle", "EV", "Rugged"] },
  { id: "zero-sr-f", make: "Zero Motorcycles", model: "SR/F", trimName: "Electric", segment: "motorcycle-electric", usedBase: 12400, newBase: 20900, categories: ["Motorcycle", "EV", "Sport"] },
  { id: "ford-e350-cargo-van-super-duty", make: "Ford", model: "E-350 Cargo Van", trimName: "Super Duty", segment: "cargo-van", usedBase: 24600, newBase: 0 },
  { id: "ford-e250-cargo-van-super-duty", make: "Ford", model: "E-250 Cargo Van", trimName: "Super Duty", segment: "cargo-van", usedBase: 19800, newBase: 0 },
  { id: "ford-e150-cargo-van-xl", make: "Ford", model: "E-150 Cargo Van", trimName: "XL", segment: "cargo-van", usedBase: 17100, newBase: 0 },
  { id: "ford-e-series-cutaway-e350", make: "Ford", model: "E-Series Cutaway", trimName: "E-350", segment: "cargo-van", usedBase: 28900, newBase: 38600 },
  { id: "ford-transit-connect-cargo-van-xl", make: "Ford", model: "Transit Connect Cargo Van", trimName: "XL", segment: "cargo-van", usedBase: 22100, newBase: 0 },
  { id: "chevrolet-astro-cargo-van", make: "Chevrolet", model: "Astro Cargo Van", trimName: "Cargo", segment: "cargo-van", usedBase: 7600, newBase: 0 },
  { id: "dodge-sprinter-cargo-van-2500", make: "Dodge", model: "Sprinter Cargo Van", trimName: "2500", segment: "cargo-van", usedBase: 18400, newBase: 0 },
  { id: "freightliner-sprinter-cargo-van-2500", make: "Freightliner", model: "Sprinter Cargo Van", trimName: "2500", segment: "cargo-van", usedBase: 20600, newBase: 0 },
  { id: "mercedes-benz-metris-cargo-van", make: "Mercedes-Benz", model: "Metris Cargo Van", trimName: "Cargo", segment: "cargo-van", usedBase: 27600, newBase: 0 },
  { id: "nissan-nv-cargo-van-2500-hd", make: "Nissan", model: "NV Cargo Van", trimName: "2500 HD", segment: "cargo-van", usedBase: 24100, newBase: 0 },
  { id: "nissan-nv200-compact-cargo-van-s", make: "Nissan", model: "NV200 Compact Cargo Van", trimName: "S", segment: "cargo-van", usedBase: 17200, newBase: 0 },
  { id: "subaru-crosstrek-premium", make: "Subaru", model: "Crosstrek", trimName: "Premium", segment: "compact-suv", usedBase: 23100, newBase: 29900 },
  { id: "subaru-forester-premium", make: "Subaru", model: "Forester", trimName: "Premium", segment: "compact-suv", usedBase: 24400, newBase: 32600 },
  { id: "subaru-outback-premium", make: "Subaru", model: "Outback", trimName: "Premium", segment: "midsize-suv", usedBase: 22600, newBase: 34100 },
  { id: "tesla-model-3-long-range", make: "Tesla", model: "Model 3", trimName: "Long Range", segment: "ev", usedBase: 26100, newBase: 42400 },
  { id: "tesla-model-y-long-range", make: "Tesla", model: "Model Y", trimName: "Long Range", segment: "ev", usedBase: 28600, newBase: 43800 },
  { id: "toyota-camry-le", make: "Toyota", model: "Camry", trimName: "LE", segment: "midsize-sedan", usedBase: 25700, newBase: 29500 },
  { id: "toyota-corolla-le", make: "Toyota", model: "Corolla", trimName: "LE", segment: "compact-sedan", usedBase: 11900, newBase: 23900 },
  { id: "toyota-rav4-xle", make: "Toyota", model: "RAV4", trimName: "XLE", segment: "compact-suv", usedBase: 29800, newBase: 34500 },
  { id: "toyota-prius-xle", make: "Toyota", model: "Prius", trimName: "XLE", segment: "hybrid", usedBase: 26600, newBase: 36500 },
  { id: "volkswagen-jetta-se", make: "Volkswagen", model: "Jetta", trimName: "SE", segment: "compact-sedan", usedBase: 17800, newBase: 27600 },
  { id: "volkswagen-tiguan-se", make: "Volkswagen", model: "Tiguan", trimName: "SE", segment: "compact-suv", usedBase: 22400, newBase: 34100 },
  { id: "volvo-xc60-plus", make: "Volvo", model: "XC60", trimName: "Plus", segment: "luxury", usedBase: 36900, newBase: 54200 },
  { id: "volvo-xc90-plus", make: "Volvo", model: "XC90", trimName: "Plus", segment: "luxury", usedBase: 42100, newBase: 61200 },
  { id: "alfa-romeo-giulia-ti", make: "Alfa Romeo", model: "Giulia", trimName: "Ti", segment: "luxury", usedBase: 27900, newBase: 46400 },
  { id: "alfa-romeo-stelvio-ti", make: "Alfa Romeo", model: "Stelvio", trimName: "Ti", segment: "luxury", usedBase: 31200, newBase: 49800 },
  { id: "aston-martin-vantage-coupe", make: "Aston Martin", model: "Vantage", trimName: "Coupe", segment: "luxury", usedBase: 119000, newBase: 194000 },
  { id: "aston-martin-db12-coupe", make: "Aston Martin", model: "DB12", trimName: "Coupe", segment: "luxury", usedBase: 228000, newBase: 268000 },
  { id: "aston-martin-dbx707", make: "Aston Martin", model: "DBX", trimName: "707", segment: "luxury", usedBase: 176000, newBase: 252000 },
  { id: "bentley-bentayga-v8", make: "Bentley", model: "Bentayga", trimName: "V8", segment: "luxury", usedBase: 154000, newBase: 214000 },
  { id: "bentley-continental-gt-v8", make: "Bentley", model: "Continental GT", trimName: "V8", segment: "luxury", usedBase: 178000, newBase: 246000 },
  { id: "bentley-flying-spur-v8", make: "Bentley", model: "Flying Spur", trimName: "V8", segment: "luxury", usedBase: 166000, newBase: 231000 },
  { id: "bugatti-chiron-sport", make: "Bugatti", model: "Chiron", trimName: "Sport", segment: "luxury", usedBase: 3200000, newBase: 3900000 },
  { id: "ferrari-296-gtb", make: "Ferrari", model: "296", trimName: "GTB", segment: "luxury", usedBase: 328000, newBase: 371000 },
  { id: "ferrari-roma-coupe", make: "Ferrari", model: "Roma", trimName: "Coupe", segment: "luxury", usedBase: 218000, newBase: 247000 },
  { id: "ferrari-purosangue", make: "Ferrari", model: "Purosangue", trimName: "V12", segment: "luxury", usedBase: 410000, newBase: 430000 },
  { id: "lamborghini-huracan-tecnica", make: "Lamborghini", model: "Huracan", trimName: "Tecnica", segment: "luxury", usedBase: 254000, newBase: 289000 },
  { id: "lamborghini-urus-s", make: "Lamborghini", model: "Urus", trimName: "S", segment: "luxury", usedBase: 212000, newBase: 241000 },
  { id: "lamborghini-revuelto", make: "Lamborghini", model: "Revuelto", trimName: "V12 Hybrid", segment: "luxury", usedBase: 595000, newBase: 608000 },
  { id: "lotus-emira-v6", make: "Lotus", model: "Emira", trimName: "V6", segment: "luxury", usedBase: 82000, newBase: 105000 },
  { id: "lotus-eletre", make: "Lotus", model: "Eletre", trimName: "EV", segment: "ev", usedBase: 89000, newBase: 108000 },
  { id: "maserati-ghibli-modena", make: "Maserati", model: "Ghibli", trimName: "Modena", segment: "luxury", usedBase: 38900, newBase: 87400 },
  { id: "maserati-grecale-modena", make: "Maserati", model: "Grecale", trimName: "Modena", segment: "luxury", usedBase: 69800, newBase: 86400 },
  { id: "maserati-granturismo-modena", make: "Maserati", model: "GranTurismo", trimName: "Modena", segment: "luxury", usedBase: 147000, newBase: 174000 },
  { id: "mclaren-artura", make: "McLaren", model: "Artura", trimName: "Hybrid", segment: "luxury", usedBase: 202000, newBase: 241000 },
  { id: "mclaren-750s", make: "McLaren", model: "750S", trimName: "Coupe", segment: "luxury", usedBase: 323000, newBase: 342000 },
  { id: "mclaren-gt", make: "McLaren", model: "GT", trimName: "Coupe", segment: "luxury", usedBase: 159000, newBase: 208000 },
  { id: "porsche-911-carrera", make: "Porsche", model: "911", trimName: "Carrera", segment: "luxury", usedBase: 112000, newBase: 127000 },
  { id: "porsche-cayenne-base", make: "Porsche", model: "Cayenne", trimName: "Base", segment: "luxury", usedBase: 68100, newBase: 86100 },
  { id: "porsche-macan-base", make: "Porsche", model: "Macan", trimName: "Base", segment: "luxury", usedBase: 45800, newBase: 64200 },
  { id: "porsche-taycan-4s", make: "Porsche", model: "Taycan", trimName: "4S", segment: "ev", usedBase: 72800, newBase: 118000 },
  { id: "rolls-royce-cullinan", make: "Rolls-Royce", model: "Cullinan", trimName: "Base", segment: "luxury", usedBase: 332000, newBase: 397000 },
  { id: "rolls-royce-ghost", make: "Rolls-Royce", model: "Ghost", trimName: "Base", segment: "luxury", usedBase: 271000, newBase: 354000 },
  { id: "rolls-royce-phantom", make: "Rolls-Royce", model: "Phantom", trimName: "Base", segment: "luxury", usedBase: 395000, newBase: 493000 },
  { id: "land-rover-defender-110-s", make: "Land Rover", model: "Defender", trimName: "110 S", segment: "luxury", usedBase: 61200, newBase: 72100 },
  { id: "land-rover-discovery-dynamic-se", make: "Land Rover", model: "Discovery", trimName: "Dynamic SE", segment: "luxury", usedBase: 47200, newBase: 68300 },
  { id: "land-rover-range-rover-se", make: "Land Rover", model: "Range Rover", trimName: "SE", segment: "luxury", usedBase: 102000, newBase: 111000 },
  { id: "land-rover-range-rover-sport-se", make: "Land Rover", model: "Range Rover Sport", trimName: "SE", segment: "luxury", usedBase: 73800, newBase: 91400 },
  { id: "jaguar-f-pace-p250", make: "Jaguar", model: "F-PACE", trimName: "P250", segment: "luxury", usedBase: 35400, newBase: 58600 },
  { id: "jaguar-i-pace-hse", make: "Jaguar", model: "I-PACE", trimName: "HSE", segment: "ev", usedBase: 31800, newBase: 73100 },
  { id: "infiniti-q50-luxe", make: "Infiniti", model: "Q50", trimName: "Luxe", segment: "luxury", usedBase: 22400, newBase: 44400 },
  { id: "infiniti-qx60-luxe", make: "Infiniti", model: "QX60", trimName: "Luxe", segment: "luxury", usedBase: 34700, newBase: 52800 },
  { id: "infiniti-qx80-luxe", make: "Infiniti", model: "QX80", trimName: "Luxe", segment: "luxury", usedBase: 41200, newBase: 74200 },
  { id: "lucid-air-pure", make: "Lucid", model: "Air", trimName: "Pure", segment: "ev", usedBase: 53200, newBase: 69900 },
  { id: "lucid-gravity-touring", make: "Lucid", model: "Gravity", trimName: "Touring", segment: "ev", usedBase: 72500, newBase: 94800 },
  { id: "mini-cooper-s", make: "MINI", model: "Cooper", trimName: "S", segment: "compact-sedan", usedBase: 21800, newBase: 33400 },
  { id: "mini-countryman-s", make: "MINI", model: "Countryman", trimName: "S", segment: "compact-suv", usedBase: 26700, newBase: 38900 },
  { id: "mitsubishi-eclipse-cross-se", make: "Mitsubishi", model: "Eclipse Cross", trimName: "SE", segment: "compact-suv", usedBase: 18100, newBase: 30600 },
  { id: "mitsubishi-mirage-es", make: "Mitsubishi", model: "Mirage", trimName: "ES", segment: "compact-sedan", usedBase: 9800, newBase: 18100 },
  { id: "mitsubishi-outlander-se", make: "Mitsubishi", model: "Outlander", trimName: "SE", segment: "compact-suv", usedBase: 23700, newBase: 33900 },
  { id: "polestar-2-long-range", make: "Polestar", model: "2", trimName: "Long Range", segment: "ev", usedBase: 29200, newBase: 51400 },
  { id: "polestar-3-long-range", make: "Polestar", model: "3", trimName: "Long Range", segment: "ev", usedBase: 61800, newBase: 74400 },
  { id: "rivian-r1s-adventure", make: "Rivian", model: "R1S", trimName: "Adventure", segment: "ev", usedBase: 72100, newBase: 84500 },
  { id: "rivian-r1t-adventure", make: "Rivian", model: "R1T", trimName: "Adventure", segment: "ev", usedBase: 68100, newBase: 79900 }
];

const coverageCatalog = {
  Acura: "ADX|luxury, CL|compact-sedan, ILX|compact-sedan, Integra|compact-sedan, Legend|midsize-sedan, MDX|luxury, NSX|luxury, RDX|luxury, RL|luxury, RLX|luxury, RSX|compact-sedan, TL|midsize-sedan, TLX|luxury, TSX|compact-sedan, ZDX|ev",
  "Alfa Romeo": "4C|luxury, Giulia|luxury, Stelvio|luxury, Tonale|compact-suv",
  "Aston Martin": "DB9|luxury, DB11|luxury, DB12|luxury, DBS|luxury, DBX|luxury, Rapide|luxury, Vantage|luxury, Vanquish|luxury, Virage|luxury",
  Audi: "A3|compact-sedan, A4|luxury, A5|luxury, A6|luxury, A6 e-tron|ev, A7|luxury, A8|luxury, Allroad|luxury, e-tron|ev, e-tron GT|ev, Q3|luxury, Q4 e-tron|ev, Q5|luxury, Q6 e-tron|ev, Q7|luxury, Q8|luxury, R8|luxury, RS 3|luxury, RS 5|luxury, RS 6|luxury, RS 7|luxury, S3|luxury, S4|luxury, S5|luxury, S6|luxury, S7|luxury, S8|luxury, SQ5|luxury, SQ6 e-tron|ev, SQ7|luxury, SQ8|luxury, TT|compact-sedan",
  Bentley: "Arnage|luxury, Azure|luxury, Bentayga|luxury, Brooklands|luxury, Continental GT|luxury, Continental Flying Spur|luxury, Flying Spur|luxury, Mulsanne|luxury",
  BMW: "1 Series|compact-sedan, 2 Series|compact-sedan, 3 Series|luxury, 4 Series|luxury, 5 Series|luxury, 6 Series|luxury, 7 Series|luxury, 8 Series|luxury, i3|ev, i4|ev, i5|ev, i7|ev, i8|luxury, iX|ev, M2|luxury, M3|luxury, M4|luxury, M5|luxury, M8|luxury, XM|luxury, X1|luxury, X2|luxury, X3|luxury, X4|luxury, X5|luxury, X6|luxury, X7|luxury, Z3|compact-sedan, Z4|compact-sedan",
  Birkin: "S3|luxury, CS3|luxury",
  Bugatti: "Chiron|luxury, Divo|luxury, Veyron|luxury",
  BYD: "Atto 3|ev, Dolphin|ev, Han|ev, Seal|ev, Sealion 7|ev, Tang|ev, Yuan Plus|ev",
  Buick: "Cascada|compact-sedan, Century|midsize-sedan, Enclave|midsize-suv, Encore|compact-suv, Encore GX|compact-suv, Envision|compact-suv, Envista|compact-suv, LaCrosse|midsize-sedan, LeSabre|midsize-sedan, Lucerne|midsize-sedan, Park Avenue|midsize-sedan, Rainier|midsize-suv, Regal|midsize-sedan, Rendezvous|midsize-suv, Terraza|midsize-suv, Verano|compact-sedan",
  Cadillac: "ATS|luxury, CELESTIQ|ev, CT4|luxury, CT5|luxury, CT6|luxury, CTS|luxury, DeVille|luxury, DTS|luxury, ELR|ev, Escalade|luxury, Escalade IQ|ev, LYRIQ|ev, OPTIQ|ev, SRX|luxury, STS|luxury, VISTIQ|ev, XLR|luxury, XT4|luxury, XT5|luxury, XT6|luxury, XTS|luxury",
  Campagna: "T-Rex|luxury, V13R|luxury",
  Changan: "Deepal S07|ev, UNI-K|midsize-suv, UNI-T|compact-suv",
  Chery: "Arrizo 5|compact-sedan, Omoda 5|compact-suv, Tiggo 7|compact-suv, Tiggo 8|midsize-suv",
  Chevrolet: "Astro|midsize-suv, Astro Cargo Van|cargo-van, Avalanche|pickup, Aveo|compact-sedan, Blazer|midsize-suv, Blazer EV|ev, Bolt EUV|ev, Bolt EV|ev, Camaro|compact-sedan, Caprice|midsize-sedan, Cavalier|compact-sedan, Cobalt|compact-sedan, Colorado|pickup, Corvette|luxury, Corvette E-Ray|luxury, Corvette ZR1X|luxury, Cruze|compact-sedan, Equinox|compact-suv, Equinox EV|ev, Express|midsize-suv, Express Cargo Van|cargo-van, HHR|compact-suv, Impala|midsize-sedan, Malibu|midsize-sedan, Monte Carlo|midsize-sedan, Silverado 1500|pickup, Silverado 2500HD|pickup, Silverado 3500HD|pickup, Silverado EV|ev, Sonic|compact-sedan, Spark|compact-sedan, SSR|pickup, Suburban|midsize-suv, Tahoe|midsize-suv, Trailblazer|compact-suv, Traverse|midsize-suv, Trax|compact-suv, Uplander|midsize-suv, Volt|hybrid",
  Chrysler: "200|midsize-sedan, 300|midsize-sedan, Aspen|midsize-suv, Crossfire|compact-sedan, Pacifica|midsize-suv, PT Cruiser|compact-suv, Sebring|midsize-sedan, Town & Country|midsize-suv, Voyager|midsize-suv",
  Citroen: "C3|compact-sedan, C4|compact-sedan, C5 Aircross|compact-suv, C6|midsize-sedan",
  Cupra: "Born|ev, Formentor|compact-suv, Leon|compact-sedan",
  Dacia: "Duster|compact-suv, Logan|compact-sedan, Sandero|compact-sedan, Spring|ev",
  DS: "DS 3|compact-suv, DS 4|compact-sedan, DS 7|compact-suv, DS 9|midsize-sedan",
  Dodge: "Avenger|midsize-sedan, Caliber|compact-sedan, Challenger|compact-sedan, Charger|midsize-sedan, Dart|compact-sedan, Durango|midsize-suv, Grand Caravan|midsize-suv, Hornet|compact-suv, Journey|midsize-suv, Magnum|midsize-sedan, Neon|compact-sedan, Nitro|midsize-suv, Sprinter|midsize-suv, Sprinter Cargo Van|cargo-van, Viper|luxury",
  Dongfeng: "Aeolus Shine|compact-sedan, Fengon 580|compact-suv, M-Hero 917|ev",
  ElectraMeccanica: "Solo|ev",
  Ferrari: "296|luxury, 360|luxury, 430|luxury, 458|luxury, 488|luxury, 599|luxury, 612|luxury, 812|luxury, California|luxury, F12berlinetta|luxury, F8|luxury, FF|luxury, GTC4Lusso|luxury, LaFerrari|luxury, Portofino|luxury, Purosangue|luxury, Roma|luxury, SF90|luxury",
  Felino: "cB7|luxury, cB7R|luxury",
  Fiat: "124 Spider|compact-sedan, 500|compact-sedan, 500e|ev, 500L|compact-suv, 500X|compact-suv",
  Fisker: "Karma|luxury, Ocean|ev",
  Ford: "Bronco|midsize-suv, Bronco Sport|compact-suv, C-Max|hybrid, Contour|midsize-sedan, Crown Victoria|midsize-sedan, E-150 Cargo Van|cargo-van, E-250 Cargo Van|cargo-van, E-350 Cargo Van|cargo-van, E-Series Cutaway|cargo-van, EcoSport|compact-suv, Edge|midsize-suv, Escape|compact-suv, Excursion|midsize-suv, Expedition|midsize-suv, Explorer|midsize-suv, F-150|pickup, F-250 Super Duty|pickup, F-350 Super Duty|pickup, Fiesta|compact-sedan, Five Hundred|midsize-sedan, Flex|midsize-suv, Focus|compact-sedan, Freestar|midsize-suv, Freestyle|midsize-suv, Fusion|midsize-sedan, Maverick|pickup, Mustang|compact-sedan, Mustang Mach-E|ev, Ranger|pickup, Taurus|midsize-sedan, Thunderbird|compact-sedan, Transit|midsize-suv, Transit Cargo Van|cargo-van, E-Transit Cargo Van|ev, Transit Connect|midsize-suv, Transit Connect Cargo Van|cargo-van",
  Freightliner: "Sprinter Cargo Van|cargo-van",
  GAC: "Aion S|ev, Aion Y|ev, GS8|midsize-suv",
  GAZ: "Sobol|midsize-suv, Volga|midsize-sedan",
  Geely: "Coolray|compact-suv, Emgrand|compact-sedan, Monjaro|midsize-suv, Geometry C|ev",
  Genesis: "G70|luxury, G80|luxury, G90|luxury, GV60|ev, GV70|luxury, Electrified GV70|ev, GV80|luxury, GV80 Coupe|luxury",
  GMC: "Acadia|midsize-suv, Canyon|pickup, Envoy|midsize-suv, Hummer EV Pickup|ev, Hummer EV SUV|ev, Savana|midsize-suv, Savana Cargo Van|cargo-van, Sierra 1500|pickup, Sierra 2500HD|pickup, Sierra 3500HD|pickup, Sierra EV|ev, Terrain|compact-suv, Yukon|midsize-suv, Yukon XL|midsize-suv",
  "Great Wall": "Cannon|pickup, Ora 03|ev, Tank 300|midsize-suv, Wingle|pickup",
  Haval: "H6|compact-suv, Jolion|compact-suv, Big Dog|compact-suv",
  Honda: "Accord|midsize-sedan, Accord Crosstour|midsize-suv, Civic|compact-sedan, Clarity|hybrid, CR-V|compact-suv, CR-Z|hybrid, Crosstour|midsize-suv, Element|compact-suv, Fit|compact-sedan, HR-V|compact-suv, Insight|hybrid, Odyssey|midsize-suv, Passport|midsize-suv, Pilot|midsize-suv, Prelude|compact-sedan, Prologue|ev, Ridgeline|pickup, S2000|compact-sedan",
  Hongqi: "E-HS9|ev, H5|midsize-sedan, H9|luxury, HS5|compact-suv",
  Hummer: "H1|midsize-suv, H2|midsize-suv, H3|midsize-suv",
  Hyundai: "Accent|compact-sedan, Azera|midsize-sedan, Elantra|compact-sedan, Entourage|midsize-suv, Equus|luxury, Genesis|luxury, Ioniq|hybrid, Ioniq 5|ev, Ioniq 6|ev, Kona|compact-suv, Kona Electric|ev, Nexo|ev, Palisade|midsize-suv, Palisade Hybrid|hybrid, Santa Cruz|pickup, Santa Fe|midsize-suv, Santa Fe Hybrid|hybrid, Sonata|midsize-sedan, Tiburon|compact-sedan, Tucson|compact-suv, Tucson Hybrid|hybrid, Veloster|compact-sedan, Venue|compact-suv, Veracruz|midsize-suv",
  Infiniti: "EX|luxury, FX|luxury, G|luxury, I|midsize-sedan, JX|luxury, M|luxury, Q40|luxury, Q45|luxury, Q50|luxury, Q60|luxury, Q70|luxury, QX30|luxury, QX4|luxury, QX50|luxury, QX55|luxury, QX56|luxury, QX60|luxury, QX70|luxury, QX80|luxury",
  Innoson: "Fox|compact-sedan, G5|midsize-suv, G6|midsize-suv, G80|midsize-suv, Ikenga|pickup, Umu|compact-sedan",
  Isuzu: "Ascender|midsize-suv, Axiom|midsize-suv, i-Series|pickup, Rodeo|midsize-suv, Trooper|midsize-suv, VehiCROSS|midsize-suv",
  Iveco: "Daily|midsize-suv",
  Jaguar: "E-PACE|luxury, F-PACE|luxury, F-TYPE|luxury, I-PACE|ev, S-Type|luxury, X-Type|luxury, XE|luxury, XF|luxury, XJ|luxury, XK|luxury",
  Jeep: "Cherokee|compact-suv, Commander|midsize-suv, Compass|compact-suv, Gladiator|pickup, Grand Cherokee|midsize-suv, Grand Cherokee L|midsize-suv, Liberty|compact-suv, Patriot|compact-suv, Renegade|compact-suv, Wagoneer|midsize-suv, Grand Wagoneer|luxury, Wrangler|midsize-suv, Wrangler Unlimited|midsize-suv",
  Karma: "GS-6|luxury, Revero|luxury",
  Kantanka: "Amoanimaa|compact-sedan, Mensah|midsize-suv, Omama|pickup, Onantefo|midsize-suv",
  Kia: "Amanti|midsize-sedan, Borrego|midsize-suv, Cadenza|midsize-sedan, Carnival|midsize-suv, Carnival Hybrid|hybrid, EV3|ev, EV4|ev, EV5|ev, EV6|ev, EV9|ev, Forte|compact-sedan, K4|compact-sedan, K5|midsize-sedan, K900|luxury, Niro|hybrid, Niro EV|ev, Optima|midsize-sedan, Rio|compact-sedan, Rondo|compact-suv, Sedona|midsize-suv, Seltos|compact-suv, Sorento|midsize-suv, Sorento Hybrid|hybrid, Soul|compact-suv, Soul EV|ev, Spectra|compact-sedan, Sportage|compact-suv, Sportage Hybrid|hybrid, Stinger|luxury, Telluride|midsize-suv",
  Lamborghini: "Aventador|luxury, Gallardo|luxury, Huracan|luxury, Murcielago|luxury, Revuelto|luxury, Urus|luxury",
  Lada: "Granta|compact-sedan, Niva Legend|midsize-suv, Niva Travel|midsize-suv, Vesta|compact-sedan, Xray|compact-suv",
  Lancia: "Ypsilon|compact-sedan",
  Laraki: "Epitome|luxury, Fulgura|luxury",
  "Land Rover": "Defender|luxury, Discovery|luxury, Discovery Sport|luxury, Freelander|compact-suv, LR2|luxury, LR3|luxury, LR4|luxury, Range Rover|luxury, Range Rover Evoque|luxury, Range Rover Sport|luxury, Range Rover Velar|luxury",
  Lexus: "CT|hybrid, ES|luxury, GS|luxury, GX|luxury, HS|hybrid, IS|luxury, LC|luxury, LFA|luxury, LS|luxury, LX|luxury, NX|luxury, RC|luxury, RX|luxury, RZ|ev, SC|luxury, TX|luxury, UX|luxury",
  "Li Auto": "L6|ev, L7|ev, L8|ev, L9|ev, Mega|ev",
  Lincoln: "Aviator|luxury, Blackwood|pickup, Continental|luxury, Corsair|luxury, LS|luxury, Mark LT|pickup, MKC|luxury, MKS|luxury, MKT|luxury, MKX|luxury, MKZ|luxury, Nautilus|luxury, Navigator|luxury, Town Car|luxury, Zephyr|luxury",
  "Lynk & Co": "01|compact-suv, 03|compact-sedan, 05|compact-suv, 09|midsize-suv",
  Lotus: "Elise|luxury, Eletre|ev, Emira|luxury, Esprit|luxury, Evora|luxury, Exige|luxury",
  Lucid: "Air|ev, Gravity|ev",
  Maserati: "Coupe|luxury, Ghibli|luxury, GranTurismo|luxury, GranCabrio|luxury, Grecale|luxury, Levante|luxury, MC20|luxury, Quattroporte|luxury, Spyder|luxury",
  Maybach: "57|luxury, 62|luxury",
  Mazda: "2|compact-sedan, 3|compact-sedan, 5|compact-suv, 6|midsize-sedan, CX-3|compact-suv, CX-30|compact-suv, CX-5|compact-suv, CX-50|compact-suv, CX-7|midsize-suv, CX-70|midsize-suv, CX-9|midsize-suv, CX-90|midsize-suv, Mazdaspeed3|compact-sedan, Millenia|midsize-sedan, MPV|midsize-suv, MX-30|ev, MX-5 Miata|compact-sedan, Protege|compact-sedan, RX-8|compact-sedan, Tribute|compact-suv",
  McLaren: "570S|luxury, 600LT|luxury, 650S|luxury, 675LT|luxury, 720S|luxury, 750S|luxury, 765LT|luxury, Artura|luxury, GT|luxury, MP4-12C|luxury, P1|luxury, Senna|luxury",
  "Mercedes-Benz": "A-Class|luxury, AMG GT|luxury, B-Class|compact-sedan, C-Class|luxury, CLA|luxury, CLE|luxury, CLK|luxury, CLS|luxury, E-Class|luxury, EQB|ev, EQE|ev, EQE SUV|ev, EQS|ev, EQS SUV|ev, G-Class|luxury, GL-Class|luxury, GLA|luxury, GLB|luxury, GLC|luxury, GLC Coupe|luxury, GLE|luxury, GLE Coupe|luxury, GLK|luxury, GLS|luxury, M-Class|luxury, Maybach GLS|luxury, Maybach S-Class|luxury, Metris Cargo Van|cargo-van, R-Class|luxury, S-Class|luxury, SL|luxury, SLC|luxury, SLK|luxury, SLS AMG|luxury, Sprinter|midsize-suv, Sprinter Cargo Van|cargo-van, eSprinter Cargo Van|ev",
  Mercury: "Cougar|compact-sedan, Grand Marquis|midsize-sedan, Marauder|midsize-sedan, Mariner|compact-suv, Milan|midsize-sedan, Montego|midsize-sedan, Monterey|midsize-suv, Mountaineer|midsize-suv, Sable|midsize-sedan",
  MINI: "Clubman|compact-sedan, Convertible|compact-sedan, Cooper|compact-sedan, Countryman|compact-suv, Coupe|compact-sedan, Hardtop|compact-sedan, Paceman|compact-suv, Roadster|compact-sedan",
  Mitsubishi: "Diamante|midsize-sedan, Eclipse|compact-sedan, Eclipse Cross|compact-suv, Endeavor|midsize-suv, Galant|midsize-sedan, i-MiEV|ev, Lancer|compact-sedan, Mirage|compact-sedan, Montero|midsize-suv, Outlander|compact-suv, Outlander PHEV|hybrid, Raider|pickup",
  Mobius: "II|midsize-suv, III|midsize-suv",
  Moskvich: "3|compact-suv, 6|midsize-sedan",
  NIO: "EC6|ev, ES6|ev, ES8|ev, ET5|ev, ET7|ev",
  Nissan: "350Z|compact-sedan, 370Z|compact-sedan, Altima|midsize-sedan, Ariya|ev, Armada|midsize-suv, Cube|compact-sedan, Frontier|pickup, GT-R|luxury, Juke|compact-suv, Kicks|compact-suv, Leaf|ev, Maxima|midsize-sedan, Murano|midsize-suv, NV|midsize-suv, NV Cargo Van|cargo-van, NV200 Compact Cargo Van|cargo-van, Pathfinder|midsize-suv, Quest|midsize-suv, Rogue|compact-suv, Rogue Plug-in Hybrid|hybrid, Rogue Sport|compact-suv, Sentra|compact-sedan, Titan|pickup, Versa|compact-sedan, Xterra|midsize-suv, Z|compact-sedan",
  Nord: "A3|compact-sedan, A5|compact-suv, Tank|pickup",
  Oldsmobile: "Alero|compact-sedan, Aurora|midsize-sedan, Bravada|midsize-suv, Silhouette|midsize-suv",
  Opel: "Astra|compact-sedan, Corsa|compact-sedan, Insignia|midsize-sedan, Mokka|compact-suv, Zafira|midsize-suv",
  Polestar: "1|hybrid, 2|ev, 3|ev, 4|ev",
  Pontiac: "Aztek|midsize-suv, Bonneville|midsize-sedan, G3|compact-sedan, G5|compact-sedan, G6|midsize-sedan, G8|midsize-sedan, Grand Am|compact-sedan, Grand Prix|midsize-sedan, GTO|compact-sedan, Montana|midsize-suv, Solstice|compact-sedan, Sunfire|compact-sedan, Torrent|compact-suv, Vibe|compact-suv",
  Porsche: "718 Boxster|luxury, 718 Cayman|luxury, 911|luxury, Boxster|luxury, Carrera GT|luxury, Cayenne|luxury, Cayman|luxury, Macan|luxury, Panamera|luxury, Taycan|ev",
  Peugeot: "208|compact-sedan, 308|compact-sedan, 3008|compact-suv, 5008|midsize-suv",
  Ram: "1500|pickup, 1500 Ramcharger|hybrid, 1500 REV|ev, 2500|pickup, 3500|pickup, Chassis Cab|pickup, ProMaster|midsize-suv, ProMaster Cargo Van|cargo-van, ProMaster City|midsize-suv, ProMaster EV Cargo Van|ev",
  Renault: "Captur|compact-suv, Clio|compact-sedan, Megane|compact-sedan, Scenic|compact-suv, Zoe|ev",
  Rivian: "R1S|ev, R1T|ev",
  "Rolls-Royce": "Cullinan|luxury, Dawn|luxury, Ghost|luxury, Phantom|luxury, Spectre|ev, Wraith|luxury",
  Saab: "9-2X|compact-sedan, 9-3|compact-sedan, 9-4X|midsize-suv, 9-5|midsize-sedan, 9-7X|midsize-suv",
  Saturn: "Astra|compact-sedan, Aura|midsize-sedan, Ion|compact-sedan, L-Series|midsize-sedan, Outlook|midsize-suv, Relay|midsize-suv, Sky|compact-sedan, S-Series|compact-sedan, Vue|compact-suv",
  Scion: "FR-S|compact-sedan, iA|compact-sedan, iM|compact-sedan, iQ|compact-sedan, tC|compact-sedan, xA|compact-sedan, xB|compact-sedan, xD|compact-sedan",
  SEAT: "Arona|compact-suv, Ateca|compact-suv, Ibiza|compact-sedan, Leon|compact-sedan",
  Skoda: "Enyaq|ev, Fabia|compact-sedan, Kodiaq|midsize-suv, Octavia|compact-sedan, Superb|midsize-sedan",
  Smart: "fortwo|compact-sedan, fortwo electric drive|ev",
  Subaru: "Ascent|midsize-suv, Baja|pickup, BRZ|compact-sedan, Crosstrek|compact-suv, Crosstrek Hybrid|hybrid, Forester|compact-suv, Forester Hybrid|hybrid, Impreza|compact-sedan, Legacy|midsize-sedan, Outback|midsize-suv, Solterra|ev, Trailseeker|ev, Tribeca|midsize-suv, Uncharted|ev, WRX|compact-sedan",
  Suzuki: "Aerio|compact-sedan, Equator|pickup, Forenza|compact-sedan, Grand Vitara|compact-suv, Kizashi|midsize-sedan, Reno|compact-sedan, SX4|compact-sedan, Verona|midsize-sedan, Vitara|compact-suv, XL7|midsize-suv",
  Tesla: "Cybertruck|ev, Model 3|ev, Model S|ev, Model X|ev, Model Y|ev, Roadster|ev",
  Toyota: "4Runner|midsize-suv, 86|compact-sedan, Avalon|midsize-sedan, bZ4X|ev, C-HR|compact-suv, Camry|midsize-sedan, Celica|compact-sedan, Corolla|compact-sedan, Corolla Cross|compact-suv, Crown|midsize-sedan, Crown Signia|midsize-suv, FJ Cruiser|midsize-suv, GR Corolla|compact-sedan, GR Supra|luxury, GR86|compact-sedan, Grand Highlander|midsize-suv, Highlander|midsize-suv, Land Cruiser|midsize-suv, Matrix|compact-suv, Mirai|ev, Prius|hybrid, Prius c|hybrid, Prius v|hybrid, RAV4|compact-suv, Sequoia|midsize-suv, Sienna|midsize-suv, Solara|compact-sedan, Tacoma|pickup, Tundra|pickup, Venza|compact-suv, Yaris|compact-sedan",
  UAZ: "Hunter|midsize-suv, Patriot|midsize-suv, Pickup|pickup",
  Volkswagen: "Arteon|midsize-sedan, Atlas|midsize-suv, Atlas Cross Sport|midsize-suv, Beetle|compact-sedan, CC|midsize-sedan, Eos|compact-sedan, e-Golf|ev, Golf|compact-sedan, Golf Alltrack|compact-suv, Golf GTI|compact-sedan, Golf R|compact-sedan, ID.4|ev, ID. Buzz|ev, Jetta|compact-sedan, Passat|midsize-sedan, Phaeton|luxury, Rabbit|compact-sedan, Routan|midsize-suv, Taos|compact-suv, Tiguan|compact-suv, Touareg|luxury",
  Volvo: "C30|compact-sedan, C40 Recharge|ev, C70|compact-sedan, EX30|ev, EX90|ev, S40|compact-sedan, S60|luxury, S80|luxury, S90|luxury, V50|compact-sedan, V60|luxury, V70|midsize-sedan, V90|luxury, XC40|luxury, XC40 Recharge|ev, XC60|luxury, XC70|midsize-suv, XC90|luxury",
  Vauxhall: "Astra|compact-sedan, Corsa|compact-sedan, Insignia|midsize-sedan, Mokka|compact-suv",
  VUHL: "05|luxury, 05RR|luxury",
  Wallyscar: "Iris|compact-suv, Izis|compact-suv",
  Wuling: "Air EV|ev, Bingo|ev, Hongguang Mini EV|ev, Victory|midsize-suv",
  XPeng: "G6|ev, G9|ev, P7|ev, X9|ev",
  Xiaomi: "SU7|ev, YU7|ev",
  Zacua: "MX2|ev, MX3|ev",
  Zeekr: "001|ev, 007|ev, 009|ev, X|ev"
};

const makePriceFactors = {
  "Aston Martin": 4.3,
  Bentley: 4.6,
  Bugatti: 55,
  Ferrari: 7.2,
  Lamborghini: 7,
  Lotus: 1.8,
  McLaren: 6.3,
  "Rolls-Royce": 7.7,
  Maserati: 1.45,
  Maybach: 5.2,
  Porsche: 1.9,
  Lucid: 1.35,
  Rivian: 1.32,
  Tesla: 1.14,
  "Land Rover": 1.38,
  Lexus: 1.18,
  "Mercedes-Benz": 1.32,
  BMW: 1.24,
  Audi: 1.18,
  Cadillac: 1.14,
  Genesis: 1.1,
  Lincoln: 1.08,
  Acura: 1.04,
  Infiniti: 1.02,
  Jaguar: 1.24,
  Volvo: 1.1,
  Buick: 0.96,
  GMC: 1.06,
  Ram: 1.04,
  Hummer: 1.08,
  Jeep: 1.02,
  Subaru: 0.98,
  Mazda: 0.96,
  Volkswagen: 0.95,
  Toyota: 1.02,
  Honda: 1,
  Ford: 0.98,
  Chevrolet: 0.96,
  Dodge: 0.96,
  Chrysler: 0.94,
  Hyundai: 0.93,
  Kia: 0.93,
  Nissan: 0.93,
  Mitsubishi: 0.88,
  Fiat: 0.86,
  MINI: 0.96,
  Smart: 0.76
};

function slug(value) {
  return String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function coverageEntries() {
  return Object.entries(coverageCatalog).flatMap(([make, rawModels]) => {
    const factor = makePriceFactors[make] || 0.92;
    return rawModels.split(",").flatMap((entry) => {
      const [model, segment] = entry.trim().split("|");
      const lastYear = modelLastYears[`${make}::${model}`];
      if (lastYear && lastYear < earliestModelYear) return [];
      const base = segments[segment] || segments["midsize-sedan"];
      return [{
        id: `${slug(make)}-${slug(model)}-benchmark`,
        make,
        model,
        trimName: "Benchmark",
        segment,
        usedBase: Math.round((base.usedBase * factor) / 100) * 100,
        newBase: Math.round((base.newBase * factor) / 100) * 100
      }];
    });
  });
}

function mergeProfiles(curatedProfiles, generatedProfiles) {
  const seenModels = new Set(curatedProfiles.map((profile) => `${profile.make}::${profile.model}`));
  const seenIds = new Set(curatedProfiles.map((profile) => profile.id));
  const additions = generatedProfiles.filter((profile) => {
    const modelKey = `${profile.make}::${profile.model}`;
    if (seenModels.has(modelKey) || seenIds.has(profile.id)) return false;
    seenModels.add(modelKey);
    seenIds.add(profile.id);
    return true;
  });
  return [...curatedProfiles, ...additions].sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
}

const brandCategories = {
  Acura: ["Lux", "Mid-Market"],
  "Alfa Romeo": ["Lux", "Sport", "Niche"],
  "Aston Martin": ["Exotic", "Lux", "Sport"],
  Audi: ["Lux", "Sport"],
  Bentley: ["Exotic", "Lux"],
  Birkin: ["International", "Niche", "Sport"],
  BMW: ["Lux", "Sport", "Tuner"],
  "BMW Motorrad": ["Motorcycle", "Lux", "Sport", "Rugged"],
  Bugatti: ["Exotic", "Lux", "Sport"],
  BYD: ["International", "EV", "Mass-Market"],
  Buick: ["Mid-Market"],
  Cadillac: ["Lux"],
  Campagna: ["International", "Niche", "Sport"],
  Changan: ["International", "Niche", "EV"],
  Chery: ["International", "Niche"],
  Chevrolet: ["Mass-Market", "Muscle", "Sport", "Commercial"],
  Chrysler: ["Mid-Market"],
  Citroen: ["International", "Niche"],
  Cupra: ["International", "Sport"],
  Dacia: ["International", "Niche"],
  Dongfeng: ["International", "Niche", "EV"],
  DS: ["International", "Lux", "Niche"],
  Dodge: ["Muscle", "Sport", "Niche"],
  ElectraMeccanica: ["International", "EV", "Niche"],
  Ferrari: ["Exotic", "Lux", "Sport"],
  Felino: ["International", "Exotic", "Sport"],
  Fiat: ["Mass-Market", "Niche"],
  Fisker: ["EV", "Lux", "Niche"],
  Ford: ["Mass-Market", "Rugged", "Muscle", "Commercial"],
  Freightliner: ["Commercial", "Rugged"],
  GAC: ["International", "Niche", "EV"],
  GAZ: ["International", "Rugged", "Niche"],
  Geely: ["International", "Niche", "EV"],
  Genesis: ["Lux", "Niche"],
  GMC: ["Rugged", "Mid-Market", "Commercial"],
  "Great Wall": ["International", "Rugged", "Niche"],
  Haval: ["International", "Niche", "Rugged"],
  Hino: ["Commercial", "International", "Rugged"],
  Honda: ["Mass-Market", "Tuner"],
  "Honda Powersports": ["Motorcycle", "Tuner", "Rugged"],
  Hongqi: ["International", "Lux", "EV"],
  Hummer: ["Rugged", "Niche"],
  Hyundai: ["Mass-Market", "Mid-Market"],
  Infiniti: ["Lux", "Mid-Market"],
  International: ["Commercial", "Rugged"],
  Isuzu: ["Rugged", "Niche", "Commercial"],
  Innoson: ["International", "Rugged", "Mass-Market"],
  Iveco: ["International", "Rugged"],
  Jaguar: ["Lux", "Sport", "Niche"],
  Jeep: ["Rugged", "Mass-Market"],
  Karma: ["EV", "Lux", "Niche"],
  Kantanka: ["International", "Rugged", "Niche"],
  Kia: ["Mass-Market", "Mid-Market"],
  Lamborghini: ["Exotic", "Lux", "Sport"],
  Lada: ["International", "Mass-Market", "Rugged"],
  "Land Rover": ["Lux", "Rugged"],
  Lancia: ["International", "Niche"],
  Laraki: ["International", "Exotic", "Sport"],
  Lexus: ["Lux", "Mid-Market"],
  "Li Auto": ["International", "EV", "Lux"],
  Lincoln: ["Lux", "Mid-Market"],
  "Lynk & Co": ["International", "Niche", "Sport"],
  Lotus: ["Niche", "Sport", "Exotic"],
  Lucid: ["EV", "Lux", "Niche"],
  Maserati: ["Lux", "Sport", "Niche"],
  Maybach: ["Exotic", "Lux"],
  Mazda: ["Mass-Market", "Sport"],
  McLaren: ["Exotic", "Lux", "Sport"],
  "Mercedes-Benz": ["Lux", "Sport", "Commercial"],
  Mercury: ["Mid-Market", "Niche"],
  MINI: ["Niche", "Sport"],
  Mitsubishi: ["Niche"],
  "Mitsubishi Fuso": ["Commercial", "International", "Rugged"],
  Mobius: ["International", "Rugged", "Niche"],
  Moskvich: ["International", "Niche", "Rugged"],
  NIO: ["International", "EV", "Lux"],
  Nissan: ["Mass-Market", "Sport", "Tuner", "Commercial"],
  Nord: ["International", "Niche", "Rugged"],
  Oldsmobile: ["Mid-Market", "Niche"],
  Opel: ["International", "Mass-Market"],
  Peugeot: ["International", "Niche"],
  Polestar: ["EV", "Lux", "Niche"],
  Pontiac: ["Muscle", "Sport", "Niche"],
  Porsche: ["Lux", "Sport", "Exotic"],
  Ram: ["Rugged", "Mid-Market", "Commercial"],
  Renault: ["International", "Mass-Market"],
  Rivian: ["EV", "Rugged", "Niche"],
  "Rolls-Royce": ["Exotic", "Lux"],
  Saab: ["Niche", "Sport"],
  Saturn: ["Mid-Market", "Niche"],
  Scion: ["Niche", "Tuner"],
  SEAT: ["International", "Niche", "Sport"],
  Skoda: ["International", "Mass-Market"],
  Smart: ["Niche", "International"],
  Subaru: ["Mass-Market", "Rugged", "Tuner"],
  Suzuki: ["Rugged", "Niche", "International"],
  Tesla: ["EV", "Niche", "Lux"],
  Toyota: ["Mass-Market", "Rugged"],
  UAZ: ["International", "Rugged", "Niche"],
  Vauxhall: ["International", "Niche"],
  Volkswagen: ["Mass-Market", "Tuner"],
  Volvo: ["Lux", "Mid-Market"],
  VUHL: ["International", "Exotic", "Sport"],
  Wallyscar: ["International", "Rugged", "Niche"],
  Wuling: ["International", "EV", "Niche"],
  XPeng: ["International", "EV", "Lux"],
  Xiaomi: ["International", "EV", "Sport"],
  Zacua: ["International", "EV", "Niche"],
  Zeekr: ["International", "EV", "Lux"]
};

const internationalMakes = new Set([
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "Birkin", "BMW", "Bugatti", "BYD", "Campagna", "Changan", "Chery", "Citroen", "Cupra", "Dacia", "Dongfeng", "DS", "ElectraMeccanica", "Ferrari", "Felino", "Fiat", "Fisker", "GAC", "GAZ", "Geely", "Genesis", "Great Wall", "Haval", "Honda", "Hongqi", "Hyundai", "Infiniti", "Innoson", "Isuzu", "Iveco", "Jaguar", "Kantanka", "Kia", "Lada", "Lamborghini", "Land Rover", "Lancia", "Laraki", "Lexus", "Li Auto", "Lotus", "Lucid", "Lynk & Co", "Maserati", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi", "Mobius", "Moskvich", "NIO", "Nissan", "Nord", "Opel", "Peugeot", "Polestar", "Porsche", "Renault", "Rolls-Royce", "Saab", "SEAT", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "UAZ", "Vauxhall", "Volkswagen", "Volvo", "VUHL", "Wallyscar", "Wuling", "XPeng", "Xiaomi", "Zacua", "Zeekr"
]);

for (const make of internationalMakes) {
  if (!brandCategories[make]) brandCategories[make] = ["International"];
  if (!brandCategories[make].includes("International")) brandCategories[make].push("International");
}

const modelFirstYears = {
  "Acura::ADX": 2025,
  "Audi::A6 e-tron": 2025,
  "Audi::Q4 e-tron": 2022,
  "Audi::Q6 e-tron": 2025,
  "Audi::SQ6 e-tron": 2025,
  "BMW::i4": 2022,
  "BMW::i5": 2024,
  "BMW::i7": 2023,
  "BMW::iX": 2022,
  "BMW::XM": 2023,
  "Cadillac::CELESTIQ": 2024,
  "Cadillac::Escalade IQ": 2025,
  "Cadillac::LYRIQ": 2023,
  "Cadillac::OPTIQ": 2025,
  "Cadillac::VISTIQ": 2026,
  "Chevrolet::Blazer EV": 2024,
  "Chevrolet::Bolt EUV": 2022,
  "Chevrolet::Corvette E-Ray": 2024,
  "Chevrolet::Corvette ZR1X": 2026,
  "Chevrolet::Equinox EV": 2024,
  "Chevrolet::Silverado EV": 2024,
  "Dodge::Charger": 2024,
  "Dodge::Hornet": 2023,
  "Fiat::500X": 2016,
  "Fisker::Ocean": 2023,
  "Ford::Bronco Sport": 2021,
  "Ford::E-Series Cutaway": 2026,
  "Ford::E-Transit Cargo Van": 2022,
  "Ford::Maverick": 2022,
  "Ford::Mustang Mach-E": 2021,
  "Ford::Transit Cargo Van": 2015,
  "Genesis::GV60": 2023,
  "Genesis::GV70": 2022,
  "Genesis::GV80": 2021,
  "Genesis::GV80 Coupe": 2025,
  "GMC::Hummer EV Pickup": 2022,
  "GMC::Hummer EV SUV": 2024,
  "GMC::Sierra EV": 2024,
  "Honda::HR-V": 2016,
  "Honda::Prologue": 2024,
  "Hyundai::Ioniq": 2017,
  "Hyundai::Ioniq 5": 2022,
  "Hyundai::Ioniq 6": 2023,
  "Hyundai::Kona": 2018,
  "Hyundai::Nexo": 2019,
  "Hyundai::Palisade": 2020,
  "Hyundai::Palisade Hybrid": 2026,
  "Hyundai::Santa Cruz": 2022,
  "Hyundai::Santa Fe Hybrid": 2021,
  "Hyundai::Tucson Hybrid": 2022,
  "Hyundai::Venue": 2020,
  "Jaguar::E-PACE": 2018,
  "Jaguar::F-PACE": 2017,
  "Jaguar::F-TYPE": 2014,
  "Jaguar::I-PACE": 2019,
  "Jeep::Gladiator": 2020,
  "Jeep::Renegade": 2015,
  "Jeep::Wagoneer": 2022,
  "Jeep::Grand Wagoneer": 2022,
  "Kia::Carnival": 2022,
  "Kia::Carnival Hybrid": 2025,
  "Kia::EV3": 2025,
  "Kia::EV4": 2026,
  "Kia::EV5": 2026,
  "Kia::EV6": 2022,
  "Kia::EV9": 2024,
  "Kia::K4": 2025,
  "Kia::K5": 2021,
  "Kia::Seltos": 2021,
  "Kia::Sorento Hybrid": 2021,
  "Kia::Sportage Hybrid": 2023,
  "Kia::Telluride": 2020,
  "Lamborghini::Revuelto": 2024,
  "Lamborghini::Urus": 2019,
  "Land Rover::Range Rover Velar": 2018,
  "Lexus::RZ": 2023,
  "Lexus::TX": 2024,
  "Lucid::Air": 2022,
  "Lucid::Gravity": 2025,
  "Mazda::CX-30": 2020,
  "Mazda::CX-50": 2023,
  "Mazda::CX-70": 2025,
  "Mazda::CX-90": 2024,
  "Mercedes-Benz::CLE": 2024,
  "Mercedes-Benz::EQB": 2022,
  "Mercedes-Benz::EQE": 2023,
  "Mercedes-Benz::EQE SUV": 2023,
  "Mercedes-Benz::EQS": 2022,
  "Mercedes-Benz::EQS SUV": 2023,
  "Mercedes-Benz::GLC Coupe": 2024,
  "Mercedes-Benz::GLE Coupe": 2021,
  "Mercedes-Benz::Maybach GLS": 2021,
  "Mercedes-Benz::eSprinter Cargo Van": 2024,
  "Nissan::Ariya": 2023,
  "Nissan::Rogue Plug-in Hybrid": 2026,
  "Polestar::2": 2021,
  "Polestar::3": 2025,
  "Polestar::4": 2025,
  "Porsche::Taycan": 2020,
  "Rivian::R1S": 2022,
  "Rivian::R1T": 2022,
  "Rolls-Royce::Spectre": 2024,
  "Ram::1500 Ramcharger": 2026,
  "Ram::1500 REV": 2026,
  "Ram::ProMaster EV Cargo Van": 2024,
  "Subaru::Ascent": 2019,
  "Subaru::Crosstrek Hybrid": 2026,
  "Subaru::Forester Hybrid": 2025,
  "Subaru::Solterra": 2023,
  "Subaru::Trailseeker": 2026,
  "Subaru::Uncharted": 2026,
  "Tesla::Cybertruck": 2024,
  "Tesla::Model 3": 2017,
  "Tesla::Model X": 2016,
  "Tesla::Model Y": 2020,
  "Toyota::bZ4X": 2023,
  "Toyota::Corolla Cross": 2022,
  "Toyota::Crown": 2023,
  "Toyota::Crown Signia": 2025,
  "Toyota::GR Corolla": 2023,
  "Toyota::Grand Highlander": 2024,
  "Volkswagen::Atlas": 2018,
  "Volkswagen::ID.4": 2021,
  "Volkswagen::ID. Buzz": 2025,
  "Volkswagen::Taos": 2022,
  "Volvo::C40 Recharge": 2022,
  "Volvo::EX30": 2025,
  "Volvo::EX90": 2025,
  "Volvo::XC40": 2019,
  "Volvo::XC40 Recharge": 2021
};

const modelLastYears = {
  "Acura::CL": 2003,
  "Acura::ILX": 2022,
  "Acura::Legend": 1995,
  "Acura::RL": 2012,
  "Acura::RLX": 2020,
  "Acura::RSX": 2006,
  "Acura::TL": 2014,
  "Acura::TLX": 2025,
  "Acura::TSX": 2014,
  "Acura::ZDX": 2025,
  "Audi::A4": 2025,
  "Audi::A7": 2025,
  "Audi::e-tron": 2023,
  "Audi::Q8 e-tron": 2025,
  "Audi::R8": 2023,
  "Audi::S7": 2025,
  "Audi::TT": 2023,
  "BMW::i3": 2021,
  "BMW::i8": 2020,
  "BMW::X4": 2025,
  "BMW::Z3": 2002,
  "BMW::Z4": 2026,
  "Buick::Cascada": 2019,
  "Buick::Century": 2005,
  "Buick::LaCrosse": 2019,
  "Buick::LeSabre": 2005,
  "Buick::Lucerne": 2011,
  "Buick::Park Avenue": 2005,
  "Buick::Rainier": 2007,
  "Buick::Regal": 2020,
  "Buick::Rendezvous": 2007,
  "Buick::Terraza": 2007,
  "Buick::Verano": 2017,
  "Cadillac::ATS": 2019,
  "Cadillac::CT4": 2026,
  "Cadillac::CT5": 2026,
  "Cadillac::CT6": 2020,
  "Cadillac::CTS": 2019,
  "Cadillac::DeVille": 2005,
  "Cadillac::DTS": 2011,
  "Cadillac::ELR": 2016,
  "Cadillac::SRX": 2016,
  "Cadillac::STS": 2011,
  "Cadillac::XLR": 2009,
  "Cadillac::XT4": 2025,
  "Cadillac::XT6": 2025,
  "Cadillac::XTS": 2019,
  "Chevrolet::Astro": 2005,
  "Chevrolet::Astro Cargo Van": 2005,
  "Chevrolet::Avalanche": 2013,
  "Chevrolet::Aveo": 2011,
  "Chevrolet::Caprice": 2017,
  "Chevrolet::Cavalier": 2005,
  "Chevrolet::Cobalt": 2010,
  "Chevrolet::Cruze": 2019,
  "Chevrolet::HHR": 2011,
  "Chevrolet::Impala": 2020,
  "Chevrolet::Malibu": 2025,
  "Chevrolet::Monte Carlo": 2007,
  "Chevrolet::Sonic": 2020,
  "Chevrolet::Spark": 2022,
  "Chevrolet::SSR": 2006,
  "Chevrolet::Uplander": 2008,
  "Chevrolet::Volt": 2019,
  "Chrysler::200": 2017,
  "Chrysler::300": 2023,
  "Chrysler::Aspen": 2009,
  "Chrysler::Crossfire": 2008,
  "Chrysler::PT Cruiser": 2010,
  "Chrysler::Sebring": 2010,
  "Chrysler::Town & Country": 2016,
  "Chrysler::Voyager": 2024,
  "Dodge::Avenger": 2014,
  "Dodge::Caliber": 2012,
  "Dodge::Challenger": 2023,
  "Dodge::Charger": 2027,
  "Dodge::Dart": 2016,
  "Dodge::Grand Caravan": 2020,
  "Dodge::Hornet": 2025,
  "Dodge::Journey": 2020,
  "Dodge::Magnum": 2008,
  "Dodge::Neon": 2005,
  "Dodge::Nitro": 2011,
  "Dodge::Ram 1500": 2009,
  "Dodge::Ram 2500": 2009,
  "Dodge::Ram 3500": 2009,
  "Dodge::Sprinter": 2009,
  "Dodge::Sprinter Cargo Van": 2009,
  "Dodge::Viper": 2017,
  "Ford::C-Max": 2018,
  "Ford::Contour": 2000,
  "Ford::Crown Victoria": 2011,
  "Ford::E-150 Cargo Van": 2014,
  "Ford::E-250 Cargo Van": 2014,
  "Ford::E-350 Cargo Van": 2014,
  "Ford::EcoSport": 2022,
  "Ford::Edge": 2024,
  "Ford::Escape": 2025,
  "Ford::Excursion": 2005,
  "Ford::Fiesta": 2019,
  "Ford::Five Hundred": 2007,
  "Ford::Flex": 2019,
  "Ford::Focus": 2018,
  "Ford::Freestar": 2007,
  "Ford::Freestyle": 2007,
  "Ford::Fusion": 2020,
  "Ford::Taurus": 2019,
  "Ford::Thunderbird": 2005,
  "Ford::Transit Connect": 2023,
  "Ford::Transit Connect Cargo Van": 2023,
  "Freightliner::Sprinter Cargo Van": 2021,
  "Hummer::H1": 2006,
  "Hummer::H2": 2009,
  "Hummer::H3": 2010,
  "Hyundai::Accent": 2022,
  "Hyundai::Azera": 2017,
  "Hyundai::Entourage": 2008,
  "Hyundai::Equus": 2016,
  "Hyundai::Genesis": 2016,
  "Hyundai::Ioniq": 2022,
  "Hyundai::Ioniq 6": 2026,
  "Hyundai::Kona Electric": 2026,
  "Hyundai::Tiburon": 2008,
  "Hyundai::Veloster": 2022,
  "Hyundai::Veracruz": 2012,
  "Infiniti::EX": 2013,
  "Infiniti::FX": 2013,
  "Infiniti::G": 2013,
  "Infiniti::I": 2004,
  "Infiniti::JX": 2013,
  "Infiniti::M": 2013,
  "Infiniti::Q40": 2015,
  "Infiniti::Q45": 2006,
  "Infiniti::Q70": 2019,
  "Infiniti::QX30": 2019,
  "Infiniti::QX4": 2003,
  "Infiniti::QX50": 2025,
  "Infiniti::QX55": 2025,
  "Infiniti::QX56": 2013,
  "Infiniti::QX70": 2017,
  "Isuzu::Ascender": 2008,
  "Isuzu::Axiom": 2004,
  "Isuzu::i-Series": 2008,
  "Isuzu::Rodeo": 2004,
  "Isuzu::Trooper": 2002,
  "Isuzu::VehiCROSS": 2001,
  "Jaguar::E-PACE": 2024,
  "Jaguar::F-PACE": 2025,
  "Jaguar::F-TYPE": 2024,
  "Jaguar::I-PACE": 2024,
  "Jaguar::S-Type": 2008,
  "Jaguar::X-Type": 2008,
  "Jaguar::XE": 2020,
  "Jaguar::XF": 2024,
  "Jaguar::XJ": 2019,
  "Jaguar::XK": 2015,
  "Jeep::Commander": 2010,
  "Jeep::Liberty": 2012,
  "Jeep::Patriot": 2017,
  "Jeep::Renegade": 2023,
  "Jeep::Wagoneer": 2025,
  "Jeep::Grand Wagoneer": 2025,
  "Kia::Amanti": 2009,
  "Kia::Borrego": 2009,
  "Kia::Cadenza": 2020,
  "Kia::K900": 2020,
  "Kia::Niro EV": 2025,
  "Kia::Optima": 2020,
  "Kia::Rio": 2023,
  "Kia::Rondo": 2010,
  "Kia::Sedona": 2021,
  "Kia::Soul": 2025,
  "Kia::Soul EV": 2019,
  "Kia::Spectra": 2009,
  "Kia::Stinger": 2023,
  "Lexus::CT": 2017,
  "Lexus::GS": 2020,
  "Lexus::HS": 2012,
  "Lexus::LC": 2026,
  "Lexus::LFA": 2012,
  "Lexus::RC": 2025,
  "Lexus::SC": 2010,
  "Lincoln::Blackwood": 2002,
  "Lincoln::Continental": 2020,
  "Lincoln::LS": 2006,
  "Lincoln::Mark LT": 2008,
  "Lincoln::MKS": 2016,
  "Lincoln::MKT": 2019,
  "Lincoln::MKX": 2018,
  "Lincoln::MKZ": 2020,
  "Lincoln::Town Car": 2011,
  "Lincoln::Zephyr": 2006,
  "Lotus::Elise": 2011,
  "Lotus::Esprit": 2004,
  "Lotus::Evora": 2021,
  "Lotus::Exige": 2011,
  "Maserati::Ghibli": 2024,
  "Maserati::Quattroporte": 2024,
  "Mazda::2": 2014,
  "Mazda::5": 2015,
  "Mazda::6": 2021,
  "Mazda::CX-3": 2021,
  "Mazda::CX-7": 2012,
  "Mazda::CX-9": 2023,
  "Mazda::Mazdaspeed3": 2013,
  "Mazda::Millenia": 2002,
  "Mazda::MPV": 2006,
  "Mazda::MX-30": 2023,
  "Mazda::Protege": 2003,
  "Mazda::RX-8": 2011,
  "Mazda::Tribute": 2011,
  "Mercedes-Benz::B-Class": 2017,
  "Mercedes-Benz::CLK": 2009,
  "Mercedes-Benz::CLS": 2023,
  "Mercedes-Benz::EQB": 2025,
  "Mercedes-Benz::GL-Class": 2016,
  "Mercedes-Benz::GLK": 2015,
  "Mercedes-Benz::M-Class": 2015,
  "Mercedes-Benz::Metris Cargo Van": 2023,
  "Mercedes-Benz::R-Class": 2012,
  "Mercedes-Benz::SLC": 2020,
  "Mercedes-Benz::SLK": 2016,
  "Mercedes-Benz::SLS AMG": 2015,
  "Mercury::Cougar": 2002,
  "Mercury::Grand Marquis": 2011,
  "Mercury::Marauder": 2004,
  "Mercury::Mariner": 2011,
  "Mercury::Milan": 2011,
  "Mercury::Montego": 2007,
  "Mercury::Monterey": 2007,
  "Mercury::Mountaineer": 2010,
  "Mercury::Sable": 2009,
  "MINI::Clubman": 2024,
  "MINI::Coupe": 2015,
  "MINI::Paceman": 2016,
  "MINI::Roadster": 2015,
  "Mitsubishi::Diamante": 2004,
  "Mitsubishi::Eclipse": 2012,
  "Mitsubishi::Endeavor": 2011,
  "Mitsubishi::Galant": 2012,
  "Mitsubishi::i-MiEV": 2017,
  "Mitsubishi::Lancer": 2017,
  "Mitsubishi::Montero": 2006,
  "Mitsubishi::Raider": 2009,
  "Nissan::350Z": 2009,
  "Nissan::370Z": 2020,
  "Nissan::Altima": 2025,
  "Nissan::Ariya": 2025,
  "Nissan::Cube": 2014,
  "Nissan::GT-R": 2024,
  "Nissan::Juke": 2017,
  "Nissan::Kicks Play": 2025,
  "Nissan::Maxima": 2023,
  "Nissan::NV": 2021,
  "Nissan::NV Cargo Van": 2021,
  "Nissan::NV200 Compact Cargo Van": 2021,
  "Nissan::Quest": 2017,
  "Nissan::Rogue Sport": 2022,
  "Nissan::Titan": 2024,
  "Nissan::Versa": 2025,
  "Nissan::Xterra": 2015,
  "Oldsmobile::Alero": 2004,
  "Oldsmobile::Aurora": 2003,
  "Oldsmobile::Bravada": 2004,
  "Oldsmobile::Silhouette": 2004,
  "Polestar::1": 2021,
  "Pontiac::Aztek": 2005,
  "Pontiac::Bonneville": 2005,
  "Pontiac::G3": 2010,
  "Pontiac::G5": 2010,
  "Pontiac::G6": 2010,
  "Pontiac::G8": 2009,
  "Pontiac::Grand Am": 2005,
  "Pontiac::Grand Prix": 2008,
  "Pontiac::GTO": 2006,
  "Pontiac::Montana": 2006,
  "Pontiac::Solstice": 2010,
  "Pontiac::Sunfire": 2005,
  "Pontiac::Torrent": 2009,
  "Pontiac::Vibe": 2010,
  "Porsche::718 Boxster": 2026,
  "Porsche::718 Cayman": 2026,
  "Porsche::Boxster": 2016,
  "Porsche::Carrera GT": 2006,
  "Porsche::Cayman": 2016,
  "Porsche::Macan": 2026,
  "Saab::9-2X": 2006,
  "Saab::9-3": 2011,
  "Saab::9-4X": 2011,
  "Saab::9-5": 2011,
  "Saab::9-7X": 2009,
  "Saturn::Astra": 2009,
  "Saturn::Aura": 2010,
  "Saturn::Ion": 2007,
  "Saturn::L-Series": 2005,
  "Saturn::Outlook": 2010,
  "Saturn::Relay": 2007,
  "Saturn::S-Series": 2002,
  "Saturn::Sky": 2010,
  "Saturn::Vue": 2010,
  "Scion::FR-S": 2016,
  "Scion::iA": 2016,
  "Scion::iM": 2016,
  "Scion::iQ": 2015,
  "Scion::tC": 2016,
  "Scion::xA": 2006,
  "Scion::xB": 2015,
  "Scion::xD": 2014,
  "Smart::fortwo": 2019,
  "Smart::fortwo electric drive": 2019,
  "Subaru::Baja": 2006,
  "Subaru::Legacy": 2025,
  "Subaru::Tribeca": 2014,
  "Suzuki::Aerio": 2007,
  "Suzuki::Equator": 2012,
  "Suzuki::Forenza": 2008,
  "Suzuki::Grand Vitara": 2013,
  "Suzuki::Kizashi": 2013,
  "Suzuki::Reno": 2008,
  "Suzuki::SX4": 2013,
  "Suzuki::Verona": 2006,
  "Suzuki::Vitara": 2004,
  "Suzuki::XL7": 2009,
  "Tesla::Model S": 2026,
  "Tesla::Model X": 2026,
  "Toyota::86": 2020,
  "Toyota::Avalon": 2022,
  "Toyota::C-HR": 2022,
  "Toyota::Celica": 2005,
  "Toyota::FJ Cruiser": 2014,
  "Toyota::GR Supra": 2026,
  "Toyota::Land Cruiser": 2021,
  "Toyota::Matrix": 2013,
  "Toyota::Prius c": 2019,
  "Toyota::Prius v": 2017,
  "Toyota::Solara": 2008,
  "Toyota::Venza": 2024,
  "Toyota::Yaris": 2020,
  "Volkswagen::Arteon": 2024,
  "Volkswagen::Beetle": 2019,
  "Volkswagen::CC": 2017,
  "Volkswagen::e-Golf": 2019,
  "Volkswagen::Eos": 2016,
  "Volkswagen::Golf Alltrack": 2019,
  "Volkswagen::Golf R": 2024,
  "Volkswagen::ID. Buzz": 2025,
  "Volkswagen::Passat": 2022,
  "Volkswagen::Phaeton": 2006,
  "Volkswagen::Rabbit": 2009,
  "Volkswagen::Routan": 2014,
  "Volkswagen::Touareg": 2017,
  "Volvo::C30": 2013,
  "Volvo::C70": 2013,
  "Volvo::S40": 2011,
  "Volvo::S80": 2016,
  "Volvo::S90": 2025,
  "Volvo::V50": 2011,
  "Volvo::V60": 2025,
  "Volvo::V70": 2010,
  "Volvo::XC70": 2016
};

const vehicleProfiles = mergeProfiles(curatedVehicleProfiles, coverageEntries());

const antiqueModelCatalog = {
  Acura: "Integra|compact-sedan|16500|1986|2001, Legend|midsize-sedan|12100|1986|1995, NSX|luxury|89000|1991|2001",
  AMC: "AMX|compact-sedan|38500|1968|1970, Ambassador|midsize-sedan|15200|1958|1974, Eagle|compact-suv|14200|1980|1988, Gremlin|compact-sedan|12300|1970|1978, Javelin|compact-sedan|34200|1968|1974, Pacer|compact-sedan|12100|1975|1980",
  "Alfa Romeo": "Giulia Sprint|compact-sedan|42000|1962|1978, Spider|compact-sedan|22800|1966|1994, GTV|compact-sedan|39200|1965|1986",
  "Aston Martin": "DB4|luxury|515000|1958|1963, DB5|luxury|925000|1963|1965, DB6|luxury|347000|1965|1970, V8 Vantage|luxury|168000|1977|1989",
  Audi: "100|midsize-sedan|11800|1968|1994, 4000|compact-sedan|9400|1980|1987, 5000|midsize-sedan|8900|1978|1988, Quattro|compact-sedan|69000|1980|1991",
  BMW: "2002|compact-sedan|31500|1968|1976, 3 Series E30|compact-sedan|23800|1982|1991, 5 Series E28|midsize-sedan|14200|1981|1988, 6 Series E24|luxury|28600|1976|1989, 7 Series E38|luxury|16400|1995|2001, Z3|compact-sedan|12600|1996|2001",
  Buick: "Century|midsize-sedan|13900|1936|2001, Electra|midsize-sedan|16200|1959|1990, Grand National|midsize-sedan|61500|1982|1987, LeSabre|midsize-sedan|11800|1959|2001, Riviera|luxury|28400|1963|1999, Roadmaster|midsize-sedan|17600|1936|1996, Skylark|compact-sedan|18100|1953|1998",
  Cadillac: "DeVille|luxury|18800|1959|2001, Eldorado|luxury|26200|1953|2001, Fleetwood|luxury|21300|1947|1996, Seville|luxury|14300|1975|1997",
  Chevrolet: "Bel Air|midsize-sedan|39200|1950|1975, Blazer K5|midsize-suv|34600|1969|1994, C/K Pickup|pickup|28400|1960|1998, Camaro|compact-sedan|35900|1967|2001, Caprice|midsize-sedan|14200|1966|1996, Chevelle|midsize-sedan|48200|1964|1977, Chevy II Nova|compact-sedan|31900|1962|1979, Corvette|luxury|54400|1953|2001, El Camino|pickup|31500|1959|1987, Impala|midsize-sedan|27100|1958|2001, Monte Carlo|midsize-sedan|21900|1970|1988, Suburban|midsize-suv|22600|1935|2001, Tahoe|midsize-suv|13200|1995|2001",
  Chrysler: "300 Letter Series|luxury|76200|1955|1965, Imperial|luxury|28100|1955|1993, LeBaron|midsize-sedan|9100|1977|1995, New Yorker|luxury|16700|1939|1996, Newport|midsize-sedan|12400|1940|1981, Town & Country|midsize-suv|9600|1941|2001",
  Datsun: "240Z|compact-sedan|44500|1970|1973, 260Z|compact-sedan|28600|1974|1974, 280Z|compact-sedan|26200|1975|1978, 510|compact-sedan|19800|1968|1973, Roadster|compact-sedan|24800|1963|1970",
  Dodge: "Challenger|compact-sedan|49200|1970|1974, Charger|midsize-sedan|45800|1966|1978, Coronet|midsize-sedan|26100|1949|1976, Dart|compact-sedan|19600|1960|1976, Power Wagon|pickup|38600|1946|1980, Ram Van|cargo-van|10600|1971|2001, Ramcharger|midsize-suv|21900|1974|1993, Viper|luxury|69200|1992|2001",
  Ferrari: "250 GT|luxury|1650000|1954|1964, 308|luxury|81500|1975|1985, 328|luxury|107000|1985|1989, 348|luxury|82000|1989|1995, Testarossa|luxury|173000|1984|1991",
  Fiat: "124 Spider|compact-sedan|15200|1966|1985, 500|compact-sedan|18200|1957|1975, X1/9|compact-sedan|11200|1972|1989",
  Ford: "Bronco|midsize-suv|42600|1966|1996, Crown Victoria|midsize-sedan|9100|1992|2001, E-Series Van|cargo-van|11200|1961|2001, F-100|pickup|28600|1953|1983, F-Series|pickup|19600|1948|2001, Fairlane|midsize-sedan|22100|1955|1970, Falcon|compact-sedan|18200|1960|1970, Galaxie|midsize-sedan|24600|1959|1974, Model A|compact-sedan|26800|1928|1931, Model T|compact-sedan|18400|1908|1927, Mustang|compact-sedan|31600|1965|2001, Ranchero|pickup|21900|1957|1979, Taurus SHO|midsize-sedan|11900|1989|1999, Thunderbird|luxury|23700|1955|1997, Torino|midsize-sedan|25400|1968|1976",
  GMC: "C/K Pickup|pickup|24400|1960|1998, Jimmy|midsize-suv|23400|1970|1991, Safari Cargo Van|cargo-van|7800|1985|2001, Suburban|midsize-suv|21300|1937|1999, Vandura|cargo-van|10300|1964|1996",
  Honda: "Accord|midsize-sedan|9200|1976|2001, Civic|compact-sedan|11800|1973|2001, CRX|compact-sedan|18100|1984|1991, Prelude|compact-sedan|14200|1979|2001, S600|compact-sedan|28600|1964|1966, S800|compact-sedan|31200|1966|1970",
  Jaguar: "E-Type|luxury|112000|1961|1975, Mark 2|luxury|34800|1959|1967, XJ|luxury|16600|1968|2001, XJS|luxury|18400|1975|1996, XK120|luxury|132000|1948|1954",
  Jeep: "CJ|midsize-suv|22600|1945|1986, Cherokee XJ|compact-suv|15400|1984|2001, Grand Wagoneer|midsize-suv|48200|1984|1991, Wagoneer|midsize-suv|31900|1963|1991, Wrangler YJ|midsize-suv|14200|1987|1995, Wrangler TJ|midsize-suv|16400|1997|2001",
  "Land Rover": "Defender|luxury|62100|1983|2001, Range Rover Classic|luxury|29400|1970|1995, Series I|midsize-suv|33800|1948|1958, Series II|midsize-suv|27100|1958|1971, Series III|midsize-suv|24600|1971|1985",
  Lexus: "LS|luxury|12600|1990|2001, SC|luxury|15400|1992|2001",
  Lincoln: "Continental|luxury|22600|1939|2001, Mark Series|luxury|21700|1956|1998, Town Car|luxury|11200|1981|2001",
  Mazda: "Miata NA|compact-sedan|13600|1990|1997, Miata NB|compact-sedan|11800|1999|2001, RX-2|compact-sedan|16200|1970|1978, RX-3|compact-sedan|18400|1971|1978, RX-7|compact-sedan|28600|1979|1995",
  "Mercedes-Benz": "190E|luxury|14600|1984|1993, 300SL|luxury|1420000|1954|1963, E-Class W124|luxury|13800|1986|1995, G-Class|luxury|51200|1979|2001, S-Class W126|luxury|18400|1979|1991, SL R107|luxury|28600|1971|1989, SL R129|luxury|21600|1990|2001",
  Mercury: "Comet|compact-sedan|18400|1960|1977, Cougar|compact-sedan|22600|1967|1997, Grand Marquis|midsize-sedan|8200|1975|2001, Marauder|midsize-sedan|19800|1963|1970, Monterey|midsize-sedan|15200|1952|1974",
  MG: "MGA|compact-sedan|31800|1955|1962, MGB|compact-sedan|17600|1962|1980, Midget|compact-sedan|10800|1961|1979, TD|compact-sedan|22600|1950|1953",
  Nissan: "300ZX|compact-sedan|28600|1984|1996, Maxima|midsize-sedan|9200|1981|2001, Pathfinder|midsize-suv|9400|1987|2001, Skyline GT-R|compact-sedan|112000|1969|1999, Z|compact-sedan|25200|1979|2001",
  Oldsmobile: "442|midsize-sedan|42500|1964|1987, Cutlass|midsize-sedan|18600|1961|1999, Delta 88|midsize-sedan|12600|1949|1999, Toronado|luxury|17200|1966|1992",
  Plymouth: "Barracuda|compact-sedan|65500|1964|1974, Belvedere|midsize-sedan|18600|1954|1970, Duster|compact-sedan|22400|1970|1976, Fury|midsize-sedan|15200|1956|1978, Road Runner|midsize-sedan|58400|1968|1980",
  Pontiac: "Bonneville|midsize-sedan|16400|1958|2001, Firebird|compact-sedan|28600|1967|2001, GTO|midsize-sedan|61200|1964|1974, Grand Prix|midsize-sedan|15400|1962|2001, LeMans|midsize-sedan|22600|1962|1981, Trans Am|compact-sedan|39400|1969|2001",
  Porsche: "356|luxury|96000|1948|1965, 911|luxury|82500|1964|2001, 914|compact-sedan|24600|1969|1976, 924|compact-sedan|11800|1976|1988, 928|luxury|28600|1978|1995, 944|compact-sedan|18200|1982|1991",
  "Rolls-Royce": "Corniche|luxury|71500|1971|1995, Phantom|luxury|112000|1925|1991, Silver Cloud|luxury|48600|1955|1966, Silver Shadow|luxury|26800|1965|1980, Silver Spur|luxury|23400|1980|1998",
  Saab: "900|compact-sedan|14200|1978|1998, 96|compact-sedan|9800|1960|1980, Sonett|compact-sedan|24800|1955|1974",
  Toyota: "2000GT|luxury|875000|1967|1970, Celica|compact-sedan|18400|1971|2001, Corolla|compact-sedan|10200|1966|2001, FJ40 Land Cruiser|midsize-suv|45800|1960|1984, MR2|compact-sedan|17200|1985|1995, Pickup|pickup|16800|1968|1995, Supra|compact-sedan|48600|1979|1998",
  Volkswagen: "Beetle|compact-sedan|15600|1938|1979, Bus Type 2|midsize-suv|39500|1950|1979, Cabriolet|compact-sedan|9800|1979|1993, Corrado|compact-sedan|13200|1990|1995, Golf GTI Mk1|compact-sedan|21800|1976|1984, Karmann Ghia|compact-sedan|27600|1955|1974, Vanagon|midsize-suv|24600|1980|1991",
  Volvo: "122 Amazon|midsize-sedan|16200|1956|1970, 1800|compact-sedan|38200|1961|1973, 240|midsize-sedan|11800|1974|1993, 740|midsize-sedan|7800|1984|1992, 850|midsize-sedan|9200|1992|1997"
};

function antiqueEntries() {
  return Object.entries(antiqueModelCatalog).flatMap(([make, rawModels]) => rawModels.split(",").map((entry) => {
    const [model, segment, base, firstYear, lastYear] = entry.trim().split("|");
    const lane = modelLaneFromText(`${model} Antique benchmark`);
    const categoryTags = [
      "Antique",
      segment === "cargo-van" ? "Commercial" : "",
      lane.includes("Muscle") ? "Muscle" : "",
      lane.includes("Tuner") ? "Tuner" : "",
      lane.includes("Sport") ? "Sport" : "",
      lane.includes("Rugged") ? "Rugged" : "",
      lane.includes("Exotic") ? "Exotic" : "",
      lane,
      ...(brandCategories[make] || [])
    ].filter(Boolean);
    return {
      id: `${slug(make)}-${slug(model)}-antique`,
      make,
      model,
      trimName: "Antique benchmark",
      segment,
      usedBase: Number(base),
      newBase: 0,
      firstYear: Number(firstYear),
      lastYear: Math.min(Number(lastYear), antiqueCutoffYear),
      categories: [...new Set(categoryTags)]
    };
  }));
}

const antiqueVehicleProfiles = antiqueEntries()
  .filter((profile) => profile.firstYear <= antiqueCutoffYear)
  .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));

const catalogAudit = validateCatalogIntegrity();
const expectedCatalogSignature = computeCatalogSignature([...vehicleProfiles, ...antiqueVehicleProfiles]);
Object.freeze(vehicleProfiles);
Object.freeze(antiqueVehicleProfiles);

function activeProfilePool(vehicleType = document.getElementById("vehicleType")?.value || "used") {
  return vehicleType === "antique" ? antiqueVehicleProfiles : vehicleProfiles;
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function clampControlValue(control) {
  if (!control || control.type !== "range") return "ok";
  const min = Number(control.min);
  const max = Number(control.max);
  const before = control.value;
  control.value = String(clampNumber(control.value, min, max, min));
  return before === control.value ? "ok" : "clamped";
}

function sanitizeSelectValue(select) {
  if (!select || !select.options.length) return "empty";
  const hasValue = [...select.options].some((option) => option.value === select.value);
  if (hasValue) return "ok";
  select.value = select.options[0].value;
  return "recovered";
}

function resolveSafeProfile(profileId, vehicleType = document.getElementById("vehicleType")?.value || "used") {
  const pool = activeProfilePool(vehicleType);
  return pool.find((profile) => profile.id === profileId) || pool[0] || vehicleProfiles[0];
}

function computeCatalogSignature(profiles) {
  const seed = profiles.map((profile) => `${profile.id}:${profile.make}:${profile.model}:${profile.segment}`).join("|");
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function checkDuplicateIds(profiles) {
  const seen = new Set();
  const duplicates = [];
  profiles.forEach((profile) => {
    if (seen.has(profile.id)) duplicates.push(profile.id);
    seen.add(profile.id);
  });
  return duplicates;
}

function validateSegmentKeys(profiles) {
  return profiles.filter((profile) => !segments[profile.segment]).map((profile) => profile.id);
}

function validateYearBounds(profiles) {
  return profiles.filter((profile) => {
    if (profile.trimName === "Antique benchmark") return profile.firstYear > profile.lastYear || profile.lastYear > antiqueCutoffYear;
    const lastYear = modelLastYears[`${profile.make}::${profile.model}`];
    return Boolean(lastYear && lastYear < earliestModelYear);
  }).map((profile) => profile.id);
}

function validateCatalogIntegrity() {
  const allProfiles = [...vehicleProfiles, ...antiqueVehicleProfiles];
  const duplicateIds = checkDuplicateIds(allProfiles);
  const missingSegments = validateSegmentKeys(allProfiles);
  const yearIssues = validateYearBounds(allProfiles);
  const missingCategories = allProfiles.filter((profile) => !profileCategoryLabels(profile).length).map((profile) => profile.id);
  return {
    ok: duplicateIds.length === 0 && missingSegments.length === 0 && yearIssues.length === 0 && missingCategories.length === 0,
    duplicateIds,
    missingSegments,
    yearIssues,
    missingCategories,
    profileCount: allProfiles.length,
    antiqueCount: antiqueVehicleProfiles.length
  };
}

function getDataFreshness() {
  return `Reviewed through May 2026; ${currentYear} runtime`;
}

function auditEstimateInputs(values) {
  const yearBounds = profileYearBounds(values.profile, values.vehicleType);
  const issues = [];
  if (values.modelYear < yearBounds.min || values.modelYear > yearBounds.max) issues.push("year");
  if (!segments[values.segment]) issues.push("segment");
  if (!Number.isFinite(values.profile.usedBase) || values.profile.usedBase <= 0) issues.push("base");
  if (values.vehicleType === "new" && !isCurrentProduction(values.profile)) issues.push("production");
  return {
    ok: issues.length === 0,
    issues,
    yearBounds
  };
}

function estimateVolatility(values, result) {
  if (values.vehicleType === "antique") return "Collector-sensitive";
  if (result.marketPressure === "Hot" || values.demand.key === "hot") return "High";
  if (values.history.key !== "clean" || values.condition.key !== "good") return "Medium";
  return "Normal";
}

function calculateLiquidity(values) {
  if (values.vehicleType === "antique") return "Specialist buyer pool";
  if (["Toyota", "Honda", "Ford", "Chevrolet", "Nissan"].includes(values.make)) return "Broad buyer pool";
  if ((profileCategoryLabels(values.profile) || []).includes("Exotic")) return "Thin buyer pool";
  return "Moderate buyer pool";
}

function calculateOwnershipRisk(values) {
  if (values.ownerCount.key === "five-plus" || values.fleetUse) return "Elevated";
  if (values.history.key === "major" || values.history.key === "unknown") return "Review";
  return "Normal";
}

function failsafeResult(values, audit) {
  if (audit.ok) return null;
  const base = Math.max(3500, Number(values.profile.usedBase || segments[values.segment]?.usedBase || 15000));
  return {
    segment: segments[values.segment] || segments["midsize-sedan"],
    base,
    benchmark: base,
    netAdjustment: 0,
    taxFeeReserve: base * 0.08,
    outTheDoor: base * 1.08,
    monthlyPayment: base * 0.024,
    costPerMile: base / Math.max(12000, values.mileage || 12000),
    auctionReserve: 0,
    transportReserve: 0,
    storageReserve: 0,
    originalitySignal: "Fail-safe",
    provenanceSignal: "Fail-safe",
    restorationRisk: "Review",
    marketPressure: "Review",
    ageMileageFit: "Review",
    mileageDelta: 0,
    qualityScore: 38,
    qualityReason: `Fail-safe estimate used because ${audit.issues.join(", ")} needs recovery.`,
    low: base * 0.86,
    high: base * 1.14,
    confidence: "fail-safe",
    volatility: "Review",
    liquidity: "Review",
    ownershipRisk: "Review",
    adjustments: [["Fail-safe base", base]]
  };
}

function emitOperationEvent(label) {
  operationState.events.unshift(`${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${label}`);
  operationState.events = operationState.events.slice(0, 8);
}

function persistLastEstimateSnapshot(values, result) {
  try {
    const snapshot = {
      savedAt: new Date().toISOString(),
      vehicleType: values.vehicleType,
      make: values.make,
      model: values.model,
      modelYear: values.modelYear,
      benchmark: Math.round(result.benchmark),
      signature: expectedCatalogSignature
    };
    localStorage.setItem(estimatorStorageKey, JSON.stringify(snapshot));
    operationState.lastSnapshot = `${values.make} ${values.model} saved`;
    return true;
  } catch {
    operationState.lastSnapshot = "Storage unavailable";
    return false;
  }
}

function restoreEstimateSnapshot() {
  try {
    const raw = localStorage.getItem(estimatorStorageKey);
    if (!raw) return null;
    const snapshot = JSON.parse(raw);
    operationState.lastRecovery = snapshot.signature === expectedCatalogSignature ? "Snapshot ready" : "Snapshot stale";
    return snapshot;
  } catch {
    operationState.lastRecovery = "Snapshot unreadable";
    return null;
  }
}

function checkTamperStatus() {
  const liveSignature = computeCatalogSignature([...vehicleProfiles, ...antiqueVehicleProfiles]);
  const frozen = Object.isFrozen(vehicleProfiles) && Object.isFrozen(antiqueVehicleProfiles);
  const clean = liveSignature === expectedCatalogSignature && frozen && catalogAudit.ok;
  operationState.tamper = clean ? "Clean" : "Review required";
  return {
    clean,
    liveSignature,
    frozen
  };
}

function formatHealthStatus(ok, pass = "Pass", fail = "Review") {
  return ok ? pass : fail;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateOperationsPanel(values, result, inputAudit) {
  const tamper = checkTamperStatus();
  const modelSelect = document.getElementById("modelSelect");
  const renderedIds = ["benchmarkPrice", "priceRange", "qualityScore", "catalogSummary", "systemStatus"];
  setText("systemStatus", formatHealthStatus(catalogAudit.ok && inputAudit.ok, "Operational", "Degraded"));
  setText("catalogIntegrity", catalogAudit.ok ? `${catalogAudit.profileCount.toLocaleString()} profiles verified` : "Catalog review needed");
  setText("calculationGuard", Number.isFinite(result.benchmark) && result.benchmark > 0 ? "Finite price output" : "Output blocked");
  setText("inputGuard", inputAudit.ok ? "Inputs inside bounds" : `Recovered: ${inputAudit.issues.join(", ")}`);
  setText("tamperStatus", `${operationState.tamper} (${tamper.liveSignature})`);
  setText("failsafeStatus", operationState.failsafe);
  setText("snapshotStatus", operationState.lastSnapshot);
  setText("recoveryStatus", operationState.lastRecovery);
  setText("dataFreshness", getDataFreshness());
  setText("catalogSignature", expectedCatalogSignature);
  setText("modelGuard", modelSelect?.options.length ? `${modelSelect.options.length} controlled models` : "No model options");
  setText("duplicateGuard", catalogAudit.duplicateIds.length ? `${catalogAudit.duplicateIds.length} duplicates` : "No duplicate IDs");
  setText("segmentGuard", catalogAudit.missingSegments.length ? `${catalogAudit.missingSegments.length} missing segments` : "Segments valid");
  setText("yearGuard", inputAudit.yearBounds ? `${inputAudit.yearBounds.min}-${inputAudit.yearBounds.max}` : "Year bounds valid");
  setText("rangeGuard", result.low < result.high ? "Range ordered" : "Range review");
  setText("priceGuard", result.benchmark >= 2500 ? "Price floor active" : "Price review");
  setText("renderGuard", renderedIds.every((id) => document.getElementById(id)?.textContent.trim()) ? "Render complete" : "Render review");
  setText("copyGuard", operationState.copy);
  setText("themeGuard", document.body.dataset.theme ? `Theme ${document.body.dataset.theme}` : "Theme pending");
  setText("smokeStatus", "Check + browser smoke covered");
}

function currentSummaryPayload(values, result) {
  return {
    vehicle: `${values.modelYear} ${values.make} ${values.model}`,
    vehicleType: values.vehicleType,
    benchmark: Math.round(result.benchmark),
    rangeLow: Math.round(result.low),
    rangeHigh: Math.round(result.high),
    askingPrice: values.askingPrice || null,
    quality: result.qualityScore,
    savedAt: new Date().toISOString()
  };
}

function loadComparisons() {
  try {
    return JSON.parse(localStorage.getItem(comparisonStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveComparisons(comparisons) {
  localStorage.setItem(comparisonStorageKey, JSON.stringify(comparisons.slice(0, 3)));
}

function renderComparisons() {
  const comparisons = loadComparisons();
  setText("savedComparisons", comparisons.length
    ? comparisons.map((item) => `${item.vehicle}: ${money(item.benchmark)}`).join(" | ")
    : "No saved comparisons yet.");
}

function saveCurrentComparison() {
  const values = getFormValues();
  const result = calculateBenchmark(values);
  const comparisons = [currentSummaryPayload(values, result), ...loadComparisons()].slice(0, 3);
  saveComparisons(comparisons);
  renderComparisons();
  setText("catalogIssueStatus", "Comparison saved locally.");
  emitOperationEvent("Comparison saved");
}

function clearSavedComparisons() {
  localStorage.removeItem(comparisonStorageKey);
  renderComparisons();
  setText("catalogIssueStatus", "Saved comparisons cleared.");
}

function exportCurrentJson() {
  const values = getFormValues();
  const result = calculateBenchmark(values);
  const payload = JSON.stringify(currentSummaryPayload(values, result), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vehicle-estimate.json";
  link.click();
  URL.revokeObjectURL(url);
  setText("exportStatus", "Estimate JSON exported.");
}

function reportCatalogIssue() {
  const values = getFormValues();
  const subject = encodeURIComponent(`Catalog issue: ${values.make} ${values.model}`);
  const body = encodeURIComponent(`Please review this catalog entry:\n${values.modelYear} ${values.make} ${values.model}\nCategory: ${document.getElementById("categorySelect").value}\nIssue: `);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  setText("catalogIssueStatus", "Catalog issue draft opened.");
}

function bindOptionalClick(id, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener("click", handler);
}

function modelLaneFromText(rawText) {
  const text = String(rawText).toLowerCase();
  if (/300sl|250 gt|2000gt|db4|db5|db6|duesenberg|ferrari|lamborghini|mclaren|rolls|bentley|aston|phantom|corniche/.test(text)) return "Exotic / collector";
  if (/mustang|camaro|challenger|charger|corvette|chevelle|gto|trans am|firebird|barracuda|road runner|grand national|442|amx|javelin/.test(text)) return "Muscle / sport";
  if (/\bwrx\b|type r|\bsi\b|\bgti\b|supra|rx-7|rx-3|rx-2|skyline|240z|260z|280z|300zx|miata|2002|quattro|nsx|crx/.test(text)) return "Tuner / sport";
  if (/cargo van|e-series|vandura|ram van|safari cargo|bus type 2|vanagon|pickup|power wagon|f-100|f-series|c\/k|bronco|blazer|jimmy|suburban|land cruiser|defender|series i|series ii|series iii|cj|wagoneer|wrangler/.test(text)) return "Rugged / utility";
  return "";
}

function modelLane(profile) {
  const text = `${profile.model} ${profile.trimName}`.toLowerCase();
  if (profile.segment?.startsWith("motorcycle-")) {
    const type = segments[profile.segment].label.replace("Motorcycle - ", "");
    return `Motorcycle / ${type}`;
  }
  if (profile.trimName === "Antique benchmark") {
    return modelLaneFromText(text) || "Antique / collector";
  }
  if (/chiron|ferrari|lamborghini|mclaren|rolls|bentley|aston|revuelto|huracan|750s|phantom|ghost|cullinan/.test(text) || ["Bugatti", "Ferrari", "Lamborghini", "McLaren", "Rolls-Royce", "Bentley", "Aston Martin"].includes(profile.make)) {
    return "Exotic / collector";
  }
  if (/mustang|camaro|challenger|charger|corvette/.test(text)) return "Muscle / sport";
  if (/\bwrx\b|type r|\bsi\b|\bgti\b|supra|gr86|z performance|miata/.test(text)) return "Tuner / sport";
  if (/box truck|low cab forward|m2 106|canter|npr|nqr|cutaway|cargo van|e-series|nv200|nv cargo|metris|e-350|e-250|e-150|astro cargo/.test(text) || profile.segment === "cargo-van") return "Commercial / cargo";
  if (/bronco|raptor|rubicon|wrangler|defender|range rover|r1t|r1s|sierra|silverado|f-150|1500/.test(text)) return "Rugged / utility";
  if (profile.segment === "ev") return "EV / tech";
  if (profile.segment === "luxury") return "Luxury / premium";
  return segments[profile.segment].label;
}

const sliderProfiles = {
  condition: [
    { key: "rough", label: "Rough", adjustment: -0.22 },
    { key: "fair", label: "Fair", adjustment: -0.11 },
    { key: "good", label: "Good", adjustment: 0 },
    { key: "excellent", label: "Excellent", adjustment: 0.08 }
  ],
  trim: [
    { key: "base", label: "Base", adjustment: -0.06 },
    { key: "mid", label: "Mid", adjustment: 0 },
    { key: "premium", label: "Premium", adjustment: 0.09 },
    { key: "performance", label: "Performance / off-road", adjustment: 0.14 }
  ],
  region: [
    { key: "rural", label: "Lower-demand rural", adjustment: -0.035 },
    { key: "average", label: "Average market", adjustment: 0 },
    { key: "sunbelt", label: "Sunbelt market", adjustment: 0.015 },
    { key: "snow", label: "Snow / AWD-heavy", adjustment: 0.025 },
    { key: "urban", label: "High-demand urban", adjustment: 0.035 }
  ],
  demand: [
    { key: "soft", label: "Soft", adjustment: -0.05 },
    { key: "normal", label: "Normal", adjustment: 0 },
    { key: "strong", label: "Strong", adjustment: 0.045 },
    { key: "hot", label: "Hot", adjustment: 0.085 }
  ],
  sellerType: [
    { key: "trade", label: "Trade-in planning", usedAdjustment: -0.14, newAdjustment: -0.025 },
    { key: "private", label: "Private party", usedAdjustment: -0.015, newAdjustment: -0.01 },
    { key: "dealer", label: "Dealer retail", usedAdjustment: 0.035, newAdjustment: 0.025 }
  ],
  history: [
    { key: "major", label: "Major accident / structural concern", usedAdjustment: -0.2, newAdjustment: -0.035 },
    { key: "minor", label: "Minor accident reported", usedAdjustment: -0.06, newAdjustment: -0.018 },
    { key: "unknown", label: "Unknown history", usedAdjustment: -0.04, newAdjustment: -0.012 },
    { key: "clean", label: "Clean title", usedAdjustment: 0, newAdjustment: 0.004 }
  ],
  ownerCount: [
    { key: "one", label: "1 owner", usedAdjustment: 0.018, newAdjustment: 0 },
    { key: "two", label: "2 owners", usedAdjustment: 0, newAdjustment: 0 },
    { key: "three", label: "3 owners", usedAdjustment: -0.025, newAdjustment: 0 },
    { key: "four", label: "4 owners", usedAdjustment: -0.045, newAdjustment: 0 },
    { key: "five-plus", label: "5+ owners", usedAdjustment: -0.07, newAdjustment: 0 }
  ],
  marketMode: [
    { key: "soft", label: "Soft market", adjustment: softMarketRate },
    { key: "normal", label: "Normal", adjustment: 0 },
    { key: "inflation", label: "Inflation", adjustment: currentInflationRate }
  ]
};

const controlLabels = {
  categorySelect: "Brand category",
  makeSelect: "Make",
  modelSelect: "Model",
  vehicleType: "Vehicle type",
  modelYear: "Model year",
  mileage: "Mileage",
  condition: "Condition",
  trim: "Trim / options",
  region: "Region",
  sellerType: "Transaction context",
  history: "History / title",
  ownerCount: "Owner count",
  fleetUse: "Fleet / company use",
  demand: "Current demand",
  askingPrice: "Asking price",
  fuelType: "Fuel / energy",
  drivetrain: "Drivetrain",
  powertrain: "Engine / powertrain",
  transmission: "Transmission",
  optionPackage: "Options package",
  colorDemand: "Exterior / interior color",
  warrantyStatus: "Warranty status",
  serviceRecords: "Service records",
  wearItems: "Tires / brakes",
  recallStatus: "Open recalls",
  titleBrand: "Title brand",
  rustLevel: "Rust / corrosion",
  repairQuality: "Repair quality",
  accessoryCompleteness: "Keys / accessories",
  rentalUse: "Prior rental",
  dealerAddons: "Dealer add-ons",
  incentiveLevel: "Incentives / rebates",
  daysMarket: "Days on market",
  inventorySupply: "Local inventory",
  seasonality: "Seasonality",
  shippingDistance: "Shipping distance",
  commercialIntensity: "Commercial use intensity",
  evBatteryHealth: "EV battery health",
  taxCredit: "Tax credit eligibility",
  importStatus: "Import status",
  modificationLevel: "Originality / modifications",
  aftermarketQuality: "Aftermarket quality",
  rarity: "Rarity",
  matchingNumbers: "Matching numbers",
  marketMode: "Market price mode"
};

function profileYearBounds(profile, vehicleType = document.getElementById("vehicleType")?.value || "used") {
  const isAntique = vehicleType === "antique";
  const firstYear = profile.firstYear || modelFirstYears[`${profile.make}::${profile.model}`] || (isAntique ? earliestAntiqueYear : earliestModelYear);
  const lastYear = profile.lastYear || modelLastYears[`${profile.make}::${profile.model}`] || (isAntique ? antiqueCutoffYear : latestModelYear);
  const maxYear = Math.min(latestModelYear, lastYear);
  if (vehicleType === "new") {
    return {
      min: Math.max(currentYear, firstYear),
      max: maxYear
    };
  }
  if (isAntique) {
    return {
      min: Math.max(earliestAntiqueYear, firstYear),
      max: Math.min(antiqueCutoffYear, maxYear)
    };
  }
  return {
    min: Math.max(earliestModelYear, firstYear),
    max: maxYear
  };
}

function productionLabel(profile) {
  const isAntique = profile.trimName === "Antique benchmark";
  const firstYear = Math.max(isAntique ? earliestAntiqueYear : earliestModelYear, profile.firstYear || modelFirstYears[`${profile.make}::${profile.model}`] || (isAntique ? earliestAntiqueYear : earliestModelYear));
  const lastYear = profile.lastYear || modelLastYears[`${profile.make}::${profile.model}`];
  if (isAntique) return `Antique (${firstYear}-${lastYear || antiqueCutoffYear})`;
  if (!lastYear || lastYear >= latestModelYear) return `Current (${firstYear}-${latestModelYear})`;
  return `Discontinued (${firstYear}-${lastYear})`;
}

function isCurrentProduction(profile) {
  const lastYear = profile.lastYear || modelLastYears[`${profile.make}::${profile.model}`] || latestModelYear;
  return lastYear >= currentYear;
}

function availableProfiles() {
  const category = document.getElementById("categorySelect")?.value || "all";
  const vehicleType = document.getElementById("vehicleType")?.value || "used";
  return activeProfilePool(vehicleType).filter((profile) => {
    const categories = profile.categories || brandCategories[profile.make] || [];
    const categoryMatch = category === "all" ||
      (category === "Commercial"
        ? modelLane(profile) === "Commercial / cargo"
        : category === "SUV"
          ? suvSegments.has(profile.segment)
        : category === "Crossover"
          ? isCrossoverProfile(profile)
        : category === "Motorcycle"
          ? profile.segment?.startsWith("motorcycle-")
          : categories.includes(category));
    const antiqueCategoryMatch = vehicleType !== "antique" || category === "all" || categories.includes(category);
    const productionMatch = vehicleType !== "new" || isCurrentProduction(profile);
    return (vehicleType === "antique" ? antiqueCategoryMatch : categoryMatch) && productionMatch;
  });
}

function isCrossoverProfile(profile) {
  if (!suvSegments.has(profile.segment)) return false;
  if (nonCrossoverModels.has(String(profile.model).toLowerCase())) return false;
  const text = `${profile.make} ${profile.model} ${profile.trimName}`;
  return !nonCrossoverPattern.test(text);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Math.round(value / 100) * 100);
}

function moneyPrecise(value, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function numberValue(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
}

function titleCase(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function sliderOption(key) {
  const input = document.getElementById(key);
  const options = sliderProfiles[key];
  return options[Math.max(0, Math.min(options.length - 1, Number(input.value || 0)))];
}

function sliderAdjustment(option, vehicleType) {
  if (typeof option.adjustment === "number") return option.adjustment;
  return vehicleType === "new" ? option.newAdjustment : option.usedAdjustment;
}

function updateSliderLabels() {
  const profile = selectedVehicleProfile();
  const yearInput = document.getElementById("modelYear");
  const bounds = profileYearBounds(profile);
  const minYear = Math.min(bounds.min, bounds.max);
  const maxYear = bounds.max;
  yearInput.min = minYear;
  yearInput.max = maxYear;
  if (Number(yearInput.value) < minYear) yearInput.value = minYear;
  if (Number(yearInput.value) > maxYear) yearInput.value = maxYear;
  document.getElementById("modelYearValue").textContent = yearInput.value;
  const vehicleType = document.getElementById("vehicleType").value;
  const typeHint = vehicleType === "antique" ? "antique collector" : vehicleType;
  document.getElementById("yearHint").textContent = `${minYear}-${maxYear} selectable for this ${typeHint} profile`;
  document.getElementById("mileageValue").textContent = `${Number(document.getElementById("mileage").value || 0).toLocaleString()} mi`;
  document.getElementById("conditionValue").textContent = sliderOption("condition").label;
  document.getElementById("trimValue").textContent = sliderOption("trim").label;
  document.getElementById("regionValue").textContent = sliderOption("region").label;
  document.getElementById("demandValue").textContent = sliderOption("demand").label;
  document.getElementById("sellerTypeValue").textContent = sliderOption("sellerType").label;
  document.getElementById("historyValue").textContent = sliderOption("history").label;
  document.getElementById("ownerCountValue").textContent = sliderOption("ownerCount").label;
  document.getElementById("marketModeValue").textContent = sliderOption("marketMode").label;
  document.getElementById("marketModeNote").textContent = marketModeReference;
  document.getElementById("fleetUseValue").textContent = document.getElementById("fleetUse").checked ? "Fleet/company-use history applied" : "Personal-use history assumed";
}

function updateCatalogSummary() {
  const fullCatalog = [...vehicleProfiles, ...antiqueVehicleProfiles];
  const makes = new Set(fullCatalog.map((profile) => profile.make));
  const internationalMakes = [...makes].filter((make) => (brandCategories[make] || []).includes("International"));
  document.getElementById("catalogSummary").textContent = `${makes.size.toLocaleString()} makes, ${fullCatalog.length.toLocaleString()} profiles, ${antiqueVehicleProfiles.length.toLocaleString()} antique profiles`;
  document.getElementById("heroMakeCount").textContent = makes.size.toLocaleString();
  document.getElementById("heroProfileCount").textContent = fullCatalog.length.toLocaleString();
  document.getElementById("heroYearBand").textContent = `${earliestAntiqueYear}-${latestModelYear}`;
  setText("antiqueThreshold", `${earliestAntiqueYear}-${antiqueCutoffYear}`);
  setText("antiqueCatalogCount", `${antiqueVehicleProfiles.length.toLocaleString()} profiles`);
}

function selectedVehicleProfile() {
  const pool = activeProfilePool();
  const profileId = document.getElementById("modelSelect").value || pool[0]?.id || vehicleProfiles[0].id;
  return pool.find((profile) => profile.id === profileId) || pool[0] || vehicleProfiles[0];
}

function profileCategoryLabels(profile) {
  return profile.categories || brandCategories[profile.make] || ["Uncategorized"];
}

function updateProfileLabels() {
  const profile = selectedVehicleProfile();
  document.getElementById("profileMake").textContent = profile.make;
  document.getElementById("profileModel").textContent = profile.model;
  document.getElementById("profileSegment").textContent = segments[profile.segment].label;
  document.getElementById("profileTrim").textContent = profile.trimName === "Benchmark"
    ? "Baseline"
    : profile.trimName === "Antique benchmark"
      ? "Antique"
      : profile.trimName;
  document.getElementById("profileBrandCategory").textContent = profileCategoryLabels(profile).join(" / ");
  document.getElementById("profileModelLane").textContent = modelLane(profile);
  document.getElementById("profileProduction").textContent = productionLabel(profile);
}

function modelOptionLabel(profile) {
  return profile.trimName === "Benchmark" || profile.trimName === "Antique benchmark"
    ? profile.model
    : `${profile.model} ${profile.trimName}`;
}

function availableMakes() {
  return [...new Set(availableProfiles().map((profile) => profile.make))].sort((a, b) => a.localeCompare(b));
}

function populateMakeSelect(preferredMake = "") {
  const makeSelect = document.getElementById("makeSelect");
  const makes = availableMakes();
  makeSelect.innerHTML = makes
    .map((make) => `<option value="${make}">${make}</option>`)
    .join("");
  if (makes.length) makeSelect.value = makes.includes(preferredMake) ? preferredMake : makes[0];
  const vehicleType = document.getElementById("vehicleType")?.value || "used";
  const typeLabel = vehicleType === "new"
    ? "manufacturer-available new models"
    : vehicleType === "antique"
      ? `25+ model-year collector profiles (${earliestAntiqueYear}-${antiqueCutoffYear})`
      : "current and discontinued models";
  document.getElementById("catalogCount").textContent = `${makes.length.toLocaleString()} makes available in this category (${typeLabel})`;
}

function populateModelSelect(preferredProfileId = "") {
  const make = document.getElementById("makeSelect").value;
  const models = availableProfiles().filter((profile) => profile.make === make);
  const modelSelect = document.getElementById("modelSelect");
  if (!models.length) {
    modelSelect.innerHTML = "";
    return;
  }
  modelSelect.innerHTML = models
    .map((profile) => `<option value="${profile.id}">${modelOptionLabel(profile)}</option>`)
    .join("");
  modelSelect.value = models.some((profile) => profile.id === preferredProfileId)
    ? preferredProfileId
    : models[0].id;
}

function getFormValues() {
  const condition = sliderOption("condition");
  const trim = sliderOption("trim");
  const region = sliderOption("region");
  const demand = sliderOption("demand");
  const sellerType = sliderOption("sellerType");
  const history = sliderOption("history");
  const ownerCount = sliderOption("ownerCount");

  const profile = selectedVehicleProfile();
  const marketMode = sliderOption("marketMode");
  const fleetUse = document.getElementById("fleetUse").checked;

  return {
    profile,
    segment: profile.segment,
    vehicleType: document.getElementById("vehicleType").value,
    make: profile.make,
    model: profile.model,
    modelYear: Number(document.getElementById("modelYear").value || currentYear),
    mileage: Number(document.getElementById("mileage").value || 0),
    condition,
    trim,
    region,
    demand,
    sellerType,
    history,
    ownerCount,
    fleetUse,
    askingPrice: clampNumber(document.getElementById("askingPrice").value, 0, 10000000, 0),
    fuelType: document.getElementById("fuelType").value,
    drivetrain: document.getElementById("drivetrain").value,
    powertrain: document.getElementById("powertrain").value,
    transmission: document.getElementById("transmission").value,
    optionPackage: document.getElementById("optionPackage").value,
    colorDemand: document.getElementById("colorDemand").value,
    warrantyStatus: document.getElementById("warrantyStatus").value,
    serviceRecords: document.getElementById("serviceRecords").value,
    wearItems: document.getElementById("wearItems").value,
    recallStatus: document.getElementById("recallStatus").value,
    titleBrand: document.getElementById("titleBrand").value,
    rustLevel: document.getElementById("rustLevel").value,
    repairQuality: document.getElementById("repairQuality").value,
    accessoryCompleteness: document.getElementById("accessoryCompleteness").value,
    rentalUse: document.getElementById("rentalUse").value,
    dealerAddons: document.getElementById("dealerAddons").value,
    incentiveLevel: document.getElementById("incentiveLevel").value,
    daysMarket: document.getElementById("daysMarket").value,
    inventorySupply: document.getElementById("inventorySupply").value,
    seasonality: document.getElementById("seasonality").value,
    shippingDistance: document.getElementById("shippingDistance").value,
    commercialIntensity: document.getElementById("commercialIntensity").value,
    evBatteryHealth: document.getElementById("evBatteryHealth").value,
    taxCredit: document.getElementById("taxCredit").value,
    importStatus: document.getElementById("importStatus").value,
    modificationLevel: document.getElementById("modificationLevel").value,
    aftermarketQuality: document.getElementById("aftermarketQuality").value,
    rarity: document.getElementById("rarity").value,
    matchingNumbers: document.getElementById("matchingNumbers").value,
    marketMode
  };
}

function compareAskingPrice(values, result) {
  if (!values.askingPrice) return { quality: "Enter asking price", delta: 0 };
  const delta = values.askingPrice - result.benchmark;
  if (values.askingPrice < result.low) return { quality: "Likely under market", delta };
  if (values.askingPrice > result.high) return { quality: "Likely overpriced", delta };
  return { quality: "Fair range", delta };
}

function negotiationTargets(values, result) {
  const midpoint = (result.low + result.high) / 2;
  const firstOffer = values.vehicleType === "new" ? result.low * 0.985 : result.low * 0.96;
  const walkAway = values.askingPrice ? Math.min(values.askingPrice, result.high * 1.02) : result.high;
  return { firstOffer, walkAway, midpoint };
}

function ownershipCostPreview(values, result) {
  if (values.segment?.startsWith("motorcycle-")) {
    const motorcycleFactor = values.segment === "motorcycle-touring" ? 0.115 : values.segment === "motorcycle-offroad" ? 0.13 : 0.095;
    return result.benchmark * motorcycleFactor;
  }
  const fuelFactor = { gas: 0.09, diesel: 0.1, hybrid: 0.065, ev: 0.055, unknown: 0.085 }[values.fuelType] || 0.085;
  const maintenanceFactor = values.vehicleType === "antique" ? 0.08 : values.segment === "luxury" ? 0.055 : values.segment === "cargo-van" ? 0.06 : 0.04;
  const insuranceFactor = values.vehicleType === "antique" ? 0.018 : 0.035;
  return result.benchmark * (fuelFactor + maintenanceFactor + insuranceFactor);
}

function maintenanceRisk(values) {
  if (values.condition.key === "rough" || values.history.key === "major") return "High";
  if (values.segment === "motorcycle-offroad" || values.segment === "motorcycle-sport") return "Wear-sensitive";
  if (values.segment?.startsWith("motorcycle-")) return "Seasonal service";
  if (values.vehicleType === "antique" || values.segment === "luxury" || values.segment === "cargo-van") return "Specialist";
  if (values.mileage > 120000 || values.fleetUse) return "Elevated";
  return "Normal";
}

function fuelSensitivity(values) {
  if (values.segment?.startsWith("motorcycle-")) return values.segment === "motorcycle-electric" ? "Battery/range" : "Seasonal fuel";
  if (values.fuelType === "ev") return "Charging access";
  if (values.fuelType === "diesel") return "Fuel and emissions";
  if (values.fuelType === "hybrid") return "Battery health";
  if (values.segment === "pickup" || values.segment === "cargo-van") return "Fuel-price sensitive";
  return "Normal";
}

function depreciationPreview(values, result) {
  if (values.vehicleType === "antique") return "Collector curve";
  const isMotorcycle = values.segment?.startsWith("motorcycle-");
  const oneYear = result.benchmark * (values.vehicleType === "new" ? (isMotorcycle ? 0.84 : 0.88) : (isMotorcycle ? 0.9 : 0.93));
  const threeYear = result.benchmark * (values.vehicleType === "new" ? (isMotorcycle ? 0.66 : 0.72) : (isMotorcycle ? 0.76 : 0.82));
  const fiveYear = result.benchmark * (values.vehicleType === "new" ? (isMotorcycle ? 0.54 : 0.63) : (isMotorcycle ? 0.66 : 0.73));
  return `1y ${money(oneYear)} / 3y ${money(threeYear)} / 5y ${money(fiveYear)}`;
}

function regionalNote(values) {
  const notes = {
    rural: "Lower density can soften demand but may favor trucks and work vehicles.",
    average: "Average market assumes balanced local supply and demand.",
    sunbelt: "Sunbelt markets can support convertibles, clean bodies, and low-rust inventory.",
    snow: "Snow markets can lift AWD, trucks, SUVs, tires, and rust-free examples.",
    urban: "Urban demand can lift compact, hybrid, EV, and low-mileage inventory."
  };
  return notes[values.region.key] || notes.average;
}

function confidenceBand(score) {
  if (score >= 82) return "High confidence";
  if (score >= 68) return "Medium confidence";
  if (score >= 54) return "Review needed";
  return "Specialist review";
}

function signedPercent(value) {
  const percent = Math.round(value * 1000) / 10;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function historicalCpiForYear(year) {
  const targetYear = clampNumber(year, firstProductionAutomobileYear, currentYear, firstProductionAutomobileYear);
  const exact = historicalCpiAnchors.find(([anchorYear]) => anchorYear === targetYear);
  if (exact) return exact[1];
  const upperIndex = historicalCpiAnchors.findIndex(([anchorYear]) => anchorYear > targetYear);
  if (upperIndex <= 0) return historicalCpiAnchors[0][1];
  const [lowerYear, lowerCpi] = historicalCpiAnchors[upperIndex - 1];
  const [upperYear, upperCpi] = historicalCpiAnchors[upperIndex];
  const progress = (targetYear - lowerYear) / (upperYear - lowerYear);
  return lowerCpi + ((upperCpi - lowerCpi) * progress);
}

function renderHistoricalValue(result) {
  const input = document.getElementById("historicalYear");
  if (!input) return;
  input.min = String(firstProductionAutomobileYear);
  input.max = String(currentYear);
  const selectedYear = clampNumber(input.value, firstProductionAutomobileYear, currentYear, 1937);
  input.value = String(selectedYear);
  const selectedCpi = historicalCpiForYear(selectedYear);
  const thenToToday = currentCpiIndex / selectedCpi;
  const todayToThen = selectedCpi / currentCpiIndex;
  const thenVehicleValue = result.benchmark * todayToThen;
  const sourceBasis = selectedYear < 1913 ? "Pre-1913 estimate" : "BLS CPI ratio";

  setText("historicalYearValue", selectedYear);
  setText("historicalVehicleValue", money(thenVehicleValue));
  setText("historicalDollarToday", moneyPrecise(thenToToday));
  setText("currentDollarThen", moneyPrecise(todayToThen));
  setText("historicalSource", sourceBasis);
  setText("historicalNote", selectedYear < 1913
    ? `1886 begins with the Benz Patent-Motorwagen production era. ${selectedYear} uses estimated U.S. purchasing-power context before official CPI begins in 1913.`
    : `${selectedYear} uses CPI-ratio math: selected-year CPI ${selectedCpi.toFixed(1)} against May 2026 CPI ${currentCpiIndex.toFixed(3)}.`);
}

async function fetchVisitorCounter() {
  const response = await fetch(visitorCounterUrl, {
    headers: { "X-Firebase-ETag": "true" },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Counter read failed: ${response.status}`);
  const data = await response.json();
  return {
    data: data && typeof data === "object" ? data : { count: 0 },
    etag: response.headers.get("ETag") || "*"
  };
}

function renderVisitorCounter(count, status = "Aggregate counter") {
  setText("visitorCount", Number(count || 0).toLocaleString());
  setText("visitorCounterStatus", status);
}

async function incrementVisitorCounter() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, etag } = await fetchVisitorCounter();
    const nextCount = Math.max(0, Number(data.count || 0)) + 1;
    const response = await fetch(visitorCounterUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "If-Match": etag
      },
      body: JSON.stringify({
        count: nextCount,
        updatedAt: { ".sv": "timestamp" }
      })
    });
    if (response.status === 412) continue;
    if (!response.ok) throw new Error(`Counter update failed: ${response.status}`);
    localStorage.setItem(visitorCounterStorageKey, "counted");
    renderVisitorCounter(nextCount, "Counted once");
    return;
  }
  throw new Error("Counter update retry limit reached");
}

async function initializeVisitorCounter() {
  const counted = localStorage.getItem(visitorCounterStorageKey) === "counted";
  try {
    if (!counted) {
      await incrementVisitorCounter();
      return;
    }
    const { data } = await fetchVisitorCounter();
    renderVisitorCounter(data.count || 0, "Already counted");
  } catch {
    renderVisitorCounter(0, "Counter unavailable");
  }
}

function transmissionLabel(values) {
  if (values.transmission === "ev" || values.fuelType === "ev" || values.segment === "motorcycle-electric") return "EV direct drive";
  if (values.transmission === "manual") return values.segment?.startsWith("motorcycle-") ? "Manual / sequential" : "Manual";
  return "Automatic";
}

function specialtyContext(values) {
  return {
    isNew: values.vehicleType === "new",
    isUsed: values.vehicleType === "used",
    isAntique: values.vehicleType === "antique",
    isCommercial: values.segment === "cargo-van" || modelLane(values.profile) === "Commercial / cargo",
    isMotorcycle: values.segment?.startsWith("motorcycle-"),
    isEv: values.segment === "ev" || values.fuelType === "ev",
    isPerformance: /sport|muscle|tuner|exotic|collector/i.test(modelLane(values.profile))
  };
}

function contextualAdjustments(values) {
  const ctx = specialtyContext(values);
  const drivetrain = ctx.isMotorcycle ? 0 : values.drivetrain === "awd" ? (values.segment === "pickup" || values.segment.includes("suv") || values.region.key === "snow" ? 0.035 : 0.015) : values.drivetrain === "rwd" && ctx.isPerformance ? 0.012 : 0;
  const powertrain = { base: 0, upgraded: 0.025, diesel: ctx.isCommercial || values.segment === "pickup" ? 0.035 : 0.005, performance: ctx.isPerformance ? 0.06 : 0.025 }[values.powertrain] || 0;
  const transmission = values.transmission === "manual"
    ? (ctx.isMotorcycle ? 0.012 : ctx.isPerformance || ctx.isAntique ? 0.035 : -0.015)
    : values.transmission === "ev" || values.fuelType === "ev" || values.segment === "motorcycle-electric"
      ? (ctx.isEv || values.segment === "motorcycle-electric" ? 0.006 : -0.008)
      : 0;
  const optionPackage = { standard: 0, safety: 0.012, luxury: values.segment === "luxury" ? 0.035 : 0.02, tow: values.segment === "pickup" || ctx.isCommercial ? 0.035 : 0.01 }[values.optionPackage] || 0;
  const colorDemand = values.colorDemand === "rare" ? (ctx.isPerformance || ctx.isAntique ? 0.025 : 0.006) : values.colorDemand === "polarizing" ? -0.018 : 0;
  const warranty = values.warrantyStatus === "factory" ? (ctx.isAntique ? 0 : 0.03) : values.warrantyStatus === "cpo" ? (ctx.isAntique ? 0 : 0.045) : 0;
  const service = values.serviceRecords === "complete" ? (ctx.isAntique ? 0.03 : 0.015) : values.serviceRecords === "missing" ? (ctx.isAntique ? -0.05 : -0.025) : 0;
  const wear = values.wearItems === "soon" ? -0.012 : values.wearItems === "needed" ? -0.035 : 0;
  const recalls = values.recallStatus === "open" ? -0.01 : 0;
  const title = values.titleBrand === "rebuilt" ? -0.18 : values.titleBrand === "salvage" ? -0.35 : 0;
  const rust = values.rustLevel === "minor" ? (ctx.isAntique || values.segment === "pickup" ? -0.035 : -0.02) : values.rustLevel === "structural" ? -0.18 : 0;
  const repair = values.repairQuality === "quality" ? 0.005 : values.repairQuality === "poor" ? -0.07 : 0;
  const accessories = values.accessoryCompleteness === "partial" ? -0.004 : values.accessoryCompleteness === "missing" ? -0.012 : 0.004;
  const rental = values.rentalUse === "yes" && !ctx.isNew ? -0.035 : 0;
  const addons = values.dealerAddons === "moderate" ? -0.008 : values.dealerAddons === "heavy" ? -0.025 : 0;
  const incentives = values.incentiveLevel === "moderate" && ctx.isNew ? -0.02 : values.incentiveLevel === "strong" && ctx.isNew ? -0.045 : 0;
  const days = values.daysMarket === "fresh" ? 0.008 : values.daysMarket === "stale" ? -0.025 : 0;
  const inventory = values.inventorySupply === "scarce" ? 0.03 : values.inventorySupply === "oversupplied" ? -0.035 : 0;
  const season = values.seasonality === "inSeason" ? 0.018 : values.seasonality === "offSeason" ? -0.018 : 0;
  const shipping = values.shippingDistance === "regional" ? -0.008 : values.shippingDistance === "long" ? -0.018 : 0;
  const commercial = ctx.isCommercial ? (values.commercialIntensity === "heavy" ? -0.055 : values.commercialIntensity === "upfitWear" ? -0.075 : 0) : 0;
  const battery = ctx.isEv ? (values.evBatteryHealth === "strong" ? 0.025 : values.evBatteryHealth === "unknown" ? -0.035 : values.evBatteryHealth === "weak" ? -0.12 : 0) : 0;
  const taxCredit = ctx.isEv ? (values.taxCredit === "eligible" ? 0.025 : values.taxCredit === "notEligible" ? -0.012 : 0) : 0;
  const importStatus = values.importStatus === "documented" && (ctx.isAntique || ctx.isPerformance) ? 0.015 : values.importStatus === "gray" ? -0.08 : 0;
  const mods = values.modificationLevel === "tasteful" ? (ctx.isPerformance || ctx.isAntique ? 0.018 : -0.005) : values.modificationLevel === "modified" ? (ctx.isPerformance ? -0.015 : -0.045) : 0;
  const aftermarket = values.aftermarketQuality === "quality" ? (ctx.isPerformance ? 0.015 : 0) : values.aftermarketQuality === "cheap" ? -0.04 : 0;
  const rarity = values.rarity === "limited" ? (ctx.isAntique || ctx.isPerformance ? 0.035 : 0.01) : values.rarity === "rare" ? (ctx.isAntique || ctx.isPerformance ? 0.07 : 0.018) : 0;
  const matching = ctx.isAntique || ctx.isPerformance ? (values.matchingNumbers === "verified" ? 0.06 : values.matchingNumbers === "unknown" ? -0.025 : values.matchingNumbers === "mismatch" ? -0.09 : 0) : 0;
  return [
    ["Drivetrain adjustment", drivetrain],
    ["Engine/powertrain adjustment", powertrain],
    ["Transmission adjustment", transmission],
    ["Options package adjustment", optionPackage],
    ["Color demand adjustment", colorDemand],
    ["Warranty adjustment", warranty],
    ["Service records adjustment", service],
    ["Tire/brake adjustment", wear],
    ["Recall adjustment", recalls],
    ["Title brand adjustment", title],
    ["Rust/corrosion adjustment", rust],
    ["Repair quality adjustment", repair],
    ["Keys/accessories adjustment", accessories],
    ["Prior rental adjustment", rental],
    ["Dealer add-ons adjustment", addons],
    ["Incentive/rebate adjustment", incentives],
    ["Days-on-market adjustment", days],
    ["Inventory supply adjustment", inventory],
    ["Seasonality adjustment", season],
    ["Shipping distance adjustment", shipping],
    ["Commercial-use adjustment", commercial],
    ["EV battery adjustment", battery],
    ["Tax-credit adjustment", taxCredit],
    ["Import/gray-market adjustment", importStatus],
    ["Modification adjustment", mods],
    ["Aftermarket quality adjustment", aftermarket],
    ["Rarity adjustment", rarity],
    ["Matching/provenance adjustment", matching]
  ];
}

function impactLabel(score) {
  if (score >= 0.04) return "Adds value";
  if (score <= -0.04) return "Reduces value";
  if (score > 0.005) return "Slight lift";
  if (score < -0.005) return "Slight drag";
  return "Neutral";
}

function factorImpactGroups(values) {
  const adjustments = Object.fromEntries(contextualAdjustments(values));
  const sum = (labels) => labels.reduce((total, label) => total + (adjustments[label] || 0), 0);
  return {
    equipment: impactLabel(sum(["Drivetrain adjustment", "Engine/powertrain adjustment", "Transmission adjustment", "Options package adjustment", "Color demand adjustment", "Warranty adjustment"])),
    history: impactLabel(sum(["Service records adjustment", "Tire/brake adjustment", "Recall adjustment", "Title brand adjustment", "Rust/corrosion adjustment", "Repair quality adjustment", "Keys/accessories adjustment", "Prior rental adjustment"])),
    market: impactLabel(sum(["Dealer add-ons adjustment", "Incentive/rebate adjustment", "Days-on-market adjustment", "Inventory supply adjustment", "Seasonality adjustment", "Shipping distance adjustment"])),
    specialty: impactLabel(sum(["Commercial-use adjustment", "EV battery adjustment", "Tax-credit adjustment", "Import/gray-market adjustment", "Modification adjustment", "Aftermarket quality adjustment", "Rarity adjustment", "Matching/provenance adjustment"]))
  };
}

function calculateBenchmark(values) {
  const segment = segments[values.segment];
  const isAntique = values.vehicleType === "antique";
  const vehicleAge = Math.max(0, currentYear - values.modelYear);
  const base = values.vehicleType === "new" ? values.profile.newBase : values.profile.usedBase;
  const newInventoryYearAdjustment = Math.max(-0.18, Math.min(0.025, (values.modelYear - currentYear) * 0.025));
  const antiqueEraAdjustment = values.modelYear <= 1940 ? 0.18 : values.modelYear <= 1965 ? 0.1 : values.modelYear <= 1985 ? 0.045 : 0;
  const ageAdjustment = values.vehicleType === "new"
    ? newInventoryYearAdjustment
    : isAntique
      ? antiqueEraAdjustment
      : Math.max(-0.42, (3 - vehicleAge) * 0.035);
  const expectedMileage = isAntique ? Math.max(15000, vehicleAge * 1400) : Math.max(0, vehicleAge * segment.annualMileage);
  const mileageDelta = values.mileage - expectedMileage;
  const mileageAdjustment = values.vehicleType === "new"
    ? Math.max(-0.18, Math.min(0.012, 0.012 - (values.mileage / 600000)))
    : isAntique
      ? Math.max(-0.09, Math.min(0.08, -(mileageDelta / 10000) * 0.004))
      : Math.max(-0.18, Math.min(0.12, -(mileageDelta / 10000) * 0.012));
  const conditionAdjustment = values.condition.adjustment;
  const trimAdjustment = values.trim.adjustment;
  const regionAdjustment = values.region.adjustment;
  const demandAdjustment = values.demand.adjustment;
  const sellerAdjustment = sliderAdjustment(values.sellerType, values.vehicleType);
  const historyAdjustment = sliderAdjustment(values.history, values.vehicleType);
  const ownerAdjustment = sliderAdjustment(values.ownerCount, values.vehicleType);
  const fleetAdjustment = values.vehicleType === "new" ? 0 : (values.fleetUse ? (isAntique ? -0.035 : -0.055) : 0);
  const marketModeAdjustment = values.marketMode.adjustment;
  const contextAdjustments = contextualAdjustments(values);
  const contextAdjustmentTotal = contextAdjustments.reduce((sum, [, adjustment]) => sum + adjustment, 0);

  const totalMultiplier = 1 + ageAdjustment + mileageAdjustment + conditionAdjustment + trimAdjustment + regionAdjustment + demandAdjustment + sellerAdjustment + historyAdjustment + ownerAdjustment + fleetAdjustment + marketModeAdjustment + contextAdjustmentTotal;
  const benchmark = Math.max(isAntique ? 3500 : 2500, base * totalMultiplier);
  const spread = benchmark * (values.vehicleType === "new" ? 0.055 : isAntique ? 0.14 : 0.078);
  const taxFeeReserve = benchmark * (values.vehicleType === "new" ? 0.092 : isAntique ? 0.062 : 0.078);
  const outTheDoor = benchmark + taxFeeReserve;
  const paymentPrincipal = outTheDoor * 0.9;
  const monthlyRate = 0.079 / 12;
  const termMonths = values.vehicleType === "new" ? 72 : isAntique ? 48 : 60;
  const monthlyPayment = paymentPrincipal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)));
  const costPerMile = benchmark / Math.max(12000, values.mileage || segment.annualMileage);
  const auctionReserve = isAntique ? benchmark * 0.1 : 0;
  const transportReserve = isAntique ? Math.max(900, Math.min(3200, benchmark * 0.018)) : 0;
  const storageReserve = isAntique ? Math.max(300, Math.min(1800, benchmark * 0.012)) : 0;
  const originalitySignal = isAntique
    ? (values.trim.key === "base" ? "Originality review" : values.trim.key === "performance" ? "Modified / specialty" : "Documentation needed")
    : "Not collector-mode";
  const provenanceSignal = isAntique
    ? (values.history.key === "clean" ? "Documented title" : values.history.key === "unknown" ? "Provenance gap" : "History review")
    : "VIN history";
  const restorationRisk = isAntique
    ? (values.condition.key === "rough" ? "High" : values.condition.key === "fair" ? "Medium" : values.trim.key === "performance" ? "Specialist" : "Normal")
    : "Standard inspection";
  const marketScore = demandAdjustment + regionAdjustment + marketModeAdjustment;
  const marketPressure = isAntique
    ? (marketScore >= 0.09 ? "Collector hot" : marketScore <= -0.045 ? "Specialist" : "Collector")
    : marketScore >= 0.1 ? "Hot" : marketScore >= 0.045 ? "Strong" : marketScore <= -0.045 ? "Soft" : "Normal";
  const ageMileageFit = Math.abs(mileageDelta) < segment.annualMileage * 0.45
    ? "Aligned"
    : (mileageDelta > 0 ? "High miles" : "Low miles");
  const confidence = isAntique
    ? (values.condition.key === "rough" || values.history.key === "unknown" || values.history.key === "major" ? "specialist review" : "collector estimate")
    : Math.abs(mileageAdjustment) > 0.1 || values.condition.key === "rough" || values.history.key === "unknown" || values.history.key === "major"
    ? "low"
    : (values.demand.key === "normal" && values.condition.key === "good" && values.history.key === "clean" ? "medium-high" : "medium");
  const qualityPenalty = [
    Math.abs(mileageAdjustment) > 0.1 ? 16 : 0,
    values.condition.key === "rough" ? 20 : 0,
    values.condition.key === "fair" ? 8 : 0,
    values.history.key === "major" ? 22 : 0,
    values.history.key === "unknown" ? 12 : 0,
    values.ownerCount.key === "five-plus" ? 10 : 0,
    values.ownerCount.key === "four" ? 7 : 0,
    values.ownerCount.key === "three" ? 4 : 0,
    values.fleetUse && values.vehicleType === "used" ? 9 : 0,
    values.fleetUse && isAntique ? 6 : 0,
    isAntique ? 10 : 0,
    Math.abs(contextAdjustmentTotal) > 0.12 ? 14 : 0,
    values.titleBrand !== "clean" ? 18 : 0,
    values.rustLevel === "structural" ? 18 : 0,
    values.evBatteryHealth === "weak" ? 12 : 0,
    values.importStatus === "gray" ? 10 : 0,
    values.matchingNumbers === "mismatch" ? 10 : 0,
    Math.abs(regionAdjustment) > 0.025 ? 5 : 0,
    Math.abs(demandAdjustment) > 0.045 ? 5 : 0,
    values.profile.trimName === "Benchmark" ? 6 : 0
  ].reduce((sum, item) => sum + item, 0);
  const qualityScore = Math.max(38, Math.min(96, 88 - qualityPenalty));
  const qualityReason = qualityScore >= 80
    ? (isAntique ? "Collector inputs are clean, but antique values still need originality and provenance review." : "Clean inputs and moderate adjustments support a tighter planning range.")
    : qualityScore >= 62
      ? (isAntique ? "Antique estimate needs documentation, originality, and restoration-quality verification." : "Some inputs need verification before leaning on the benchmark.")
      : (isAntique ? "Antique condition, originality, or provenance makes this a specialist-review estimate." : "Condition, history, mileage, or market pressure make this a review-heavy estimate.");
  const partialResult = { benchmark, marketPressure };

  return {
    segment,
    base,
    benchmark,
    netAdjustment: benchmark - base,
    taxFeeReserve,
    outTheDoor,
    monthlyPayment,
    costPerMile,
    auctionReserve,
    transportReserve,
    storageReserve,
    originalitySignal,
    provenanceSignal,
    restorationRisk,
    volatility: estimateVolatility(values, partialResult),
    liquidity: calculateLiquidity(values),
    ownershipRisk: calculateOwnershipRisk(values),
    marketPressure,
    ageMileageFit,
    mileageDelta,
    qualityScore,
    qualityReason,
    low: benchmark - spread,
    high: benchmark + spread,
    confidence,
    adjustments: [
      ["Base benchmark", base],
      ["Year adjustment", base * ageAdjustment],
      ["Mileage adjustment", base * mileageAdjustment],
      ["Condition adjustment", base * conditionAdjustment],
      ["Trim/options adjustment", base * trimAdjustment],
      ["Region adjustment", base * regionAdjustment],
      ["Demand adjustment", base * demandAdjustment],
      ["Transaction context", base * sellerAdjustment],
      ["History/title adjustment", base * historyAdjustment],
      ["Owner-count adjustment", base * ownerAdjustment],
      ["Fleet/company-use adjustment", base * fleetAdjustment],
    ["Market price mode", base * marketModeAdjustment],
      ...contextAdjustments
        .filter(([, adjustment]) => adjustment !== 0)
        .map(([label, adjustment]) => [label, base * adjustment])
    ]
  };
}

function renderDecisionSupport(values, result) {
  const riskTitle = document.getElementById("riskTitle");
  const riskText = document.getElementById("riskText");
  const negotiationLane = document.getElementById("negotiationLane");
  const documentationHint = document.getElementById("documentationHint");
  const categoryScope = document.getElementById("categoryScope");
  const categories = profileCategoryLabels(values.profile);

  if (values.history.key === "major" || values.condition.key === "rough") {
    setText("riskTitle", "High review");
    setText("riskText", "Condition or title history is pulling the benchmark down. Verify structure, repairs, and inspection results before relying on the range.");
  } else if (values.vehicleType === "antique") {
    setText("riskTitle", "Collector review");
    setText("riskText", "Antique pricing depends heavily on originality, restoration quality, documentation, and marque-specific demand.");
  } else if (result.marketPressure === "Hot") {
    setText("riskTitle", "Hot market");
    setText("riskText", "Demand and current conditions are pushing the number upward. Compare several current listings before anchoring.");
  } else {
    setText("riskTitle", "Normal review");
    setText("riskText", "Current inputs do not show a major pricing warning.");
  }

  setText("negotiationLane", values.sellerType.key === "dealer"
    ? "Use the low end of the range against the written out-the-door quote."
    : "Compare against private-party listings and leave room for inspection findings.");
  setText("documentationHint", values.vehicleType === "new"
    ? "Confirm MSRP, incentives, destination charge, dealer add-ons, taxes, fees, and financing terms."
    : values.vehicleType === "antique"
      ? "Confirm originality, matching numbers when applicable, restoration receipts, provenance, title status, rust, and specialist inspection notes."
      : "Confirm VIN history, title, service records, recalls, tire/brake condition, and inspection results.");
  setText("categoryScope", `${values.make} is tagged as ${categories.join(", ")}.`);
  setText("collectorChecklist", values.vehicleType === "antique"
    ? "Verify originality, matching numbers where applicable, marque documentation, restoration receipts, rust, parts availability, and comparable auction results."
    : "For modern vehicles, verify VIN history, service records, recalls, title status, inspection findings, and current comparable listings.");
}

function renderResult(changedControl = "") {
  document.querySelectorAll("#estimateForm input[type='range']").forEach(clampControlValue);
  sanitizeSelectValue(document.getElementById("categorySelect"));
  sanitizeSelectValue(document.getElementById("vehicleType"));
  sanitizeSelectValue(document.getElementById("makeSelect"));
  sanitizeSelectValue(document.getElementById("modelSelect"));
  updateSliderLabels();
  updateProfileLabels();
  const values = getFormValues();
  const inputAudit = auditEstimateInputs(values);
  const calculatedResult = calculateBenchmark(values);
  const safeResult = failsafeResult(values, inputAudit);
  const result = safeResult || calculatedResult;
  const deal = compareAskingPrice(values, result);
  const targets = negotiationTargets(values, result);
  const ownershipPreview = ownershipCostPreview(values, result);
  const factorImpacts = factorImpactGroups(values);
  operationState.failsafe = safeResult ? "Active" : "Standby";
  if (safeResult) emitOperationEvent("Fail-safe estimate rendered");
  const vehicleName = [values.modelYear, values.make, values.model].filter(Boolean).join(" ");

  document.getElementById("resultTitle").textContent = `${vehicleName || titleCase(values.vehicleType)} benchmark`;
  document.getElementById("benchmarkPrice").textContent = money(result.benchmark);
  document.getElementById("priceRange").textContent = `${money(result.low)} - ${money(result.high)}`;
  document.getElementById("netAdjustment").textContent = `${result.netAdjustment >= 0 ? "+" : ""}${money(result.netAdjustment)}`;
  document.getElementById("outTheDoorPrice").textContent = money(result.outTheDoor);
  document.getElementById("monthlyPayment").textContent = `${money(result.monthlyPayment)}/mo`;
  document.getElementById("taxFeeReserve").textContent = money(result.taxFeeReserve);
  document.getElementById("costPerMile").textContent = `$${Math.max(0.01, result.costPerMile).toFixed(2)}`;
  document.getElementById("marketPressure").textContent = result.marketPressure;
  document.getElementById("ageMileageFit").textContent = result.ageMileageFit;
  document.getElementById("valueVolatility").textContent = result.volatility;
  document.getElementById("buyerLiquidity").textContent = result.liquidity;
  document.getElementById("ownershipRisk").textContent = result.ownershipRisk;
  document.getElementById("dealQuality").textContent = deal.quality;
  document.getElementById("confidenceBand").textContent = confidenceBand(result.qualityScore);
  document.getElementById("firstOffer").textContent = money(targets.firstOffer);
  document.getElementById("walkAwayPoint").textContent = money(targets.walkAway);
  document.getElementById("fairMidpoint").textContent = money(targets.midpoint);
  document.getElementById("regionalAdjustment").textContent = `${values.region.label} (${signedPercent(values.region.adjustment)})`;
  document.getElementById("ownershipPreview").textContent = money(ownershipPreview);
  document.getElementById("maintenanceRisk").textContent = maintenanceRisk(values);
  document.getElementById("fuelSensitivity").textContent = fuelSensitivity(values);
  document.getElementById("depreciationPreview").textContent = depreciationPreview(values, result);
  document.getElementById("transmissionImpact").textContent = transmissionLabel(values);
  document.getElementById("equipmentImpact").textContent = factorImpacts.equipment;
  document.getElementById("historyImpact").textContent = factorImpacts.history;
  document.getElementById("marketLeverage").textContent = factorImpacts.market;
  document.getElementById("specialtyImpact").textContent = factorImpacts.specialty;
  document.getElementById("originalitySignal").textContent = result.originalitySignal;
  document.getElementById("provenanceSignal").textContent = result.provenanceSignal;
  document.getElementById("restorationRisk").textContent = result.restorationRisk;
  document.getElementById("auctionReserve").textContent = money(result.auctionReserve);
  document.getElementById("transportReserve").textContent = money(result.transportReserve);
  document.getElementById("storageReserve").textContent = money(result.storageReserve);
  document.getElementById("signalDemand").textContent = `Demand: ${values.demand.label.toLowerCase()}`;
  document.getElementById("signalHistory").textContent = `History: ${values.history.label.toLowerCase()}`;
  document.getElementById("signalInflation").textContent = `Market mode: ${values.marketMode.label.toLowerCase()}`;
  document.getElementById("signalProduction").textContent = `Production: ${productionLabel(values.profile).toLowerCase()}`;
  document.getElementById("confidenceLabel").textContent = `Confidence: ${result.confidence}`;
  document.getElementById("qualityScore").textContent = `${result.qualityScore} / 100`;
  document.getElementById("qualityMeter").value = result.qualityScore;
  document.getElementById("qualityMeter").textContent = `${result.qualityScore} out of 100`;
  document.getElementById("qualityReason").textContent = result.qualityReason;
  document.getElementById("heroRange").textContent = `${money(result.low)} - ${money(result.high)}`;
  document.getElementById("heroRangeNote").textContent = `${result.segment.label}: ${result.segment.note}`;
  renderHistoricalValue(result);
  document.getElementById("resultNote").textContent = values.vehicleType === "antique"
    ? `${result.segment.label} antique reference (${result.segment.example}). Verify against auction results, marque guides, originality, restoration quality, provenance, and specialist inspection results.`
    : `${result.segment.label} reference (${result.segment.example}). Verify against current listings, VIN history, inspection results, and written out-the-door pricing.`;
  document.getElementById("valuePointOne").textContent = `${values.make} ${values.model} is matched to a controlled ${result.segment.label.toLowerCase()} profile.`;
  document.getElementById("valuePointTwo").textContent = values.vehicleType === "antique"
    ? `${money(result.low)} - ${money(result.high)} gives a collector comparison band before inspection, transport, storage, taxes, fees, and auction premiums.`
    : `${money(result.low)} - ${money(result.high)} gives a comparison band before taxes, fees, financing, and add-ons.`;
  document.getElementById("valuePointThree").textContent = `Highest-impact checks: ${values.history.label.toLowerCase()}, ${values.ownerCount.label.toLowerCase()}, ${values.fleetUse ? "fleet/company use" : "personal-use history"}, ${values.condition.label.toLowerCase()} condition, and ${Number(values.mileage).toLocaleString()} miles.`;
  document.getElementById("lastUpdated").textContent = changedControl
    ? `${changedControl} changed`
    : "Ready";
  renderDecisionSupport(values, result);
  setText("regionalNote", regionalNote(values));
  setText("confidenceExplainer", `${result.confidence}: score reflects mileage, condition, history, demand, profile specificity, and guardrail checks.`);
  renderComparisons();
  persistLastEstimateSnapshot(values, result);
  updateOperationsPanel(values, result, inputAudit);

  const list = document.getElementById("adjustmentList");
  list.innerHTML = result.adjustments
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value >= 0 ? "+" : ""}${money(value)}</dd></div>`)
    .join("");
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("estimatorTheme", theme);
  const isNight = theme === "night";
  document.getElementById("themeToggle").setAttribute("aria-pressed", String(isNight));
  document.getElementById("themeIcon").textContent = "Mode";
  document.getElementById("themeLabel").textContent = isNight ? "Night" : "Day";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", isNight ? "#0e1420" : "#132033");
}

function initializeTheme() {
  const stored = localStorage.getItem("estimatorTheme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
  applyTheme(stored || preferred);
}

function resetEstimate() {
  document.getElementById("categorySelect").value = defaultEstimateState.categorySelect;
  populateMakeSelect(defaultEstimateState.makeSelect);
  document.getElementById("makeSelect").value = defaultEstimateState.makeSelect;
  populateModelSelect(defaultEstimateState.modelProfileId);
  document.getElementById("vehicleType").value = defaultEstimateState.vehicleType;
  document.getElementById("modelYear").value = defaultEstimateState.modelYear;
  document.getElementById("mileage").value = defaultEstimateState.mileage;
  document.getElementById("condition").value = defaultEstimateState.condition;
  document.getElementById("trim").value = defaultEstimateState.trim;
  document.getElementById("region").value = defaultEstimateState.region;
  document.getElementById("sellerType").value = defaultEstimateState.sellerType;
  document.getElementById("history").value = defaultEstimateState.history;
  document.getElementById("ownerCount").value = defaultEstimateState.ownerCount;
  document.getElementById("fleetUse").checked = defaultEstimateState.fleetUse;
  document.getElementById("demand").value = defaultEstimateState.demand;
  document.getElementById("marketMode").value = defaultEstimateState.marketMode;
  document.getElementById("askingPrice").value = defaultEstimateState.askingPrice;
  document.getElementById("fuelType").value = defaultEstimateState.fuelType;
  [
    "drivetrain", "powertrain", "transmission", "optionPackage", "colorDemand", "warrantyStatus",
    "serviceRecords", "wearItems", "recallStatus", "titleBrand", "rustLevel", "repairQuality",
    "accessoryCompleteness", "rentalUse", "dealerAddons", "incentiveLevel", "daysMarket",
    "inventorySupply", "seasonality", "shippingDistance", "commercialIntensity", "evBatteryHealth",
    "taxCredit", "importStatus", "modificationLevel", "aftermarketQuality", "rarity", "matchingNumbers"
  ].forEach((id) => {
    document.getElementById(id).value = defaultEstimateState[id];
  });
  renderResult("Reset");
}

async function copySummary() {
  const summary = [
    document.getElementById("resultTitle").textContent,
    `Benchmark: ${document.getElementById("benchmarkPrice").textContent}`,
    `Range: ${document.getElementById("priceRange").textContent}`,
    `Out-the-door estimate: ${document.getElementById("outTheDoorPrice").textContent}`,
    `Payment estimate: ${document.getElementById("monthlyPayment").textContent}`,
    `Confidence: ${document.getElementById("confidenceLabel").textContent.replace("Confidence: ", "")}`
  ].join("\n");
  await navigator.clipboard.writeText(summary);
  operationState.copy = "Last copy succeeded";
  document.getElementById("lastUpdated").textContent = "Summary copied";
  emitOperationEvent("Summary copied");
  const values = getFormValues();
  const result = calculateBenchmark(values);
  updateOperationsPanel(values, result, auditEstimateInputs(values));
}

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  restoreEstimateSnapshot();
  updateCatalogSummary();
  populateMakeSelect();
  document.getElementById("makeSelect").value = "Toyota";
  populateModelSelect("toyota-rav4-xle");
  renderResult();
  initializeVisitorCounter();

  document.getElementById("categorySelect").addEventListener("change", () => {
    populateMakeSelect(document.getElementById("makeSelect").value);
    populateModelSelect();
    renderResult("Brand category");
  });

  document.getElementById("makeSelect").addEventListener("change", () => {
    populateModelSelect();
    renderResult("Make");
  });

  document.getElementById("vehicleType").addEventListener("change", () => {
    populateMakeSelect(document.getElementById("makeSelect").value);
    populateModelSelect(document.getElementById("modelSelect").value);
    renderResult("Vehicle type");
  });

  document.getElementById("estimateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderResult("Manual refresh");
  });

  document.getElementById("themeToggle").addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "night" ? "day" : "night");
  });

  document.getElementById("resetEstimate").addEventListener("click", resetEstimate);
  document.getElementById("copySummary").addEventListener("click", () => {
    copySummary().catch(() => {
      operationState.copy = "Clipboard unavailable";
      document.getElementById("lastUpdated").textContent = "Copy unavailable";
      const values = getFormValues();
      updateOperationsPanel(values, calculateBenchmark(values), auditEstimateInputs(values));
    });
  });
  bindOptionalClick("saveComparison", saveCurrentComparison);
  bindOptionalClick("clearComparisons", clearSavedComparisons);
  bindOptionalClick("printSummary", () => {
    setText("printStatus", "Print dialog opened.");
    window.print();
  });
  bindOptionalClick("exportJson", exportCurrentJson);
  bindOptionalClick("reportCatalogIssue", reportCatalogIssue);

  document.querySelectorAll("#estimateForm input, #estimateForm select").forEach((control) => {
    const update = () => renderResult(controlLabels[control.id] || "Control");
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });

  document.getElementById("historicalYear").addEventListener("input", () => renderResult("Historical dollar year"));
});
