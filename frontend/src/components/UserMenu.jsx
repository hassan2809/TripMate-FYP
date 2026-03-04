import React from 'react'
import { useState, useEffect } from 'react'
import { 
  LogOut, 
  UserPen, 
  House, 
  Settings, 
  ChevronRight,
  Bell,
  CreditCard,
  CircleUser
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { MdHotel, MdOutlineHotel, MdOutlineTour } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom'

const UserMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("name");
    setUserName(storedUserName || "");
    
    // Generate initials from name
    if (storedUserName) {
      const names = storedUserName.split(" ");
      if (names.length >= 2) {
        setInitials(`${names[0][0]}${names[1][0]}`);
      } else if (names.length === 1 && names[0].length > 0) {
        setInitials(names[0][0]);
      }
    }
    
    const storedUserEmail = localStorage.getItem("email");
    setUserEmail(storedUserEmail || "");
  }, []);

  const menuItems = [
    {
      icon: <MdOutlineTour className="h-4 w-4" />,
      label: "My Tours",
      action: () => navigate("/my-tours"),
      highlight: false,
    },
    {
      icon: <House className="h-4 w-4" />,
      label: "My Room Listings",
      action: () => navigate("/myRoomListings"),
      highlight: false,
    },
    {
      icon: <UserPen className="h-4 w-4" />,
      label: "Edit Profile",
      action: () => navigate("/edit-profile"),
      highlight: false
    },
    {
      icon: <MdOutlineHotel className="h-4 w-4" />,
      label: "My Room Bookings",
      action: () => navigate("/myBookings"),
      highlight: false
    },
    {
      icon: <LogOut className="h-4 w-4" />,
      label: "Log out",
      action: onLogout,
      highlight: true
    }
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src="/placeholder-user.jpg" alt={userName} />
            <AvatarFallback className="bg-blue-600 text-white font-medium uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 mt-2 p-2" 
        align="end" 
        forceMount
        sideOffset={8}
      >
        <div className="flex items-center gap-4 p-2">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src="/placeholder-user.jpg" alt={userName} />
            <AvatarFallback className="bg-blue-600 text-white font-medium uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium line-clamp-1 capitalize">{userName}</p>
            <p className="text-xs text-gray-500 line-clamp-1">
              {userEmail}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuGroup>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <DropdownMenuItem
                className={`cursor-pointer py-2 px-3 flex items-center justify-between ${
                  item.highlight ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'hover:bg-gray-50'
                }`}
                onClick={item.action}
              >
                <div className="flex items-center gap-2">
                  <span className={`${item.highlight ? 'text-red-600' : 'text-gray-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                
                {item.badge ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-2 py-0 text-xs">
                    {item.badge}
                  </Badge>
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </DropdownMenuItem>
              
              {index < menuItems.length - 1 && !item.highlight && (
                <DropdownMenuSeparator className="my-1" />
              )}
            </React.Fragment>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-2" />
        
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500">
            Logged in as <span className="font-medium text-gray-700 capitalize">{userName.split(' ')[0]}</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu