import ServerSideBar from '@/components/server/server-sidebar';
import { currentProfile } from '@/lib/current-profile'
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

async function ServerLayout({ children, params }: { children: React.ReactNode, params: { serverId: string } }) {

    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const server = await prisma.server.findUnique({
        where: {
            id: params.serverId,
            Member: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (!server) {
        return redirect("/");
    }

    return (
        <div className='h-full'>
            <div className='hidden fixed md:flex h-full w-60 z-20 flex-col inset-y-0'>
                <ServerSideBar serverId={params.serverId} />
            </div>
            <main className='h-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}

export default ServerLayout