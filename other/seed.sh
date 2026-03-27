#!/bin/sh
# Seed script — creates test users, friend relationships, posts, and likes
# Usage: sh scripts/seed.sh
# Requires: the backend running on localhost:3001

API="http://localhost:3001"
PASS="test1234"
IMG_DIR="frontend/public/images"

# --- Users -----------------------------------------------------------

USERS="alice bob charlie diana emma frank grace hugo"

echo "=== Creating users ==="

for name in $USERS; do
  printf "  %-10s " "$name"
  curl -s -X POST "$API/registerUser" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$name\",\"email\":\"${name}@test.com\",\"password\":\"$PASS\"}" \
    | sed 's/.*"message":"\([^"]*\)".*/\1/'
  echo
done

# --- Login helper -----------------------------------------------------

login() {
  curl -s -X POST "$API/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${1}@test.com\",\"password\":\"$PASS\"}" \
    | sed 's/.*"token":"\([^"]*\)".*/\1/'
}

echo ""
echo "=== Logging in ==="

TOKEN_ALICE=$(login alice)
TOKEN_BOB=$(login bob)
TOKEN_CHARLIE=$(login charlie)
TOKEN_DIANA=$(login diana)
TOKEN_EMMA=$(login emma)
TOKEN_FRANK=$(login frank)
TOKEN_GRACE=$(login grace)
TOKEN_HUGO=$(login hugo)

echo "  All tokens acquired"

# --- Get user IDs -----------------------------------------------------

get_id() {
  curl -s "$API/user" -H "Authorization: Bearer $1" \
    | sed 's/.*"id":\([0-9]*\).*/\1/'
}

ID_ALICE=$(get_id "$TOKEN_ALICE")
ID_BOB=$(get_id "$TOKEN_BOB")
ID_CHARLIE=$(get_id "$TOKEN_CHARLIE")
ID_DIANA=$(get_id "$TOKEN_DIANA")
ID_EMMA=$(get_id "$TOKEN_EMMA")
ID_FRANK=$(get_id "$TOKEN_FRANK")
ID_GRACE=$(get_id "$TOKEN_GRACE")
ID_HUGO=$(get_id "$TOKEN_HUGO")

echo "  alice=$ID_ALICE bob=$ID_BOB charlie=$ID_CHARLIE diana=$ID_DIANA"
echo "  emma=$ID_EMMA frank=$ID_FRANK grace=$ID_GRACE hugo=$ID_HUGO"

# --- Friend requests --------------------------------------------------

echo ""
echo "=== Creating friend relationships ==="

send_friend() {
  printf "  %-24s " "$3"
  curl -s -X POST "$API/friends" \
    -H "Authorization: Bearer $1" \
    -H "Content-Type: application/json" \
    -d "{\"receiverId\":$2}" \
    | sed 's/.*"message":"\([^"]*\)".*/\1/'
  echo
}

# Alice -> everyone (will be accepted)
send_friend "$TOKEN_ALICE" "$ID_BOB"     "alice -> bob"
send_friend "$TOKEN_ALICE" "$ID_CHARLIE" "alice -> charlie"
send_friend "$TOKEN_ALICE" "$ID_DIANA"   "alice -> diana"
send_friend "$TOKEN_ALICE" "$ID_EMMA"    "alice -> emma"
send_friend "$TOKEN_ALICE" "$ID_FRANK"   "alice -> frank"
send_friend "$TOKEN_ALICE" "$ID_GRACE"   "alice -> grace"
send_friend "$TOKEN_ALICE" "$ID_HUGO"    "alice -> hugo"

# Other friendships (will be accepted)
send_friend "$TOKEN_BOB"   "$ID_DIANA"   "bob -> diana"
send_friend "$TOKEN_BOB"   "$ID_EMMA"    "bob -> emma"
send_friend "$TOKEN_DIANA" "$ID_GRACE"   "diana -> grace"
send_friend "$TOKEN_FRANK" "$ID_HUGO"    "frank -> hugo"
send_friend "$TOKEN_EMMA"  "$ID_GRACE"   "emma -> grace"

