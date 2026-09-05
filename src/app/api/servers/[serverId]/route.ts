import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { serverId: string } }
) {
    try {

        const profile = await currentProfile();
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauhtorized", { status: 401 });
        }

        const server = await prisma.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                imageUrl,
            }
        });

        return NextResponse.json(server);


    } catch (error) {
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }

}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { serverId: string } }
) {
    try {

        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauhtorized", { status: 401 });
        }

        const server = await prisma.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id
            }
        });

        return NextResponse.json(server);


    } catch (error) {
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }

}