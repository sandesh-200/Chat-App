import React, { useState, useMemo } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllUsers, type UsersApiResponse } from "@/api/user"
import { createGroupChat, createPersonalChat } from "@/api/chats"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  X,
  Users,
  Loader2,
  UserX,
  MessageSquarePlus,
  Check,
  ArrowRight
} from "lucide-react"

interface User {
  _id: string
  fullName: string
  email?: string
}

export function UnifiedChatModal({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  // Mutate group creation
  const {
    mutate: createGroup,
    isPending: isGroupPending
  } = useMutation({
    mutationFn: createGroupChat,
    onSuccess: (data) => {
      toast.success(data.message || "Group chat created")
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      handleOpenChange(false)
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to create group"
      toast.error(errorMsg)
    }
  })

  // Mutate direct message creation
  const {
    mutate: createPersonal,
    isPending: isPersonalPending
  } = useMutation({
    mutationFn: (userId: string) => createPersonalChat(userId),
    onSuccess: (responseData) => {
      if (responseData && responseData.chat) {
        if (responseData.isNew === true) {
          toast.success("Conversation started!", { richColors: true })
        } else {
          toast.info("Opened existing conversation", { richColors: true })
        }
      }
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      handleOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to start conversation", { richColors: true })
    }
  })

  const isPending = isGroupPending || isPersonalPending

  // Infinite query for users
  const {
    data,
    isLoading,
    isError,
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
    enabled: open,
  })

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )

  // Instant local filtering without discarding active selection state
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
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

  // Validation: 1 user OR 2+ users with non-empty group name
  const isGroup = selectedUsers.length > 1
  const canCreate =
    selectedUsers.length === 1 ||
    (isGroup && groupName.trim().length > 0)

  const handleCreate = () => {
    if (!canCreate || isPending) return

    if (selectedUsers.length === 1) {
      createPersonal(selectedUsers[0]._id)
    } else {
      createGroup({
        groupName: groupName.trim(),
        participants: selectedUsers.map((u) => u._id),
      })
    }
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

      <DialogContent className="sm:max-w-md w-full h-[580px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border/50 shadow-2xl rounded-xl bg-background">
        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3 shrink-0 text-left border-b border-border/40">
          <DialogTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-primary shrink-0" />
            <span>New Chat</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Search and select recipients to start a conversation.
          </DialogDescription>
        </DialogHeader>

        {/* Input & Recipient Bar (Fixed Dimensions) */}
        <div className="px-5 py-3 shrink-0 space-y-2 border-b border-border/30 bg-muted/10">
          {/* Recipient Picker Field */}
          <div className="relative flex items-center min-h-[38px] px-2.5 rounded-md border border-border/60 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />

            {/* Inline Search Input */}
            <input
              type="text"
              placeholder={selectedUsers.length > 0 ? "Add another person..." : "Type a name or email..."}
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70 text-foreground py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search recipients"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded-xs"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Conditional Group Title Input (Reveals only when 2+ people selected) */}
          {isGroup && (
            <div className="pt-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
              <Input
                placeholder="Group Subject / Title (Required)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-8 text-xs bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/70"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Selected Participants Tray (Fixed height to eliminate layout shift/shakiness) */}
        <div className="h-[46px] shrink-0 border-b border-border/30 px-5 flex items-center bg-background">
          {selectedUsers.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/60 italic">
              No recipients selected
            </span>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex items-center gap-1.5 py-1">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user._id}
                    variant="secondary"
                    className="shrink-0 inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 text-[11px] font-normal rounded-md bg-secondary/80 hover:bg-secondary border border-border/40 transition-colors"
                  >
                    <Avatar className="h-3.5 w-3.5 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[110px] truncate">{user.fullName}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user._id)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${user.fullName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-1" />
            </ScrollArea>
          )}
        </div>

        {/* User Contact List (Flex-1 fills remaining spatial budget) */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea
            className="h-full w-full"
            onScroll={(e) => {
              const target = e.currentTarget
              if (
                target.scrollHeight - target.scrollTop <=
                target.clientHeight + 40
              ) {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
              }
            }}
          >
            <div className="p-2 space-y-0.5" role="list" aria-label="Contacts list">
              {/* Skeletons */}
              {isLoading && (
                <div className="space-y-1 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md">
                      <Skeleton className="h-4 w-4 rounded-xs shrink-0" />
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2.5 w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {isError && !isLoading && (
                <div className="p-8 text-center text-xs text-destructive flex flex-col items-center justify-center">
                  <UserX className="h-7 w-7 text-destructive/40 mb-2 stroke-[1.5]" />
                  <p className="font-medium">Failed to load contacts</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Please check your connection.</p>
                </div>
              )}

              {/* No Matches Found */}
              {!isLoading && !isError && filteredUsers.length === 0 && searchQuery && (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <UserX className="h-7 w-7 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-foreground">No matches found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No users matching "{searchQuery}"
                  </p>
                </div>
              )}

              {/* Empty Directory */}
              {!isLoading && !isError && users.length === 0 && !searchQuery && (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <UserX className="h-7 w-7 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-foreground">No contacts available</p>
                </div>
              )}

              {/* Contact Items */}
              {!isLoading &&
                !isError &&
                filteredUsers.map((user) => {
                  const selected = isSelected(user._id)
                  return (
                    <button
                      key={user._id}
                      type="button"
                      role="listitem"
                      aria-selected={selected}
                      onClick={() => toggleUser(user)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-left outline-none select-none group cursor-pointer",
                        selected
                          ? "bg-accent/80 text-accent-foreground font-medium"
                          : "hover:bg-accent/40 active:bg-accent/70 text-foreground",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        tabIndex={-1}
                        className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />

                      <Avatar className="h-8 w-8 border border-border/40 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.fullName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-snug">
                          {user.fullName}
                        </p>
                        {user.email && (
                          <p className="text-[11px] text-muted-foreground truncate leading-tight">
                            {user.email}
                          </p>
                        )}
                      </div>

                      {selected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}

              {/* Pagination Loading Sentinel */}
              <div className="py-2 flex justify-center items-center min-h-[20px]">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading more contacts...</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Footer */}
        <div className="px-4 py-3 shrink-0 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-2">
          {/* Subtle Contextual Hint */}
          <div className="text-xs text-muted-foreground">
            {selectedUsers.length === 0 ? (
              <span className="text-muted-foreground/70 text-[11px]">
                Select a contact to begin
              </span>
            ) : selectedUsers.length === 1 ? (
              <span className="font-medium text-foreground text-[11px]">
                1 contact selected
              </span>
            ) : (
              <span className="font-medium text-foreground text-[11px]">
                {selectedUsers.length} contacts selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!canCreate || isPending}
              className="h-8 text-xs gap-1.5 px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isGroup ? "Creating Group..." : "Starting..."}</span>
                </>
              ) : (
                <>
                  <span>Start Chat</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}