import { Blob } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, "config");
const API = process.env.API || "http://backend:3001";
const PASS = process.env.PASS || "test1234";
const SEED_SCRIPT_KEY = normalizeEnvValue(process.env.SEED_SCRIPT_KEY || "");
const FIXED_SEED = "ft_transcendence-social-seed-generator-v2";
const PLAN_ONLY = process.argv.includes("--plan-only") || process.argv.includes("--verify-only");

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const USER_TIERS = ["showcase", "active", "regular", "light"];
const TONES = ["warm", "dry", "enthusiastic", "calm", "tired", "sarcastic", "focused"];
const POST_FAMILIES = [
  "status",
  "progress",
  "question",
  "opinion",
  "frustration",
  "small_win",
  "photo",
  "event",
];
const COMMENT_FAMILIES = [
  "agreement",
  "advice",
  "reaction",
  "congrats",
  "empathy",
  "banter",
  "follow_up",
];
const CLUSTER_NAMES = ["builders", "designers", "nightshift", "campus", "sports", "misc"];

const TARGETS = {
  users: 100,
  posts: 1000,
  likes: 10000,
  favorites: 500,
  comments: 3000,
  imageRatio: 0.19,
};

const PROFILE_MINIMUMS = {
  acceptedFriends: 2,
  posts: 3,
  authoredComments: 9,
};

const TIER_RANGES = {
  showcase: { min: 18, max: 24 },
  active: { min: 11, max: 15 },
  regular: { min: 7, max: 10 },
  light: { min: 3, max: 6 },
};

const TIER_POST_PICK_WEIGHT = {
  showcase: 2.7,
  active: 2.05,
  regular: 1.35,
  light: 0.72,
};

const TIER_OUTGOING_WEIGHT = {
  showcase: 1.28,
  active: 1.18,
  regular: 1,
  light: 0.82,
};

const IMAGE_BIAS_WEIGHT = {
  low: 0.84,
  medium: 1,
  high: 1.24,
};

const POST_TYPE_WEIGHTS = {
  builders: { status: 18, progress: 24, question: 12, opinion: 7, frustration: 12, small_win: 16, photo: 3, event: 8 },
  designers: { status: 12, progress: 12, question: 8, opinion: 16, frustration: 7, small_win: 10, photo: 24, event: 11 },
  nightshift: { status: 17, progress: 17, question: 9, opinion: 8, frustration: 21, small_win: 10, photo: 4, event: 14 },
  campus: { status: 15, progress: 9, question: 17, opinion: 8, frustration: 6, small_win: 8, photo: 15, event: 22 },
  sports: { status: 17, progress: 10, question: 7, opinion: 15, frustration: 8, small_win: 17, photo: 7, event: 19 },
  misc: { status: 18, progress: 11, question: 12, opinion: 13, frustration: 6, small_win: 11, photo: 7, event: 22 },
};

const MOODS_BY_POST_TYPE = {
  status: ["steady", "calm", "hopeful"],
  progress: ["focused", "relieved", "steady"],
  question: ["curious", "open", "uncertain"],
  opinion: ["playful", "firm", "wry"],
  frustration: ["frayed", "tired", "restless"],
  small_win: ["proud", "light", "relieved"],
  photo: ["reflective", "warm", "playful"],
  event: ["upbeat", "hopeful", "open"],
};

const IMAGE_DIMENSIONS = [
  [600, 400],
  [540, 675],
  [500, 500],
  [640, 360],
  [450, 600],
  [720, 480],
];

const TONE_INTROS = {
  warm: ["Quick note from {city}", "Leaving this here from {city}", "Small check-in from {city}"],
  dry: ["Status check", "Practical note", "Current read"],
  enthusiastic: ["Genuinely happy with this one", "This landed better than expected", "Energy is finally decent here"],
  calm: ["Keeping this simple", "Quiet update", "Leaving the cleaner version here"],
  tired: ["Late note before I disappear", "Logging this before I forget it", "End-of-day note while I still remember"],
  sarcastic: ["Apparently this is today's personality", "Tiny dramatic update", "Amazing how this became a whole thing"],
  focused: ["Checkpoint for the next pass", "Locking this in", "Useful version of the note"]
};

const COMMENT_OPENERS = {
  agreement: {
    warm: ["yes,", "same here,", "honestly, yes,"],
    dry: ["agreed,", "yep,", "same read,"],
    enthusiastic: ["oh yes,", "fully with you,", "yes, this rules,"],
    calm: ["yeah,", "that tracks,", "I get this,"],
    tired: ["yes,", "same mood,", "honestly yes,"],
    sarcastic: ["annoyingly, yes,", "yeah, actually,", "I hate that you are right,"],
    focused: ["agreed,", "same conclusion,", "that lines up,"]
  },
  advice: {
    warm: ["if it helps,", "small thought,", "I would start with"],
    dry: ["try", "start with", "my first pass would be"],
    enthusiastic: ["quick idea,", "okay, I would try", "my vote is"],
    calm: ["I would try", "maybe start with", "one path could be"],
    tired: ["I would still try", "honestly, start with", "maybe just"],
    sarcastic: ["before this turns into a personality trait,", "I would just", "tiny suggestion,"],
    focused: ["start with", "I would test", "my first move would be"]
  },
  reaction: {
    warm: ["love this,", "this landed,", "good one,"],
    dry: ["nice,", "works for me,", "solid,"],
    enthusiastic: ["okay, this is great,", "very into this,", "this rules,"],
    calm: ["this is lovely,", "this works,", "good mood here,"],
    tired: ["this helped,", "needed this one,", "good reset,"],
    sarcastic: ["rude that this looks this good,", "well this is unfairly nice,", "okay, sure, keep posting this,"],
    focused: ["clean shot,", "good frame,", "this reads well,"]
  },
  congrats: {
    warm: ["love this for you,", "very deserved,", "good win,"],
    dry: ["nice one,", "good fix,", "earned,"],
    enthusiastic: ["let's go,", "huge win,", "this is great,"],
    calm: ["well earned,", "good stuff,", "happy to see this,"],
    tired: ["needed a win like this,", "good one,", "earned that,"],
    sarcastic: ["look at you being correct,", "rude that this worked out,", "fine, this is good,"],
    focused: ["solid win,", "that landed,", "good progress,"]
  },
  empathy: {
    warm: ["felt this,", "yeah, I get this,", "oof, yes,"],
    dry: ["I know this one,", "been there,", "that tracks,"],
    enthusiastic: ["oof, yes,", "I know this spiral,", "absolutely felt that,"],
    calm: ["I get this,", "that is a rough one,", "yeah, that is real,"],
    tired: ["this is the exact late-hour mood,", "I know this feeling,", "oof, same,"],
    sarcastic: ["ah yes, the classic,", "love that for absolutely nobody,", "nothing like this exact nightmare,"],
    focused: ["I know this failure mode,", "that is a rough state,", "been in that loop,"]
  },
  banter: {
    warm: ["okay,", "honestly,", "fair enough,"],
    dry: ["sure,", "fair,", "okay then,"],
    enthusiastic: ["okay wow,", "please,", "all right,"],
    calm: ["to be fair,", "honestly,", "all right,"],
    tired: ["okay, fair,", "honestly,", "this got me,"],
    sarcastic: ["well that is rude,", "okay, show-off,", "cool, now my post looks worse,"],
    focused: ["fair,", "all right,", "good point,"]
  },
  follow_up: {
    warm: ["curious,", "real question,", "now I want to know,"],
    dry: ["question,", "follow-up,", "what happened with"],
    enthusiastic: ["okay, question,", "wait, did", "now I need the update on"],
    calm: ["curious,", "wanted to ask,", "how did"],
    tired: ["small question,", "did", "now I am wondering whether"],
    sarcastic: ["genuine question beneath the drama,", "okay but did", "now tell me whether"],
    focused: ["follow-up,", "did", "I want the outcome on"]
  }
};

const TOKENS = new Map();
const USER_IDS = new Map();

async function loadJson(name) {
  const raw = await readFile(path.join(CONFIG_DIR, name), "utf8");
  return JSON.parse(raw);
}

