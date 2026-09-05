import InitialModal from '@/components/modals/initial-modal';
import prisma from '@/lib/db';
import { initialProfile } from '@/lib/initial-profile';
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {

    const profile = await initialProfile();

    const FirstServerOfProfile = await prisma.server.findFirst({
        where: {
            Member: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (FirstServerOfProfile) {
        return redirect(`/server/${FirstServerOfProfile.id}`)
    }

    return (
        <div>
            <InitialModal />
        </div>
    );
}

export default page