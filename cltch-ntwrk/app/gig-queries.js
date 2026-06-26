import { collection, limit, orderBy, query, where } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export const OPEN_GIG_LOOKAHEAD_DAYS = 180;
export const OPEN_GIG_QUERY_LIMIT = 120;
export const ACCEPTED_GIG_QUERY_LIMIT = 120;
export const HOST_GIG_QUERY_LIMIT = 200;
export const AVAILABLE_MUSICIAN_QUERY_LIMIT = 250;

export function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export function isoDaysFromToday(days) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function buildOpenGigFeedQuery(db, options = {}) {
  const today = options.today || isoToday();
  const through = options.through || isoDaysFromToday(OPEN_GIG_LOOKAHEAD_DAYS);
  const limitCount = options.limitCount || OPEN_GIG_QUERY_LIMIT;
  return query(
    collection(db, "gigs"),
    where("status", "==", "open"),
    where("date", ">=", today),
    where("date", "<=", through),
    orderBy("date", "asc"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
}

export function buildAcceptedGigQuery(db, musicianId, options = {}) {
  const today = options.today || isoToday();
  const limitCount = options.limitCount || ACCEPTED_GIG_QUERY_LIMIT;
  return query(
    collection(db, "gigs"),
    where("acceptedBy", "==", musicianId),
    where("status", "==", "accepted"),
    where("date", ">=", today),
    orderBy("date", "asc"),
    limit(limitCount)
  );
}

export function buildHostGigQuery(db, hostId, options = {}) {
  const limitCount = options.limitCount || HOST_GIG_QUERY_LIMIT;
  return query(
    collection(db, "gigs"),
    where("hostId", "==", hostId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
}

export function buildAvailableMusiciansQuery(db, performerType = "any", options = {}) {
  const limitCount = options.limitCount || AVAILABLE_MUSICIAN_QUERY_LIMIT;
  const constraints = [where("available", "==", true)];
  if (performerType && performerType !== "any") {
    constraints.push(where("performerType", "==", performerType));
  }
  constraints.push(limit(limitCount));
  return query(collection(db, "musicians"), ...constraints);
}