function normalizeEnvValue(value) {
  const trimmed = String(value || "").trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function hashString(input) {
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seed) {
  let state = hashString(seed) || 1;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleIndex(length, rng) {
  return Math.floor(rng() * length);
}

function pick(array, rng) {
  return array[sampleIndex(array.length, rng)];
}

function pickUnique(array, count, rng) {
  const pool = [...array];
  const selected = [];

  while (pool.length > 0 && selected.length < count) {
    selected.push(pool.splice(sampleIndex(pool.length, rng), 1)[0]);
  }

  return selected;
}

function weightedPick(items, weightFn, rng) {
  let total = 0;
  const cumulative = [];

  for (const item of items) {
    const weight = Math.max(0, weightFn(item));

    if (weight <= 0) {
      continue;
    }

    total += weight;
    cumulative.push({ item, total });
  }

  if (total <= 0 || cumulative.length === 0) {
    throw new Error("Weighted pick called without positive weights");
  }

  const roll = rng() * total;
  return cumulative.find((entry) => roll <= entry.total)?.item ?? cumulative.at(-1).item;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pairKey(left, right) {
  return [left, right].sort().join("|");
}

function directedKey(from, to) {
  return `${from}->${to}`;
}

function listSummary(values) {
  return values.length > 0 ? values.join(", ") : "none";
}

function extractCity(location) {
  return String(location).split(",")[0].trim();
}

function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function cleanText(text) {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/([.!?])(?=[A-Za-z])/g, "$1 ")
    .trim();
}

function sharedThemeCount(left, right) {
  const rightSet = new Set(right.themes);
  return left.themes.filter((theme) => rightSet.has(theme)).length;
}

function getThemeData(themes, themeId) {
  const value = themes.themeFragments[themeId];

  if (!value) {
    throw new Error(`Unknown theme fragment set: ${themeId}`);
  }

  return value;
}

function getClusterPairDensity(relationships, leftCluster, rightCluster) {
  const key = pairKey(leftCluster, rightCluster);

  const match = relationships.clusterPairDensities.find((entry) =>
    pairKey(entry.clusters[0], entry.clusters[1]) === key,
  );

  if (!match) {
    throw new Error(`Missing relationship density for ${leftCluster}/${rightCluster}`);
  }

  return match;
}

function validateConfig({ roster, clusters, themes, relationships, showcase }) {
  if (!Array.isArray(roster.users) || roster.users.length !== TARGETS.users) {
    throw new Error(`roster.json must define exactly ${TARGETS.users} users`);
  }

  for (const clusterName of CLUSTER_NAMES) {
    if (!clusters.clusters?.[clusterName]) {
      throw new Error(`clusters.json is missing cluster "${clusterName}"`);
    }
  }

  for (const family of POST_FAMILIES) {
    if (!Array.isArray(themes.postFamilies?.[family]) || themes.postFamilies[family].length === 0) {
      throw new Error(`themes.json is missing post family "${family}"`);
    }
  }

  for (const family of COMMENT_FAMILIES) {
    if (!Array.isArray(themes.commentFamilies?.[family]) || themes.commentFamilies[family].length === 0) {
      throw new Error(`themes.json is missing comment family "${family}"`);
    }
  }

  const tierCounts = Object.fromEntries(USER_TIERS.map((tier) => [tier, 0]));

  for (const user of roster.users) {
    if (!USER_TIERS.includes(user.tier)) {
      throw new Error(`Invalid tier for ${user.username}: ${user.tier}`);
    }

    if (!TONES.includes(user.tone)) {
      throw new Error(`Invalid tone for ${user.username}: ${user.tone}`);
    }

    if (!CLUSTER_NAMES.includes(user.cluster)) {
      throw new Error(`Invalid cluster for ${user.username}: ${user.cluster}`);
    }

    for (const themeId of user.themes) {
      getThemeData(themes, themeId);
    }

    tierCounts[user.tier] += 1;
  }

  if (
    tierCounts.showcase !== 8 ||
    tierCounts.active !== 22 ||
    tierCounts.regular !== 40 ||
    tierCounts.light !== 30
  ) {
    throw new Error(`Tier counts are invalid: ${JSON.stringify(tierCounts)}`);
  }

  const showcaseUsers = Object.keys(showcase.users || {});

  if (showcaseUsers.length !== 8) {
    throw new Error("showcase-users.json must define exactly 8 showcase users");
  }

  for (const username of showcaseUsers) {
    const user = roster.users.find((entry) => entry.username === username);

    if (!user) {
      throw new Error(`showcase user "${username}" does not exist in roster`);
    }

    if (user.tier !== "showcase") {
      throw new Error(`showcase user "${username}" must have tier "showcase"`);
    }
  }

  if (!showcase.users.alice || !showcase.users.bob) {
    throw new Error("showcase-users.json must include alice and bob");
  }
}

function buildProfiles(roster, clusters, showcase, themes) {
  const showcaseMap = showcase.users;

  return roster.users.map((user) => {
    const themeLabel = getThemeData(themes, user.themes[0]).label;
    const secondaryLabel = getThemeData(themes, user.themes[1]).label;
    const defaultProfile = {
      bio: `${capitalize(themeLabel)} notes, ${secondaryLabel} detours, and ${user.habits[0]}.`,
      status: `Today: ${user.habits[1]}.`,
      website: `https://example.com/${user.username}`,
    };

    return {
      ...user,
      email: `${user.username}@test.com`,
      avatar: `https://i.pravatar.cc/300?img=${user.avatarId}`,
      clusterConfig: clusters.clusters[user.cluster],
      showcaseConfig: showcaseMap[user.username] ?? null,
      profile: {
        ...defaultProfile,
        ...(showcaseMap[user.username]?.profile ?? {}),
      },
    };
  });
}

function buildBudgetPlan(users) {
  const budgets = new Map();
  let total = 0;

  for (const user of users) {
    const range = user.showcaseConfig?.postBudget ?? TIER_RANGES[user.tier];
    budgets.set(user.username, range.min);
    total += range.min;
  }

  let remaining = TARGETS.posts - total;

  if (remaining < 0) {
    throw new Error(`Minimum post budgets exceed target total: ${total}`);
  }

  const budgetPriority = [...users].sort((left, right) => {
    const leftRange = left.showcaseConfig?.postBudget ?? TIER_RANGES[left.tier];
    const rightRange = right.showcaseConfig?.postBudget ?? TIER_RANGES[right.tier];
    const leftScore =
      (left.showcaseConfig?.interactionBoost ?? 1) * 10 +
      TIER_POST_PICK_WEIGHT[left.tier] * 4 +
      leftRange.max - leftRange.min +
      (hashString(`budget:${left.username}`) % 100) / 1000;
    const rightScore =
      (right.showcaseConfig?.interactionBoost ?? 1) * 10 +
      TIER_POST_PICK_WEIGHT[right.tier] * 4 +
      rightRange.max - rightRange.min +
      (hashString(`budget:${right.username}`) % 100) / 1000;

    return rightScore - leftScore;
  });

  while (remaining > 0) {
    let changed = false;

    for (const user of budgetPriority) {
      if (remaining === 0) {
        break;
      }

      const range = user.showcaseConfig?.postBudget ?? TIER_RANGES[user.tier];
      const current = budgets.get(user.username);

      if (current >= range.max) {
        continue;
      }

      budgets.set(user.username, current + 1);
      remaining -= 1;
      changed = true;
    }

    if (!changed) {
      throw new Error("Unable to distribute post budgets to reach target total");
    }
  }

  return budgets;
}

function buildGraph(users, relationships, showcase) {
  const userByName = new Map(users.map((user) => [user.username, user]));
  const bridgeBoostByUser = new Map(
    (relationships.bridgeUserOverrides || []).map((entry) => [entry.username, entry]),
  );
  const showcaseBoostByUser = new Map(
    (relationships.showcaseUserConnectionBoosts || []).map((entry) => [entry.username, entry]),
  );

  const acceptedCandidates = [];

  for (let leftIndex = 0; leftIndex < users.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < users.length; rightIndex += 1) {
      const left = users[leftIndex];
      const right = users[rightIndex];
      const density = getClusterPairDensity(relationships, left.cluster, right.cluster);
      const sharedThemes = sharedThemeCount(left, right);
      const leftBridge = left.bridgeClusters?.includes(right.cluster);
      const rightBridge = right.bridgeClusters?.includes(left.cluster);
      const bridgeBoost =
        (leftBridge ? bridgeBoostByUser.get(left.username)?.acceptedBoost ?? 0.06 : 0) +
        (rightBridge ? bridgeBoostByUser.get(right.username)?.acceptedBoost ?? 0.06 : 0);
      const showcaseBoost =
        (showcaseBoostByUser.get(left.username)?.acceptedBoost ?? 0) +
        (showcaseBoostByUser.get(right.username)?.acceptedBoost ?? 0);
      const tierBoost =
        (left.tier === "showcase" || right.tier === "showcase" ? 0.12 : 0) +
        (left.tier === "light" && right.tier === "light" && left.cluster !== right.cluster ? -0.05 : 0);
      const affinityWeight =
        left.clusterConfig.crossClusterAffinityWeights[right.cluster] +
        right.clusterConfig.crossClusterAffinityWeights[left.cluster];
      const score =
        density.accepted * 100 +
        affinityWeight * 11 +
        sharedThemes * 4 +
        bridgeBoost * 100 +
        showcaseBoost * 100 +
        tierBoost * 100 -
        (hashString(`accepted:${pairKey(left.username, right.username)}`) % 1000) / 55;

      acceptedCandidates.push({ left: left.username, right: right.username, score });
    }
  }

  acceptedCandidates.sort((left, right) => right.score - left.score);

  const acceptedPairs = selectAcceptedPairs(
    acceptedCandidates,
    users,
    relationships.targets.acceptedTotal,
    PROFILE_MINIMUMS.acceptedFriends,
  );
  const acceptedSet = new Set(acceptedPairs.map(([left, right]) => pairKey(left, right)));

  const pendingPairs = [];
  const pendingSet = new Set();

  for (const [username, config] of Object.entries(showcase.users)) {
    for (const source of config.guaranteedIncomingPendingFrom || []) {
      const key = directedKey(source, username);
      const pair = pairKey(source, username);

      if (!acceptedSet.has(pair) && !pendingSet.has(key) && !pendingSet.has(directedKey(username, source))) {
        pendingPairs.push([source, username]);
        pendingSet.add(key);
      }
    }

    for (const target of config.guaranteedOutgoingPendingTo || []) {
      const key = directedKey(username, target);
      const pair = pairKey(username, target);

      if (!acceptedSet.has(pair) && !pendingSet.has(key) && !pendingSet.has(directedKey(target, username))) {
        pendingPairs.push([username, target]);
        pendingSet.add(key);
      }
    }
  }

  const pendingCandidates = [];

  for (const sender of users) {
    for (const receiver of users) {
      if (sender.username === receiver.username) {
        continue;
      }

      const pair = pairKey(sender.username, receiver.username);
      const key = directedKey(sender.username, receiver.username);

      if (acceptedSet.has(pair) || pendingSet.has(key) || pendingSet.has(directedKey(receiver.username, sender.username))) {
        continue;
      }

      const density = getClusterPairDensity(relationships, sender.cluster, receiver.cluster);
      const sharedThemes = sharedThemeCount(sender, receiver);
      const senderBridge = sender.bridgeClusters?.includes(receiver.cluster);
      const receiverBridge = receiver.bridgeClusters?.includes(sender.cluster);
      const bridgeBoost =
        (senderBridge ? bridgeBoostByUser.get(sender.username)?.pendingBoost ?? 0.03 : 0) +
        (receiverBridge ? bridgeBoostByUser.get(receiver.username)?.pendingBoost ?? 0.02 : 0);
      const showcaseBoost =
        (showcaseBoostByUser.get(sender.username)?.outgoingPendingBoost ?? 0) +
        (showcaseBoostByUser.get(receiver.username)?.incomingPendingBoost ?? 0) +
        (showcaseBoostByUser.get(sender.username)?.pendingBoost ?? 0) +
        (showcaseBoostByUser.get(receiver.username)?.pendingBoost ?? 0);
      const score =
        density.pending * 100 +
        sender.clusterConfig.crossClusterAffinityWeights[receiver.cluster] * 9 +
        sharedThemes * 3 +
        bridgeBoost * 100 +
        showcaseBoost * 100 +
        TIER_OUTGOING_WEIGHT[sender.tier] * 6 -
        (hashString(`pending:${key}`) % 1000) / 60;

      pendingCandidates.push([sender.username, receiver.username, score]);
    }
  }

  pendingCandidates.sort((left, right) => right[2] - left[2]);

  for (const [sender, receiver] of pendingCandidates) {
    if (pendingPairs.length >= relationships.targets.pendingTotal) {
      break;
    }

    const pair = pairKey(sender, receiver);
    const key = directedKey(sender, receiver);

    if (acceptedSet.has(pair) || pendingSet.has(key) || pendingSet.has(directedKey(receiver, sender))) {
      continue;
    }

    pendingPairs.push([sender, receiver]);
    pendingSet.add(key);
  }

  return {
    acceptedPairs,
    pendingPairs,
    acceptedSet,
    pendingSet,
    userByName,
  };
}

function selectAcceptedPairs(candidates, users, targetTotal, minimumPerUser) {
  const acceptedPairs = [];
  const acceptedSet = new Set();
  const acceptedCountByUser = new Map(users.map((user) => [user.username, 0]));

  function addPair(left, right) {
    const key = pairKey(left, right);

    if (acceptedSet.has(key)) {
      return false;
    }

    acceptedPairs.push([left, right]);
    acceptedSet.add(key);
    acceptedCountByUser.set(left, (acceptedCountByUser.get(left) || 0) + 1);
    acceptedCountByUser.set(right, (acceptedCountByUser.get(right) || 0) + 1);
    return true;
  }

  let progress = true;

  while (progress) {
    progress = false;

    for (const candidate of candidates) {
      if (acceptedPairs.length >= targetTotal) {
        break;
      }

      const leftCount = acceptedCountByUser.get(candidate.left) || 0;
      const rightCount = acceptedCountByUser.get(candidate.right) || 0;

      if (leftCount >= minimumPerUser && rightCount >= minimumPerUser) {
        continue;
      }

      if (addPair(candidate.left, candidate.right)) {
        progress = true;
      }
    }

    if ([...acceptedCountByUser.values()].every((count) => count >= minimumPerUser)) {
      break;
    }
  }

  const unmetUsers = [...acceptedCountByUser.entries()]
    .filter(([, count]) => count < minimumPerUser)
    .map(([username]) => username);

  if (unmetUsers.length > 0) {
    throw new Error(
      `Unable to satisfy minimum accepted friends (${minimumPerUser}) for: ${unmetUsers.join(", ")}`,
    );
  }

  for (const candidate of candidates) {
    if (acceptedPairs.length >= targetTotal) {
      break;
    }

    addPair(candidate.left, candidate.right);
  }

  if (acceptedPairs.length !== targetTotal) {
    throw new Error(`Unable to reach accepted friendship target of ${targetTotal}`);
  }

  return acceptedPairs;
}

function describeRelation(author, actor, graph) {
  return {
    accepted: graph.acceptedSet.has(pairKey(author.username, actor.username)),
    pending:
      graph.pendingSet.has(directedKey(author.username, actor.username)) ||
      graph.pendingSet.has(directedKey(actor.username, author.username)),
    sameCluster: author.cluster === actor.cluster,
    bridge:
      author.bridgeClusters?.includes(actor.cluster) ||
      actor.bridgeClusters?.includes(author.cluster) ||
      false,
  };
}

function pickAuthor(remainingBudgets, users, recentAuthors, rng) {
  const candidates = users.filter((user) => remainingBudgets.get(user.username) > 0);
  const filtered = candidates.filter((user) => !recentAuthors.includes(user.username));
  const pool = filtered.length > 0 ? filtered : candidates;

  return weightedPick(
    pool,
    (user) => {
      const remaining = remainingBudgets.get(user.username);
      const interactionBoost = user.showcaseConfig?.interactionBoost ?? 1;
      return remaining * TIER_POST_PICK_WEIGHT[user.tier] * interactionBoost;
    },
    rng,
  );
}

function pickPostType(user, rng) {
  const weights = POST_TYPE_WEIGHTS[user.cluster];
  const families = Object.keys(weights);
  return weightedPick(families, (family) => weights[family], rng);
}

function buildSyntheticTimeline(totalPosts) {
  const rng = createRng(`${FIXED_SEED}:timeline`);
  const timeline = [];
  let cursor = Date.now() - 14 * DAY;

  for (let index = 0; index < totalPosts; index += 1) {
    let gapMinutes;

    if (index > 0 && index % 57 === 0) {
      gapMinutes = 360 + Math.floor(rng() * 180);
    } else if (index % 19 < 4) {
      gapMinutes = 3 + Math.floor(rng() * 7);
    } else if (index % 27 > 20) {
      gapMinutes = 18 + Math.floor(rng() * 28);
    } else {
      gapMinutes = 9 + Math.floor(rng() * 16);
    }

    cursor += gapMinutes * MINUTE;
    timeline.push(new Date(cursor));
  }

  const latestAllowed = Date.now() - 45 * MINUTE;
  const drift = timeline.at(-1).getTime() - latestAllowed;

  if (drift > 0) {
    return timeline.map((value) => new Date(value.getTime() - drift));
  }

  return timeline;
}

function buildPostPlans(users, budgets, themes, showcase) {
  const rng = createRng(`${FIXED_SEED}:posts`);
  const timeline = buildSyntheticTimeline(TARGETS.posts);
  const remainingBudgets = new Map(budgets);
  const recentAuthors = [];
  const plans = [];

  for (let sequence = 0; sequence < TARGETS.posts; sequence += 1) {
    const author = pickAuthor(remainingBudgets, users, recentAuthors.slice(-2), rng);
    const type = pickPostType(author, rng);
    const theme = pick(author.themes, rng);
    const themeData = getThemeData(themes, theme);
    const mood = pick(MOODS_BY_POST_TYPE[type], rng);
    const asksForReply =
      type === "question" ||
      type === "event" ||
      type === "frustration" ||
      (type === "opinion" && rng() < 0.55) ||
      (type === "status" && rng() < 0.22);
    const hooks = pickUnique(themeData.hooks, Math.min(2, themeData.hooks.length), rng);

    plans.push({
      sequence,
      author,
      type,
      theme,
      mood,
      asksForReply,
      hooks,
      createdAt: timeline[sequence],
      targetReach: "normal",
      hasImage: false,
      imageSpec: null,
      content: "",
      threadAnchor: false,
    });

    remainingBudgets.set(author.username, remainingBudgets.get(author.username) - 1);
    recentAuthors.push(author.username);
  }

  allocateImages(plans, showcase);
  assignTargetReach(plans);
  assignThreadAnchors(plans, showcase);

  for (const plan of plans) {
    plan.content = renderPostContent(plan, themes);
  }

  return plans;
}

function makeImageSpec(plan) {
  const [width, height] = IMAGE_DIMENSIONS[plan.sequence % IMAGE_DIMENSIONS.length];
  const seed = `${plan.author.username}-${plan.sequence + 1}-${plan.type}`;

  return {
    seed,
    width,
    height,
    url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`,
  };
}

function allocateImages(plans, showcase) {
  const target = Math.round(TARGETS.posts * TARGETS.imageRatio);
  const scored = plans.map((plan) => {
    const clusterModifier = plan.author.clusterConfig.imageLikelihoodModifier;
    const bias = IMAGE_BIAS_WEIGHT[plan.author.imageBias] ?? 1;
    const score =
      (plan.type === "photo" ? 4 : 0) +
      (plan.type === "event" ? 1.1 : 0) +
      (plan.author.showcaseConfig ? 0.8 : 0) +
      clusterModifier +
      bias +
      (hashString(`image:${plan.sequence}`) % 1000) / 1000;

    return { plan, score };
  });

  const selected = new Set();

  for (const item of scored.filter((entry) => entry.plan.type === "photo")) {
    selected.add(item.plan.sequence);
  }

  for (const [username, config] of Object.entries(showcase.users)) {
    const userPlans = scored
      .filter((entry) => entry.plan.author.username === username)
      .sort((left, right) => right.score - left.score);

    for (const item of userPlans.slice(0, config.guaranteedImagePosts || 0)) {
      selected.add(item.plan.sequence);
    }
  }

  for (const item of [...scored].sort((left, right) => right.score - left.score)) {
    if (selected.size >= target) {
      break;
    }

    selected.add(item.plan.sequence);
  }

  for (const plan of plans) {
    if (selected.has(plan.sequence)) {
      plan.hasImage = true;
      plan.imageSpec = makeImageSpec(plan);
    }
  }
}

function assignTargetReach(plans) {
  const hotTarget = 200;
  const lowTarget = 300;
  const scored = plans.map((plan) => {
    const score =
      (plan.author.showcaseConfig ? 2.2 : 0) +
      (plan.hasImage ? 0.9 : 0) +
      (plan.asksForReply ? 0.8 : 0) +
      (plan.type === "question" ? 0.9 : 0) +
      (plan.type === "opinion" ? 0.6 : 0) +
      (plan.type === "photo" ? 0.8 : 0) +
      (plan.type === "event" ? 0.6 : 0) +
      (hashString(`reach:${plan.sequence}`) % 1000) / 1000;

    return { plan, score };
  });

  scored.sort((left, right) => right.score - left.score);

  for (const item of scored.slice(0, hotTarget)) {
    item.plan.targetReach = "hot";
  }

  for (const item of scored.slice(-lowTarget)) {
    if (item.plan.targetReach !== "hot") {
      item.plan.targetReach = "low";
    }
  }
}

function assignThreadAnchors(plans, showcase) {
  for (const [username, config] of Object.entries(showcase.users)) {
    const userPlans = plans
      .filter((plan) => plan.author.username === username)
      .sort((left, right) => {
        const leftScore =
          (left.targetReach === "hot" ? 3 : left.targetReach === "normal" ? 2 : 1) +
          (left.asksForReply ? 1 : 0) +
          (left.hasImage ? 0.5 : 0);
        const rightScore =
          (right.targetReach === "hot" ? 3 : right.targetReach === "normal" ? 2 : 1) +
          (right.asksForReply ? 1 : 0) +
          (right.hasImage ? 0.5 : 0);

        return rightScore - leftScore || left.sequence - right.sequence;
      });

    for (const plan of userPlans.slice(0, config.guaranteedCommentThreads || 0)) {
      plan.threadAnchor = true;
    }
  }
}

function pickFromTheme(theme, field, key) {
  const rng = createRng(`${FIXED_SEED}:${key}`);
  return pick(theme[field], rng);
}

function buildAsk(plan) {
  if (!plan.asksForReply) {
    return "";
  }

  const rng = createRng(`${FIXED_SEED}:ask:${plan.sequence}`);

  if (plan.type === "event") {
    return "If you are around later, let me know.";
  }

  return pick(
    [
      "If you have a cleaner take, I want it.",
      "Would take a second read from anybody nearby.",
      "Curious whether somebody else would solve this differently.",
      "Happy to compare notes if you have a better path.",
    ],
    rng,
  );
}

function buildPostLead(plan) {
  const city = extractCity(plan.author.location);
  const intro = fillTemplate(
    pick(TONE_INTROS[plan.author.tone], createRng(`${FIXED_SEED}:lead:${plan.sequence}`)),
    { city },
  );
  const clusterHint = pick(
    plan.author.clusterConfig.defaultToneFragments,
    createRng(`${FIXED_SEED}:clusterlead:${plan.sequence}`),
  );
  const hook = plan.hooks[0];

  return cleanText(`${intro}, ${clusterHint}, around ${hook}`);
}

function buildDetailLine(plan, themeData) {
  const detail = pickFromTheme(themeData, "details", `detail:${plan.sequence}`);
  const habit = plan.author.habits[plan.sequence % plan.author.habits.length];

  if (plan.type === "photo") {
    return cleanText(`${detail}, somewhere between ${habit} and ${plan.hooks[0]}`);
  }

  return cleanText(`${detail} after ${habit}`);
}

function buildQuestionLine(plan, themeData, themes) {
  const fragment = pick(themes.questionFragments, createRng(`${FIXED_SEED}:question:${plan.sequence}`));
  return cleanText(`${fragment} ${capitalize(themeData.label)} is where I keep circling.`);
}

function buildOpinionLine(plan, themeData, themes) {
  const fragment = pick(themes.opinionFragments, createRng(`${FIXED_SEED}:opinion:${plan.sequence}`));
  return cleanText(`${fragment} ${capitalize(themeData.label)} reads better when it stays simple.`);
}

function buildFrustrationLine(plan, themeData, themes) {
  const fragment = pick(themes.frustrationFragments, createRng(`${FIXED_SEED}:frustration:${plan.sequence}`));
  return cleanText(`${fragment} ${capitalize(themeData.label)} keeps dragging one more hidden state into it.`);
}

function buildWinLine(plan, themeData, themes) {
  const fragment = pick(themes.winFragments, createRng(`${FIXED_SEED}:win:${plan.sequence}`));
  return cleanText(`${fragment} ${capitalize(themeData.label)} finally feels calmer.`);
}

function buildCaption(plan, themes) {
  const fragment = pick(themes.mediaCaptionFragments, createRng(`${FIXED_SEED}:caption:${plan.sequence}`));
  return cleanText(`${fragment} around ${plan.hooks[0]}`);
}

function buildEventLine(plan) {
  const city = extractCity(plan.author.location);

  return cleanText(`Probably around ${city} later for ${plan.hooks[0]} if anybody wants in.`);
}

function renderPostContent(plan, themes) {
  const themeData = getThemeData(themes, plan.theme);
  const template = pick(
    themes.postFamilies[plan.type],
    createRng(`${FIXED_SEED}:template:${plan.type}:${plan.sequence}`),
  );

  const values = {
    lead: buildPostLead(plan),
    detail: buildDetailLine(plan, themeData),
    win: buildWinLine(plan, themeData, themes),
    question: buildQuestionLine(plan, themeData, themes),
    opinion: buildOpinionLine(plan, themeData, themes),
    frustration: buildFrustrationLine(plan, themeData, themes),
    caption: buildCaption(plan, themes),
    eventLine: buildEventLine(plan),
    ask: buildAsk(plan),
  };

  return cleanText(fillTemplate(template, values));
}

function allocateCounts(items, target, { baseFn, capFn, weightFn, seedLabel }) {
  const counts = items.map((item, index) => Math.max(0, Math.floor(baseFn(item, index))));
  const caps = items.map((item, index) => Math.max(counts[index], Math.floor(capFn(item, index))));
  const weights = items.map((item, index) => Math.max(0.01, weightFn(item, index)));
  const used = counts.reduce((sum, value) => sum + value, 0);
  let remaining = target - used;

  if (remaining < 0) {
    throw new Error(`Base allocation for ${seedLabel} exceeds target by ${Math.abs(remaining)}`);
  }

  const rng = createRng(`${FIXED_SEED}:${seedLabel}`);

  while (remaining > 0) {
    let total = 0;
    const cumulative = [];

    for (let index = 0; index < items.length; index += 1) {
      if (counts[index] >= caps[index]) {
        continue;
      }

      const dynamicWeight = weights[index] / (1 + counts[index] * 0.17);
      total += dynamicWeight;
      cumulative.push({ index, total });
    }

    if (total <= 0 || cumulative.length === 0) {
      throw new Error(`Unable to complete allocation for ${seedLabel}`);
    }

    const roll = rng() * total;
    const selected = cumulative.find((entry) => roll <= entry.total) ?? cumulative.at(-1);
    counts[selected.index] += 1;
    remaining -= 1;
  }

  return counts;
}

function buildEngagementPlans(posts, graph) {
  const likeCounts = allocateCounts(posts, TARGETS.likes, {
    seedLabel: "likes",
    baseFn: (post) => (post.targetReach === "hot" ? 4 : post.threadAnchor ? 2 : 0),
    capFn: (post) => {
      const base = post.targetReach === "hot" ? 34 : post.targetReach === "normal" ? 18 : 8;
      return clamp(base + (post.hasImage ? 2 : 0) + (post.author.showcaseConfig ? 3 : 0), 0, 50);
    },
    weightFn: (post) => {
      return (
        (post.targetReach === "hot" ? 4.2 : post.targetReach === "normal" ? 1.8 : 0.45) +
        (post.hasImage ? 0.85 : 0) +
        (post.type === "photo" ? 0.7 : 0) +
        (post.type === "question" ? 0.5 : 0) +
        (post.type === "opinion" ? 0.4 : 0) +
        (post.author.showcaseConfig?.incomingBoost ?? 1) * 0.6
      );
    },
  });

  const commentCounts = allocateCounts(posts, TARGETS.comments, {
    seedLabel: "comments",
    baseFn: (post) => {
      if (post.threadAnchor) {
        return post.targetReach === "hot" ? 4 : 3;
      }

      if (post.targetReach === "hot" && post.asksForReply) {
        return 1;
      }

      return 0;
    },
    capFn: (post) => {
      if (post.targetReach === "hot") {
        return post.threadAnchor ? 12 : 9;
      }

      if (post.targetReach === "normal") {
        return post.asksForReply ? 6 : 4;
      }

      return post.asksForReply ? 2 : 1;
    },
    weightFn: (post) => {
      return (
        (post.targetReach === "hot" ? 3.8 : post.targetReach === "normal" ? 1.55 : 0.3) +
        (post.asksForReply ? 1.15 : 0) +
        (post.threadAnchor ? 2.2 : 0) +
        (post.type === "question" ? 0.9 : 0) +
        (post.type === "frustration" ? 0.8 : 0) +
        (post.type === "small_win" ? 0.65 : 0) +
        (post.type === "opinion" ? 0.45 : 0) +
        (post.type === "photo" ? 0.55 : 0)
      );
    },
  });

  const likeCountBySequence = new Map(
    posts.map((post, index) => [post.sequence, likeCounts[index]]),
  );
  const favoriteEligible = posts.filter((post) =>
    ["photo", "progress", "question", "small_win", "event"].includes(post.type) ||
    (post.targetReach === "hot" && post.hasImage),
  );
  const favoriteCounts = allocateCounts(favoriteEligible, TARGETS.favorites, {
    seedLabel: "favorites",
    baseFn: () => 0,
    capFn: (post) => {
      const likeCap = likeCountBySequence.get(post.sequence) || 0;
      let desiredCap;

      if (post.type === "photo") {
        desiredCap = post.targetReach === "hot" ? 4 : 2;
      } else if (post.type === "question") {
        desiredCap = post.targetReach === "hot" ? 3 : 1;
      } else if (post.type === "progress" || post.type === "small_win") {
        desiredCap = post.targetReach === "hot" ? 3 : 1;
      } else {
        desiredCap = post.targetReach === "hot" ? 2 : 1;
      }

      return Math.min(likeCap, desiredCap);
    },
    weightFn: (post) => {
      return (
        (post.type === "photo" ? 2.8 : 0) +
        (post.type === "progress" ? 1.6 : 0) +
        (post.type === "question" ? 1.4 : 0) +
        (post.type === "small_win" ? 1.2 : 0) +
        (post.hasImage ? 0.8 : 0) +
        (post.targetReach === "hot" ? 1.2 : 0.25)
      );
    },
  });

  const favoriteCountBySequence = new Map(
    favoriteEligible.map((post, index) => [post.sequence, favoriteCounts[index]]),
  );

  const commentPlansBySequence = assignCommentPlans(posts, graph, commentCounts);

  return posts.map((post, index) => {
    const likeTargets = clamp(likeCounts[index], 0, 99);
    const favoriteTargets = clamp(favoriteCountBySequence.get(post.sequence) || 0, 0, 99);

    const likeCandidates = buildActorWeights(post, graph, "like");
    const likes = pickUniqueUsersWeighted(likeCandidates, likeTargets, `likes:${post.sequence}`);
    const favoriteCandidates = likeCandidates.filter((entry) => likes.some((user) => user.username === entry.user.username));
    const favorites = pickUniqueUsersWeighted(
      favoriteCandidates.map((entry) => ({
        ...entry,
        weight:
          entry.weight +
          (post.type === "photo" ? 1.4 : 0) +
          (post.type === "progress" ? 0.8 : 0) +
          (post.type === "question" ? 0.7 : 0),
      })),
      favoriteTargets,
      `favorites:${post.sequence}`,
    );
    const comments = (commentPlansBySequence.get(post.sequence) || []).map((user, commentIndex) => {
      const relation = describeRelation(post.author, user, graph);
      const family = pickCommentFamily(post, relation, commentIndex);

      return {
        user,
        family,
        content: renderCommentContent(post, user, family, relation, commentIndex),
      };
    });

    return {
      sequence: post.sequence,
      likes,
      favorites,
      comments,
    };
  });
}

function assignCommentPlans(posts, graph, commentCounts) {
  const commentPlansBySequence = new Map(posts.map((post) => [post.sequence, []]));
  const commentSlotsRemaining = new Map(
    posts.map((post, index) => [post.sequence, clamp(commentCounts[index], 0, 99)]),
  );
  const authoredCommentsByUser = new Map(
    [...graph.userByName.values()].map((user) => [user.username, 0]),
  );

  for (const user of graph.userByName.values()) {
    const rankedPosts = posts
      .filter((post) => post.author.username !== user.username)
      .map((post) => ({
        post,
        weight:
          calculateActorWeight(post, user, graph, "comment") +
          (post.threadAnchor ? 2.4 : 0) +
          (post.asksForReply ? 1.1 : 0) +
          (post.targetReach === "hot" ? 1.3 : post.targetReach === "normal" ? 0.55 : 0),
      }))
      .sort((left, right) => right.weight - left.weight);

    for (const { post } of rankedPosts) {
      if ((authoredCommentsByUser.get(user.username) || 0) >= PROFILE_MINIMUMS.authoredComments) {
        break;
      }

      const remainingSlots = commentSlotsRemaining.get(post.sequence) || 0;
      const currentPlans = commentPlansBySequence.get(post.sequence) || [];

      if (remainingSlots <= 0 || currentPlans.some((entry) => entry.username === user.username)) {
        continue;
      }

      currentPlans.push(user);
      commentPlansBySequence.set(post.sequence, currentPlans);
      commentSlotsRemaining.set(post.sequence, remainingSlots - 1);
      authoredCommentsByUser.set(
        user.username,
        (authoredCommentsByUser.get(user.username) || 0) + 1,
      );
    }
  }

  const unmetUsers = [...authoredCommentsByUser.entries()]
    .filter(([, count]) => count < PROFILE_MINIMUMS.authoredComments)
    .map(([username]) => username);

  if (unmetUsers.length > 0) {
    throw new Error(
      `Unable to satisfy minimum authored comments (${PROFILE_MINIMUMS.authoredComments}) for: ${unmetUsers.join(", ")}`,
    );
  }

  for (const post of posts) {
    const remainingSlots = commentSlotsRemaining.get(post.sequence) || 0;

    if (remainingSlots <= 0) {
      continue;
    }

    const existingUsers = new Set(
      (commentPlansBySequence.get(post.sequence) || []).map((user) => user.username),
    );
    const weightedCandidates = buildActorWeights(post, graph, "comment").map((entry) => ({
      ...entry,
      weight:
        entry.weight +
        Math.max(
          0,
          PROFILE_MINIMUMS.authoredComments - (authoredCommentsByUser.get(entry.user.username) || 0),
        ) *
          1.6,
    }));
    const selectedUsers = pickUniqueUsersWeighted(
      weightedCandidates.filter((entry) => !existingUsers.has(entry.user.username)),
      remainingSlots,
      `comments:${post.sequence}`,
    );
    const currentPlans = commentPlansBySequence.get(post.sequence) || [];

    for (const user of selectedUsers) {
      currentPlans.push(user);
      authoredCommentsByUser.set(
        user.username,
        (authoredCommentsByUser.get(user.username) || 0) + 1,
      );
    }

    commentPlansBySequence.set(post.sequence, currentPlans);
    commentSlotsRemaining.set(post.sequence, 0);
  }

  return commentPlansBySequence;
}

function buildActorWeights(post, graph, mode) {
  return [...graph.userByName.values()]
    .filter((user) => user.username !== post.author.username)
    .map((user) => {
      return { user, weight: calculateActorWeight(post, user, graph, mode) };
    });
}

function calculateActorWeight(post, user, graph, mode) {
  const relation = describeRelation(post.author, user, graph);
  const sharedThemes = sharedThemeCount(post.author, user);
  let weight = 0.35 + TIER_OUTGOING_WEIGHT[user.tier];

  if (relation.accepted) {
    weight += mode === "comment" ? 4.6 : 5.2;
  }

  if (relation.sameCluster) {
    weight += mode === "comment" ? 2.1 : 1.8;
  }

  if (relation.bridge) {
    weight += mode === "comment" ? 1.55 : 1.15;
  }

  if (relation.pending) {
    weight += 0.7;
  }

  weight += sharedThemes * 0.42;

  if (post.hasImage && ["designers", "campus"].includes(user.cluster)) {
    weight += mode === "favorite" ? 1.2 : 0.5;
  }

  if (post.targetReach === "hot" && (relation.bridge || !relation.sameCluster)) {
    weight += 1.15;
  }

  if (post.targetReach === "low" && !relation.accepted && !relation.sameCluster) {
    weight *= 0.42;
  }

  if (mode === "comment") {
    if (post.type === "question") weight += 1;
    if (post.type === "frustration") weight += 0.8;
    if (post.type === "small_win") weight += 0.55;
    if (post.type === "photo") weight += 0.45;
  }

  return weight;
}

function pickUniqueUsersWeighted(weightedUsers, count, seedLabel) {
  const pool = weightedUsers
    .filter((entry) => entry.weight > 0)
    .map((entry) => ({ ...entry }));
  const selected = [];
  const rng = createRng(`${FIXED_SEED}:${seedLabel}`);

  while (pool.length > 0 && selected.length < count) {
    const picked = weightedPick(pool, (entry) => entry.weight, rng);
    selected.push(picked.user);
    pool.splice(pool.findIndex((entry) => entry.user.username === picked.user.username), 1);
  }

  return selected;
}

function pickCommentFamily(post, relation, commentIndex) {
  const order = {
    question: relation.accepted ? ["advice", "follow_up", "agreement"] : ["advice", "agreement", "follow_up"],
    photo: ["reaction", "banter", "follow_up"],
    small_win: ["congrats", "reaction", "banter"],
    frustration: relation.accepted ? ["empathy", "advice", "follow_up"] : ["empathy", "follow_up", "advice"],
    opinion: relation.sameCluster ? ["agreement", "follow_up", "banter"] : ["follow_up", "banter", "agreement"],
    progress: ["agreement", "advice", "reaction"],
    status: ["reaction", "banter", "follow_up"],
    event: ["reaction", "follow_up", "agreement"],
  };

  return order[post.type][commentIndex % order[post.type].length];
}

function relationFlavor(relation) {
  if (relation.accepted) {
    return "since you already did the hard part";
  }

  if (relation.bridge) {
    return "this crossed over into my lane too";
  }

  if (relation.sameCluster) {
    return "I hit similar stuff on my side";
  }

  if (relation.pending) {
    return "we should compare notes sometime";
  }

  return "";
}

function buildCommentReply(post, commenter, family, relation) {
  const hook = post.hooks[0];
  const secondHook = post.hooks[1] || hook;
  const flavor = relationFlavor(relation);

  switch (family) {
    case "agreement":
      return cleanText(`same read on ${hook}; ${flavor || "that choice makes sense"}.`);
    case "advice":
      return cleanText(`start with ${hook} before touching ${secondHook}; ${flavor || "that usually shortens the mess"}.`);
    case "reaction":
      return post.type === "photo"
        ? cleanText(`the light on ${hook} is doing a lot for this.`)
        : cleanText(`${hook} reads better than the rough version in my head.`);
    case "congrats":
      return cleanText(`${hook} finally reading clean is a real win${flavor ? `, ${flavor}` : ""}.`);
    case "empathy":
      return cleanText(`${hook} can eat a whole evening; ${flavor || "that mood is real"}.`);
    case "banter":
      return post.type === "opinion"
        ? cleanText(`I lean a little the other way on ${hook}, but I get the trade.`)
        : cleanText(`this is making my own ${post.theme} plan look underprepared.`);
    case "follow_up":
      return cleanText(`did ${secondHook} end up helping, or was it the other thing?`);
    default:
      return cleanText(`${hook} makes sense.`);
  }
}

function renderCommentContent(post, commenter, family, relation, commentIndex) {
  const opener = pick(
    COMMENT_OPENERS[family][commenter.tone],
    createRng(`${FIXED_SEED}:comment-opener:${post.sequence}:${commentIndex}`),
  );
  const reply = buildCommentReply(post, commenter, family, relation);
  const template = pick(
    themesCache.commentFamilies[family],
    createRng(`${FIXED_SEED}:comment-template:${family}:${post.sequence}:${commentIndex}`),
  );

  return cleanText(
    fillTemplate(template, {
      lead: opener,
      reply,
      postHook: post.hooks[0],
    }),
  );
}

async function apiRequest(pathname, { method = "GET", token, json, formData, extraHeaders = {} } = {}) {
  const headers = { ...extraHeaders };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    body = formData;
  }

  const response = await fetch(`${API}${pathname}`, {
    method,
    headers,
    body,
  });
  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
  }

  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed (${response.status}): ${data?.message ?? raw}`);
  }

  return data;
}

