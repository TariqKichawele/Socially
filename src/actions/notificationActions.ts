'use server';

import prisma from "@/lib/prisma";
import { getUserById } from "./userActions";

export async function getNotifications() {
    try {
        const userId = await getUserById();
        if (!userId) return [];

        const notifications = await prisma.notification.findMany({
            where: {
                userId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        image: true,
                        content: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return notifications;

    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        throw new Error("Failed to fetch notifications");
    }
}

export async function markAsRead(notificationId: string[]) {
    try {
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationId
                }
            },
            data: {
                read: true
            }
        });
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        throw new Error("Failed to mark notification as read");
    }
}