#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API:-http://localhost:3001}"
PASS="${SEED_PASSWORD:-test1234}"

cd "$ROOT_DIR"

API="$API" PASS="$PASS" ROOT_DIR="$ROOT_DIR" node --input-type=module <<'NODE'
import { Blob } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const API = process.env.API;
const PASS = process.env.PASS;
const ROOT_DIR = process.env.ROOT_DIR;

function readSeedScriptKey() {
  try {
    const envFile = readFileSync(path.join(ROOT_DIR, "backend/.env"), "utf8");
    const match = envFile.match(/^\s*SEED_SCRIPT_KEY\s*=\s*(.*)\s*$/m);

    if (!match) {
      return "";
    }

    return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
  } catch {
    return "";
  }
}

const SEED_SCRIPT_KEY = readSeedScriptKey();

function makeUser({
  username,
  avatarId,
  cluster,
  focus,
  ritual,
  win,
  hangout,
  sideQuest,
  tip,
  location,
  demo = false,
  imageBias = false,
}) {
  return {
    username,
    email: `${username}@test.com`,
    avatarId,
    cluster,
    focus,
    ritual,
    win,
    hangout,
    sideQuest,
    tip,
    location,
    demo,
    imageBias,
    bio: `${capitalize(focus)} and ${sideQuest}. Usually somewhere near ${hangout}.`,
    status: `Today: ${ritual}.`,
    website: `https://example.com/${username}`,
  };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stableNumber(input) {
  let hash = 0;

  for (const char of input) {
    hash = (hash * 33 + char.charCodeAt(0)) % 2147483647;
  }

  return hash;
}

function titleCaseUsername(username) {
  return username
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => capitalize(part))
    .join(" ");
}

