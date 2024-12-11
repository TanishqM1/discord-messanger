'use client';

import { DiscordServer } from "@/models/DiscordServer";
import { createContext, useCallback, useContext, useState } from "react";
import { Channel, ChannelFilters, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { v4 as uuid } from 'uuid';

type DiscordState = {
  server?:DiscordServer;
  channelsByCategories: Map<string, Array<Channel<DefaultStreamChatGenerics>>>;
  changeServer: (server: DiscordServer | undefined, client: StreamChat) => void;
  createServer: (
  client: StreamChat,
  name: string,
  imageUrl: string,
  userIds: string[]
  ) => void;
  createChannel: (
    client: StreamChat,
    name: string,
    category: string,
    userIds: string[]
  ) => void;
};

const initialValue: DiscordState = {
  server:undefined,
  channelsByCategories: new Map(),
  changeServer: ()=> {},
  createServer: ()=>{},
  createChannel: ()=>{},
};

const DiscordContext = createContext<DiscordState>(initialValue);

export const DiscordContextProvider: any = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const [myState, setMyState]= useState<DiscordState>(initialValue);
    const changeServer = useCallback(
      async (server: DiscordServer | undefined, client: StreamChat) => {
        let filters: ChannelFilters = {
          type: 'messaging',
          members: { $in: [client.userID as string] },
        };
        if (!server) {
          filters.member_count = 2;
        }

        const channels = await client.queryChannels(filters);
        const channelsByCategories = new Map<
        string,
        Array<Channel<DefaultStreamChatGenerics>>
      >();
      if (server) {
        const categories = new Set(
          channels
            .filter((channel) => {
              return channel.data?.data?.server === server.name;
            })
            .map((channel) => {
              return channel.data?.data?.category;
            })
        );

        for (const category of Array.from(categories)) {
          channelsByCategories.set(
            category,
            channels.filter((channel) => {
              return (
                channel.data?.data?.server === server.name &&
                channel.data?.data?.category === category
              );
            })
          );
        }
      } else {
        channelsByCategories.set('Direct Messages', channels);
      }


        setMyState((myState) => {
          return {...myState,server, channelsByCategories};

        });

      },
      [setMyState]
    );

    const createServer = useCallback(
      async(
        client: StreamChat,
        name: string,
        imageUrl: string,
        userIds: string[]
      ) => {
        const serverId= uuid();
        const messagingChannel=client.channel('messaging', uuid(), {
          name: 'Welcome',
          members: userIds,
          data: {
            image:imageUrl,
            serverId: serverId,
            server:name,
            category: 'Text Channels',


          },

      });

      try{
        const response=await messagingChannel.create();
        console.log('[DiscordContext-createServer] Response:', response);

      } catch (err) {
        console.error(err);

      }

      },
      []

    );

    const createChannel = useCallback(
      async (
        client: StreamChat,
        name: string,
        category: string,
        userIds: string[]
      ) => {
        if (client.userID) {
          console.log("HERE" + myState.server?.image, myState.server?.id,myState.server?.name,category);
          console.log(name, userIds, client);
          const channel = client.channel('messaging', uuid(), {
            name: name,
            members: userIds,
            data: {
              image: myState.server?.image,
              serverId: myState.server?.id,
              server: myState.server?.name,
              category: category,
            },
          });
          try {
            const response = await channel.create();
          } catch (err) {
            console.log(err);
          }
        }
      },
      [myState.server]
    );
    const store: DiscordState = {
      server:myState.server,
      channelsByCategories: myState.channelsByCategories,
      changeServer:changeServer,
      createServer:createServer,
      createChannel:createChannel,
    };
  

  return (
    <DiscordContext.Provider value ={store}>{children}</DiscordContext.Provider>
  );
};




export const useDiscordContext = () => useContext(DiscordContext);