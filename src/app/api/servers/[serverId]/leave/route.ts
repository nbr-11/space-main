import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params: { serverId } }: { params: { serverId: string } }) {
    try {

        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("UnAuthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server id is missing", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                profileId: {
                    not: profile.id //admin cannot leave the server
                },
                Member: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                Member: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_LEAVE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}