# --- Accept friend requests -------------------------------------------

echo ""
echo "=== Accepting friend requests ==="

accept_from() {
  local token="$1"
  local name="$2"
  local ids
  ids=$(curl -s "$API/friends/requests" \
    -H "Authorization: Bearer $token" \
    | node -e "process.stdin.on('data',d=>JSON.parse(d).forEach(r=>console.log(r.id)))")
  for rid in $ids; do
    printf "  %-24s " "$name accepts #$rid"
    curl -s -X PUT "$API/friends/$rid" \
      -H "Authorization: Bearer $token" \
      | sed 's/.*"friend":.*/accepted/'
    echo
  done
}

# Everyone accepts all pending requests (alice's + other friendships)
accept_from "$TOKEN_BOB"     "bob"
accept_from "$TOKEN_CHARLIE" "charlie"
accept_from "$TOKEN_DIANA"   "diana"
accept_from "$TOKEN_EMMA"    "emma"
accept_from "$TOKEN_FRANK"   "frank"
accept_from "$TOKEN_GRACE"   "grace"
accept_from "$TOKEN_HUGO"    "hugo"

# Now send charlie's requests AFTER acceptance so they stay pending
echo ""
echo "=== Charlie sends pending friend requests ==="

send_friend "$TOKEN_CHARLIE" "$ID_BOB"   "charlie -> bob"
send_friend "$TOKEN_CHARLIE" "$ID_DIANA" "charlie -> diana"
send_friend "$TOKEN_CHARLIE" "$ID_EMMA"  "charlie -> emma"
send_friend "$TOKEN_CHARLIE" "$ID_FRANK" "charlie -> frank"
send_friend "$TOKEN_CHARLIE" "$ID_GRACE" "charlie -> grace"
send_friend "$TOKEN_CHARLIE" "$ID_HUGO"  "charlie -> hugo"

# --- Posts ------------------------------------------------------------

echo ""
echo "=== Creating posts ==="

post() {
  printf "  %-10s " "$3"
  curl -s -X POST "$API/posts" \
    -H "Authorization: Bearer $1" \
    -F "content=$2" \
    | sed 's/.*"message":"\([^"]*\)".*/\1/'
  echo
}

post_img() {
  printf "  %-10s " "$4 (img)"
  curl -s -X POST "$API/posts" \
    -H "Authorization: Bearer $1" \
    -F "content=$2" \
    -F "media=@$3" \
    | sed 's/.*"message":"\([^"]*\)".*/\1/'
  echo
}

# 20 posts — alice has 5, others spread out
# Posts with images: alice #1, bob #1, diana #1, grace #1

post_img "$TOKEN_ALICE" "Golden hour at the campus, this view never gets old"            "$IMG_DIR/nir-himi-w_rVpVZGa3g-unsplash.jpg"    "alice"
post     "$TOKEN_ALICE" "Just joined this platform, excited to connect with everyone!"   "alice"
post     "$TOKEN_ALICE" "Hot take: tabs are better than spaces. Fight me."               "alice"
post     "$TOKEN_ALICE" "Spent 4 hours debugging a missing semicolon. I love this job."  "alice"
post     "$TOKEN_ALICE" "Who else is still at the lab at midnight? Solidarity."           "alice"

post_img "$TOKEN_BOB"   "Found this spot while taking a break from coding"               "$IMG_DIR/chris-lee-70l1tDAI6rM-unsplash.jpg"    "bob"
post     "$TOKEN_BOB"   "Working on a new project with Docker and Prisma today."         "bob"
post     "$TOKEN_BOB"   "Just discovered jq and my life will never be the same."         "bob"

post     "$TOKEN_CHARLIE" "Anyone else grinding through 42 projects this weekend?"       "charlie"
post     "$TOKEN_CHARLIE" "Pushing code at 2am hits different."                          "charlie"
post     "$TOKEN_CHARLIE" "Finally understood how JWT works. Only took me three days."   "charlie"