function pickSeededSubset(users, count, seedLabel) {
  return new Set(
    [...users]
      .sort((left, right) => {
        const leftScore = stableNumber(`${seedLabel}:${left.username}`);
        const rightScore = stableNumber(`${seedLabel}:${right.username}`);

        if (leftScore === rightScore) {
          return left.username.localeCompare(right.username);
        }

        return leftScore - rightScore;
      })
      .slice(0, Math.min(count, users.length))
      .map((user) => user.username),
  );
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

const USERS = [
  makeUser({
    username: "alice",
    avatarId: 12,
    cluster: "builders",
    focus: "the feed composer and the small polish around it",
    ritual: "oat-milk coffee before standup",
    win: "the composer stopped flickering when the modal closes",
    hangout: "the window table in the main room",
    sideQuest: "a canal walk with a camera",
    tip: "name the awkward intermediate states before they spread",
    location: "Paris, FR",
    demo: true,
    imageBias: true,
  }),
  makeUser({
    username: "bob",
    avatarId: 13,
    cluster: "builders",
    focus: "the Docker setup and the rough edges in the backend",
    ritual: "checking logs before opening chat",
    win: "the last env mismatch finally disappeared",
    hangout: "the back corner near the power strip",
    sideQuest: "a slow espresso run between deploys",
    tip: "write the command down once it finally works",
    location: "Lyon, FR",
    demo: true,
  }),
  makeUser({
    username: "charlie",
    avatarId: 14,
    cluster: "builders",
    focus: "the auth flow and the weird edge cases around it",
    ritual: "a ten-minute pass through the open issues",
    win: "the login error states are finally consistent",
    hangout: "the small round table near the whiteboard",
    sideQuest: "late-night basketball outside campus",
    tip: "test the unhappy path before the pretty one",
    location: "Marseille, FR",
  }),
  makeUser({
    username: "diana",
    avatarId: 15,
    cluster: "builders",
    focus: "cleaning the profile view and the tabs around it",
    ritual: "music first, messages later",
    win: "the profile layout stopped jumping on mobile",
    hangout: "the quiet row by the bookshelves",
    sideQuest: "sunset walks after a long review session",
    tip: "if the spacing feels off, it usually is",
    location: "Bordeaux, FR",
    imageBias: true,
  }),
  makeUser({
    username: "emma",
    avatarId: 16,
    cluster: "builders",
    focus: "keeping the route flow readable when the app grows",
    ritual: "rewriting my todo list after lunch",
    win: "the profile actions finally read like one system",
    hangout: "the bench outside the main entrance",
    sideQuest: "a pastry stop on the way back from errands",
    tip: "cut one branch before adding the next feature",
    location: "Lille, FR",
  }),
  makeUser({
    username: "frank",
    avatarId: 17,
    cluster: "creatives",
    focus: "making the feed cards feel less stiff",
    ritual: "sketching before touching the code",
    win: "the card spacing finally feels deliberate",
    hangout: "the table closest to the poster wall",
    sideQuest: "street-photo breaks around the block",
    tip: "contrast should do more work than decoration",
    location: "Nantes, FR",
  }),
  makeUser({
    username: "grace",
    avatarId: 18,
    cluster: "creatives",
    focus: "the image-heavy posts and the way they land in the feed",
    ritual: "editing one thing at a time",
    win: "portrait images finally stop crushing the layout",
    hangout: "the sunny spot by the upstairs railing",
    sideQuest: "bringing flowers back from the market",
    tip: "let the image breathe before adding copy",
    location: "Nice, FR",
    imageBias: true,
  }),
  makeUser({
    username: "hugo",
    avatarId: 19,
    cluster: "creatives",
    focus: "notifications and the tiny details around them",
    ritual: "clearing the inbox before touching the code",
    win: "the unread state finally survives a refresh",
    hangout: "the couch near the coffee machine",
    sideQuest: "sunrise runs before the lab opens",
    tip: "if the state can desync, assume it will",
    location: "Toulouse, FR",
  }),
  makeUser({
    username: "iris",
    avatarId: 20,
    cluster: "creatives",
    focus: "the visual rhythm across profile and feed",
    ritual: "taking screenshots before every big change",
    win: "the profile header finally feels balanced",
    hangout: "the mezzanine with the good daylight",
    sideQuest: "visiting small galleries after class",
    tip: "compare screenshots, not memories",
    location: "Montpellier, FR",
    imageBias: true,
  }),
  makeUser({
    username: "jack",
    avatarId: 21,
    cluster: "creatives",
    focus: "the interaction details in comments and dialogs",
    ritual: "one pass through the keyboard shortcuts",
    win: "the comment dialog finally closes in the right places",
    hangout: "the side desk near the printer",
    sideQuest: "quick bike rides between work blocks",
    tip: "microcopy should remove one doubt at a time",
    location: "Rennes, FR",
  }),
  makeUser({
    username: "karen",
    avatarId: 22,
    cluster: "operators",
    focus: "keeping the database layer predictable",
    ritual: "reading the migration diff before anything else",
    win: "the slow query stopped showing up in the logs",
    hangout: "the first table near the wall outlets",
    sideQuest: "yoga after the last merge of the day",
    tip: "make the data shape boring before the UI depends on it",
    location: "Grenoble, FR",
  }),
  makeUser({
    username: "liam",
    avatarId: 23,
    cluster: "operators",
    focus: "the multiplayer game loop and the state around it",
    ritual: "a scoreboard check before opening the editor",
    win: "the lobby state finally resets the right way",
    hangout: "the long table near the projector",
    sideQuest: "pickup football after class",
    tip: "instrument first, guess later",
    location: "Strasbourg, FR",
  }),
  makeUser({
    username: "mia",
    avatarId: 24,
    cluster: "operators",
    focus: "schema cleanup and removing duplicated edge cases",
    ritual: "a quick pass through old tickets",
    win: "the seed data no longer trips over stale records",
    hangout: "the tall desk by the stairs",
    sideQuest: "collecting bookmarks for food spots nearby",
    tip: "delete the second copy before fixing the third bug",
    location: "Annecy, FR",
  }),
  makeUser({
    username: "noah",
    avatarId: 25,
    cluster: "operators",
    focus: "game timing and the little race conditions around it",
    ritual: "checking one replay before coding",
    win: "the countdown finally matches what players see",
    hangout: "the gaming corner with the spare monitor",
    sideQuest: "late dinners after long test runs",
    tip: "anything time-based deserves one more test",
    location: "Rouen, FR",
  }),
  makeUser({
    username: "olivia",
    avatarId: 26,
    cluster: "operators",
    focus: "bookmarks, saved views, and the things people revisit",
    ritual: "sorting the backlog into tiny pieces",
    win: "saved posts finally feel stable between sessions",
    hangout: "the quiet nook by the plants",
    sideQuest: "weekend hikes outside the city",
    tip: "revisited features deserve fast paths",
    location: "Chambery, FR",
    imageBias: true,
  }),
  makeUser({
    username: "pablo",
    avatarId: 27,
    cluster: "nightshift",
    focus: "making the local dev workflow less fragile",
    ritual: "opening terminal tabs before browser tabs",
    win: "the compose stack now restarts cleanly",
    hangout: "the desk closest to the emergency snacks",
    sideQuest: "midnight sandwich runs",
    tip: "one reliable script beats three clever commands",
    location: "Perpignan, FR",
  }),
  makeUser({
    username: "quinn",
    avatarId: 28,
    cluster: "nightshift",
    focus: "turning rough interaction ideas into something shippable",
    ritual: "writing the first ugly version fast",
    win: "the notification flow finally reads in one pass",
    hangout: "the lamp-lit table near the back wall",
    sideQuest: "vinyl hunting on slow Sundays",
    tip: "ship the honest version before the fancy one",
    location: "Tours, FR",
  }),
  makeUser({
    username: "ruby",
    avatarId: 29,
    cluster: "nightshift",
    focus: "smoothing the profile details people actually notice",
    ritual: "a camera-roll clearout during break",
    win: "the profile meta row stopped wrapping awkwardly",
    hangout: "the stool beside the big window",
    sideQuest: "night walks when the lab finally empties",
    tip: "if the detail is visible every day, it is not a small detail",
    location: "Reims, FR",
    imageBias: true,
  }),
  makeUser({
    username: "sam",
    avatarId: 30,
    cluster: "nightshift",
    focus: "keeping the realtime bits understandable under pressure",
    ritual: "one voice memo before the late shift starts",
    win: "the socket reconnect stopped duplicating state",
    hangout: "the corner table beside the fan",
    sideQuest: "late tram rides with headphones on",
    tip: "trace the event order before blaming the transport layer",
    location: "Metz, FR",
  }),
  makeUser({
    username: "tina",
    avatarId: 31,
    cluster: "nightshift",
    focus: "small interaction polish that keeps the app feeling alive",
    ritual: "a screenshot round before the final push",
    win: "the pending states finally read as intentional",
    hangout: "the high table near the kitchen",
    sideQuest: "sunrise bakery stops after all-nighters",
    tip: "loading states are part of the design, not an apology",
    location: "Dijon, FR",
  }),
];

const USERS_WITH_AVATARS = pickSeededSubset(USERS, 10, "profile-avatar");
const USERS_WITH_BANNERS = pickSeededSubset(USERS, 15, "profile-banner");

for (const user of USERS) {
  user.displayName = titleCaseUsername(user.username);
  user.avatar = USERS_WITH_AVATARS.has(user.username)
    ? `https://i.pravatar.cc/300?img=${user.avatarId}`
    : null;
  user.banner = USERS_WITH_BANNERS.has(user.username)
    ? `https://picsum.photos/seed/${encodeURIComponent(`banner-${user.username}`)}/1400/420`
    : null;
}

USERS.forEach((user, index) => {
  user.index = index;
});

const USER_BY_NAME = new Map(USERS.map((user) => [user.username, user]));

const ACCEPTED_PAIRS = [
  ["alice", "bob"],
  ["alice", "charlie"],
  ["alice", "diana"],
  ["alice", "emma"],
  ["bob", "charlie"],
  ["bob", "emma"],
  ["charlie", "diana"],
  ["diana", "emma"],
  ["frank", "grace"],
  ["frank", "hugo"],
  ["grace", "hugo"],
  ["grace", "iris"],
  ["hugo", "jack"],
  ["iris", "jack"],
  ["grace", "jack"],
  ["karen", "liam"],
  ["karen", "mia"],
  ["karen", "noah"],
  ["liam", "noah"],
  ["liam", "olivia"],
  ["mia", "olivia"],
  ["noah", "olivia"],
  ["pablo", "quinn"],
  ["pablo", "ruby"],
  ["pablo", "sam"],
  ["quinn", "ruby"],
  ["quinn", "sam"],
  ["ruby", "tina"],
  ["sam", "tina"],
  ["alice", "grace"],
  ["bob", "liam"],
  ["bob", "quinn"],
  ["diana", "ruby"],
  ["emma", "iris"],
  ["frank", "pablo"],
  ["hugo", "noah"],
  ["mia", "jack"],
  ["tina", "olivia"],
];

const PENDING_PAIRS = [
  ["sam", "alice"],
  ["ruby", "alice"],
  ["alice", "olivia"],
  ["alice", "jack"],
  ["tina", "bob"],
  ["noah", "bob"],
  ["bob", "mia"],
  ["bob", "grace"],
  ["charlie", "grace"],
  ["quinn", "emma"],
  ["olivia", "grace"],
];

const ACCEPTED_SET = new Set(ACCEPTED_PAIRS.map(([left, right]) => pairKey(left, right)));
const PENDING_SET = new Set(PENDING_PAIRS.map(([from, to]) => directedKey(from, to)));

function getUser(username) {
  const user = USER_BY_NAME.get(username);

  if (!user) {
    throw new Error(`Unknown seeded user: ${username}`);
  }

  return user;
}

function validateGraph() {
  for (const [left, right] of ACCEPTED_PAIRS) {
    if (!USER_BY_NAME.has(left) || !USER_BY_NAME.has(right)) {
      throw new Error(`Accepted pair references unknown user: ${left}, ${right}`);
    }

    if (left === right) {
      throw new Error(`Accepted pair cannot reference the same user twice: ${left}`);
    }
  }

  for (const [from, to] of PENDING_PAIRS) {
    if (!USER_BY_NAME.has(from) || !USER_BY_NAME.has(to)) {
      throw new Error(`Pending pair references unknown user: ${from}, ${to}`);
    }

    if (from === to) {
      throw new Error(`Pending pair cannot reference the same user twice: ${from}`);
    }

    if (ACCEPTED_SET.has(pairKey(from, to))) {
      throw new Error(`Pending pair overlaps an accepted relation: ${from}, ${to}`);
    }
  }
}

function areAccepted(left, right) {
  return ACCEPTED_SET.has(pairKey(left, right));
}

function hasPending(left, right) {
  return PENDING_SET.has(directedKey(left, right)) || PENDING_SET.has(directedKey(right, left));
}

function getImageSlots(user) {
  const slots = new Set([user.index % 5]);
  let secondSlot = (user.index * 3 + 4) % 10;

  if (secondSlot === user.index % 5) {
    secondSlot = (secondSlot + 3) % 10;
  }

  slots.add(secondSlot);

  if (user.imageBias || user.demo) {
    slots.add((user.index * 7 + 2) % 10);
  }

  return slots;
}

function getImageSpec(user, postIndex) {
  if (!getImageSlots(user).has(postIndex)) {
    return null;
  }

  const dimensions = [
    [1200, 800],
    [1080, 1350],
    [1000, 1000],
    [1280, 720],
    [900, 1200],
    [1440, 960],
  ];
  const [width, height] = dimensions[(user.index + postIndex) % dimensions.length];
  const seed = `${user.username}-${postIndex + 1}`;

  return {
    seed,
    width,
    height,
    url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`,
  };
}

function buildPostContent(user, postIndex, hasImage) {
  const focus = user.focus;
  const imageTemplates = [
    `Quick reset between two long blocks on ${focus}. Keeping this one because the light on the way back from ${user.hangout} was too good.`,
    `Took the longer route after working on ${focus}. ${capitalize(user.sideQuest)} usually clears my head faster than another hour at the desk.`,
    `This felt worth saving in the middle of a busy day. ${capitalize(user.sideQuest)} is still the easiest way for me to come back sharper to ${focus}.`,
    `Small reminder that stepping away helps. Picked this up on the way back to ${user.hangout} before getting back into ${focus}.`,
  ];

  const textTemplates = [
    `Starting the day at ${user.hangout} with ${user.ritual}. ${capitalize(focus)} is the main thread today.`,
    `Most of the afternoon went into ${focus}. The good news: ${user.win}.`,
    `Mini checkpoint for future me: ${user.win}. Writing it down now before I forget the clean version.`,
    `If anyone is around ${user.hangout} later, I still want a second set of eyes on ${focus}.`,
    `Took a short break for ${user.sideQuest} and came back with a cleaner approach to ${focus}. That trade keeps paying off.`,
    `Current rule for the week: ${user.tip}. It already saved me from one avoidable mess today.`,
    `I keep underestimating how much calmer ${user.ritual} makes the rest of the day. ${capitalize(focus)} feels a lot less dramatic after that.`,
    `Wrapped one messy thread today: ${user.win}. Tomorrow can be about polish instead of panic.`,
    `Leaving myself a note here: document ${focus} before handoff and the next pass will be much less annoying.`,
    `Signing off from ${user.hangout}. ${capitalize(user.sideQuest)} was the right reset after chasing ${focus} all day.`,
  ];

  return hasImage
    ? imageTemplates[(user.index + postIndex) % imageTemplates.length]
    : textTemplates[postIndex];
}

function buildPostingSchedule() {
  let cursor = Date.now() - 13 * DAY;
  const schedule = [];
  let sequence = 0;

  for (let round = 0; round < 10; round += 1) {
    for (let slot = 0; slot < USERS.length; slot += 1) {
      const userIndex = (round * 7 + slot * 9) % USERS.length;
      const user = USERS[userIndex];
      const gapMinutes = 25 + ((sequence * 17 + round * 11) % 85) + (slot % 5 === 0 ? 35 : 0);

      cursor += gapMinutes * MINUTE;

      if (sequence > 0 && sequence % 13 === 0) {
        cursor += (2 + (sequence % 4)) * HOUR;
      }

      schedule.push({
        sequence,
        round,
        slot,
        postIndex: round,
        user,
        createdAt: new Date(cursor),
        imageSpec: getImageSpec(user, round),
      });

      sequence += 1;
    }
  }

  const latestAllowed = Date.now() - 45 * MINUTE;
  const drift = schedule.at(-1).createdAt.getTime() - latestAllowed;

  if (drift > 0) {
    for (const entry of schedule) {
      entry.createdAt = new Date(entry.createdAt.getTime() - drift);
    }
  }

  return schedule;
}

function rankCandidates(post) {
  return USERS
    .filter((candidate) => candidate.username !== post.user.username)
    .map((candidate) => {
      let affinity = 0;

      if (areAccepted(post.user.username, candidate.username)) {
        affinity += 5;
      } else if (post.user.cluster === candidate.cluster) {
        affinity += 3;
      }

      if (hasPending(post.user.username, candidate.username)) {
        affinity += 1;
      }

      if (post.user.demo || candidate.demo) {
        affinity += 1;
      }

      return {
        user: candidate,
        affinity,
        order: stableNumber(`rank:${post.sequence}:${candidate.username}`),
      };
    })
    .sort((left, right) => right.affinity - left.affinity || left.order - right.order);
}

function ensureMinimumSelection(existing, ranked, minimum) {
  const seen = new Set(existing.map((entry) => entry.username));

  for (const candidate of ranked) {
    if (existing.length >= minimum) {
      break;
    }

    if (!seen.has(candidate.user.username)) {
      existing.push(candidate.user);
      seen.add(candidate.user.username);
    }
  }

  return existing;
}

function buildCommentContent(post, commenter, commentIndex) {
  const focus = post.user.focus;
  const imageTemplates = [
    `Worth taking the longer route for that one.`,
    `This is the exact kind of reset I keep forgetting to take before diving back into work.`,
    `Okay, now I want the same break before I touch my next task.`,
    `The light on this one did a lot of work in your favor.`,
    `Saving the mood of this for later.`,
  ];
  const textTemplates = [
    `That sounds better than yesterday's version of ${focus}.`,
    `If you want another set of eyes on ${focus}, I am around later.`,
    `Writing this down because I keep hitting the same thing on my side.`,
    `This is exactly why your updates from ${post.user.hangout} are useful.`,
    `The clean version always looks obvious in hindsight.`,
    `Keeping this in mind for my own afternoon.`,
  ];
  const friendlyAddOn = areAccepted(post.user.username, commenter.username)
    ? ""
    : ` ${capitalize(commenter.sideQuest)} sounds easier than my current plan.`;

  if (post.hasImage) {
    return `${imageTemplates[(post.sequence + commentIndex + commenter.index) % imageTemplates.length]}${friendlyAddOn}`;
  }

  return `${textTemplates[(post.sequence + commentIndex + commenter.index) % textTemplates.length]}${friendlyAddOn}`;
}

function planPostActivity(post) {
  const ranked = rankCandidates(post);
  const likes = [];
  const likeMinimum = post.user.demo ? 3 : post.hasImage ? 1 : 0;
  const likeMaximum = post.user.demo ? 8 : post.hasImage ? 6 : 4;

  for (const candidate of ranked) {
    const baseThreshold =
      candidate.affinity >= 5 ? 68 :
      candidate.affinity >= 3 ? 46 :
      candidate.affinity >= 2 ? 28 :
      9;
    const bonus = (post.hasImage ? 10 : 0) + (post.user.demo ? 10 : 0);
    const roll = stableNumber(`like:${post.sequence}:${candidate.user.username}`) % 100;

    if (roll < baseThreshold + bonus) {
      likes.push(candidate.user);
    }

    if (likes.length >= likeMaximum) {
      break;
    }
  }

  ensureMinimumSelection(likes, ranked, likeMinimum);

  const likedNames = new Set(likes.map((user) => user.username));
  const favoriteCandidates = ranked.filter(
    (candidate) => likedNames.has(candidate.user.username) && candidate.affinity >= 3,
  );
  const favorites = [];
  const favoriteMaximum = post.user.demo ? 3 : post.hasImage ? 2 : 1;
  const favoriteMinimum = post.user.demo && post.sequence % 4 === 0 ? 1 : 0;

  for (const candidate of favoriteCandidates) {
    const threshold = (post.hasImage ? 28 : 14) + (candidate.affinity >= 5 ? 18 : 0) + (post.user.demo ? 10 : 0);
    const roll = stableNumber(`favorite:${post.sequence}:${candidate.user.username}`) % 100;

    if (roll < threshold) {
      favorites.push(candidate.user);
    }

    if (favorites.length >= favoriteMaximum) {
      break;
    }
  }

  ensureMinimumSelection(favorites, favoriteCandidates, favoriteMinimum);

  let desiredComments = 0;
  const thresholds = [
    post.user.demo ? 70 : post.hasImage ? 44 : 22,
    post.user.demo ? 36 : post.hasImage ? 18 : 7,
    post.user.demo ? 14 : post.hasImage ? 7 : 2,
  ];

  thresholds.forEach((threshold, index) => {
    const roll = stableNumber(`comment-budget:${post.sequence}:${index}`) % 100;

    if (roll < threshold) {
      desiredComments += 1;
    }
  });

  if (desiredComments === 0 && post.user.demo && post.sequence % 6 === 0) {
    desiredComments = 1;
  }

  const commentPool = ranked.filter(
    (candidate) => candidate.affinity >= 3 || (post.user.demo && candidate.affinity >= 2),
  );
  const comments = commentPool.slice(0, desiredComments).map((candidate, index) => ({
    user: candidate.user,
    content: buildCommentContent(post, candidate.user, index),
  }));

  return {
    likes,
    favorites,
    comments,
  };
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

const TOKENS = new Map();
const USER_IDS = new Map();

async function registerUsers() {
  console.log("=== Creating users and profiles ===");

  for (const user of USERS) {
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
        banner: user.banner,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        location: user.location,
        website: user.website,
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

  await apiRequest(`/friends/${relation.id}`, {
    method: "PUT",
    token: TOKENS.get(to),
  });
}

async function seedFriendships() {
  console.log("=== Building the social graph ===");

  for (const [from, to] of ACCEPTED_PAIRS) {
    await sendFriend(from, to);
    await acceptFriend(from, to);
  }

  console.log(`  accepted friendships: ${ACCEPTED_PAIRS.length}`);

  for (const [from, to] of PENDING_PAIRS) {
    await sendFriend(from, to);
  }

  console.log(`  pending requests:     ${PENDING_PAIRS.length}`);
}

async function createPosts() {
  console.log("=== Creating 200 interleaved posts ===");

  const schedule = buildPostingSchedule();
  const createdPosts = [];

  for (const entry of schedule) {
    const upload = entry.imageSpec ? await createRemoteImage(entry.imageSpec) : null;
    const hasImage = Boolean(upload);
    const content = buildPostContent(entry.user, entry.postIndex, hasImage);
    const formData = new FormData();

    formData.set("content", content);

    if (upload) {
      formData.set("media", upload.blob, upload.filename);
    }

    const response = await apiRequest("/posts", {
      method: "POST",
      token: TOKENS.get(entry.user.username),
      formData,
    });

    createdPosts.push({
      ...entry,
      id: response.post.id,
      content,
      hasImage,
      likes: [],
      favorites: [],
      comments: [],
    });

    if (createdPosts.length % 25 === 0) {
      console.log(`  ${createdPosts.length}/200 posts created`);
    }
  }

  return createdPosts;
}

async function seedInteractions(createdPosts) {
  console.log("=== Adding likes, favorites, and comments ===");

  let totalLikes = 0;
  let totalFavorites = 0;
  let totalComments = 0;

  for (const post of createdPosts) {
    const plan = planPostActivity(post);

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

    for (let index = 0; index < plan.comments.length; index += 1) {
      const commentPlan = plan.comments[index];
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

    if ((post.sequence + 1) % 40 === 0) {
      console.log(`  activity seeded for ${post.sequence + 1}/200 posts`);
    }
  }

  return {
    totalLikes,
    totalFavorites,
    totalComments,
  };
}

function summarizeUser(createdPosts, username) {
  const userPosts = createdPosts.filter((post) => post.user.username === username);
  const acceptedFriends = ACCEPTED_PAIRS
    .filter(([left, right]) => left === username || right === username)
    .map(([left, right]) => (left === username ? right : left))
    .sort();
  const incomingPending = PENDING_PAIRS
    .filter(([, to]) => to === username)
    .map(([from]) => from)
    .sort();
  const outgoingPending = PENDING_PAIRS
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

async function main() {
  validateGraph();
  await ensureBackendReady();

  console.log("=== Seeding social demo data ===");
  console.log("  expecting a clean database; `make seed` now handles that via `db-clean`");

  if (!SEED_SCRIPT_KEY) {
    console.log("  SEED_SCRIPT_KEY not found in backend/.env; seeded comments will use normal moderation");
  }

  await registerUsers();
  await seedFriendships();

  const createdPosts = await createPosts();
  const activityTotals = await seedInteractions(createdPosts);
  const aliceSummary = summarizeUser(createdPosts, "alice");
  const bobSummary = summarizeUser(createdPosts, "bob");

  console.log("=== Seed complete ===");
  console.log("");
  console.log(`  Users:      ${USERS.length}`);
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
NODE
