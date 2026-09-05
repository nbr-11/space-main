import { currentProfilePages } from "@/lib/current-profile-pages";
import prisma from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        const profile = await currentProfilePages(req);
        const { content, fileUrl } = req.body;
        const { conversationId } = req.query;

        if (!profile) {
            return res.status(401).json({ "error": "Unauthorized" });
        }


        if (!conversationId) {
            return res.status(400).json({ "error": "conversationId Missisng" });
        }

        if (!content) {
            return res.status(400).json({ "error": "Content is Missing" });
        }



        const conversations = await prisma.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        if (!conversations) {
            return res.status(404).json({ "error": "Could not find conversations" })
        }
        const member = conversations.memberOne.profileId === profile.id ? conversations.memberOne : conversations.memberTwo;


        if (!member) {
            return res.status(404).json({ "message": "Member not found" });
        }

        const message = await prisma.directMessage.create({
            data: {
                content,
                fileUrl,
                conversationId: conversationId as string,
                memberId: member.id
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        const channelKey = `chat:${conversationId}:messages`;

        res?.socket?.server?.io?.emit(channelKey, message);

        return res.status(200).json("Message sent successfully");

    } catch (error) {
        console.log("[DIRECT_MESSAGES_POST_PAGES]", error);
        return res.status(500).json({ "message": "Internal Error" });
    }
}