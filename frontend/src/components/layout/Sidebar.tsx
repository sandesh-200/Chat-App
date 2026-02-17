import { PlusIcon, Search, Check, Users, Pen } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardTitle } from "../ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { ScrollArea } from "../ui/scroll-area"
import React from "react"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { getUsersChat } from "@/api/chats"
import { useQuery } from '@tanstack/react-query'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { PersonalChatCreateModal } from "../chatCreateModal"

export interface Participant {
  _id: string;
  fullName: string;
}

interface BaseChat {
  _id: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  __v: number;
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

const Sidebar = () => {

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery<Chat[]>({
    queryKey:["chats"],
    queryFn:getUsersChat
  })

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
          <DropdownMenuContent className="border-none">
            <DropdownMenuGroup className="flex flex-col gap-1">
              <PersonalChatCreateModal>
              <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                <Pen/>
                New Chat
              </DropdownMenuItem>
              </PersonalChatCreateModal>
              <DropdownMenuItem className="cursor-pointer">
                <Users/>
                Group Chat
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
          </DropdownMenu>

      </div>

      {/* Search Bar */}
      <div id="search-bar" className="px-4 mb-4">
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

      <ScrollArea className="flex-1 w-full rounded-none">
        
        <div className="flex flex-col">
          {isLoading && (
      <div className="p-4 text-sm text-muted-foreground">
        Loading chats...
      </div>
    )}

    {error && (
      <div className="p-4 text-sm text-red-500">
        Error loading chats
      </div>
    )}

    
          {!isLoading && !error &&chats?.map((chat, index) => {
            console.log(chats)
            const relativeTime = formatDistanceToNow(new Date(chat.updatedAt), { 
              addSuffix: true 
            });

            return (
              <React.Fragment key={`${chat._id}-${index}`}>
                <div className="flex items-center gap-4 px-4 py-4 hover:bg-secondary cursor-pointer group">
                  {/* Avatar with fixed size */}
                  <Avatar className="h-12 w-12 shrink-0 border">
                    <AvatarFallback>{
                      chat.type === "personal"?chat.participants[1].fullName.charAt(0).toUpperCase():chat.groupName.charAt(0).toUpperCase()
                  }</AvatarFallback>
                  </Avatar>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm truncate">{chat.type === "personal"?chat.participants[1].fullName:chat.groupName}</h3>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                        {relativeTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground truncate leading-tight">
                          {chat?.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="mx-4 w-auto opacity-50" />
              </React.Fragment>
            )
          })}
        </div>
      </ScrollArea>
    </Card>


  )
}

export default Sidebar