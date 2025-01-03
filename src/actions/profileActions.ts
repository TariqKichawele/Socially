'use server';

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserById } from "./userActions";


export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });

        return user;
    } catch (error) {
        console.error("Failed to get user by username:", error);
        throw new Error("Failed to get user by username");
    }
};

export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: { authorId: userId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return posts;
    } catch (error) {
        console.error("Failed to get user posts:", error);
        throw new Error("Failed to get user posts");
    }
};

export async function getUserLikesPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return likedPosts;
    } catch (error) {
        console.error("Failed to get user liked posts:", error);
        throw new Error("Failed to get user liked posts");
    }
}

export async function updateProfile(formData: FormData) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) throw new Error("Unauthorized");

        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;
        
        const user = await prisma.user.update({
            where: { clerkId: clerkId },
            data: {
                name: name,
                bio: bio,
                location: location,
                website: website
            }
        });

        revalidatePath("/profile");
        return { success: true, user };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
};


export async function isFollowing(userId: string) {
    try {
        const currentUserId = await getUserById();
        if (!currentUserId) return false;

        const follow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId
                }
            }
        });

        return !!follow;
    } catch (error) {
        console.error("Failed to check if following:", error);
        throw new Error("Failed to check if following");
    }
}