async function ensureBackendReady() {
  try {
    await apiRequest("/health");
  } catch (error) {
    throw new Error(`Backend is not reachable at ${API}. Start the stack before running the seed. ${error.message}`);
  }
}

async function createRemoteImage(spec) {
  try {
    const response = await fetch(spec.url);

    if (!response.ok) {
      throw new Error(`picsum returned ${response.status}`);
    }

    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const extension = mimeType.includes("png") ? "png" : "jpg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      blob: new Blob([buffer], { type: mimeType }),
      filename: `${spec.seed}.${extension}`,
    };
  } catch (error) {
    console.warn(`  media fallback: ${spec.seed} could not be fetched (${error.message}); creating a text-only post instead`);
    return null;
  }
}

function extractRelativePostMediaPath(response, hasUpload) {
  const mediaPath = response?.post?.media?.[0] ?? null;

  if (!hasUpload) {
    return mediaPath;
  }

  if (typeof mediaPath !== "string" || !mediaPath.startsWith("/uploads/")) {
    throw new Error(
      `POST /posts returned an unexpected media path: ${String(mediaPath)}`,
    );
  }

  return mediaPath;
}

async function registerUsers(users) {
  console.log("=== Creating users and profiles ===");

  for (const user of users) {
    await apiRequest("/registerUser", {
      method: "POST",
      json: {
        username: user.username,
        email: user.email,
        password: PASS,
      },
    });

    const login = await apiRequest("/login", {
      method: "POST",
      json: {
        identifier: user.username,
        password: PASS,
      },
    });
    const token = login.token;
    const currentUser = await apiRequest("/user", { token });

    TOKENS.set(user.username, token);
    USER_IDS.set(user.username, currentUser.id);

    await apiRequest(`/users/${currentUser.id}`, {
      method: "PUT",
      token,
      json: {
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.profile.bio,
        status: user.profile.status,
        location: user.location,
        website: user.profile.website,
      },
    });

    console.log(`  ${user.username.padEnd(10)} -> #${String(currentUser.id).padEnd(3)} ${user.cluster}`);
  }
}

