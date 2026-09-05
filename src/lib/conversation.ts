import prisma from "@/lib/db";

export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {

    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);

    if (!conversation) {
        //@ts-ignore
        conversation = await createNewConersation(memberOneId, memberTwoId);

    }

    return conversation;
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        const conservation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId }
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

        return conservation;
    } catch (error) {
        return null;
    }
}

const createNewConersation = async (memberOneId: string, memberTwoId: string) => {
    try {
        const conversation = await prisma.conversation.create({
            data: {
                memberOneId,
                memberTwoId
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

        return conversation;
    } catch (erorr) {
        return null;
    }
}