"use client"

import { Member, MemberRole, Profile } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import UserAvatar from '../user-avatar'
import ActionToolTip from '../action-tooltip'
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from 'lucide-react'
import Image from "next/image";
import axios from 'axios'
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import qs from "query-string";

import { cn } from '@/lib/utils'
import {
    Form,
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModal } from '@/hooks/use-modal-store'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface ChatItemProps {
    id: string,
    content: string,
    member: Member & {
        profile: Profile
    },
    timeStamp: string,
    fileurl: string | null,
    currentMember: Member,
    socketUrl: string,
    socketQuery: Record<string, string>,
    isUpdated: boolean,
    deleted: boolean
}

const RoleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
    "ADMIN": <ShieldAlert className='h-4 w-4 ml-2 text-green-600' />

}

const formSchema = z.object({
    content: z.string().min(1)
});

function ChatItem({
    id,
    content,
    member,
    timeStamp,
    fileurl,
    deleted,
    currentMember,
    isUpdated,
    socketUrl,
    socketQuery
}: ChatItemProps) {

    const [isEditing, setIsEditing] = useState(false);
    const { onOpen } = useModal();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    }
    );

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {

        const down = (event: KeyboardEvent) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                setIsEditing(false);
            };

        }

        window.addEventListener("keydown", down);

        return () => {
            window.removeEventListener("keydown", down);
        }

    }, []);

    const [fileType, setFileType] = useState<string>("");
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileurl;
    const isPDF = fileType === "pdf" && fileurl;
    const isImage = !isPDF && fileurl;
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        if (fileurl) {
            axios.get(fileurl).then((res) => {
                setFileType(res.headers["content-type"].split("/")[1]);
            })
        }

    }, []);



    useEffect(() => {
        form.reset({ content: content });
    }, [content]);



    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {

            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery
            });

            await axios.patch(url, values);
            setIsEditing(false);

        } catch (error) {
            console.log(error);
        }
    }

    const onMemberClick = () => {
        if (member.id === currentMember.id) {
            return;
        }

        router.push(`/server/${params?.serverId}/conversations/${member.id}`);
    }

    return (
        <div className='relative group flex items-center hover:bg-black/5 p-4 transition w-full'>

            <div className='group flex gap-x-2 items-start w-full'>
                <div onClick={() => onMemberClick()} className='cursor-pointer hover:drop-shadow-md transition'>
                    <UserAvatar src={member.profile.imageUrl} />
                </div>

                <div className='flex flex-col w-full '>
                    <div className="flex items-center gap-x-2">
                        <div className='flex items-center'>
                            <p onClick={() => onMemberClick()} className='font-semibold text-sm hover:underline cursor-pointer'>
                                {member.profile.name}
                            </p>
                            <ActionToolTip label={member.role}>
                                {
                                    RoleIconMap[member.role]
                                }
                            </ActionToolTip>
                        </div>

                        <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                            {timeStamp}
                        </span>
                    </div>
                    {
                        isImage && (
                            <a href={fileurl} target='_blank' rel="noopener noreferrer" className='relative aspect-square rounded-md mt-2 overflow-hidden items-center bg-secondary h-48 w-48'>
                                <Image priority fill src={fileurl} alt={content} className='object-corner' />
                            </a>
                        )
                    }
                    {
                        isPDF && (
                            <div className='relative flex h-fit gap-1  items-center p-4 mt-2 rounded-md bg-background/10'>

                                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                                <a href={fileurl} rel="noopener noreferrer" className=' ml-2   text-indigo-500 dark:text-indigo-400 hover:underline ' target='_blank'>
                                    PDF file
                                </a>
                            </div >
                        )
                    }
                    {
                        !fileurl && !isEditing && (
                            <p className={
                                cn(
                                    "text-sm text-zinc-600 dark:text-zinc-300",
                                    deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                                )
                            }>
                                {content}
                                {
                                    isUpdated && !deleted && (
                                        <span className='text-[10px] mx-2 text-zinc-500 dark:text-zinc-400'>
                                            (edited)
                                        </span>
                                    )
                                }
                            </p>
                        )
                    }
                    {
                        !fileurl && isEditing && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center w-full gap-x-2 pt-2'>
                                    <FormField
                                        control={form.control}
                                        name='content'
                                        render={({ field }) => {
                                            return (
                                                <FormItem className='flex-1'>
                                                    <FormControl>
                                                        <div className='relative w-full'>
                                                            <Input disabled={isLoading} className='p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200' placeholder='Edited message' {...field} />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )
                                        }} />

                                    <Button disabled={isLoading} size="sm" variant={"primary"}>
                                        Save
                                    </Button>
                                </form>
                                <span className='text-[10px] mt-1 text-zinc-400'>
                                    Press esc to cancel, enter to save
                                </span>
                            </Form>
                        )
                    }
                </div>
            </div>
            {
                canDeleteMessage && (
                    <div className='hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm'>
                        {
                            canEditMessage && (
                                <ActionToolTip label='edit'>
                                    <Edit onClick={() => setIsEditing(true)} className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
                                </ActionToolTip>
                            )
                        }

                        {
                            canDeleteMessage && (
                                <ActionToolTip label='delete'>
                                    <Trash onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${id}`, query: socketQuery })} className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
                                </ActionToolTip>
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default ChatItem