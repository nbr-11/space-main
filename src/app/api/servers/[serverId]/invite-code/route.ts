import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export async function PATCH(req: NextRequest, { params }: { params: { serverId: string } }) {
    try {

        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("ServerId missing", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                inviteCode: uuid()
            }
        });

        if (!server) {
            return new NextResponse("You are not an Admin", { status: 401 })
        }

        return NextResponse.json(server);

    } catch (error) {
        console.log("[SERVER_ID]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}