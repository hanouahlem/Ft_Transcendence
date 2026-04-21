"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
  getPosts,
  getUserById,
  getUserFriends,
  getUsers,
} from "@/lib/api";
import { getRightRailTitle, type RightRailSuggestion } from "@/lib/right-rail";

type SearchTab = "posts" | "users";

const DEFAULT_TAB: SearchTab = "posts";
const POSTS_PER_PAGE = 5;
const USERS_PER_PAGE = 6;

function normalizeSearchValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

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

export default function SearchPage() {
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

  const normalizedQuery = useMemo(
    () => normalizeSearchValue(currentQuery),
    [currentQuery],
  );

  useEffect(() => {
    setDraftQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    const fetchSearchData = async () => {
      try {
        setLoading(true);
        setPageError(null);
        enrichedUserIdsRef.current.clear();
        enrichingUserIdsRef.current.clear();

        const [postsResult, usersResult, suggestionsResult] = await Promise.all([
          getPosts(token),
          getUsers(token),
          getFriendSuggestions(token),
        ]);

        if (!postsResult.ok) {
          throw new Error(postsResult.message || t("search.errors.loadPosts"));
        }

        if (!usersResult.ok) {
          throw new Error(usersResult.message || t("search.errors.loadUsers"));
        }

        const resolvedPosts = Array.isArray(postsResult.data)
          ? postsResult.data
          : [];

        const postStatsByUser = resolvedPosts.reduce<
          Record<number, { postCount: number; totalLikes: number; totalComments: number }>
        >((accumulator, post) => {
          const nextStats = accumulator[post.author.id] || {
            postCount: 0,
            totalLikes: 0,
            totalComments: 0,
          };

          nextStats.postCount += 1;
          nextStats.totalLikes += post.likesCount;
          nextStats.totalComments += post.commentsCount;
          accumulator[post.author.id] = nextStats;

          return accumulator;
        }, {});

        const baseUsers = Array.isArray(usersResult.data) ? usersResult.data : [];
        const resolvedUsers = baseUsers.map((baseUser) => {
          const stats = postStatsByUser[baseUser.id] || {
            postCount: 0,
            totalLikes: 0,
            totalComments: 0,
          };

          return {
            id: baseUser.id,
            username: baseUser.username,
            displayName: baseUser.displayName ?? null,
            avatar: baseUser.avatar ?? null,
            banner: null,
            bio: null,
            status: null,
            location: null,
            website: null,
            createdAt: undefined,
            friendCount: 0,
            postCount: stats.postCount,
            totalLikes: stats.totalLikes,
            totalComments: stats.totalComments,
          } satisfies SearchUserRecord;
        });

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

        if (ignore) {
          return;
        }

        setPosts(resolvedPosts);
        setUsers(
          resolvedUsers.sort((left, right) =>
            left.username.localeCompare(right.username),
          ),
        );
        setSuggestions(normalizedSuggestions);
      } catch (error) {
        if (ignore) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : t("search.errors.loadFallback");

        setPageError(message);
        notifyError(message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchSearchData();

    return () => {
      ignore = true;
    };
  }, [notifyError, setPosts, token]);

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const haystack = [
        post.content,
        post.author.username,
        post.author.displayName,
        ...post.comments.map((comment) => comment.content),
        ...post.comments.map((comment) => comment.author.username),
        ...post.comments.map((comment) => comment.author.displayName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, posts]);

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((candidate) => {
      const haystack = [
        candidate.username,
        candidate.displayName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, users]);

  const resultCount =
    activeTab === "posts" ? filteredPosts.length : filteredUsers.length;
  const resultLabel =
    activeTab === "posts"
      ? t("search.resultLabels.posts")
      : t("search.resultLabels.users");
  const pageSize = activeTab === "posts" ? POSTS_PER_PAGE : USERS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(resultCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;

    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [currentPage, filteredPosts]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;

    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [currentPage, filteredUsers]);

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
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-label">
                    {t("search.description")}
                  </p>
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

                <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  <span>
                    {loading
                      ? t("search.loading.indexing")
                      : t("search.resultsCount", { count: resultCount, label: resultLabel, s: resultCount === 1 ? "" : "s" })}
                  </span>
                  <span>
                    {normalizedQuery
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
                  {filteredPosts.length === 0 ? (
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
                  {filteredUsers.length === 0 ? (
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
