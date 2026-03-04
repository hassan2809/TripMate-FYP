import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const navItems = [
    { name: t("nav.home"), to: "/" },
    { name: t("nav.tourPackages"), to: "/tourPackages" },
    { name: t("nav.tourPlan"), to: "/tourPlan" },
    { name: t("nav.accommodation"), to: "/accomodation" },
  ];

  return (
    <nav>
      <div className="container mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">
                {t("nav.tripmate")}
              </span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`text-white inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === item.to 
                    ? "border-b-2 border-white" 
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn && (
              <Link 
                to="/chat" 
                className={`text-white mr-3 ${
                  location.pathname === "/chat" 
                    ? "border-b-2 border-white" 
                    : ""
                }`}
              >
                <MessageCircle 
                  size={20} 
                  fill={location.pathname === "/chat" ? "white" : "none"}
                />
              </Link>
            )}
            <div className="text-white mr-5 font-semibold">
              <LanguageSwitcher />
            </div>
            {!isLoggedIn ? (
              <div className="mr-4 flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-100 hover:text-indigo-600"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            ) : (
              <>
                <UserMenu onLogout={handleLogout} />
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
                >
                  <span className="sr-only">{t("nav.openMenu")}</span>
                  {isOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:hidden">
                <div className="pt-5 pb-6 px-5">
                  <div className="mt-6">
                    <nav className="grid gap-y-8">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="ml-3 text-base font-medium text-gray-900">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                      {isLoggedIn && (
                        <Link
                          to="/chat"
                          className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          <MessageCircle className="h-6 w-6 text-gray-600" />
                          <span className="ml-3 text-base font-medium text-gray-900">
                            {t("nav.messages")}
                          </span>
                        </Link>
                      )}
                    </nav>
                    <div className="ml-3 mt-5 font-bold">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
                <div className="mt-6 px-5">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        {t("nav.signin")}
                      </Link>
                      <p className="mt-6 text-center text-base font-medium text-gray-500">
                        {t("nav.newCustomer")}{" "}
                        <Link
                          to="/signup"
                          className="text-indigo-600 hover:text-indigo-500"
                          onClick={() => setIsOpen(false)}
                        >
                          {t("nav.startHere")}
                        </Link>
                      </p>
                    </>
                  ) : (
                    <p className="mt-6 text-center text-base font-medium text-gray-500">
                      {t("nav.newCustomer")}{" "}
                      <Link
                        to="/signup"
                        className="text-indigo-600 hover:text-indigo-500"
                        onClick={() => setIsOpen(false)}
                      >
                        {t("nav.startHere")}
                      </Link>
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;