async function sendFriend(from, to) {
  await apiRequest("/friends", {
    method: "POST",
    token: TOKENS.get(from),
    json: {
      receiverId: USER_IDS.get(to),
    },
  });
}

async function acceptFriend(from, to) {
  const requests = await apiRequest("/friends/requests", {
    token: TOKENS.get(to),
  });
  const senderId = USER_IDS.get(from);
  const relation = requests.find(
    (request) => request.sender?.id === senderId || request.senderId === senderId,
  );

  if (!relation) {
    throw new Error(`Unable to find pending request ${from} -> ${to}`);
  }

  await apiRequest(`/friends/${relation.id}/accept`, {
    method: "PATCH",
    token: TOKENS.get(to),
  });
}

async function seedFriendships(graph) {
  console.log("=== Building the social graph ===");

  for (const [from, to] of graph.acceptedPairs) {
    await sendFriend(from, to);
    await acceptFriend(from, to);
  }

  console.log(`  accepted friendships: ${graph.acceptedPairs.length}`);

  for (const [from, to] of graph.pendingPairs) {
    await sendFriend(from, to);
  }

  console.log(`  pending requests:     ${graph.pendingPairs.length}`);
}

async function createPosts(plans) {
  console.log(`=== Creating ${plans.length} interleaved posts ===`);

  const createdPosts = [];

  for (const plan of plans) {
    const upload = plan.imageSpec ? await createRemoteImage(plan.imageSpec) : null;
    const formData = new FormData();

    formData.set("content", plan.content);

    if (upload) {
      formData.set("media", upload.blob, upload.filename);
    }

    const response = await apiRequest("/posts", {
      method: "POST",
      token: TOKENS.get(plan.author.username),
      formData,
    });
    const mediaPath = extractRelativePostMediaPath(response, Boolean(upload));

    createdPosts.push({
      ...plan,
      id: response.post.id,
      hasImage: Boolean(upload),
      mediaPath,
      likes: [],
      favorites: [],
      comments: [],
    });

    if ((plan.sequence + 1) % 100 === 0) {
      console.log(`  ${plan.sequence + 1}/${plans.length} posts created`);
    }
  }

  return createdPosts;
}

