"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { RightRail } from "@/components/layout/RightRail";
import { SearchUserCard, type SearchUserRecord } from "@/components/search/SearchUserCard";
import {
  Pagination,
  PaginationControls,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationSummary,
  type PaginationPageChangeDetails,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { useI18n } from "@/i18n/I18nProvider";
import {
  getFriendSuggestions,
  getUserById,
  getUserFriends,
  searchPostsAdvanced,
  searchUsersAdvanced,
  type MediaTypeFilter,
  type PostSortOption,
  type UserSortOption,
} from "@/lib/api";
import { getRightRailTitle, type RightRailSuggestion } from "@/lib/right-rail";

type SearchTab = "posts" | "users";

const DEFAULT_TAB: SearchTab = "posts";
const POSTS_PER_PAGE = 5;
const USERS_PER_PAGE = 6;

type PostFilters = {
  author: string;
  dateFrom: string;
  dateTo: string;
  mediaType: MediaTypeFilter;
  favoritesOnly: boolean;
  sort: PostSortOption;
};

type UserFilters = {
  onlineOnly: boolean;
  friendsOnly: boolean;
  sort: UserSortOption;
};

const DEFAULT_POST_FILTERS: PostFilters = {
  author: "",
  dateFrom: "",
  dateTo: "",
  mediaType: "all",
  favoritesOnly: false,
  sort: "recent",
};

const DEFAULT_USER_FILTERS: UserFilters = {
  onlineOnly: false,
  friendsOnly: false,
  sort: "alpha-asc",
};

function readSearchTab(value: string | null): SearchTab {
  return value === "users" ? "users" : DEFAULT_TAB;
}

function readSearchPage(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildSearchHref(query: string, tab: SearchTab, page = 1) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    params.set("q", trimmedQuery);
  }

  if (tab !== DEFAULT_TAB) {
    params.set("tab", tab);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();

  return serialized ? `/search?${serialized}` : "/search";
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { t } = useI18n();
  const { notifyError } = useArchiveToasts();

  const currentQuery = searchParams.get("q")?.trim() || "";
  const activeTab = readSearchTab(searchParams.get("tab"));
  const requestedPage = readSearchPage(searchParams.get("page"));

  const [draftQuery, setDraftQuery] = useState(currentQuery);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [users, setUsers] = useState<SearchUserRecord[]>([]);
  const [suggestions, setSuggestions] = useState<RightRailSuggestion[]>([]);
  const [postFilters, setPostFilters] = useState<PostFilters>(DEFAULT_POST_FILTERS);
  const [userFilters, setUserFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const enrichedUserIdsRef = useRef(new Set<number>());
  const enrichingUserIdsRef = useRef(new Set<number>());

  const {
    posts,
    setPosts,
    activePost,
    postDialogOpen,
    focusCommentInput,
    commentValue,
    deletingPostId,
    deletingCommentId,
    likingPostId,
    favoritingPostId,
    likingCommentId,
    favoritingCommentId,
    commentingPostId,
    handleCommentChange,
    handleOpenPost,
    handlePostDialogChange,
    handleDeleteComment,
    handleAddComment,
    handleDelete,
    handleToggleLike,
    handleToggleFavorite,
    handleToggleCommentLike,
    handleToggleCommentFavorite,
  } = usePostInteractions({ token });

  const {
    sentRequests,
    incomingRequestIdsBySender,
    connectedFriendshipIdsByUser,
    sendingFriendId,
    handleAddFriend,
    handleAcceptFriend,
    handleRemoveFriend,
  } = useFriendRequests({
    token,
    onFriendAccepted: (userId) => {
      setSuggestions((prev) =>
        prev.filter((suggestion) => suggestion.id !== userId),
      );
    },
  });

  const rightRailLabels = {
    myFriends: t("rightRail.myFriends"),
    youMightKnow: t("rightRail.youMightKnow"),
    friendsSuffix: t("rightRail.friendsSuffix"),
  };

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.likesCount, 0),
    [posts],
  );

  const totalComments = useMemo(
    () => posts.reduce((sum, post) => sum + post.commentsCount, 0),
    [posts],
  );

  useEffect(() => {
    setDraftQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    (async () => {
      const suggestionsResult = await getFriendSuggestions(token);

      if (ignore) return;

      const normalizedSuggestions =
        suggestionsResult.ok &&
        suggestionsResult.data &&
        Array.isArray(suggestionsResult.data.suggestions)
          ? suggestionsResult.data.suggestions
              .filter(
                (item): item is RightRailSuggestion =>
                  typeof item?.id === "number" &&
                  typeof item?.username === "string",
              )
              .map((item) => ({
                id: item.id,
                username: item.username,
                displayName: item.displayName || null,
                avatar: item.avatar || null,
              }))
          : [];

      setSuggestions(normalizedSuggestions);
    })();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || activeTab !== "posts") {
      return;
    }

    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setPageError(null);

        const result = await searchPostsAdvanced(
          {
            q: currentQuery,
            author: postFilters.author,
            dateFrom: postFilters.dateFrom,
            dateTo: postFilters.dateTo,
            mediaType: postFilters.mediaType,
            favoritesOnly: postFilters.favoritesOnly,
            sort: postFilters.sort,
            page: requestedPage,
            limit: POSTS_PER_PAGE,
          },
          token,
        );

        if (ignore) return;

        if (!result.ok) {
          throw new Error(result.message || t("search.errors.loadPosts"));
        }

        setPosts(result.data.items);
        setPostsTotal(result.data.total);
        setPostsTotalPages(result.data.totalPages);
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error ? error.message : t("search.errors.loadFallback");
        setPageError(message);
        notifyError(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    activeTab,
    currentQuery,
    notifyError,
    postFilters,
    requestedPage,
    setPosts,
    t,
    token,
  ]);

  useEffect(() => {
    if (!token || activeTab !== "users") {
      return;
    }

    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setPageError(null);
        enrichedUserIdsRef.current.clear();
        enrichingUserIdsRef.current.clear();

        const result = await searchUsersAdvanced(
          {
            q: currentQuery,
            onlineOnly: userFilters.onlineOnly,
            friendsOnly: userFilters.friendsOnly,
            sort: userFilters.sort,
            page: requestedPage,
            limit: USERS_PER_PAGE,
          },
          token,
        );

        if (ignore) return;

        if (!result.ok) {
          throw new Error(result.message || t("search.errors.loadUsers"));
        }

        const baseUsers = result.data.items.map((baseUser) =>
          ({
            id: baseUser.id,
            username: baseUser.username,
            displayName: baseUser.displayName ?? null,
            avatar: baseUser.avatar ?? null,
            banner: null,
            bio: null,
            status: baseUser.status ?? null,
            location: null,
            website: null,
            createdAt: baseUser.createdAt,
            friendCount: 0,
            postCount: 0,
            totalLikes: 0,
            totalComments: 0,
          } satisfies SearchUserRecord),
        );

        setUsers(baseUsers);
        setUsersTotal(result.data.total);
        setUsersTotalPages(result.data.totalPages);
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error ? error.message : t("search.errors.loadFallback");
        setPageError(message);
        notifyError(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [activeTab, currentQuery, notifyError, requestedPage, t, token, userFilters]);

  const resultCount = activeTab === "posts" ? postsTotal : usersTotal;
  const resultLabel =
    activeTab === "posts"
      ? t("search.resultLabels.posts")
      : t("search.resultLabels.users");
  const pageSize = activeTab === "posts" ? POSTS_PER_PAGE : USERS_PER_PAGE;
  const totalPages = activeTab === "posts" ? postsTotalPages : usersTotalPages;
  const currentPage = Math.min(requestedPage, Math.max(1, totalPages));

  const paginatedPosts = posts;
  const paginatedUsers = users;

  useEffect(() => {
    if (!token || loading || pageError || activeTab !== "users") {
      return;
    }

    const visibleUsers = paginatedUsers.filter((user) => {
      return (
        !enrichedUserIdsRef.current.has(user.id) &&
        !enrichingUserIdsRef.current.has(user.id)
      );
    });

    if (visibleUsers.length === 0) {
      return;
    }

    let cancelled = false;

    visibleUsers.forEach((user) => {
      enrichingUserIdsRef.current.add(user.id);
    });

    const enrichVisibleUsers = async () => {
      try {
        const enrichedUsers = await Promise.all(
          visibleUsers.map(async (baseUser) => {
            const [profileResult, friendsResult] = await Promise.all([
              getUserById(baseUser.id, token),
              getUserFriends(baseUser.id, token),
            ]);

            const profile = profileResult.ok
              ? profileResult.data
              : {
                ...baseUser,
                banner: null,
                bio: null,
                status: null,
                location: null,
                website: null,
                createdAt: undefined,
              };

            return {
              ...baseUser,
              username: profile.username || baseUser.username,
              displayName:
                profile.displayName ?? baseUser.displayName ?? null,
              avatar: profile.avatar ?? baseUser.avatar ?? null,
              banner: profile.banner ?? null,
              bio: profile.bio ?? null,
              status: profile.status ?? null,
              location: profile.location ?? null,
              website: profile.website ?? null,
              createdAt: profile.createdAt,
              friendCount:
                friendsResult.ok && Array.isArray(friendsResult.data)
                  ? friendsResult.data.length
                  : baseUser.friendCount,
            } satisfies SearchUserRecord;
          }),
        );

        if (cancelled) {
          return;
        }

        const enrichedUserMap = new Map(
          enrichedUsers.map((user) => [user.id, user]),
        );

        setUsers((previousUsers) =>
          previousUsers.map((user) => enrichedUserMap.get(user.id) || user),
        );

        enrichedUsers.forEach((user) => {
          enrichedUserIdsRef.current.add(user.id);
        });
      } catch {
        // Retry on the next visible-page pass if one of these requests fails.
      } finally {
        visibleUsers.forEach((user) => {
          enrichingUserIdsRef.current.delete(user.id);
        });
      }
    };

    void enrichVisibleUsers();

    return () => {
      cancelled = true;
    };
  }, [activeTab, loading, pageError, paginatedUsers, token]);

  useEffect(() => {
    if (loading || pageError || requestedPage === currentPage) {
      return;
    }

    router.replace(buildSearchHref(currentQuery, activeTab, currentPage));
  }, [
    activeTab,
    currentPage,
    currentQuery,
    loading,
    pageError,
    requestedPage,
    router,
  ]);

  const resetToFirstPage = () => {
    if (requestedPage !== 1) {
      router.replace(buildSearchHref(currentQuery, activeTab, 1));
    }
  };

  useEffect(() => {
    resetToFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postFilters, userFilters, activeTab]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildSearchHref(draftQuery, activeTab));
  };

  const handleTabChange = (nextTab: SearchTab) => {
    router.replace(buildSearchHref(draftQuery, nextTab));
  };

  const handlePageChange = (details: PaginationPageChangeDetails) => {
    router.replace(buildSearchHref(currentQuery, activeTab, details.page));
  };

  return (
    <>
      <div className="flex items-start justify-center gap-8 xl:gap-10">
        <section className="min-w-0 w-full max-w-[800px]">
          <Tabs
            value={activeTab}
            onValueChange={(details) =>
              handleTabChange(readSearchTab(details.value))
            }
            className="gap-8"
          >
            <header className="archive-paper relative border border-black/10 px-6 py-6 rotate-[-0.5deg] sm:px-8">
              <div className="archive-tape absolute -top-3 left-10 h-5 w-24 rotate-2 bg-accent-orange" />

              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-[-0.05em] text-ink sm:text-5xl">
                    {t("search.title")}
                  </h1>
                  {/*<p className="mt-2 max-w-2xl text-sm leading-relaxed text-label">
                    {t("search.description")}
                  </p>*/}
                </div>

                <form className="relative" onSubmit={handleSearchSubmit}>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label" />
                  <input
                    type="text"
                    value={draftQuery}
                    onChange={(event) => setDraftQuery(event.target.value)}
                    placeholder={t("search.placeholder")}
                    className="archive-input w-full border-2 border-label/20 bg-paper-muted py-4 pl-12 pr-4 font-mono text-lg text-ink transition-colors outline-none focus:border-accent-orange"
                  />
                </form>

                <TabsList variant="archive" className="gap-8">
                  <TabsTrigger value="posts" variant="archive">
                    {t("search.tabs.posts")}
                  </TabsTrigger>
                  <TabsTrigger value="users" variant="archive">
                    {t("search.tabs.users")}
                  </TabsTrigger>
                  <TabsIndicator />
                </TabsList>

                <div className="border-t border-dashed border-label/30 pt-4">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-label transition-colors hover:text-ink"
                    aria-expanded={filtersOpen}
                  >
                    <span>{filtersOpen ? "[-]" : "[+]"}</span>
                    <span>Advanced filters & sort</span>
                  </button>

                  {filtersOpen ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 border border-dashed border-label/25 bg-paper-muted/60 p-4 sm:grid-cols-2">
                      {activeTab === "posts" ? (
                        <>
                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Author (username)
                            <input
                              type="text"
                              value={postFilters.author}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  author: event.target.value,
                                }))
                              }
                              placeholder="@username"
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            />
                          </label>

                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Media type
                            <select
                              value={postFilters.mediaType}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  mediaType: event.target.value as MediaTypeFilter,
                                }))
                              }
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            >
                              <option value="all">All</option>
                              <option value="image">Image only</option>
                              <option value="pdf">PDF only</option>
                              <option value="none">No attachment</option>
                            </select>
                          </label>

                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Date from
                            <input
                              type="date"
                              value={postFilters.dateFrom}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  dateFrom: event.target.value,
                                }))
                              }
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            />
                          </label>

                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Date to
                            <input
                              type="date"
                              value={postFilters.dateTo}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  dateTo: event.target.value,
                                }))
                              }
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            />
                          </label>

                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Sort by
                            <select
                              value={postFilters.sort}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  sort: event.target.value as PostSortOption,
                                }))
                              }
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            >
                              <option value="recent">Most recent</option>
                              <option value="oldest">Oldest</option>
                              <option value="likes">Most liked</option>
                            </select>
                          </label>

                          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label sm:mt-6">
                            <input
                              type="checkbox"
                              checked={postFilters.favoritesOnly}
                              onChange={(event) =>
                                setPostFilters((prev) => ({
                                  ...prev,
                                  favoritesOnly: event.target.checked,
                                }))
                              }
                              className="h-4 w-4 accent-accent-orange"
                            />
                            My favorites only
                          </label>

                          <button
                            type="button"
                            onClick={() => setPostFilters(DEFAULT_POST_FILTERS)}
                            className="sm:col-span-2 mt-1 self-start font-mono text-[10px] uppercase tracking-[0.22em] text-label underline transition-colors hover:text-accent-red"
                          >
                            Reset filters
                          </button>
                        </>
                      ) : (
                        <>
                          <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                            Sort by
                            <select
                              value={userFilters.sort}
                              onChange={(event) =>
                                setUserFilters((prev) => ({
                                  ...prev,
                                  sort: event.target.value as UserSortOption,
                                }))
                              }
                              className="archive-input mt-1 border border-label/20 bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent-orange"
                            >
                              <option value="alpha-asc">Alphabetical (A-Z)</option>
                              <option value="alpha-desc">Alphabetical (Z-A)</option>
                              <option value="recent">Newest members</option>
                              <option value="oldest">Oldest members</option>
                            </select>
                          </label>

                          <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label sm:mt-6">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={userFilters.onlineOnly}
                                onChange={(event) =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    onlineOnly: event.target.checked,
                                  }))
                                }
                                className="h-4 w-4 accent-accent-orange"
                              />
                              Online only
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={userFilters.friendsOnly}
                                onChange={(event) =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    friendsOnly: event.target.checked,
                                  }))
                                }
                                className="h-4 w-4 accent-accent-orange"
                              />
                              Friends only
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => setUserFilters(DEFAULT_USER_FILTERS)}
                            className="sm:col-span-2 mt-1 self-start font-mono text-[10px] uppercase tracking-[0.22em] text-label underline transition-colors hover:text-accent-red"
                          >
                            Reset filters
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  <span>
                    {loading
                      ? t("search.loading.indexing")
                      : t("search.resultsCount", { count: resultCount, label: resultLabel, s: resultCount === 1 ? "" : "s" })}
                  </span>
                  <span>
                    {currentQuery
                      ? t("search.query", { query: currentQuery })
                      : t("search.showingLatest")}
                  </span>
                </div>
              </div>
            </header>

            {pageError ? (
              <section className="border border-accent-red/20 bg-paper px-5 py-4 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-red">
                  {pageError}
                </p>
              </section>
            ) : null}

            {pageError ? null : loading ? (
              <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  {t("search.loading.records")}
                </p>
              </section>
            ) : (
              <>
                <TabsContent value="posts" className="space-y-10">
                  {paginatedPosts.length === 0 ? (
                    <section className="border border-dashed border-label/30 bg-paper/70 px-5 py-10 text-center">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-label">
                        {t("search.empty.posts")}
                      </p>
                    </section>
                  ) : (
                    paginatedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                        onOpenPost={handleOpenPost}
                        onDelete={handleDelete}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                        deletingPostId={deletingPostId}
                        likingPostId={likingPostId}
                        favoritingPostId={favoritingPostId}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="users">
                  {paginatedUsers.length === 0 ? (
                    <section className="border border-dashed border-label/30 bg-paper/70 px-5 py-10 text-center">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-label">
                        {t("search.empty.users")}
                      </p>
                    </section>
                  ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {paginatedUsers.map((candidate) => (
                        <SearchUserCard
                          key={candidate.id}
                          user={candidate}
                          currentUserId={user?.id}
                          sentRequests={sentRequests}
                          incomingRequestIdsBySender={incomingRequestIdsBySender}
                          connectedFriendshipIdsByUser={connectedFriendshipIdsByUser}
                          sendingFriendId={sendingFriendId}
                          onAddFriend={handleAddFriend}
                          onAcceptFriend={handleAcceptFriend}
                          onRemoveFriend={handleRemoveFriend}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {resultCount > pageSize ? (
                  <Pagination
                    count={resultCount}
                    page={currentPage}
                    pageSize={pageSize}
                    siblingCount={1}
                    onPageChange={handlePageChange}
                    className="border-t border-dashed border-label/30 py-8"
                  >
                    <PaginationSummary itemLabel={t("search.pagination", { label: resultLabel })} />
                    <PaginationControls>
                      <PaginationPrevTrigger />
                      <PaginationItems />
                      <PaginationNextTrigger />
                    </PaginationControls>
                  </Pagination>
                ) : null}

                <div className="border-t border-dashed border-label py-8 text-center font-mono text-sm text-label">
                  {t("search.endOfResults")}
                </div>
              </>
            )}
          </Tabs>
        </section>

        <RightRail
          totalPosts={posts.length}
          totalLikes={totalLikes}
          totalComments={totalComments}
          sectionTitle={getRightRailTitle({}, rightRailLabels)}
          suggestions={suggestions}
          sentRequests={sentRequests}
          incomingRequestIdsBySender={incomingRequestIdsBySender}
          connectedFriendshipIdsByUser={connectedFriendshipIdsByUser}
          sendingFriendId={sendingFriendId}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
          onRemoveFriend={handleRemoveFriend}
        />
      </div>

      <PostDialog
        open={postDialogOpen}
        post={activePost}
        commentValue={commentValue}
        currentUserId={user?.id}
        deletingPostId={deletingPostId}
        deletingCommentId={deletingCommentId}
        likingPostId={likingPostId}
        favoritingPostId={favoritingPostId}
        likingCommentId={likingCommentId}
        favoritingCommentId={favoritingCommentId}
        commentingPostId={commentingPostId}
        focusCommentInput={focusCommentInput}
        onOpenChange={handlePostDialogChange}
        onDelete={handleDelete}
        onDeleteComment={handleDeleteComment}
        onToggleLike={handleToggleLike}
        onToggleFavorite={handleToggleFavorite}
        onToggleCommentLike={handleToggleCommentLike}
        onToggleCommentFavorite={handleToggleCommentFavorite}
        onCommentChange={handleCommentChange}
        onAddComment={handleAddComment}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
