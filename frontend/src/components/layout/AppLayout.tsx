import { Outlet, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const AppLayout = () => {
  const { user, isLoading, isError } = useAuth();
  const navigate = useNavigate();
  const {chatId} = useParams()

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      navigate("/get-started");
    }
  }, [user, isLoading, isError, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-background`}>
      <div className={`${chatId ? "hidden" : "block"} w-full md:flex md:w-[30%] border-r`}>
        <Sidebar />
      </div>

     <main className={`${chatId ? "block" : "hidden"} md:block flex-1 h-full min-w-0`}>
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default AppLayout;