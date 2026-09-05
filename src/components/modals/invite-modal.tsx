"use client";


import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy, RefreshCcw } from 'lucide-react';
import { useModal } from '@/hooks/use-modal-store';
import { useOrigin } from '@/hooks/use-origin';
import axios from 'axios';


function InviteModal() {


    const { onOpen, isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "invite";
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const origin = useOrigin();
    const { server } = data;

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    const onNew = async () => {
        try {

            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`)

            onOpen("invite", { server: response.data });

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const inviteUrl = `${origin}/invite/${server?.inviteCode}`;
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Invite Friends
                    </DialogTitle>


                </DialogHeader>
                <div className='p-6'>
                    <Label className='uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70'>
                        Server Invite Link
                    </Label>
                    <div className='flex items-center mt-2 gap-x-2'>
                        <Input disabled={isLoading} className='bg-zinc-300/50 border-50 focus-visible:ring-0 text-black focus-visible:ring-offset-0' value={inviteUrl} />

                        <Button disabled={isLoading} onClick={onCopy} size={"icon"}>
                            {
                                copied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />

                            }
                        </Button>
                    </div>

                    <Button onClick={onNew} disabled={isLoading} variant={"link"} size={"sm"} className='text-xs text-zince-500 mt-4'>
                        Generate a new link

                        <RefreshCcw className='w-4 h-4 ml-2' />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InviteModal;