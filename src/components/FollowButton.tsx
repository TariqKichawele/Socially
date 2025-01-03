'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import { toggleFollow } from '@/actions/userActions';

const FollowButton = ({ userId }: { userId: string }) => {
    const [ isLoading, setIsLoading ] = useState(false);

    const handleFollow = async () => {
        setIsLoading(true);

        try {
            await toggleFollow(userId);
            toast.success("Successfully followed user")
        } catch (error) {
            toast.error("Failed to follow user")
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  )
}

export default FollowButton