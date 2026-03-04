// import { useTranslation } from "react-i18next";

// const LanguageSwitcher = () => {
//   const { i18n } = useTranslation();

//   const toggleLanguage = () => {
//     const newLang = i18n.language === "en" ? "ur" : "en";
//     i18n.changeLanguage(newLang);
//     // document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr"; // optional RTL support
//   };

//   return (
//     <button onClick={toggleLanguage}>
//       {i18n.language === "en" ? "English" : "اردو"}
//     </button>
//   );
// };

// export default LanguageSwitcher;


import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Available languages
  const languages = [
    { code: "en", name: "English" },
    { code: "ur", name: "اردو" },
    // Add more languages here
  ];

  // Handle language change
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    // Optional RTL support
    // document.documentElement.dir = langCode === "ur" ? "rtl" : "ltr";
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Globe button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-sm">
          {languages.find(lang => lang.code === i18n.language)?.name || "English"}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200 animate-fadeIn">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                  i18n.language === language.code
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{language.name}</span>
                {i18n.language === language.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;