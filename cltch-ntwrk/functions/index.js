const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Stripe = require('stripe');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const ALLOWED_ORIGINS = new Set([
  'https://cltch-ntwrk-social.web.app',
  'https://cltch-ntwrk.web.app',
  'https://cltch.network',
  'https://www.cltch.network'
]);

function getPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID || '';
  const secret = process.env.PLAID_SECRET || '';
  const envName = (process.env.PLAID_ENV || 'sandbox').toLowerCase();

  if (!clientId || !secret) {
    throw new Error('Plaid secrets are not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.');
  }

  const envMap = {
    sandbox: PlaidEnvironments.sandbox,
    development: PlaidEnvironments.development,
    production: PlaidEnvironments.production
  };

  const config = new Configuration({
    basePath: envMap[envName] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret
      }
    }
  });

  return new PlaidApi(config);
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return {};
    }
  }
  return {};
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return '';
  }
  return authHeader.slice(7).trim();
}

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Firebase-AppCheck');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function validateOrigin(req) {
  const origin = req.headers.origin || '';
  if (!origin) return;
  if (!ALLOWED_ORIGINS.has(origin)) {
    const err = new Error('Origin not allowed.');
    err.status = 403;
    throw err;
  }
}

async function verifyAppCheckIfPresent(req) {
  const token = req.headers['x-firebase-appcheck'];
  if (!token) return null;
  try {
    return await admin.appCheck().verifyToken(token);
  } catch (error) {
    const err = new Error('Invalid App Check token.');
    err.status = 401;
    throw err;
  }
}

async function requireUid(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error('Missing auth token.');
    err.status = 401;
    throw err;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    const err = new Error('Invalid auth token.');
    err.status = 401;
    throw err;
  }
}

async function requireRoleAccess(uid, role) {
  const roleSnap = await db.collection('userRoles').doc(uid).get();
  if (roleSnap.exists && roleSnap.data().role === role) return true;
  const profileRef = role === 'host' ? db.collection('hosts').doc(uid) : db.collection('musicians').doc(uid);
  const profileSnap = await profileRef.get();
  if (profileSnap.exists) return true;
  const err = new Error('Role access denied.');
  err.status = 403;
  throw err;
}

function respond(res, status, payload) {
  res.set('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

function validRole(role) {
  return role === 'host' || role === 'musician';
}

function sanitizeInstitution(name) {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/[^a-zA-Z0-9 .&'\-]/g, '').trim().slice(0, 48);
}

function sanitizeMask(mask) {
  if (!mask || typeof mask !== 'string') return '';
  return mask.replace(/[^0-9]/g, '').slice(-4);
}

function buildDisplayHandle(institution, mask) {
  const safeInstitution = sanitizeInstitution(institution);
  const safeMask = sanitizeMask(mask);
  if (safeInstitution && safeMask) return `Plaid ${safeInstitution} ****${safeMask}`;
  if (safeInstitution) return `Plaid ${safeInstitution}`;
  if (safeMask) return `Plaid ****${safeMask}`;
  return 'Plaid Connected';
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    const err = new Error('Stripe is not configured. Set STRIPE_SECRET_KEY first.');
    err.status = 503;
    throw err;
  }
  return new Stripe(secretKey);
}

function getStripePublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

function stripeConnectedAccountRef(uid, role) {
  return db.collection('stripeAccounts').doc(uid).collection('roles').doc(role);
}

async function getConnectedAccountId(uid, role) {
  const snap = await stripeConnectedAccountRef(uid, role).get();
  if (!snap.exists) {
    const err = new Error('Stripe connected account not found for this role.');
    err.status = 404;
    throw err;
  }
  const accountId = (snap.data() || {}).accountId || '';
  if (!accountId) {
    const err = new Error('Stripe connected account record is incomplete.');
    err.status = 409;
    throw err;
  }
  return accountId;
}

function buildStripeReturnUrl(path) {
  const baseUrl = (process.env.STRIPE_PLATFORM_BASE_URL || 'https://cltch-ntwrk-social.web.app').replace(/\/+$/, '');
  const safePath = String(path || '').replace(/^\/+/, '');
  return `${baseUrl}/${safePath}`;
}

function parseAmountCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    const err = new Error('Invalid amount.');
    err.status = 400;
    throw err;
  }
  return Math.round(amount * 100);
}

async function readDocumentData(collection, id) {
  const snap = await db.collection(collection).doc(id).get();
  return snap.exists ? snap.data() : null;
}

