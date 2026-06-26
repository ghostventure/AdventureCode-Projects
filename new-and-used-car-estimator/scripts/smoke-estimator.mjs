import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const sitePort = 4173;
const debugPort = 9223;

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript"
};

function serve() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, `http://127.0.0.1:${sitePort}`).pathname;
      const requested = pathname === "/" ? "index.html" : pathname.slice(1);
      const filePath = normalize(join(root, requested));
      if (!filePath.startsWith(root)) throw new Error("Invalid path");
      const body = await readFile(filePath);
      response.writeHead(200, { "Content-Type": types[extname(filePath)] || "text/plain" });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(sitePort, "127.0.0.1", () => resolve(server));
  });
}

async function waitForJson(url, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function cdpSocket(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const callId = ++id;
          ws.send(JSON.stringify({ id: callId, method, params }));
          return new Promise((callResolve, callReject) => {
            pending.set(callId, { resolve: callResolve, reject: callReject });
          });
        },
        close() {
          ws.close();
        }
      });
    });
    ws.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result.value;
}

function priceNumber(value) {
  return Number(String(value).replace(/[^0-9.-]/g, ""));
}

async function price(client) {
  return priceNumber(await evaluate(client, "document.getElementById('benchmarkPrice').textContent"));
}

async function assertPriceChanges(client, label, expression) {
  const before = await price(client);
  await evaluate(client, `(() => { ${expression} })()`);
  await new Promise((resolve) => setTimeout(resolve, 75));
  const after = await price(client);
  if (before === after) {
    throw new Error(`${label} did not change benchmark price (${before})`);
  }
  return { label, before, after };
}

const server = await serve();
const chromium = spawn("chromium", [
  "--headless=new",
  "--no-sandbox",
  `--remote-debugging-port=${debugPort}`,
  `http://127.0.0.1:${sitePort}/`
], { stdio: "ignore" });

