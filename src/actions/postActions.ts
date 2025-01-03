'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserById } from "@/actions/userActions";

export async function createPost(content: string, image: string) {
    try {
        const userId = await getUserById();
        if (!userId) return;

        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId: userId
            }
        });

        revalidatePath("/");
        return { success: true, post }
    } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, error:"Failed to create post" }
    }
};

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: "desc"
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
            }
        });

        return posts;
    } catch (error) {
        console.log("Error fetching posts", error);
        throw new Error("Failed to fetch posts");
    }
}

export async function toggleLike(postId: string) {
    try {
        const userId = await getUserById();
        if (!userId) return;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (!post) throw new Error("Post not found");

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
        } else {
            await prisma.$transaction([
                prisma.like.create({
                    data: {
                        userId,
                        postId
                    }
                }),
                ...(post.authorId !== userId 
                    ? [
                        prisma.notification.create({
                            data: {
                                type: "LIKE",
                                userId: post.authorId,
                                postId,
                                creatorId: userId
                            }
                        })
                    ]
                    : []
                )
            ])
        }

        revalidatePath("/");
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle like:", error);
        return { success: false, error:"Failed to toggle like" }
    }
}

export async function createComement(postId: string, content: string) {
    try {
        const userId = await getUserById();
        if (!userId) return;

        if (!content) throw new Error("content cannot be empty");

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (!post) throw new Error("Post not found");

        const [comment] = await prisma.$transaction(async (tx) => {
            const newComment = await tx.comment.create({
                data: {
                    content,
                    authorId: userId,
                    postId
                }
            });

            if (post.authorId !== userId) {
                await tx.notification.create({
                    data: {
                        type: "COMMENT",
                        userId: post.authorId,
                        postId,
                        creatorId: userId
                    }
                });
            }

            return [newComment];
        });

        revalidatePath("/");
        return { success: true, comment }
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error:"Failed to create comment" }
    }
}

export async function deletePost(postId: string) {
    try {
        const userId = await getUserById();
        if (!userId) return;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (!post) throw new Error("Post not found");

        if (post.authorId !== userId) throw new Error("You cannot delete this post");

        await prisma.post.delete({
            where: { id: postId }
        });

        revalidatePath("/");
        return { success: true }
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { success: false, error:"Failed to delete post" }
    }
}