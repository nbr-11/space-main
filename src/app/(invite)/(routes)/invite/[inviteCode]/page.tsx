import { currentProfile } from '@/lib/current-profile'
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface InviteCodePageProps {
    params: {
        inviteCode: string
    }
}


async function page({ params }: InviteCodePageProps) {

    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    const existingServer = await prisma.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            Member: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (existingServer) {
        return redirect(`/server/${existingServer.id}`)
    }

    const server = await prisma.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            Member: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }

    });

    if (server) {
        return redirect(`/server/${server.id}`)
    }

    return (
        null
    )
}

export default page