try {
  await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
  const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json`);
  const page = pages.find((entry) => entry.type === "page") || pages[0];
  const client = await cdpSocket(page.webSocketDebuggerUrl);
  await client.send("Runtime.enable");
  await new Promise((resolve) => setTimeout(resolve, 500));
  await evaluate(client, "document.readyState === 'complete' || new Promise((resolve) => window.addEventListener('load', () => resolve(true), { once: true }))");

  const checks = [];
  checks.push(await assertPriceChanges(client, "vehicle type", "const el = document.getElementById('vehicleType'); el.value = 'new'; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "model year", "const el = document.getElementById('modelYear'); el.value = el.value === el.min ? el.max : el.min; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "mileage", "const el = document.getElementById('mileage'); el.value = '180000'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "condition", "const el = document.getElementById('condition'); el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "trim/options", "const el = document.getElementById('trim'); el.value = '3'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "region", "const el = document.getElementById('region'); el.value = '4'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "transaction context", "const type = document.getElementById('vehicleType'); type.value = 'used'; type.dispatchEvent(new Event('change', { bubbles: true })); const el = document.getElementById('sellerType'); el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "history/title", "const el = document.getElementById('history'); el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "owner count", "const el = document.getElementById('ownerCount'); el.value = '4'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "fleet/company use", "const el = document.getElementById('fleetUse'); el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "current demand", "const el = document.getElementById('demand'); el.value = '3'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "market mode inflation", "const el = document.getElementById('marketMode'); el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "market mode soft", "const el = document.getElementById('marketMode'); el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "category make/model", "const el = document.getElementById('categorySelect'); el.value = 'Exotic'; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "drivetrain", "const type = document.getElementById('vehicleType'); type.value = 'used'; type.dispatchEvent(new Event('change', { bubbles: true })); const el = document.getElementById('drivetrain'); el.value = 'awd'; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "title brand", "const el = document.getElementById('titleBrand'); el.value = 'rebuilt'; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "inventory supply", "const el = document.getElementById('inventorySupply'); el.value = 'scarce'; el.dispatchEvent(new Event('change', { bubbles: true }));"));
  checks.push(await assertPriceChanges(client, "rarity", "const type = document.getElementById('vehicleType'); type.value = 'antique'; type.dispatchEvent(new Event('change', { bubbles: true })); const el = document.getElementById('rarity'); el.value = 'rare'; el.dispatchEvent(new Event('change', { bubbles: true }));"));

  const catalog = await evaluate(client, "({ makes: document.getElementById('makeSelect').options.length, models: document.getElementById('modelSelect').options.length, category: document.getElementById('categorySelect').value, minYear: document.getElementById('modelYear').min, maxYear: document.getElementById('modelYear').max, status: document.getElementById('lastUpdated').textContent })");
  if (catalog.makes < 1 || catalog.models < 1) throw new Error("Category filter left the estimator without selectable vehicles");
  const theme = await evaluate(client, "(() => { const before = document.body.dataset.theme; document.getElementById('themeToggle').click(); return { before, after: document.body.dataset.theme, label: document.getElementById('themeLabel').textContent }; })()");
  if (theme.before === theme.after) throw new Error("Theme toggle did not change the theme");
  const components = await evaluate(client, "['outTheDoorPrice', 'monthlyPayment', 'taxFeeReserve', 'costPerMile', 'marketPressure', 'ageMileageFit', 'valueVolatility', 'buyerLiquidity', 'ownershipRisk', 'dealQuality', 'confidenceBand', 'firstOffer', 'walkAwayPoint', 'fairMidpoint', 'regionalAdjustment', 'ownershipPreview', 'maintenanceRisk', 'fuelSensitivity', 'depreciationPreview', 'transmissionImpact', 'equipmentImpact', 'historyImpact', 'marketLeverage', 'specialtyImpact', 'originalitySignal', 'provenanceSignal', 'restorationRisk', 'auctionReserve', 'transportReserve', 'storageReserve', 'qualityScore', 'qualityReason', 'historicalYearValue', 'historicalVehicleValue', 'historicalDollarToday', 'currentDollarThen', 'historicalSource', 'historicalNote', 'valuePointOne', 'valuePointTwo', 'valuePointThree', 'exportStatus', 'catalogIssueStatus', 'printStatus', 'catalogSummary'].every((id) => document.getElementById(id)?.textContent.trim().length > 0)");
  if (!components) throw new Error("One or more sophisticated components did not render text");
  const historicalPower = await evaluate(client, `(() => {
    const year = document.getElementById('historicalYear');
    year.value = '1937';
    year.dispatchEvent(new Event('input', { bubbles: true }));
    const dollarToday = Number(document.getElementById('historicalDollarToday').textContent.replace(/[^0-9.-]/g, ''));
    const currentDollarThen = Number(document.getElementById('currentDollarThen').textContent.replace(/[^0-9.-]/g, ''));
    const firstValue = document.getElementById('historicalVehicleValue').textContent;
    year.value = '1886';
    year.dispatchEvent(new Event('input', { bubbles: true }));
    const secondValue = document.getElementById('historicalVehicleValue').textContent;
    return {
      ok: dollarToday >= 20 &&
        dollarToday <= 25 &&
        currentDollarThen >= 0.04 &&
        currentDollarThen <= 0.05 &&
        firstValue !== secondValue &&
        document.getElementById('historicalSource').textContent.includes('estimate') &&
        document.getElementById('historicalNote').textContent.includes('1886'),
      dollarToday,
      currentDollarThen,
      firstValue,
      secondValue,
      source: document.getElementById('historicalSource').textContent,
      note: document.getElementById('historicalNote').textContent
    };
  })()`);
  if (!historicalPower.ok) throw new Error(`Historical purchasing-power card failed: ${JSON.stringify(historicalPower)}`);
  const supportPage = await evaluate(client, `fetch('/support.html').then(async (response) => {
    const html = await response.text();
    return {
      ok: response.ok &&
      html.includes('Decision Support') &&
      html.includes('Operations') &&
      html.includes('Tools') &&
      html.includes('Antique Support') &&
      html.includes('Homework') &&
      html.includes('Market Facts') &&
      html.includes('335.123') &&
      html.includes('$49,220') &&
      html.includes('Back to estimator'),
      length: html.length
    };
  })`);
  if (!supportPage.ok) throw new Error(`Support page content failed: ${JSON.stringify(supportPage)}`);
  const docsPage = await evaluate(client, `fetch('/docs.html').then(async (response) => {
    const html = await response.text();
    return {
      ok: response.ok &&
      html.includes('FAQ') &&
      html.includes('Methodology') &&
      html.includes('Legal') &&
      html.includes('DMCA') &&
      html.includes('Privacy') &&
      html.includes('Webmaster: Black Lion Studios'),
      length: html.length
    };
  })`);
  if (!docsPage.ok) throw new Error(`Docs page content failed: ${JSON.stringify(docsPage)}`);
  const askingPriceFlow = await evaluate(client, `(() => {
    const asking = document.getElementById('askingPrice');
    asking.value = '999999';
    asking.dispatchEvent(new Event('input', { bubbles: true }));
    return {
      ok: document.getElementById('dealQuality').textContent.trim() === 'Likely overpriced' &&
        document.getElementById('firstOffer').textContent.trim().length > 0 &&
        document.getElementById('walkAwayPoint').textContent.trim().length > 0,
      dealQuality: document.getElementById('dealQuality').textContent
    };
  })()`);
  if (!askingPriceFlow.ok) throw new Error(`Asking-price flow failed: ${JSON.stringify(askingPriceFlow)}`);
  const guardRecovery = await evaluate(client, `(() => {
    const mileage = document.getElementById('mileage');
    mileage.value = '9999999';
    mileage.dispatchEvent(new Event('input', { bubbles: true }));
    return {
      ok: Number(mileage.value) <= Number(mileage.max) &&
        document.getElementById('benchmarkPrice').textContent.trim().length > 0,
      mileage: mileage.value,
      price: document.getElementById('benchmarkPrice').textContent
    };
  })()`);
  if (!guardRecovery.ok) throw new Error(`Guard recovery failed: ${JSON.stringify(guardRecovery)}`);
  const footer = await evaluate(client, "document.querySelector('.site-footer')?.textContent.includes('Webmaster: Black Lion Studios') && document.querySelector('.site-footer')?.textContent.includes('Site visits:') && document.getElementById('visitorCount')?.textContent.trim().length > 0 && document.getElementById('visitorCounterStatus')?.textContent.trim().length > 0 && [...document.querySelectorAll('.site-footer a')].some((link) => link.getAttribute('href') === 'support.html') && [...document.querySelectorAll('.site-footer a')].some((link) => link.getAttribute('href') === 'docs.html#privacy')");
  if (!footer) throw new Error("Simplified footer links did not render");
  const discontinued = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    type.value = 'used';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    const category = document.getElementById('categorySelect');
    category.value = 'all';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const make = document.getElementById('makeSelect');
    const nissan = [...make.options].find((option) => option.textContent.trim() === 'Nissan');
    if (!nissan) return { ok: false, reason: 'Nissan not found', makes: [...make.options].map((option) => option.textContent.trim()).slice(0, 20) };
    make.value = nissan.value;
    make.dispatchEvent(new Event('change', { bubbles: true }));
    const model = document.getElementById('modelSelect');
    const altima = [...model.options].find((option) => option.textContent.trim().startsWith('Altima'));
    if (!altima) return { ok: false, reason: 'Altima not found', models: [...model.options].map((option) => option.textContent.trim()).slice(0, 20) };
    model.value = altima.value;
    model.dispatchEvent(new Event('change', { bubbles: true }));
    type.value = 'new';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    const newModels = [...document.getElementById('modelSelect').options].map((option) => option.textContent.trim());
    return {
      ok: !newModels.some((label) => label.startsWith('Altima')),
      newModels: newModels.slice(0, 20),
      maxYear: document.getElementById('modelYear').max,
      production: document.getElementById('profileProduction').textContent
    };
  })()`);
  if (!discontinued.ok) throw new Error(`Discontinued model guard failed: ${JSON.stringify(discontinued)}`);
  const suvCategory = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    const category = document.getElementById('categorySelect');
    const make = document.getElementById('makeSelect');
    const model = document.getElementById('modelSelect');
    type.value = 'used';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'SUV';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const makes = [...make.options].map((entry) => entry.textContent.trim());
    const segments = [];
    for (const makeOption of [...make.options].slice(0, 12)) {
      make.value = makeOption.value;
      make.dispatchEvent(new Event('change', { bubbles: true }));
      for (const modelOption of [...model.options].slice(0, 8)) {
        model.value = modelOption.value;
        model.dispatchEvent(new Event('change', { bubbles: true }));
        segments.push(document.getElementById('profileSegment').textContent.trim());
      }
    }
    return {
      ok: makes.includes('Toyota') &&
        makes.includes('Honda') &&
        makes.includes('Jeep') &&
        segments.length > 0 &&
        segments.every((segment) => /SUV/.test(segment)) &&
        !segments.some((segment) => /sedan|Pickup|Motorcycle|Commercial|Hybrid|Electric vehicle/i.test(segment)),
      makes: makes.slice(0, 30),
      segments: [...new Set(segments)]
    };
  })()`);
  if (!suvCategory.ok) throw new Error(`SUV-only category failed: ${JSON.stringify(suvCategory)}`);
  const crossoverCategory = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    const category = document.getElementById('categorySelect');
    const make = document.getElementById('makeSelect');
    const model = document.getElementById('modelSelect');
    type.value = 'used';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'Crossover';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const makes = [...make.options].map((entry) => entry.textContent.trim());
    const labels = [];
    const segments = [];
    for (const makeName of ['Toyota', 'Honda', 'Mazda', 'Nissan', 'Hyundai', 'Kia']) {
      const makeOption = [...make.options].find((entry) => entry.textContent.trim() === makeName);
      if (!makeOption) continue;
      make.value = makeOption.value;
      make.dispatchEvent(new Event('change', { bubbles: true }));
      for (const modelOption of [...model.options].slice(0, 10)) {
        model.value = modelOption.value;
        model.dispatchEvent(new Event('change', { bubbles: true }));
        labels.push(modelOption.textContent.trim());
        segments.push(document.getElementById('profileSegment').textContent.trim());
      }
    }
    return {
      ok: makes.includes('Toyota') &&
        makes.includes('Honda') &&
        makes.includes('Mazda') &&
        labels.some((label) => /RAV4|CR-V|CX-5|Rogue|Tucson|Sportage/.test(label)) &&
        segments.length > 0 &&
        segments.every((segment) => /SUV/.test(segment)) &&
        !labels.some((label) => /Wrangler|Bronco|4Runner|Tahoe|Suburban|Expedition|Yukon|Armada|Wagoneer|Land Cruiser/.test(label)) &&
        !labels.some((label) => /Sienna|Odyssey|Quest|NV|MPV|Transit|Cargo Van|Sprinter|Metris|Caravan|Carnival|Entourage|Sedona|Matrix|Borrego|Rondo/.test(label)) &&
        !segments.some((segment) => /sedan|Pickup|Motorcycle|Commercial|Hybrid|Electric vehicle/i.test(segment)),
      makes: makes.slice(0, 30),
      labels: labels.slice(0, 40),
      segments: [...new Set(segments)]
    };
  })()`);
  if (!crossoverCategory.ok) throw new Error(`Crossover category failed: ${JSON.stringify(crossoverCategory)}`);
  const commercialVans = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    const category = document.getElementById('categorySelect');
    const make = document.getElementById('makeSelect');
    const model = document.getElementById('modelSelect');
    const selectMake = (name) => {
      const option = [...make.options].find((entry) => entry.textContent.trim() === name);
      if (!option) return false;
      make.value = option.value;
      make.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
    type.value = 'used';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'Commercial';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const usedMakes = [...make.options].map((entry) => entry.textContent.trim());
    const hasFord = selectMake('Ford');
    const usedFordModels = [...model.options].map((entry) => entry.textContent.trim());
    type.value = 'new';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'Commercial';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const newMakes = [...make.options].map((entry) => entry.textContent.trim());
    const hasNewFord = selectMake('Ford');
    const newFordModels = [...model.options].map((entry) => entry.textContent.trim());
    return {
      ok: usedMakes.includes('Ford') &&
        usedMakes.includes('Chevrolet') &&
        usedMakes.includes('GMC') &&
        usedMakes.includes('Mercedes-Benz') &&
        usedMakes.includes('Nissan') &&
        usedMakes.includes('Ram') &&
        usedMakes.includes('Freightliner') &&
        usedMakes.includes('Isuzu') &&
        usedMakes.includes('Hino') &&
        hasFord &&
        usedFordModels.some((label) => label.startsWith('E-350 Cargo Van')) &&
        usedFordModels.some((label) => label.startsWith('E-Series Cutaway Box Truck')) &&
        usedFordModels.some((label) => label.startsWith('Transit Cargo Van')) &&
        newMakes.includes('Ford') &&
        newMakes.includes('Chevrolet') &&
        newMakes.includes('GMC') &&
        newMakes.includes('Ram') &&
        newMakes.includes('Mercedes-Benz') &&
        newMakes.includes('Freightliner') &&
        newMakes.includes('International') &&
        newMakes.includes('Isuzu') &&
        newMakes.includes('Hino') &&
        newMakes.includes('Mitsubishi Fuso') &&
        !newMakes.includes('Nissan') &&
        !newMakes.includes('Dodge') &&
        hasNewFord &&
        newFordModels.some((label) => label.startsWith('Transit Cargo Van')) &&
        newFordModels.some((label) => label.startsWith('E-Series Cutaway')) &&
        newFordModels.some((label) => label.startsWith('F-650 Box Truck')) &&
        newFordModels.every((label) => /Cargo Van|E-Series Cutaway|Box Truck/.test(label)) &&
        !newFordModels.some((label) => label.startsWith('E-350 Cargo Van')),
      usedMakes,
      usedFordModels,
      newMakes,
      newFordModels
    };
  })()`);
  if (!commercialVans.ok) throw new Error(`Commercial cargo van catalog failed: ${JSON.stringify(commercialVans)}`);
  const motorcycles = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    const category = document.getElementById('categorySelect');
    const make = document.getElementById('makeSelect');
    const model = document.getElementById('modelSelect');
    type.value = 'new';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'Motorcycle';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const makes = [...make.options].map((entry) => entry.textContent.trim());
    const yamaha = [...make.options].find((entry) => entry.textContent.trim() === 'Yamaha');
    if (yamaha) {
      make.value = yamaha.value;
      make.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const yamahaModels = [...model.options].map((entry) => entry.textContent.trim());
    const before = Number(document.getElementById('benchmarkPrice').textContent.replace(/[^0-9.-]/g, ''));
    const transmission = document.getElementById('transmission');
    transmission.value = 'manual';
    transmission.dispatchEvent(new Event('change', { bubbles: true }));
    const after = Number(document.getElementById('benchmarkPrice').textContent.replace(/[^0-9.-]/g, ''));
    return {
      ok: makes.includes('Harley-Davidson') &&
        makes.includes('Honda Powersports') &&
        makes.includes('Yamaha') &&
        makes.includes('Kawasaki') &&
        makes.includes('Ducati') &&
        makes.includes('Zero Motorcycles') &&
        yamahaModels.some((label) => label.startsWith('YZF-R7')) &&
        yamahaModels.some((label) => label.startsWith('Tenere 700')) &&
        document.getElementById('profileSegment').textContent.includes('Motorcycle') &&
        document.getElementById('profileModelLane').textContent.includes('Motorcycle') &&
        document.getElementById('transmissionImpact').textContent.trim().length > 0 &&
        before !== after,
      makes,
      yamahaModels,
      segment: document.getElementById('profileSegment').textContent,
      lane: document.getElementById('profileModelLane').textContent,
      transmission: document.getElementById('transmissionImpact').textContent
    };
  })()`);
  if (!motorcycles.ok) throw new Error(`Motorcycle catalog failed: ${JSON.stringify(motorcycles)}`);
  const antique = await evaluate(client, `(() => {
    const type = document.getElementById('vehicleType');
    const category = document.getElementById('categorySelect');
    const make = document.getElementById('makeSelect');
    const model = document.getElementById('modelSelect');
    type.value = 'antique';
    type.dispatchEvent(new Event('change', { bubbles: true }));
    category.value = 'Antique';
    category.dispatchEvent(new Event('change', { bubbles: true }));
    const makes = [...make.options].map((entry) => entry.textContent.trim());
    const ford = [...make.options].find((entry) => entry.textContent.trim() === 'Ford');
    if (ford) {
      make.value = ford.value;
      make.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const fordModels = [...model.options].map((entry) => entry.textContent.trim());
    const before = Number(document.getElementById('benchmarkPrice').textContent.replace(/[^0-9.-]/g, ''));
    const year = document.getElementById('modelYear');
    year.value = year.min;
    year.dispatchEvent(new Event('input', { bubbles: true }));
    const after = Number(document.getElementById('benchmarkPrice').textContent.replace(/[^0-9.-]/g, ''));
    return {
      ok: makes.includes('Ford') &&
        makes.includes('Chevrolet') &&
        makes.includes('Porsche') &&
        fordModels.some((label) => label.startsWith('Model T')) &&
        fordModels.some((label) => label.startsWith('Mustang')) &&
        !fordModels.some((label) => /benchmark/i.test(label)) &&
        Number(year.max) <= 2001 &&
        document.getElementById('profileProduction').textContent.includes('Antique') &&
        document.getElementById('originalitySignal').textContent.trim().length > 0 &&
        document.getElementById('auctionReserve').textContent.trim() !== '$0' &&
        before !== after,
      makes: makes.slice(0, 30),
      fordModels,
      minYear: year.min,
      maxYear: year.max,
      production: document.getElementById('profileProduction').textContent,
      auctionReserve: document.getElementById('auctionReserve').textContent
    };
  })()`);
  if (!antique.ok) throw new Error(`Antique catalog failed: ${JSON.stringify(antique)}`);
  console.log(JSON.stringify({ ok: true, checks, catalog, theme, footer, historicalPower, discontinued, suvCategory, crossoverCategory, commercialVans, motorcycles, antique }, null, 2));
  client.close();
} finally {
  chromium.kill("SIGTERM");
  server.close();
}