async function seedInteractions(createdPosts, engagementPlans) {
  console.log("=== Adding likes, favorites, and comments ===");

  let totalLikes = 0;
  let totalFavorites = 0;
  let totalComments = 0;
  const planBySequence = new Map(engagementPlans.map((entry) => [entry.sequence, entry]));

  for (const post of createdPosts) {
    const plan = planBySequence.get(post.sequence);

    for (const liker of plan.likes) {
      await apiRequest(`/posts/${post.id}/like`, {
        method: "POST",
        token: TOKENS.get(liker.username),
      });
      post.likes.push(liker.username);
      totalLikes += 1;
    }

    for (const favoriter of plan.favorites) {
      await apiRequest(`/posts/${post.id}/favorite`, {
        method: "POST",
        token: TOKENS.get(favoriter.username),
      });
      post.favorites.push(favoriter.username);
      totalFavorites += 1;
    }

    for (const commentPlan of plan.comments) {
      const response = await apiRequest(`/posts/${post.id}/comments`, {
        method: "POST",
        token: TOKENS.get(commentPlan.user.username),
        json: {
          content: commentPlan.content,
        },
        extraHeaders: SEED_SCRIPT_KEY
          ? { "x-seed-script-key": SEED_SCRIPT_KEY }
          : {},
      });
      post.comments.push({
        id: response.comment.id,
        username: commentPlan.user.username,
        content: commentPlan.content,
      });
      totalComments += 1;
    }

    if ((post.sequence + 1) % 100 === 0) {
      console.log(`  activity seeded for ${post.sequence + 1}/${createdPosts.length} posts`);
    }
  }

  return {
    totalLikes,
    totalFavorites,
    totalComments,
  };
}

