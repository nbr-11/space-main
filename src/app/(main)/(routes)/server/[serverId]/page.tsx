import { currentProfile } from '@/lib/current-profile'
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface ServerIdPageProps {
    params: {
        serverId: string,
    }
};

async function page({ params }: ServerIdPageProps) {

    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const server = await prisma.server.findUnique({
        where: {
            id: params.serverId,
            Member: {
                some: {
                    profileId: profile.id,
                }
            }
        },
        include: {
            Channel: {
                where: {
                    name: "general"
                },
                orderBy: {
                    created_at: "asc"
                }
            }
        }

    });


    const initialChannel = server?.Channel?.[0];

    if (initialChannel?.name !== "general") {
        return null;
    }


    return redirect(`/server/${params?.serverId}/channels/${initialChannel?.id}`)
}

export default page