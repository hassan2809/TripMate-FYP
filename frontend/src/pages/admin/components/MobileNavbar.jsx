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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const MobileNavbar = ({ closeSheet }) => {
  const navigate = useNavigate();
  
  const menus = [
    // { name: 'Dashboard', icon: Home, tab: 'dashboard' },
    { name: "Users", icon: Users, tab: "users" },
    { name: "Tours", icon: Compass, tab: "tours" },
    { name: "Room Listings", icon: Building, tab: "rooms" },
    { name: "Reviews", icon: Star, tab: "reviews" },
    { name: "Settings", icon: Settings, tab: "settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleNavigation = (tab) => {
    // If using tabs within the same page
    if (closeSheet) {
      closeSheet();
    }
    
    // If using routes for navigation
    // navigate(`/admin/${tab}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">TripMate</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {menus.map(({ name, icon: Icon, tab }) => (
            <Button
              key={name}
              variant="ghost"
              onClick={() => handleNavigation(tab)}
              className="flex items-center justify-start gap-2 h-10 w-full rounded-md px-3 text-sm font-medium text-white hover:bg-blue-700"
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
          className="w-full flex items-center justify-start gap-2 text-white hover:bg-blue-700"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavbar;