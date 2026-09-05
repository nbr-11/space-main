import ChatHeader from '@/components/chat/chat-header';
import ChatInput from '@/components/chat/chat-input';
import ChatMessages from '@/components/chat/chat-messages';
import { MediaRoom } from '@/components/media-rooms';
import { currentProfile } from '@/lib/current-profile'
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { ChannelType } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react'


interface ChannelIdProps {
    params: {
        serverId: string,
        channelId: string,
    }
}

async function ChannelId({ params }: ChannelIdProps) {

    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const channel = await prisma.channel.findUnique({
        where: {
            id: params?.channelId
        }
    });

    const member = await prisma.member.findFirst({
        where: {
            sreverId: params.serverId,
            profileId: profile.id
        }
    });

    if (!channel || !member) {
        return redirect("/");
    }

    return (
        <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
            <ChatHeader name={channel.name} serverId={channel.serverId} type="channel" />
            {
                channel.type === ChannelType.TEXT && (
                    <>
                        <ChatMessages
                            member={member}
                            name={channel.name}
                            chatId={channel.id}
                            type="channel"
                            apiUrl='/api/messages'
                            socketUrl='/api/socket/messages'
                            socketQuery={{
                                channelId: channel.id,
                                serverId: channel.serverId
                            }}
                            paramKey='channelId'
                            paramValue={channel.id}
                        />

                        <ChatInput name={channel.name} type='channel' apiUrl="/api/socket/messages" query={{ channelId: channel.id, serverId: channel.serverId }} />
                    </>
                )
            }
            {
                channel.type == ChannelType.AUDIO && (
                    <MediaRoom chatId={channel.id} audio={true} video={false} />
                )
            }
            {
                channel.type == ChannelType.VIDEO && (
                    <MediaRoom chatId={channel.id} audio={true} video={true} />
                )
            }

        </div>
    )
}

export default ChannelId