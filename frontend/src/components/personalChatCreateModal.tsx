import { useState } from "react"
import { getAllUsers } from "@/api/user"
import { createPersonalChat } from "@/api/chats"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { type UsersApiResponse } from '../api/user'

export function ChatCreateModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<UsersApiResponse, Error>({
    queryKey: ["users"],
    queryFn: (context) => {
      const page = context.pageParam as number | undefined ?? 1;
      return getAllUsers(page, 10);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1, 
  })

  const users = data?.pages.flatMap(page => page.data) ?? []

  const createChatMutation = useMutation({
    mutationFn: (userId: string) => createPersonalChat(userId),
    onSuccess: (data) => {
      if (data.chat) {
        if (data.isNew===true) {
          toast.success("Chat created!", { richColors: true });
        } else {
          toast.info("Chat already exists", { richColors: true });
        }
      }
      setIsOpen(false) // <-- close modal
      queryClient.invalidateQueries({ queryKey: ["chats"] }) // refresh chat list immediately
    },
    onError: () => {
      toast.error("Failed to create chat", { richColors: true })
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm flex flex-col h-full md:h-[70%] gap-4 border-none">
        <DialogHeader>
          <DialogTitle className="text-muted-foreground">Select a friend to chat</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search for a friend to start a new personal conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search friends..." 
            className="pl-8 bg-background text-foreground" 
          />
        </div>

        <ScrollArea
          className="h-[250px] rounded-md border border-border"
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }}
        >
          <div className="flex flex-col p-1">
            {users.map((user) => (
              <button
                key={user._id}
                className="w-full text-left px-3 py-2 text-sm rounded-sm 
                           text-foreground transition-colors
                           hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  createChatMutation.mutate(user._id)
                }}
              >
                {user.fullName}
              </button>
            ))}
            {isFetchingNextPage && <p className="text-sm text-center text-muted-foreground">Loading...</p>}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
