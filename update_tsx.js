const fs = require('fs');

function updateFile(file, replacements, needsI18n = false) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (needsI18n && !content.includes('useI18n')) {
    content = content.replace(
      'import { useAuth } from "@/context/AuthContext";',
      'import { useAuth } from "@/context/AuthContext";\nimport { useI18n } from "@/i18n/I18nProvider";'
    );
    // Insert `const { t } = useI18n();` just after `const { user, token } = useAuth();`
    content = content.replace(
      'const { user, token } = useAuth();',
      'const { user, token } = useAuth();\n\tconst { t } = useI18n();'
    );
  }

  for (const [oldStr, newStr] of replacements) {
    content = content.split(oldStr).join(newStr);
  }
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}

// 1. ProfileView.tsx
updateFile('frontend/components/profile/ProfileView.tsx', [
  ['"Unable to resolve the observer record."', 't("profile.errors.resolveObserver")'],
  ['"Unable to fetch user."', 't("profile.errors.fetchUser")'],
  ['"Unable to fetch posts."', 't("profile.errors.fetchPosts")'],
  ['"Unable to fetch observer fellows."', 't("profile.errors.fetchFriends")'],
  ['"Failed to load the observer record."', 't("profile.errors.loadFallback")'],
  ['Loading observer record...', '{t("profile.loading")}'],
  ['Observer record not found.', '{t("profile.notFound")}'],
  ['"Observer"', 't("profile.fallbackName")'],
  ['"Field observer cataloguing fragments, patterns, and quiet evidence from the archive."', 't("profile.fallbackBio")'],
  ['>Edit Profile<', '>{t("profile.editProfile")}<'],
  ['>My Friends<', '>{t("profile.myFriends")}<'],
  ['>Message<', '>{t("profile.message")}<'],
  ['>Observer Profile<', '>{t("profile.observerProfile")}<'],
  ['label: "Posts"', 'label: t("profile.stats.posts")'],
  ['label: "Received Likes"', 'label: t("profile.stats.likes")'],
  ['label: "Comments"', 'label: t("profile.stats.comments")'],
  ['label: "Friends"', 'label: t("profile.stats.friends")'],
  ['label: "Joined"', 'label: t("profile.stats.joined")'],
  ['>Recent Entries<', '>{t("profile.recentEntries")}<'],
  ['No posts have been recorded for this observer yet.', '{t("profile.emptyPosts")}'],
  ['--- END OF PROFILE RECORD ---', '{t("profile.endOfRecord")}'],
]);

// 2. feed/page.tsx
updateFile('frontend/app/(app)/feed/page.tsx', [
  ['>All Posts<', '>{t("feed.scopeAll")}<'],
  ['>Friends<', '>{t("feed.scopeFriends")}<'],
  ['Loading friends archive...', '{t("feed.loadingFriends")}'],
  ['Loading feed archive...', '{t("feed.loadingAll")}'],
  ['No accepted-friends posts have been recorded yet.', '{t("feed.emptyFriends")}'],
  ['No posts have been recorded yet.', '{t("feed.emptyAll")}'],
  ['itemLabel="posts"', 'itemLabel={t("feed.posts")}'],
  ['--- END OF RECENT LOGS ---', '{t("feed.endOfLogs")}'],
  ['aria-label="Create a new post"', 'aria-label={t("feed.newPostAria")}']
], true);

// 3. search/page.tsx
updateFile('frontend/app/(app)/search/page.tsx', [
  ['>Search<', '>{t("search.title")}<'],
  ['Search archive posts and observer records without leaving the current shell.', '{t("search.description")}'],
  ['placeholder="SEARCH POSTS OR OBSERVERS..."', 'placeholder={t("search.placeholder")}'],
  ['>Posts<', '>{t("search.tabs.posts")}<'],
  ['>Users<', '>{t("search.tabs.users")}<'],
  ['"Indexing archive records..."', 't("search.loading.indexing")'],
  ['`${resultCount} ${resultLabel} result${resultCount === 1 ? "" : "s"}`', 't("search.resultsCount", { count: resultCount, label: resultLabel, s: resultCount === 1 ? "" : "s" })'],
  ['`Query: ${currentQuery}`', 't("search.query", { query: currentQuery })'],
  ['"Showing the latest archive records"', 't("search.showingLatest")'],
  ['Loading archive records...', '{t("search.loading.records")}'],
  ['No posts match this archive query.', '{t("search.empty.posts")}'],
  ['No observers match this archive query.', '{t("search.empty.users")}'],
  ['itemLabel={`${resultLabel} results`}', 'itemLabel={t("search.pagination", { label: resultLabel })}'],
  ['--- END OF SEARCH RESULTS ---', '{t("search.endOfResults")}'],
  ['"Unable to load archive posts."', 't("search.errors.loadPosts")'],
  ['"Unable to load observers."', 't("search.errors.loadUsers")'],
  ['"Failed to load the archive search page."', 't("search.errors.loadFallback")']
]);

// 4. friends/page.tsx
updateFile('frontend/app/(app)/friends/page.tsx', [
  ['>Directory<', '>{t("friends.title")}<'],
  ['Search for observers & manage connections', '{t("friends.subtitle")}'],
  ['placeholder="Search observers..."', 'placeholder={t("friends.searchPlaceholder")}'],
  ['>Incoming Requests<', '>{t("friends.incomingRequests")}<'],
  ['>Wants to connect<', '>{t("friends.wantsToConnect")}<'],
  ['>Accept<', '>{t("friends.accept")}<'],
  ['>Decline<', '>{t("friends.decline")}<'],
  ['{searchQuery ? "Search Results" : "All Observers"}', '{searchQuery ? t("friends.searchResults") : t("friends.allObservers")}'],
  ['>Loading...<', '>{t("friends.loading")}<'],
  ['>No observers found.<', '>{t("friends.noObservers")}<'],
  ['"Observer profile"', 't("friends.observerProfile")'],
  ['>Friend<', '>{t("friends.friend")}<'],
  ['>Delete<', '>{t("friends.delete")}<'],
  ['"Pending" : sendingId === u.id ? "Adding" : "Add"', 't("friends.pending") : sendingId === u.id ? t("friends.adding") : t("friends.add")'],
  ['sectionTitle="My Friends"', 'sectionTitle={t("profile.myFriends")}'],
  ['"You must be logged in to send a request."', 't("friends.toasts.loginRequired")'],
  ['"Unable to send friend request."', 't("friends.toasts.sendError")'],
  ['"Friend request sent."', 't("friends.toasts.sent")'],
  ['"Friend request accepted."', 't("friends.toasts.accepted")'],
  ['"Friend request declined."', 't("friends.toasts.declined")'],
  ['"Friendship not found."', 't("friends.toasts.notFound")'],
  ['"Friend removed."', 't("friends.toasts.removed")'],
  ['"Failed to remove friend."', 't("friends.toasts.removeError")'],
  ['"Unable to remove friend."', 't("friends.toasts.removeUnable")'],
  ['title: "Error"', 'title: t("friends.toasts.titles.error")'],
  ['title: "Sent"', 'title: t("friends.toasts.titles.sent")'],
  ['title: "Accepted"', 'title: t("friends.toasts.titles.accepted")'],
  ['title: "Declined"', 'title: t("friends.toasts.titles.declined")'],
  ['title: "Removed"', 'title: t("friends.toasts.titles.removed")']
], true);