function summarizeUser(createdPosts, graph, username) {
  const userPosts = createdPosts.filter((post) => post.author.username === username);
  const acceptedFriends = graph.acceptedPairs
    .filter(([left, right]) => left === username || right === username)
    .map(([left, right]) => (left === username ? right : left))
    .sort();
  const incomingPending = graph.pendingPairs
    .filter(([, to]) => to === username)
    .map(([from]) => from)
    .sort();
  const outgoingPending = graph.pendingPairs
    .filter(([from]) => from === username)
    .map(([, to]) => to)
    .sort();

  return {
    acceptedFriends,
    incomingPending,
    outgoingPending,
    postCount: userPosts.length,
    imagePosts: userPosts.filter((post) => post.hasImage).length,
    likesReceived: userPosts.reduce((sum, post) => sum + post.likes.length, 0),
    favoritesReceived: userPosts.reduce((sum, post) => sum + post.favorites.length, 0),
    commentsReceived: userPosts.reduce((sum, post) => sum + post.comments.length, 0),
  };
}

function buildVerificationSummary(users, plans, graph, engagementPlans) {
  const clusterPosts = Object.fromEntries(CLUSTER_NAMES.map((cluster) => [cluster, 0]));
  const tierPosts = Object.fromEntries(USER_TIERS.map((tier) => [tier, 0]));
  let imagePosts = 0;
  let hotPosts = 0;
  let lowPosts = 0;

  for (const plan of plans) {
    clusterPosts[plan.author.cluster] += 1;
    tierPosts[plan.author.tier] += 1;
    if (plan.hasImage) imagePosts += 1;
    if (plan.targetReach === "hot") hotPosts += 1;
    if (plan.targetReach === "low") lowPosts += 1;
  }

  const totalLikes = engagementPlans.reduce((sum, entry) => sum + entry.likes.length, 0);
  const totalFavorites = engagementPlans.reduce((sum, entry) => sum + entry.favorites.length, 0);
  const totalComments = engagementPlans.reduce((sum, entry) => sum + entry.comments.length, 0);

  return {
    users: users.length,
    posts: plans.length,
    likes: totalLikes,
    favorites: totalFavorites,
    comments: totalComments,
    imagePosts,
    hotPosts,
    lowPosts,
    acceptedFriendships: graph.acceptedPairs.length,
    pendingRequests: graph.pendingPairs.length,
    clusterPosts,
    tierPosts,
  };
}

