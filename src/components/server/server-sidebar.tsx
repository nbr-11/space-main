import { currentProfile } from '@/lib/current-profile'
import prisma from '@/lib/db';
import { ChannelType, MemberRole, Server } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react'
import ServerHeader from '@/components/server/server-header';
import { ScrollArea } from '../ui/scroll-area';
import ServerSearch from './server-search';
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';
import { channel } from 'diagnostics_channel';
import { Separator } from '../ui/separator';
import ServerSection from './server-section';
import ServerChannel from './server-channel';
import ServerMember from './server-member';

interface ServerSideBarProps {
    serverId: string
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className='mr-2 h-4 w-4' />,
    [ChannelType.AUDIO]: <Mic className='mr-2 h-4 w-4' />,
    [ChannelType.VIDEO]: <Video className='mr-2 h-4 w-4' />

}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className='h-4 w-4 mr-2 text-indigo-500' />,
    [MemberRole.ADMIN]: <ShieldAlert className='h-4 w-4 text-green-600 mr-2' />
}

async function ServerSideBar({ serverId }: ServerSideBarProps) {

    const profile = await currentProfile();

    if (!profile) {
        return redirect("/")
    }

    const server = await prisma.server.findUnique({
        where: {
            id: serverId,

        },
        include: {
            Channel: {
                orderBy: {
                    created_at: "asc"
                }
            },
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

    const textChannels = server?.Channel.filter((channel) => {
        return channel.type === ChannelType.TEXT
    });
    const audioChannels = server?.Channel.filter((channel) => {
        return channel.type === ChannelType.AUDIO
    });

    const videoChannels = server?.Channel.filter((channel) => {
        return channel.type === ChannelType.VIDEO
    });

    const members = server?.Member.filter((member) => {
        return member.profileId !== profile.id
    });

    if (!server) {
        return redirect("/");
    }

    const role = server.Member.find((member) => {
        return member.profileId === profile.id
    })?.role;

    return (
        <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]'>
            <ServerHeader server={server} role={role} />

            <ScrollArea className='flex-1 px-3'>
                <div className='mt-2'>
                    <ServerSearch data={[
                        {
                            label: "Text Channels",
                            type: "channel",
                            data: textChannels?.map((channel) => (
                                {
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap?.[channel.type]
                                }
                            ))
                        },
                        {
                            label: "Voice Channels",
                            type: "channel",
                            data: audioChannels?.map((channel) => (
                                {
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap?.[channel.type]
                                }
                            ))
                        },
                        {
                            label: "Video Channels",
                            type: "channel",
                            data: videoChannels?.map((channel) => (
                                {
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap?.[channel.type]
                                }
                            ))
                        },
                        {
                            label: "Members",
                            type: "member",
                            data: members?.map((member) => (
                                {
                                    id: member.id,
                                    name: member.profile?.name,
                                    icon: roleIconMap?.[member.role]
                                }
                            ))
                        }
                    ]} />
                </div>
                <Separator className='bg-zinc-200 dark:bg-zinc-700 rounded-md my-2' />
                {
                    !!textChannels?.length && (
                        <div className='mb-2'>
                            <ServerSection sectionType='channels' channelType={ChannelType.TEXT} role={role} label='Text Channels' />
                            {

                                textChannels?.map((channel) => (
                                    <div key={channel.id} className='space-y-[2px]'>
                                        <ServerChannel role={role} server={server} channel={channel} />
                                    </div>

                                ))
                            }
                        </div>
                    )
                }
                {
                    !!textChannels?.length && (
                        <div className='mb-2'>
                            <ServerSection sectionType='channels' channelType={ChannelType.AUDIO} role={role} label='Voice Channels' />
                            {
                                audioChannels?.map((channel) => (

                                    <div key={channel.id} className='space-y-[2px]'>
                                        <ServerChannel role={role} server={server} channel={channel} />
                                    </div>

                                ))
                            }
                        </div>
                    )
                }
                {
                    !!textChannels?.length && (
                        <div className='mb-2'>
                            <ServerSection sectionType='channels' channelType={ChannelType.VIDEO} role={role} label='Video Channels' />
                            {
                                videoChannels?.map((channel) => (
                                    <div key={channel.id} className='space-y-[2px]'>
                                        <ServerChannel role={role} server={server} channel={channel} />
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                {
                    !!textChannels?.length && (
                        <div className='mb-2'>
                            <ServerSection sectionType='members' role={role} label='Members' server={server} />
                            {
                                members?.map((member) => (
                                    <div key={member.id} className='space-y-[2px]'>
                                        <ServerMember member={member} server={server} />
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </ScrollArea>
        </div>
    )
}

export default ServerSideBar