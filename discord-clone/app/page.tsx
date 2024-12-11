"use client";

import Image from "next/image";
import { User } from "stream-chat";
import { useCallback, useEffect, useState } from 'react';
import { LoadingIndicator } from "stream-chat-react";
import { useClerk } from "@clerk/nextjs";
import MyChat from "@/components/myChat";

type HomeState = {
  apiKey: string;
  user: User;
  token: string;
}


export default function Home() { 
  const [homeState, setHomeState] = useState<HomeState | undefined>();
  const {user: clerkUser} = useClerk()
  console.log("Clerk user:", clerkUser); // Check if Clerk is providing user data

  //Method to register the user.
  const registerUser = useCallback(async function RegisterUser() {
    const userId = clerkUser?.id;
    const mail = clerkUser?.primaryEmailAddress?.emailAddress;
  
    console.log("Registering user:", { userId, mail }); // Add this log
  
    if (userId && mail) {
      const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, email: mail }),
      });
  
      const responseBody = await response.json();
      console.log("registerUser response:", responseBody);
  
      return responseBody;
    }
  }, [clerkUser]);
  
  async function getUserToken(userId: string, userName: string) {
    console.log("Getting user token for", userId, userName); // Log here
  
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  
    const responseBody = await response.json();
    console.log("getUserToken response:", responseBody);
  
    const token = responseBody.token;
  
    if (!token) {
      console.error("No Token!");
    }
  
    const user: User = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
    };
  
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (apiKey) {
      setHomeState({ apiKey: apiKey, user: user, token: token });
    }
  }
  
  console.log("Clerk User before useEffect:", clerkUser);
  useEffect(() => {
    console.log("useEffect triggered", clerkUser); // Check if useEffect is triggered
    if (
      clerkUser?.id &&
      clerkUser?.primaryEmailAddress?.emailAddress &&
      !clerkUser?.publicMetadata.streamRegistered
    ) {
      registerUser().then((result) => {
        getUserToken(
          clerkUser?.id,
          clerkUser?.primaryEmailAddress?.emailAddress || 'Unknown'
        );
      });
    } else {
      if (clerkUser?.id) {
        getUserToken(
          clerkUser?.id || 'Unknown',
          clerkUser?.primaryEmailAddress?.emailAddress || 'Unknown'
        );
      }
    }
  }, [registerUser ,clerkUser]);
  // LoadingIndicator is displayed until we have a homestate to display.
 
  if (!homeState){return <LoadingIndicator />};

  return <MyChat {...homeState} />;
}