async function readStripeRoleState(uid, role) {
  const snap = await stripeConnectedAccountRef(uid, role).get();
  if (!snap.exists) {
    return {
      connected: false
    };
  }
  const data = snap.data() || {};
  return {
    connected: !!data.accountId,
    accountId: data.accountId || '',
    chargesEnabled: !!data.chargesEnabled,
    payoutsEnabled: !!data.payoutsEnabled,
    detailsSubmitted: !!data.detailsSubmitted,
    updatedAt: data.updatedAt || null
  };
}

async function buildSessionBootstrap(uid, requestedRole) {
  const userSummary = await readDocumentData('users', uid);
  const roleRecord = await readDocumentData('userRoles', uid);
  const resolvedRole = validRole(requestedRole)
    ? requestedRole
    : (validRole(roleRecord?.role) ? roleRecord.role : (validRole(userSummary?.role) ? userSummary.role : 'musician'));
  const [hostProfile, musicianProfile, hostStripe, musicianStripe, plaidItem] = await Promise.all([
    readDocumentData('hosts', uid),
    readDocumentData('musicians', uid),
    readStripeRoleState(uid, 'host'),
    readStripeRoleState(uid, 'musician'),
    readDocumentData('plaidItems', uid)
  ]);

  return {
    uid,
    role: resolvedRole,
    userSummary,
    roleRecord,
    profiles: {
      host: hostProfile,
      musician: musicianProfile,
      active: resolvedRole === 'host' ? hostProfile : musicianProfile
    },
    payments: {
      stripe: {
        ready: !!getStripePublishableKey(),
        host: hostStripe,
        musician: musicianStripe
      },
      plaid: {
        ready: !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET),
        connected: !!plaidItem?.itemId,
        institutionName: plaidItem?.institutionName || '',
        accountMask: plaidItem?.accountMask || '',
        displayHandle: plaidItem?.displayHandle || '',
        updatedAt: plaidItem?.updatedAt || null
      }
    }
  };
}

exports.apiHealth = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'GET') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    respond(res, 200, {
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        firestore: true,
        stripe: {
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY)
        },
        plaid: {
          configured: !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET)
        }
      }
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('apiHealth failed', error);
    respond(res, status, { ok: false, error: error.message || 'Health check failed.' });
  }
});

exports.apiSessionBootstrap = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'GET') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const role = typeof req.query?.role === 'string' ? req.query.role : '';
    const session = await buildSessionBootstrap(uid, role);
    respond(res, 200, {
      ok: true,
      session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('apiSessionBootstrap failed', error);
    respond(res, status, { ok: false, error: error.message || 'Unable to load session bootstrap.' });
  }
});

exports.stripeConfig = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'GET') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    const publishableKey = getStripePublishableKey();
    respond(res, 200, {
      ready: !!publishableKey,
      publishableKey
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('stripeConfig failed', error);
    respond(res, status, { error: error.message || 'Unable to load Stripe config.' });
  }
});

exports.stripeCreateConnectedAccount = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const body = parseBody(req);
    const role = body.role;

    if (!validRole(role)) {
      respond(res, 400, { error: 'Invalid role.' });
      return;
    }
    await requireRoleAccess(uid, role);

    const stripe = getStripeClient();
    const existing = await stripeConnectedAccountRef(uid, role).get();
    if (existing.exists && existing.data().accountId) {
      respond(res, 200, {
        accountId: existing.data().accountId,
        alreadyExists: true
      });
      return;
    }

    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: {
        platform: 'CLTCH.NTWRK',
        uid,
        role
      }
    });

    await stripeConnectedAccountRef(uid, role).set({
      accountId: account.id,
      role,
      uid,
      chargesEnabled: !!account.charges_enabled,
      payoutsEnabled: !!account.payouts_enabled,
      detailsSubmitted: !!account.details_submitted,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    respond(res, 200, {
      accountId: account.id,
      alreadyExists: false
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('stripeCreateConnectedAccount failed', error);
    respond(res, status, { error: error.message || 'Unable to create Stripe connected account.' });
  }
});

exports.stripeCreateOnboardingLink = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const body = parseBody(req);
    const role = body.role;

    if (!validRole(role)) {
      respond(res, 400, { error: 'Invalid role.' });
      return;
    }
    await requireRoleAccess(uid, role);

    const stripe = getStripeClient();
    const accountId = await getConnectedAccountId(uid, role);
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: buildStripeReturnUrl(role === 'host' ? 'host-profile.html' : 'musician-profile.html'),
      return_url: buildStripeReturnUrl(role === 'host' ? 'host-profile.html' : 'musician-profile.html')
    });

    respond(res, 200, {
      url: link.url,
      expiresAt: link.expires_at
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('stripeCreateOnboardingLink failed', error);
    respond(res, status, { error: error.message || 'Unable to create Stripe onboarding link.' });
  }
});

