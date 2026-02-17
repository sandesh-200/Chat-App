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
import { Search } from "lucide-react"

const friends = [
  { id: "1", name: "Alex Johnson" },
  { id: "2", name: "Sarah Williams" },
]

export function PersonalChatCreateModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm flex flex-col gap-4 border-none">
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

        <ScrollArea className="h-[250px] rounded-md border border-border">
          <div className="flex flex-col p-1">
            {friends.map((friend) => (
              <button
                key={friend.id}
                className="w-full text-left px-3 py-2 text-sm rounded-sm 
                           text-foreground transition-colors
                           hover:bg-accent hover:text-accent-foreground"
              >
                {friend.name}
              </button>
            ))}
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