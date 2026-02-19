import { getAllUsers } from "@/api/user"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Search, X, Users, Loader2 } from "lucide-react"
import React, { useState, useMemo } from "react"
import { type UsersApiResponse } from "@/api/user"
import { cn } from "@/lib/utils"
import { createGroupChat } from "@/api/chats"
import { toast } from "sonner"

interface User {
  _id: string
  fullName: string
}

export function GroupCreateModal({ children }: { children: React.ReactNode }) { 
  const queryClient = useQueryClient()
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  const {
    mutate:createGroup,
    isPending
  } = useMutation({
    mutationFn:createGroupChat,
    onSuccess:(data)=>{
      toast.success(data.message || "Group Created Successfully")

      queryClient.invalidateQueries({ queryKey: ["chats"] })

      handleOpenChange(false)
    },
    onError:(error:any)=>{
      const errorMsg = error.response?.data?.message || "Failed to create group"
      toast.error(errorMsg)
    }
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<UsersApiResponse, Error>({
    queryKey: ["users"],
    queryFn: (context) => {
      const page = (context.pageParam as number | undefined) ?? 1
      return getAllUsers(page, 10)
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  })

  const users = data?.pages.flatMap((page) => page.data) ?? []

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    )
  }

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId))
  }

  const isSelected = (userId: string) =>
    selectedUsers.some((u) => u._id === userId)

  const canCreate = selectedUsers.length >= 2 && groupName.trim().length > 0

const handleCreate = () => {
  if (!canCreate) return

  // ONLY call the mutation here. 
  // Do NOT reset state or setOpen(false) here.
  createGroup({
    groupName: groupName.trim(),
    participants: selectedUsers.map((u) => u._id),
  })
}

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setSelectedUsers([])
      setGroupName("")
      setSearchQuery("")
    }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm flex flex-col h-full md:h-[70%] gap-4 border-none">
        <DialogHeader>
          <DialogTitle className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select at least 2 members and give your group a name.
          </DialogDescription>
        </DialogHeader>

        {/* Group Name Input */}
        <Input
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-background text-foreground"
        />

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedUsers.map((user) => (
              <Badge
                key={user._id}
                variant="secondary"
                className="flex items-center gap-1 pr-1 text-xs"
              >
                {user.fullName}
                <button
                  onClick={() => removeUser(user._id)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Validation hint */}
        {selectedUsers.length > 0 && selectedUsers.length < 2 && (
          <p className="text-xs text-amber-500">
            Select at least one more member to create a group.
          </p>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8 bg-background text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User List */}
        <ScrollArea
          className="h-[220px] rounded-md border border-border"
          onScroll={(e) => {
            const target = e.currentTarget
            if (
              target.scrollHeight - target.scrollTop <=
              target.clientHeight + 50
            ) {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            }
          }}
        >
          <div className="flex flex-col p-1">
            {filteredUsers.map((user) => {
              const selected = isSelected(user._id)
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-sm flex items-center gap-3 transition-colors",
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs">
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{user.fullName}</span>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
            {isFetchingNextPage && (
              <p className="text-sm text-center text-muted-foreground py-2">
                Loading...
              </p>
            )}
            {filteredUsers.length === 0 && !isFetchingNextPage && (
              <p className="text-sm text-center text-muted-foreground py-4">
                No users found.
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {isPending ? "Creating..." : "Create Group"}
            
            {!isPending && selectedUsers.length >= 2 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                {selectedUsers.length}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}