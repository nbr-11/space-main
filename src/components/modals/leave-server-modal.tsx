"use client";


import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useModal } from '@/hooks/use-modal-store';
import axios from 'axios';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';


function LeaveServerModal() {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "leave";
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { server } = data;

    const onClick = async () => {
        try {

            setIsLoading(true);

            await axios.patch(`/api/servers/${server?.id}/leave`);
            onClose();
            router.refresh();
            router.push("/");
        } catch (error) {
            console.log("[LEAVE_SERVER_MODAL]", error)

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Leave Server
                    </DialogTitle>

                    <DialogDescription className='text-center text-zinc-500'>
                        Are you sure you want to leave <span className='font-semibold text-indigo-500'>{server?.name}</span> ?
                    </DialogDescription>


                </DialogHeader>

                <DialogFooter className='bg-gray-100 px-6 py-4'>
                    <div className='flex items-center justify-between w-full'>
                        <Button disabled={isLoading} variant={"ghost"} onClick={() => onClose()}>
                            Cancel
                        </Button>

                        <Button onClick={onClick} disabled={isLoading} variant={"primary"}>
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default LeaveServerModal;