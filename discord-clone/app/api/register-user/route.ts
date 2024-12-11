import { clerkClient } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";


export async function POST(request: Request) {

    const apiKey = process.env.STREAM_API_KEY;
    if (!apiKey){
        return Response.error();
    }

    const serverClient = StreamChat.getInstance(
      apiKey,
      process.env.STREAM_SECRET
    );
    const body = await request.json();
    console.log('[/api/register-user] Body:', body);
  
    const userId = body?.userId;
    const mail = body?.email;
  
//Error if userID or email field is null.
    if (!userId || !mail) {
      return Response.error();
    }

    //This "role" is apart of the stream dashboard. 
    //others roles arae guest, admin, moderator etc.
    try {
        const user = await serverClient.upsertUser({
          id: userId,
          role: "user",
          name: mail,
          image: `https://getstream.io/random_png/?id=${userId}&name=${mail}`,
        });
      } catch (error) {
        console.error("Error upserting user in Stream:", error);
        return Response.error();
      }
      

    const params = {
        publicMetaData: {
            streamRegistered: true,

        },
    };
    const updatedUser = (await clerkClient()).users.updateUser(userId, params);

    console.log('[/api/register-user] User: ', updatedUser);
    const response = {
        userId: userId,
        userName: mail,
    }

    return Response.json(response);
}
