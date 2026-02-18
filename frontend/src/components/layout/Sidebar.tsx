// import { PlusIcon, Search, Check, Users, Pen } from "lucide-react";
// import { Button } from "../ui/button";
// import { Card, CardTitle } from "../ui/card";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupInput,
// } from "../ui/input-group";
// import { ScrollArea } from "../ui/scroll-area";
// import React from "react";
// import { Separator } from "../ui/separator";
// import { Avatar, AvatarFallback } from "../ui/avatar";
// import { formatDistanceToNow } from "date-fns";
// import {  getUsersChat } from "@/api/chats";
// import { useQuery } from "@tanstack/react-query";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { ChatCreateModal } from "../personalChatCreateModal";
// import { GroupCreateModal } from "../groupChatCreateModal";
// import { Link } from 'react-router-dom'

// export interface Participant {
//   _id: string;
//   fullName: string;
// }


// interface BaseChat {
//   _id: string;
//   participants: Participant[];
//   lastmessage?:string | any
//   createdAt: string;
//   updatedAt: string;
//   lastMessage: string;
//   __v: number;
// }

// interface PersonalChat extends BaseChat {
//   type: "personal";
// }

// interface GroupChat extends BaseChat {
//   type: "group";
//   groupName: string;
//   groupAdmin: string;
// }
// export type Chat = PersonalChat | GroupChat;

// interface ChatApiResponse {
//   data: Chat[];
//   pagination: {
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   };
// }

// const Sidebar = () => {
//   const {
//     data: response,
//     isLoading,
//     error,
//   } = useQuery<ChatApiResponse>({
//     queryKey: ["chats"],
//     queryFn: getUsersChat,
//   });
//   const chats = response?.data ?? [];
// console.log("chats are: ",chats)



//   return (
//     <Card className="w-full md:w-[30%] h-screen rounded-none flex flex-col border-none shadow-none">
//       {/* Header */}
//       <div className="flex justify-between items-center px-4 py-3">
//         <CardTitle className="text-3xl font-bold">Chats</CardTitle>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button className="rounded-full h-11 w-11 shadow-sm p-0">
//               <PlusIcon className="h-6 w-6" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="border-none">
//             <DropdownMenuGroup className="flex flex-col gap-1">
//               <ChatCreateModal>
//                 <DropdownMenuItem
//                   className="cursor-pointer"
//                   onSelect={(e) => e.preventDefault()}
//                 >
//                   <Pen />
//                   New Chat
//                 </DropdownMenuItem>
//               </ChatCreateModal>

//               <GroupCreateModal>
//                 <DropdownMenuItem
//                   className="cursor-pointer"
//                   onSelect={(e) => e.preventDefault()}
//                 >
//                   <Users />
//                   Group Chat
//                 </DropdownMenuItem>
//               </GroupCreateModal>
//             </DropdownMenuGroup>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       {/* Search Bar */}
//       <div id="search-bar" className="px-4 mb-4">
//         <InputGroup className="bg-muted/50 border-none rounded-lg overflow-hidden">
//           <InputGroupAddon>
//             <Search className="text-muted-foreground ml-3 h-4 w-4" />
//           </InputGroupAddon>
//           <InputGroupInput
//             placeholder="Search chats..."
//             className="placeholder:text-muted-foreground/70 border-none focus-visible:ring-0"
//           />
//         </InputGroup>
//       </div>

//       <ScrollArea className="flex-1 w-full rounded-none">
//         <div className="flex flex-col">
//           {isLoading && (
//             <div className="p-4 text-sm text-muted-foreground">
//               Loading chats...
//             </div>
//           )}

//           {error && (
//             <div className="p-4 text-sm text-red-500">Error loading chats</div>
//           )}

//           {!isLoading &&
//             !error &&
//             chats?.map((chat, index) => {
//               console.log(chats);
//               const relativeTime = formatDistanceToNow(
//                 new Date(chat.updatedAt),
//                 {
//                   addSuffix: true,
//                 },
//               );

//               return (
//                 <React.Fragment key={`${chat._id}-${index}`}>
//                   <Link to={`/chats/${chat._id}`}>
//                   <div  className="flex items-center gap-4 px-4 py-4 hover:bg-secondary cursor-pointer group">
                    
