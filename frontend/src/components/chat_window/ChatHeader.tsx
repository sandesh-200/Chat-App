import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

// 1. Define the shape of your props
interface ChatHeaderProps {
  name: string;
  initial: string;
  status: string;
}

// 2. Destructure the props in the component arguments
const ChatHeader = ({ name, initial, status }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Link to="/" className="md:hidden">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <div className="relative">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          {status === "online" && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold">{name}</h2>
          <p
            className={`text-xs ${status === "online" ? "text-green-500" : "text-muted-foreground"}`}
          >
            {status === "online" ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
