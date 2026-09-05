"use client";

import React, { useEffect, useState } from 'react'
import { UploadDropzone } from '@/lib/uploadthing';
import Image from 'next/image';
import { FileIcon, X } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string
    endpoint: "serverImage" | "messageFile"
}

function FileUpload({ onChange, endpoint, value }: FileUploadProps) {

    const [fileType, setFileType] = useState<string>("");
    const [isMounted, setIsMounted] = useState<boolean>(false);

    console.log("fileTyep", fileType);
    console.log("fileType", value);
    useEffect(() => {

        if (value !== "") {
            axios.get(value, {

            }).then((res) => {
                setFileType(String(res.headers["content-type"].split("/")[1]));
            });
        }

        setIsMounted(true);
    }, [value]);


    if (!isMounted && fileType === "") {
        return null;
    }

    if (value && (fileType !== "pdf")) {
        return (
            <div className='relative h-20 w-20'>

                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className='rounded-full'
                />
                <button onClick={() => onChange("")} className='bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm'>
                    <X className='h-4 w-4' />
                </button>
            </div>
        )
    }

    if (value && (fileType === "pdf")) {
        return (
            <div className='relative flex h-fit flex-col gap-1  items-center p-4 mt-2 rounded-md bg-background/10'>

                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a href={value} rel="noopener noreferrer" className=' ml-2  whitespace-pre-wrap text-xs  text-indigo-500 dark:text-indigo-400 hover:underline ' target='_blank'>
                    View File
                </a>
                <button onClick={() => onChange("")} className='bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm'>
                    <X className='h-4 w-4' />
                </button>
            </div >
        )
    }

    return (

        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                console.log(res);
                console.log("inside on client upload complete")
                onChange(res?.[0].url)
            }}
            onUploadError={(error: Error) => {
                console.log(Error)
            }} />

    )
}

export default FileUpload

export const dynamic = "force-dynamic";