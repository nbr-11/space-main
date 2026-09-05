"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { useRouter } from 'next/navigation';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/file-upload';

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required. "
    })
});

function InitialModal() {

    //for hydration erros
    const [isMounted, setIsMounted] = useState<boolean>(false);

    const router = useRouter();
    useEffect(() => {
        setIsMounted(true)
    }, []);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post('/api/servers', values);

            form.reset();
            router.refresh();
            window.location.reload();

        } catch (error) {
            console.log(error)
        }
    }

    if (!isMounted) {
        return null
    }
    return (
        <Dialog open>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Customize your server
                    </DialogTitle>

                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image. you can always change it later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'>
                                <FormField
                                    name='imageUrl'
                                    control={form.control}
                                    render={({ field }) => {
                                        return <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    }}
                                >

                                </FormField>
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => {
                                    return <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold dark:text-secondary/70'>
                                            Server name
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} className='bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0' placeholder='Enter server name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                }}
                            />
                        </div>

                        <DialogFooter className='bg-gray-100 px-6 py-4'>
                            <Button variant={"primary"} disabled={isLoading}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default InitialModal