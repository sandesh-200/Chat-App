import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar /> {/* Sidebar stays here forever */}
      <main className="flex-1 flex flex-col  h-full">
        <Outlet /> {/* This renders ChatWindow (via ChatPage) */}
      </main>
    </div>
  );
};

export default AppLayout