//                     {/* Avatar with fixed size */}
//                     <Avatar className="h-12 w-12 shrink-0 border">
//                       <AvatarFallback>
//                         {chat.type === "personal"
//                           ? chat.participants[1]?.fullName
//                               ?.charAt(0)
//                               .toUpperCase()
//                           : chat.groupName.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>

//                     {/* Text Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-baseline mb-1">
//                         <h3 className="font-semibold text-sm truncate">
//                           {chat.type === "personal"
//                             ? chat.participants[1].fullName
//                             : chat.groupName}
//                         </h3>
//                         <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
//                           {relativeTime}
//                         </span>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-1 min-w-0">
//                           <Check className="h-3 w-3 text-muted-foreground shrink-0" />
//                           <p className="text-sm text-muted-foreground truncate leading-tight">
//                             {chat?.lastMessage}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   </Link>
//                   <Separator className="mx-4 w-auto opacity-50" />
//                 </React.Fragment>
//               );
//             })}
//         </div>
//       </ScrollArea>
//     </Card>
//   );
// };

// export default Sidebar;



import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, Search, Check, Users, Pen } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ChatCreateModal } from "../personalChatCreateModal";
import { GroupCreateModal } from "../groupChatCreateModal";
import { getUsersChat } from "@/api/chats";

// --- Types ---
export interface Participant {
  _id: string;
  fullName: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
}

interface BaseChat {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  type: "personal" | "group";
  createdAt: string;
  updatedAt: string;
}

interface PersonalChat extends BaseChat {
  type: "personal";
}

interface GroupChat extends BaseChat {
  type: "group";
  groupName: string;
  groupAdmin: string;
}

export type Chat = PersonalChat | GroupChat;

interface ChatApiResponse {
  data: Chat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Component ---
const Sidebar = () => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ChatApiResponse>({
    queryKey: ["chats"],
    queryFn: ({ pageParam = 1 }) => getUsersChat(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  // Trigger load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten nested pages into one array
  const chats = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Card className="w-full md:w-[30%] h-screen rounded-none flex flex-col border-none shadow-none">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3">
        <CardTitle className="text-3xl font-bold">Chats</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full h-11 w-11 shadow-sm p-0">
              <PlusIcon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-none w-48" align="end">
            <DropdownMenuGroup className="flex flex-col gap-1">
              <ChatCreateModal>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <Pen className="mr-2 h-4 w-4" /> New Chat
                </DropdownMenuItem>
              </ChatCreateModal>
              <GroupCreateModal>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <Users className="mr-2 h-4 w-4" /> Group Chat
                </DropdownMenuItem>
              </GroupCreateModal>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <InputGroup className="bg-muted/50 border-none rounded-lg overflow-hidden">
          <InputGroupAddon>
            <Search className="text-muted-foreground ml-3 h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search chats..."
            className="placeholder:text-muted-foreground/70 border-none focus-visible:ring-0"
          />
        </InputGroup>
      </div>

      {/* Chat List Area */}
      <ScrollArea className="flex-1 w-full rounded-none">
        <div className="flex flex-col">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-500">Error loading chats</div>
          )}

          {chats.map((chat) => {
            const relativeTime = formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true });
            
            // Logic to find display name (assuming participants[0] is usually the other person)
            // In a real app, filter by !isMe
            const displayName = chat.type === "group" 
                ? chat.groupName 
                : chat.participants[1]?.fullName || "Chat";

            return (
              <React.Fragment key={chat._id}>
                <Link to={`/chats/${chat._id}`}>
                  <div className="flex items-center gap-4 px-4 py-4 hover:bg-secondary/80 transition-colors cursor-pointer group">
                    <Avatar className="h-12 w-12 shrink-0 border">
                      <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                          {relativeTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                          <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground truncate leading-tight">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <Separator className="mx-4 w-auto opacity-50" />
              </React.Fragment>
            );
          })}

          {/* Sentinel element for infinite scroll */}
          <div ref={ref} className="p-6 flex justify-center items-center">
            {isFetchingNextPage ? (
              <div className="animate-pulse text-xs text-muted-foreground">Loading more...</div>
            ) : hasNextPage ? (
              <div className="h-1" /> 
            ) : (
              chats.length > 0 && <span className="text-xs text-muted-foreground">End of conversations</span>
            )}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default Sidebar;