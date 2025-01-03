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
