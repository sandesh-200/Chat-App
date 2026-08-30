import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  BellOff,
  User
} from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// 1. Preserve exact prop interface
interface ChatHeaderProps {
  name: string;
  initial: string;
  status: string;
}

const ChatHeader = ({ name, initial, status }: ChatHeaderProps) => {
  const isOnline = status === "online";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 shrink-0">
      {/* Leading / Identity Area */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Mobile Navigation Back Button */}
        <Link to="/" className="md:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        {/* Cohesive Clickable Identity Region */}
        <div className="flex items-center gap-3 min-w-0 group cursor-pointer focus-outline-none">
          {/* Avatar with Presence Indicator */}
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9 border border-border/50 transition-transform group-hover:scale-105">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Conversation Identity & Subtitle Metadata */}
          <div className="flex flex-col min-w-0 leading-tight">
            <h2 className="text-sm font-semibold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`truncate font-normal text-[11px] ${isOnline
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground/80"
                  }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trailing Actions Area */}
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider delayDuration={300}>
          {/* Quick Search Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
                aria-label="Search conversation"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Search conversation
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Overflow Menu for Secondary Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
              aria-label="Conversation options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>View details</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <BellOff className="h-4 w-4 text-muted-foreground" />
              <span>Mute notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive">
              <span>Clear chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;