function printPlanOnlySummary(users, plans, graph, engagementPlans) {
  const summary = buildVerificationSummary(users, plans, graph, engagementPlans);
  const aliceSummary = summarizeUser(
    plans.map((plan, index) => ({
      ...plan,
      id: index + 1,
      likes: engagementPlans[index].likes.map((user) => user.username),
      favorites: engagementPlans[index].favorites.map((user) => user.username),
      comments: engagementPlans[index].comments,
    })),
    graph,
    "alice",
  );
  const bobSummary = summarizeUser(
    plans.map((plan, index) => ({
      ...plan,
      id: index + 1,
      likes: engagementPlans[index].likes.map((user) => user.username),
      favorites: engagementPlans[index].favorites.map((user) => user.username),
      comments: engagementPlans[index].comments,
    })),
    graph,
    "bob",
  );

  console.log("=== Seed plan summary ===");
  console.log(`  Users:      ${summary.users}`);
  console.log(`  Posts:      ${summary.posts}`);
  console.log(`  Likes:      ${summary.likes}`);
  console.log(`  Favorites:  ${summary.favorites}`);
  console.log(`  Comments:   ${summary.comments}`);
  console.log(`  Images:     ${summary.imagePosts}`);
  console.log(`  Hot posts:  ${summary.hotPosts}`);
  console.log(`  Low posts:  ${summary.lowPosts}`);
  console.log(`  Accepted:   ${summary.acceptedFriendships}`);
  console.log(`  Pending:    ${summary.pendingRequests}`);
  console.log("");
  console.log("  Posts by cluster:");

  for (const cluster of CLUSTER_NAMES) {
    console.log(`    ${cluster.padEnd(10)} ${summary.clusterPosts[cluster]}`);
  }

  console.log("");
  console.log(`  alice@test.com / ${PASS}`);
  console.log(`    posts: ${aliceSummary.postCount} (${aliceSummary.imagePosts} with images)`);
  console.log(`    likes received: ${aliceSummary.likesReceived}, comments received: ${aliceSummary.commentsReceived}, favorites received: ${aliceSummary.favoritesReceived}`);
  console.log(`    accepted friends: ${listSummary(aliceSummary.acceptedFriends)}`);
  console.log(`    incoming requests: ${listSummary(aliceSummary.incomingPending)}`);
  console.log(`    outgoing requests: ${listSummary(aliceSummary.outgoingPending)}`);
  console.log("");
  console.log(`  bob@test.com / ${PASS}`);
  console.log(`    posts: ${bobSummary.postCount} (${bobSummary.imagePosts} with images)`);
  console.log(`    likes received: ${bobSummary.likesReceived}, comments received: ${bobSummary.commentsReceived}, favorites received: ${bobSummary.favoritesReceived}`);
  console.log(`    accepted friends: ${listSummary(bobSummary.acceptedFriends)}`);
  console.log(`    incoming requests: ${listSummary(bobSummary.incomingPending)}`);
  console.log(`    outgoing requests: ${listSummary(bobSummary.outgoingPending)}`);
}