exports.stripeCreateHostCheckoutIntent = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const body = parseBody(req);
    const gigId = typeof body.gigId === 'string' ? body.gigId.trim() : '';
    const performerId = typeof body.performerId === 'string' ? body.performerId.trim() : '';

    if (!gigId || !performerId) {
      respond(res, 400, { error: 'Missing gigId or performerId.' });
      return;
    }

    const gigSnap = await db.collection('gigs').doc(gigId).get();
    if (!gigSnap.exists) {
      respond(res, 404, { error: 'Gig not found.' });
      return;
    }
    const gig = gigSnap.data() || {};
    if (gig.hostId !== uid) {
      respond(res, 403, { error: 'Only the host for this gig can start checkout.' });
      return;
    }

    const stripe = getStripeClient();
    const connectedAccountId = await getConnectedAccountId(performerId, 'musician');
    const totalAmountCents = parseAmountCents(gig.totalChargeAmount || gig.lockedTotalChargeAmount);
    const feeAmountCents = parseAmountCents(gig.processingFeeAmount || gig.lockedProcessingFeeAmount || 0);

    const intent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      application_fee_amount: feeAmountCents,
      transfer_data: {
        destination: connectedAccountId
      },
      metadata: {
        platform: 'CLTCH.NTWRK',
        gigId,
        hostId: uid,
        performerId
      }
    });

    await db.collection('gigs').doc(gigId).set({
      stripeCheckoutPreparedAt: admin.firestore.FieldValue.serverTimestamp(),
      stripePaymentIntentId: intent.id,
      stripeConnectedAccountId: connectedAccountId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    respond(res, 200, {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('stripeCreateHostCheckoutIntent failed', error);
    respond(res, status, { error: error.message || 'Unable to create Stripe checkout intent.' });
  }
});

exports.plaidCreateLinkToken = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const body = parseBody(req);
    const role = body.role;

    if (!validRole(role)) {
      respond(res, 400, { error: 'Invalid role.' });
      return;
    }
    await requireRoleAccess(uid, role);

    const plaidClient = getPlaidClient();

    const linkTokenResp = await plaidClient.linkTokenCreate({
      client_name: 'CLTCH.NTWRK',
      language: 'en',
      country_codes: ['US'],
      products: ['auth'],
      user: {
        client_user_id: `${uid}:${role}`
      },
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings']
        }
      }
    });

    respond(res, 200, {
      linkToken: linkTokenResp.data.link_token,
      expiration: linkTokenResp.data.expiration
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('plaidCreateLinkToken failed', error);
    respond(res, status, { error: error.message || 'Unable to create Plaid link token.' });
  }
});

exports.plaidExchangePublicToken = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    validateOrigin(req);
    await verifyAppCheckIfPresent(req);
    const uid = await requireUid(req);
    const body = parseBody(req);

    const role = body.role;
    const publicToken = body.publicToken;
    const accountId = typeof body.accountId === 'string' ? body.accountId : '';
    const institutionName = typeof body.institutionName === 'string' ? body.institutionName : '';
    const accountMask = typeof body.accountMask === 'string' ? body.accountMask : '';

    if (!validRole(role)) {
      respond(res, 400, { error: 'Invalid role.' });
      return;
    }
    await requireRoleAccess(uid, role);

    if (!publicToken || typeof publicToken !== 'string') {
      respond(res, 400, { error: 'Missing public token.' });
      return;
    }

    const plaidClient = getPlaidClient();
    const exchangeResp = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    const itemId = exchangeResp.data.item_id;
    const accessToken = exchangeResp.data.access_token;

    await db.collection('plaidItems').doc(uid).set(
      {
        [role]: {
          itemId,
          accessToken,
          accountId,
          institutionName: sanitizeInstitution(institutionName),
          accountMask: sanitizeMask(accountMask),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      { merge: true }
    );

    const displayHandle = buildDisplayHandle(institutionName, accountMask);
    respond(res, 200, {
      ok: true,
      displayHandle,
      institutionName: sanitizeInstitution(institutionName),
      accountMask: sanitizeMask(accountMask)
    });
  } catch (error) {
    const status = error.status || 500;
    logger.error('plaidExchangePublicToken failed', error);
    respond(res, status, { error: error.message || 'Unable to exchange Plaid public token.' });
  }
});
