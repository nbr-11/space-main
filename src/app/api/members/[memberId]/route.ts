import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, { params: { memberId } }: { params: { memberId: string } }) {
    try {

        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauhtorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("ServerId is missing", { status: 400 });
        }

        if (!memberId) {
            return new NextResponse("MemberId is missing", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                Member: {
                    deleteMany: {
                        id: memberId,
                        profileId: {
                            not: profile.id //this is so that admin don't kick themselves of the server
                        }
                    }
                }
            },
            include: {
                Member: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("[MEMBER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params: { memberId } }: { params: { memberId: string } }) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();

        const serverId = searchParams.get("serverId");
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("ServerId is missing", { status: 400 });
        }

        if (!memberId) {
            return new NextResponse("memberId is missing", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                Member: {
                    update: {
                        where: {
                            id: memberId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        data: {
                            role: role
                        }
                    }
                }
            },
            include: {
                Member: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });

        console.log(server);
        return NextResponse.json(server);

    } catch (error) {
        console.log("[MEMBER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}