post_img "$TOKEN_DIANA" "The sunset from the rooftop is unreal right now"                "$IMG_DIR/willian-justen-de-vasconcellos-Ed6XFOPKAjo-unsplash.jpg" "diana"
post     "$TOKEN_DIANA" "Reading the Docker docs so you don't have to."                  "diana"

post     "$TOKEN_EMMA"  "Finally got my dev environment working after 3 hours of debugging." "emma"
post     "$TOKEN_EMMA"  "The amount of coffee I consume during exam week should be illegal." "emma"

post     "$TOKEN_FRANK" "First post here. What did I miss?"                              "frank"
post     "$TOKEN_FRANK" "Makefile targets are underrated. Change my mind."               "frank"

post_img "$TOKEN_GRACE" "Nature break between coding sessions, highly recommended"       "$IMG_DIR/petar-avramoski-YKTIzSSd4ug-unsplash.jpg" "grace"
post     "$TOKEN_GRACE" "Pair programming is just two people being confused together."   "grace"

post     "$TOKEN_HUGO"  "Submitted my project 30 seconds before the deadline. Living on the edge." "hugo"

# --- Likes (approx 80 total) -----------------------------------------

echo ""
echo "=== Adding likes ==="

# Fetch all post IDs (newest first) using node for reliable JSON parsing
POST_IDS_FILE=$(mktemp)
curl -s "$API/posts" -H "Authorization: Bearer $TOKEN_ALICE" \
  | node -e "process.stdin.on('data',d=>JSON.parse(d).forEach(p=>console.log(p.id)))" \
  > "$POST_IDS_FILE"

# Read into P1..P20 (P1=newest, P20=oldest)
i=1; while read -r pid; do eval "P${i}=$pid"; i=$((i+1)); done < "$POST_IDS_FILE"
rm -f "$POST_IDS_FILE"

echo "  Post IDs: P1=$P1 ... P20=$P20"

like() {
  printf "  %-10s likes #%-4s " "$3" "$2"
  curl -s -X POST "$API/posts/$2/like" \
    -H "Authorization: Bearer $1" \
    | sed 's/.*"message":"\([^"]*\)".*/\1/'
  echo
}

# Posts are returned newest first, so P1=hugo's post, P20=alice's first (img) post
# Alice's 5 posts are P16-P20 (oldest). Each gets 4-5 likes.
# The image post (P20) is the most popular.

# Alice post 1 — campus photo (P20) — 5 likes
like "$TOKEN_BOB"     "$P20" "bob"
like "$TOKEN_CHARLIE" "$P20" "charlie"
like "$TOKEN_DIANA"   "$P20" "diana"
like "$TOKEN_EMMA"    "$P20" "emma"
like "$TOKEN_FRANK"   "$P20" "frank"

# Alice post 2 — just joined (P19) — 5 likes
like "$TOKEN_BOB"     "$P19" "bob"
like "$TOKEN_CHARLIE" "$P19" "charlie"
like "$TOKEN_GRACE"   "$P19" "grace"
like "$TOKEN_HUGO"    "$P19" "hugo"
like "$TOKEN_DIANA"   "$P19" "diana"

# Alice post 3 — tabs vs spaces (P18) — 5 likes
like "$TOKEN_BOB"     "$P18" "bob"
like "$TOKEN_EMMA"    "$P18" "emma"
like "$TOKEN_FRANK"   "$P18" "frank"
like "$TOKEN_GRACE"   "$P18" "grace"
like "$TOKEN_HUGO"    "$P18" "hugo"

# Alice post 4 — semicolon (P17) — 4 likes
like "$TOKEN_CHARLIE" "$P17" "charlie"
like "$TOKEN_DIANA"   "$P17" "diana"
like "$TOKEN_EMMA"    "$P17" "emma"
like "$TOKEN_FRANK"   "$P17" "frank"

# Alice post 5 — midnight lab (P16) — 5 likes
like "$TOKEN_BOB"     "$P16" "bob"
like "$TOKEN_CHARLIE" "$P16" "charlie"
like "$TOKEN_DIANA"   "$P16" "diana"
like "$TOKEN_GRACE"   "$P16" "grace"
like "$TOKEN_HUGO"    "$P16" "hugo"

