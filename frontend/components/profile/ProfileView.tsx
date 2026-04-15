"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapPin } from "lucide-react";
import {
  getCurrentUser,
  getUserByUsername,
  getUserFriends,
  getUserPosts,
  type CurrentUser,
  type PublicUser,
} from "@/lib/api";
import { RightRail } from "@/components/layout/RightRail";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { FriendActionButton } from "@/components/profile/FriendActionButton";
import ArchiveStar from "@/components/decor/ArchiveStar";
import {
  buildProfileSuggestions,
  getRightRailTitle,
  type RightRailSuggestion,
} from "@/lib/right-rail";
import { useAuth } from "@/context/AuthContext";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { cn } from "@/lib/utils";

type ProfileUser = PublicUser & {
  createdAt: string;
};

type ProfileFriend = RightRailSuggestion;

type ProfileViewProps = {
  profileUsername?: string | null;
};

function formatJoinedDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ProfileView({ profileUsername = null }: ProfileViewProps) {
  const router = useRouter();
  const { user, token, isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const isOwnProfile = profileUsername === null;
  const normalizedCurrentUsername = user?.username.trim().toLowerCase() ?? null;
  const normalizedProfileUsername = profileUsername?.trim().toLowerCase() ?? null;
  const shouldRedirectToOwnProfile =
    !isOwnProfile &&
    Boolean(normalizedCurrentUsername) &&
    normalizedCurrentUsername === normalizedProfileUsername;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [friends, setFriends] = useState<ProfileFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [handledDeepLinkedPostId, setHandledDeepLinkedPostId] = useState<
    number | null
  >(null);

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
  });

  const connectedUserIds = useMemo(
    () =>
      Object.keys(connectedFriendshipIdsByUser).map((id) =>
        Number.parseInt(id, 10),
      ),
    [connectedFriendshipIdsByUser],
  );

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
    resetInteractionState,
  } = usePostInteractions({ token });

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.likesCount, 0),
    [posts],
  );

  const totalComments = useMemo(
    () => posts.reduce((sum, post) => sum + post.commentsCount, 0),
    [posts],
  );
  const deepLinkedPostId = useMemo(() => {
    const value = searchParams.get("post");

    if (!value) {
      return null;
    }

    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }, [searchParams]);

  const rightRailTitle = useMemo(
    () =>
      getRightRailTitle({
        isOwnProfile,
        profileUsername: isOwnProfile ? null : (profile?.username ?? null),
      }),
    [isOwnProfile, profile?.username],
  );

  const rightRailSuggestions = useMemo(
    () =>
      buildProfileSuggestions({
        friends,
        currentUserId: user?.id,
        connectedUserIds,
        includeConnected: isOwnProfile,
      }),
    [friends, user?.id, connectedUserIds, isOwnProfile],
  );

  useEffect(() => {
    if (!shouldRedirectToOwnProfile) {
      return;
    }

    const queryString = searchParams.toString();
    router.replace(queryString ? `/profile?${queryString}` : "/profile");
  }, [router, searchParams, shouldRedirectToOwnProfile]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!isOwnProfile && isAuthLoading) {
      return;
    }

    if (shouldRedirectToOwnProfile) {
      return;
    }

    if (isOwnProfile && user?.id === undefined) {
      if (isAuthLoading) {
        return;
      }

      setLoading(false);
      setPageError("Unable to resolve the observer record.");
      return;
    }

    if (!isOwnProfile && !profileUsername) {
      if (isAuthLoading) {
        return;
      }

      setLoading(false);
      setPageError("Unable to resolve the observer record.");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setPageError(null);
        setProfile(null);
        setPosts([]);
        setFriends([]);
        resetInteractionState();

        const userResult = isOwnProfile
          ? await getCurrentUser(token)
          : await getUserByUsername(profileUsername, token);

        if (!userResult.ok) {
          throw new Error(userResult.message || "Unable to fetch user.");
        }

        const resolvedProfile = userResult.data as CurrentUser | PublicUser;
        const resolvedProfileId = resolvedProfile.id;

        const [postsResult, friendsResult] = await Promise.all([
          getUserPosts(resolvedProfileId, token),
          getUserFriends(resolvedProfileId, token),
        ]);

        if (!postsResult.ok) {
          throw new Error(postsResult.message || "Unable to fetch posts.");
        }

        if (!friendsResult.ok) {
          throw new Error(
            friendsResult.message || "Unable to fetch observer fellows.",
          );
        }

        setProfile(resolvedProfile as ProfileUser);
        setPosts(Array.isArray(postsResult.data) ? postsResult.data : []);
        setFriends(Array.isArray(friendsResult.data) ? friendsResult.data : []);
      } catch (error) {
        console.error("fetchProfile error:", error);
        setPageError(
          error instanceof Error
            ? error.message
            : "Failed to load the observer record.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [
    token,
    profileUsername,
    isOwnProfile,
    isAuthLoading,
    resetInteractionState,
    setPosts,
    shouldRedirectToOwnProfile,
    user?.id,
  ]);

  useEffect(() => {
    setHandledDeepLinkedPostId(null);
  }, [deepLinkedPostId, profileUsername]);

  useEffect(() => {
    if (
      loading ||
      deepLinkedPostId === null ||
      postDialogOpen ||
      handledDeepLinkedPostId === deepLinkedPostId
    ) {
      return;
    }

    const targetPost = posts.find((post) => post.id === deepLinkedPostId);

    if (!targetPost) {
      setHandledDeepLinkedPostId(deepLinkedPostId);
      return;
    }

    handleOpenPost(targetPost.id);
    setHandledDeepLinkedPostId(deepLinkedPostId);
  }, [
    deepLinkedPostId,
    handleOpenPost,
    handledDeepLinkedPostId,
    loading,
    postDialogOpen,
    posts,
  ]);

  const resolvedProfileId = profile?.id ?? (isOwnProfile ? user?.id ?? null : null);

  const profileSent = resolvedProfileId
    ? sentRequests.includes(resolvedProfileId)
    : false;
  const profileIncomingRequestId = resolvedProfileId
    ? incomingRequestIdsBySender[resolvedProfileId]
    : undefined;
  const profileFriendshipId = resolvedProfileId
    ? connectedFriendshipIdsByUser[resolvedProfileId]
    : undefined;
  const profileConnected = resolvedProfileId
    ? typeof profileFriendshipId === "number"
    : false;
  const profileDisplayName =
    profile?.displayName?.trim() || profile?.username || "Observer";

  return (
    <>
      <div className="flex items-start justify-center gap-8 xl:gap-10">
        <section className="min-w-0 w-full max-w-[800px]">
          {loading ? (
            <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                Loading observer record...
              </p>
            </section>
          ) : pageError || !profile ? (
            <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                {pageError || "Observer record not found."}
              </p>
            </section>
          ) : (
            <div className="flex flex-col gap-2 lg:gap-4">
              <section className="relative mt-3">
                <div className="rotate-2 relative h-[260px] overflow-hidden border border-paper border-8 bg-paper-muted shadow-[8px_12px_30px_rgba(26,26,26,0.12)] sm:h-[300px]">
                  <ProfileBanner
                    name={profile.username}
                    src={profile.banner}
                    className="h-full w-full"
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/6 to-black/45" />
                </div>

                <div className="absolute -top-4 -left-5 h-5 w-28 -rotate-20 bg-paper-muted/70" />
                <div className="absolute -top-1 right-[5%] h-5 w-16 rotate-89 bg-paper-muted/70" />
              </section>

              <section className="relative -mt-25 px-4 sm:px-8">
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-start">
                  <div className="relative shrink-0 shadow-xl -rotate-3">
                    <ProfilePicture
                      name={profileDisplayName}
                      src={profile.avatar}
                      alt={profileDisplayName}
                      withShadow={false}
                      frameClassName="p-2.5"
                      className="h-32 w-32 md:h-44 md:w-44 mt-5"
                    />

                    <div className="absolute -bottom-3 -right-3 h-8 w-8 rotate-12 md:h-10 md:w-10">
                      <ArchiveStar />
                    </div>
                  </div>

                  <div className="w-full flex-1 pb-1">
                    <div className="space-y-4">
                      <div>
                        <h1 className="font-display text-4xl font-black uppercase leading-none tracking-[-0.05em] text-paper md:text-5xl">
                          {profileDisplayName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 font-mono text-s uppercase tracking-[0.18em] text-paper/80">
                          <span>@{profile.username.toLowerCase()}</span>
                        </div>
                      </div>

                      <p
                        className="max-w-2xl text-xl italic leading-relaxed text-accent-blue"
                        style={{
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {profile.bio ||
                          "Field observer cataloguing fragments, patterns, and quiet evidence from the archive."}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-paper/90">
                        <div className="flex flex-wrap items-center gap-3">
                          {profile.location ? (
                            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] bg-ink p-1 px-2">
                              <MapPin className="h-3.5 w-3.5" />
                              {profile.location}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3 md:justify-end">
                          {isOwnProfile ? (
                            <>
                              <Button asChild variant="bluesh" size="lg">
                                <Link href="/settings">Edit Profile</Link>
                              </Button>
                              <Button asChild variant="paper" size="lg">
                                <Link href="/friends">My Friends</Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <FriendActionButton
                                profileUserId={resolvedProfileId}
                                isConnected={profileConnected}
                                incomingRequestId={profileIncomingRequestId}
                                isPending={profileSent}
                                sendingFriendId={sendingFriendId}
                                onAddFriend={handleAddFriend}
                                onAcceptFriend={handleAcceptFriend}
                                onRemoveFriend={handleRemoveFriend}
                              />
                              <Button asChild variant="paper" size="lg">
                                <Link href={`/message?userId=${resolvedProfileId}`}>
                                  <HugeiconsIcon
                                    icon={MessageAdd01Icon}
                                    size={18}
                                    strokeWidth={1.9}
                                  />
                                  Message
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="px-2">
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="shrink-0 font-display text-[1.65rem] font-black uppercase tracking-[0.04em] text-ink">
                    Observer Profile
                  </h2>
                  <div className="flex-grow border-t-2 border-ink/20" />
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {[
                    {
                      label: "Posts",
                      value: formatCompactCount(posts.length),
                      tone: "text-ink text-6xl",
                      tape: "bg-accent-green",
                      rotate: "rotate-1",
                    },
                    {
                      label: "Received Likes",
                      value: formatCompactCount(totalLikes),
                      tone: "text-accent-red text-6xl",
                      rotate: "-rotate-1",
                    },
                    {
                      label: "Comments",
                      value: formatCompactCount(totalComments),
                      tone: "text-accent-blue text-6xl",
                      rotate: "rotate-2",
                      star: true,
                    },
                    {
                      label: "Friends",
                      value: formatCompactCount(friends.length),
                      tone: "text-ink text-6xl",
                      rotate: "-rotate-2",
                      tape: "bg-accent-red",
                    },
                    {
                      label: "Joined",
                      value: formatJoinedDate(profile.createdAt),
                      tone: "text-ink text-4xl",
                      rotate: "rotate-1",
                    },
                  ].map((item, index) => (
                    <article
                      key={item.label}
                      className={cn(
                        "relative border border-label/10 bg-paper p-4 text-center shadow-sm",
                        item.rotate,
                        index === 4 ? "col-span-2 md:col-span-1" : "",
                      )}
                    >
                      {item.tape ? (
                        <div
                          className={cn(
                            "archive-tape absolute -top-2 left-4 h-4 w-8 rotate-[-4deg]",
                            item.tape,
                          )}
                        />
                      ) : null}
                      {item.star ? (
                        <div className="absolute right-2 top-1 h-6 w-6 scale-75">
                          <ArchiveStar />
                        </div>
                      ) : null}
                      <span
                        className={cn(
                          "block text-2xl font-black uppercase tracking-wide",
                          item.tone,
                        )}
                      >
                        {item.value}
                      </span>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-label">
                        {item.label}
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="px-2">
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="shrink-0 font-display text-[1.65rem] font-black uppercase tracking-[0.04em] text-ink">
                    Recent Entries
                  </h2>
                  <div className="flex-grow border-t-2 border-ink/20" />
                </div>

                {posts.length === 0 ? (
                  <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                      No posts have been recorded for this observer yet.
                    </p>
                  </section>
                ) : (
                  <div className="flex flex-col gap-10">
                    {posts.map((post) => (
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
                    ))}
                  </div>
                )}

                <div className="border-t border-dashed border-label py-8 text-center font-mono text-sm text-label mt-10">
                  --- END OF PROFILE RECORD ---
                </div>
              </section>
            </div>
          )}
        </section>

        <RightRail
          totalPosts={posts.length}
          totalLikes={totalLikes}
          totalComments={totalComments}
          sectionTitle={rightRailTitle}
          suggestions={rightRailSuggestions}
          sentRequests={sentRequests}
          incomingRequestIdsBySender={incomingRequestIdsBySender}
          connectedFriendshipIdsByUser={connectedFriendshipIdsByUser}
          sendingFriendId={sendingFriendId}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
          onRemoveFriend={handleRemoveFriend}
          allowFollow={!isOwnProfile}
        />
      </div>

      <PostDialog
        open={postDialogOpen}
        post={activePost}
        focusCommentInput={focusCommentInput}
        currentUserId={user?.id}
        onOpenChange={handlePostDialogChange}
        onDelete={handleDelete}
        onDeleteComment={handleDeleteComment}
        onToggleLike={handleToggleLike}
        onToggleFavorite={handleToggleFavorite}
        onToggleCommentLike={handleToggleCommentLike}
        onToggleCommentFavorite={handleToggleCommentFavorite}
        onCommentChange={handleCommentChange}
        onAddComment={handleAddComment}
        commentValue={commentValue}
        deletingPostId={deletingPostId}
        deletingCommentId={deletingCommentId}
        likingPostId={likingPostId}
        favoritingPostId={favoritingPostId}
        likingCommentId={likingCommentId}
        favoritingCommentId={favoritingCommentId}
        commentingPostId={commentingPostId}
      />
    </>
  );
}
