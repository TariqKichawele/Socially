import { getProfileByUsername, getUserLikesPosts, getUserPosts, isFollowing } from '@/actions/profileActions';
import { notFound } from 'next/navigation';
import React from 'react'
import ProfilePageClient from './ProfilePageClient';

export async function generateMetadata({ params }: { params: tParams }) {
    const { username } = await params;
    const user = await getProfileByUsername(username);
    if (!user) return;

    return {
        title: `${user.name ?? user.username}`,
        description: user.bio || `Check out ${user.username}'s profile.`,
    }
}

type tParams = Promise<{ username: string }>;

const ProfileServer = async ({ params }: { params: tParams}) => {
    const { username } = await params;
    const user = await getProfileByUsername(username);
    if (!user) return notFound();

    const [ posts, likedPosts, isCurrentUserFollowing ] = await Promise.all([
        getUserPosts(user.id),
        getUserLikesPosts(user.id),
        isFollowing(user.id)
    ]);

  return (
    <ProfilePageClient 
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
    />
  )
}

export default ProfileServer