let themesCache;

async function buildSeedState() {
  const [roster, clusters, themes, relationships, showcase] = await Promise.all([
    loadJson("roster.json"),
    loadJson("clusters.json"),
    loadJson("themes.json"),
    loadJson("relationships.json"),
    loadJson("showcase-users.json"),
  ]);

  themesCache = themes;
  validateConfig({ roster, clusters, themes, relationships, showcase });

  const users = buildProfiles(roster, clusters, showcase, themes);
  const budgets = buildBudgetPlan(users);
  const graph = buildGraph(users, relationships, showcase);
  const plans = buildPostPlans(users, budgets, themes, showcase);
  const engagementPlans = buildEngagementPlans(plans, graph);

  return {
    users,
    graph,
    plans,
    engagementPlans,
  };
}

async function guaranteeShowcaseNotifications(createdPosts) {
  console.log("=== Guaranteeing one of each notification type for alice and bob ===");

  const alicePost = createdPosts.find((p) => p.author.username === "alice");
  const bobPost = createdPosts.find((p) => p.author.username === "bob");

  // LIKE
  for (const [liker, post] of [["karen", alicePost], ["iris", bobPost]]) {
    try {
      await apiRequest(`/posts/${post.id}/like`, {
        method: "POST",
        token: TOKENS.get(liker),
      });
      console.log(`  LIKE         : ${liker} liked ${post.author.username}'s post`);
    } catch {
      console.log(`  LIKE         : ${liker} -> ${post.author.username} skipped (already liked)`);
    }
  }

  // COMMENT
  const showcaseComments = [
    ["luca", alicePost, "Solid update, saving this for later."],
    ["karen", bobPost, "Good to know, thanks for sharing."],
  ];

  for (const [commenter, post, content] of showcaseComments) {
    try {
      await apiRequest(`/posts/${post.id}/comments`, {
        method: "POST",
        token: TOKENS.get(commenter),
        json: { content },
        extraHeaders: SEED_SCRIPT_KEY ? { "x-seed-script-key": SEED_SCRIPT_KEY } : {},
      });
      console.log(`  COMMENT      : ${commenter} commented on ${post.author.username}'s post`);
    } catch {
      console.log(`  COMMENT      : ${commenter} -> ${post.author.username} skipped`);
    }
  }

  // FOLLOW
  for (const [sender, receiver] of [["iris", "alice"], ["luca", "bob"]]) {
    try {
      await sendFriend(sender, receiver);
      console.log(`  FOLLOW       : ${sender} sent a request to ${receiver}`);
    } catch {
      console.log(`  FOLLOW       : ${sender} -> ${receiver} skipped (already exists)`);
    }
  }

  // FOLLOW_ACCEPT: alice and bob's outgoing pending requests get accepted
  for (const [requester, accepter] of [["alice", "olivia"], ["bob", "mia"]]) {
    try {
      await acceptFriend(requester, accepter);
      console.log(`  FOLLOW_ACCEPT: ${accepter} accepted ${requester}'s request`);
    } catch {
      console.log(`  FOLLOW_ACCEPT: ${requester} -> ${accepter} skipped`);
    }
  }

  // UNFOLLOW: create a temporary friendship then delete it
  for (const [actor, showcase] of [["liam", "alice"], ["leo", "bob"]]) {
    try {
      await sendFriend(actor, showcase);
      await acceptFriend(actor, showcase);

      const friendships = await apiRequest("/friends", { token: TOKENS.get(actor) });
      const showcaseId = USER_IDS.get(showcase);
      const row = friendships.find((f) => f.id === showcaseId);

      if (!row) {
        throw new Error(`Could not find friendship row between ${actor} and ${showcase}`);
      }

      await apiRequest(`/friends/${row.friendshipId}`, {
        method: "DELETE",
        token: TOKENS.get(actor),
      });
      console.log(`  UNFOLLOW     : ${actor} unfriended ${showcase}`);
    } catch (error) {
      console.log(`  UNFOLLOW     : ${actor} -> ${showcase} skipped (${error.message})`);
    }
  }
}

async function main() {
  const state = await buildSeedState();

  if (PLAN_ONLY) {
    printPlanOnlySummary(state.users, state.plans, state.graph, state.engagementPlans);
    return;
  }

  await ensureBackendReady();

  console.log("=== Seeding social demo data ===");
  console.log("  expecting a clean database; `make seed` now handles that via `db-clean`");

  if (!SEED_SCRIPT_KEY) {
    console.log("  SEED_SCRIPT_KEY not found in backend container env; seeded comments will use normal moderation");
  }

  await registerUsers(state.users);
  await seedFriendships(state.graph);

  const createdPosts = await createPosts(state.plans);
  const activityTotals = await seedInteractions(createdPosts, state.engagementPlans);
  await guaranteeShowcaseNotifications(createdPosts);
  const aliceSummary = summarizeUser(createdPosts, state.graph, "alice");
  const bobSummary = summarizeUser(createdPosts, state.graph, "bob");

  console.log("=== Seed complete ===");
  console.log("");
  console.log(`  Users:      ${state.users.length}`);
  console.log(`  Posts:      ${createdPosts.length}`);
  console.log(`  Likes:      ${activityTotals.totalLikes}`);
  console.log(`  Favorites:  ${activityTotals.totalFavorites}`);
  console.log(`  Comments:   ${activityTotals.totalComments}`);
  console.log("");
  console.log(`  alice@test.com / ${PASS}`);
  console.log(`    posts: ${aliceSummary.postCount} (${aliceSummary.imagePosts} with images)`);
  console.log(`    likes received: ${aliceSummary.likesReceived}, comments received: ${aliceSummary.commentsReceived}, favorites received: ${aliceSummary.favoritesReceived}`);
  console.log(`    accepted friends: ${listSummary(aliceSummary.acceptedFriends)}`);
  console.log(`    incoming requests: ${listSummary(aliceSummary.incomingPending)}`);
  console.log(`    outgoing requests: ${listSummary(aliceSummary.outgoingPending)}`);
  console.log("");
  console.log(`  bob@test.com / ${PASS}`);
  console.log(`    posts: ${bobSummary.postCount} (${bobSummary.imagePosts} with images)`);
  console.log(`    likes received: ${bobSummary.likesReceived}, comments received: ${bobSummary.commentsReceived}, favorites received: ${bobSummary.favoritesReceived}`);
  console.log(`    accepted friends: ${listSummary(bobSummary.acceptedFriends)}`);
  console.log(`    incoming requests: ${listSummary(bobSummary.incomingPending)}`);
  console.log(`    outgoing requests: ${listSummary(bobSummary.outgoingPending)}`);
}

try {
  await main();
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
}
