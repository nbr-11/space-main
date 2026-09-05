import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {

        const profile = await currentProfile();
        const { name, type } = await req.json();

        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("[Unauthorized]", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is Missing", { status: 400 });
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
                    create: [
                        {
                            profileId: profile.id,
                            name: name,
                            type: type,
                        }
                    ]
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("[CHANNELS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });

    }
}