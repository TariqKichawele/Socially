'use client';


import { UploadDropzone } from '@/lib/uploadthing';
import { XIcon } from 'lucide-react';
import React from 'react'

interface ImageUploadProps {
    onChange: (url: string) => void;
    value: string;
    endpoint: 'postImage';
}

const ImageUpload = ({ endpoint, onChange, value }: ImageUploadProps) => {
    if (value) {
        return (
            <div className='relative size-40'>
                <img src={value} alt="upload" className='rounded-md size-40 object-cover' />
                <button 
                    onClick={() => onChange('')}
                    className='absolute top-0 right-0 bg-red-500 rounded-full shadow-sm'
                    type='button'
                >
                    <XIcon className='h-4 w-4 text-white '/>
                </button>
            </div>
        )
    }
  return (
    <UploadDropzone 
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
            onChange(res?.[0].url)
        }}
        onUploadError={(error: Error) => {
            console.log('onUploadError', error)
        }}
    />
  )
}

export default ImageUpload