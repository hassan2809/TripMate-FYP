import React from "react";
import {
  Home,
  Users,
  Compass,
  Star,
  Building,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menus = [
    // { name: 'Dashboard', icon: Home, tab: 'dashboard' },
    { name: "Users", icon: Users, tab: "users" },
    { name: "Tours", icon: Compass, tab: "tours" },
    { name: "Room Listings", icon: Building, tab: "rooms" },
    { name: "Reviews", icon: Star, tab: "reviews" },
    { name: "Settings", icon: Settings, tab: "settings" },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="hidden md:block w-52 border-r bg-gradient-to-b from-blue-900 to-blue-800 text-white">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-blue-700 px-4">
          <div className="flex items-center gap-2 font-semibold">
            {/* <img src="/logo.svg" alt="Tripmate Logo" className="h-8 w-8" /> */}
            <span className="text-xl font-bold">TripMate</span>
          </div>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {menus.map(({ name, icon: Icon, tab }) => (
              <Button
                key={name}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center justify-start gap-2 h-10 w-full rounded-md px-3 text-sm font-medium",
                  activeTab === tab
                    ? "bg-blue-700 text-white"
                    : "hover:bg-blue-700 text-blue-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Button>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t border-blue-700 p-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-2 text-blue-100 hover:bg-blue-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
