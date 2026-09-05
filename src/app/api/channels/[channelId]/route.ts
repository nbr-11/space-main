import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params: { channelId } }: { params: { channelId: string } }) {
    try {

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server Id is missing", { status: 400 });
        }

        if (!channelId) {
            return new NextResponse("channel Id is missing", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                Member: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                Channel: {
                    delete: {
                        id: channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params: { channelId } }: { params: { channelId: string } }) {

    try {

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const profile = await currentProfile();
        const { name, type } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server Id is missing", { status: 400 });
        }

        if (!channelId) {
            return new NextResponse("channel Id is missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("Name cannot be general", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                Member: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                Channel: {
                    update: {
                        where: {
                            id: channelId,
                            NOT: {
                                name: "general"
                            }
                        },
                        data: {
                            name,
                            type
                        }
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}