# Bob's posts (P13-P15) — 3-4 likes each
like "$TOKEN_ALICE"   "$P15" "alice"
like "$TOKEN_CHARLIE" "$P15" "charlie"
like "$TOKEN_DIANA"   "$P15" "diana"
like "$TOKEN_EMMA"    "$P15" "emma"

like "$TOKEN_ALICE"   "$P14" "alice"
like "$TOKEN_EMMA"    "$P14" "emma"
like "$TOKEN_FRANK"   "$P14" "frank"

like "$TOKEN_ALICE"   "$P13" "alice"
like "$TOKEN_GRACE"   "$P13" "grace"
like "$TOKEN_HUGO"    "$P13" "hugo"

# Charlie's posts (P10-P12) — 3 likes each
like "$TOKEN_ALICE"   "$P12" "alice"
like "$TOKEN_BOB"     "$P12" "bob"
like "$TOKEN_DIANA"   "$P12" "diana"

like "$TOKEN_ALICE"   "$P11" "alice"
like "$TOKEN_EMMA"    "$P11" "emma"
like "$TOKEN_FRANK"   "$P11" "frank"

like "$TOKEN_ALICE"   "$P10" "alice"
like "$TOKEN_BOB"     "$P10" "bob"
like "$TOKEN_GRACE"   "$P10" "grace"

# Diana's posts (P8-P9) — 4 likes each
like "$TOKEN_ALICE"   "$P9"  "alice"
like "$TOKEN_BOB"     "$P9"  "bob"
like "$TOKEN_CHARLIE" "$P9"  "charlie"
like "$TOKEN_HUGO"    "$P9"  "hugo"

like "$TOKEN_ALICE"   "$P8"  "alice"
like "$TOKEN_BOB"     "$P8"  "bob"
like "$TOKEN_EMMA"    "$P8"  "emma"
like "$TOKEN_FRANK"   "$P8"  "frank"

# Emma's posts (P6-P7) — 3 likes each
like "$TOKEN_ALICE"   "$P7"  "alice"
like "$TOKEN_BOB"     "$P7"  "bob"
like "$TOKEN_DIANA"   "$P7"  "diana"

like "$TOKEN_ALICE"   "$P6"  "alice"
like "$TOKEN_CHARLIE" "$P6"  "charlie"
like "$TOKEN_GRACE"   "$P6"  "grace"

# Frank's posts (P4-P5) — 3 likes each
like "$TOKEN_ALICE"   "$P5"  "alice"
like "$TOKEN_BOB"     "$P5"  "bob"
like "$TOKEN_HUGO"    "$P5"  "hugo"

like "$TOKEN_ALICE"   "$P4"  "alice"
like "$TOKEN_DIANA"   "$P4"  "diana"
like "$TOKEN_EMMA"    "$P4"  "emma"

# Grace's posts (P2-P3) — 3-4 likes each
like "$TOKEN_ALICE"   "$P3"  "alice"
like "$TOKEN_BOB"     "$P3"  "bob"
like "$TOKEN_FRANK"   "$P3"  "frank"
like "$TOKEN_HUGO"    "$P3"  "hugo"

like "$TOKEN_ALICE"   "$P2"  "alice"
like "$TOKEN_CHARLIE" "$P2"  "charlie"
like "$TOKEN_DIANA"   "$P2"  "diana"

# Hugo's post (P1) — 3 likes
like "$TOKEN_ALICE"   "$P1"  "alice"
like "$TOKEN_BOB"     "$P1"  "bob"
like "$TOKEN_FRANK"   "$P1"  "frank"

echo ""
echo "=== Seed complete ==="
echo ""
echo "Try logging in as:"
echo ""
echo "  alice@test.com / $PASS"
echo "    -> friends with everyone, 5 posts (most liked), 1 with image"
echo ""
echo "  bob@test.com / $PASS"
echo "    -> friends with alice + diana + emma, 3 posts, 6 pending requests from charlie"
echo ""
echo "  charlie@test.com / $PASS"
echo "    -> friends with alice only, 6 pending outgoing requests, 3 posts"
