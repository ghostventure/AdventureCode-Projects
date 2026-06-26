const A_OR_ABOVE = new Set(['AA', 'A']);
const B_OR_ABOVE = new Set(['AA', 'A', 'B']);

export const PERFORMER_TIER_RULES = [
  { name: 'Masterclass', minAOrAbove: 500 },
  { name: 'GOAT', minAOrAbove: 200 },
  { name: 'Sensei', minAOrAbove: 30 },
  { name: 'Rising Star', minAOrAbove: 20 },
  { name: 'Senior', minBOrAbove: 5 },
  { name: 'Junior', minBOrAbove: 0 }
];

export function countTierQualifiedRatings(reviews = []) {
  let aOrAboveCount = 0;
  let bOrAboveCount = 0;

  for (const review of reviews) {
    const grade = typeof review?.grade === 'string' ? review.grade.toUpperCase() : '';
    if (A_OR_ABOVE.has(grade)) aOrAboveCount += 1;
    if (B_OR_ABOVE.has(grade)) bOrAboveCount += 1;
  }

  return { aOrAboveCount, bOrAboveCount };
}

export function derivePerformerTier(reviews = []) {
  const { aOrAboveCount, bOrAboveCount } = countTierQualifiedRatings(reviews);
  const tierRule = PERFORMER_TIER_RULES.find((rule) => (
    (typeof rule.minAOrAbove === 'number' && aOrAboveCount >= rule.minAOrAbove)
    || (typeof rule.minBOrAbove === 'number' && bOrAboveCount >= rule.minBOrAbove)
  )) || PERFORMER_TIER_RULES[PERFORMER_TIER_RULES.length - 1];

  const currentIndex = PERFORMER_TIER_RULES.findIndex((rule) => rule.name === tierRule.name);
  const nextRule = currentIndex > 0 ? PERFORMER_TIER_RULES[currentIndex - 1] : null;
  const nextTarget = nextRule
    ? (typeof nextRule.minAOrAbove === 'number' ? nextRule.minAOrAbove : nextRule.minBOrAbove)
    : null;
  const currentQualified = nextRule
    ? (typeof nextRule.minAOrAbove === 'number' ? aOrAboveCount : bOrAboveCount)
    : null;

  return {
    tier: tierRule.name,
    aOrAboveCount,
    bOrAboveCount,
    nextTier: nextRule?.name || null,
    remainingToNextTier: nextRule ? Math.max((nextTarget || 0) - (currentQualified || 0), 0) : 0,
    currentTrackLabel: ['Masterclass', 'GOAT', 'Sensei', 'Rising Star'].includes(tierRule.name) ? 'A or above ratings' : 'B or above ratings'
  };
}

export function describeTierProgress(summary) {
  if (!summary) return 'Every performer starts as Junior.';
  if (!summary.nextTier) return `${summary.tier} unlocked. Top tier reached.`;
  const qualifier = ['Masterclass', 'GOAT', 'Sensei', 'Rising Star'].includes(summary.nextTier)
    ? 'A or above ratings'
    : 'B or above ratings';
  const current = qualifier === 'A or above ratings' ? summary.aOrAboveCount : summary.bOrAboveCount;
  return `${current} ${qualifier} so far. ${summary.remainingToNextTier} more to reach ${summary.nextTier}.`;
}

export function isBusinessClassEligible(summaryOrTier) {
  const tier = typeof summaryOrTier === 'string' ? summaryOrTier : summaryOrTier?.tier;
  return ['Senior', 'Rising Star', 'Sensei', 'GOAT', 'Masterclass'].includes(tier || '');
}
