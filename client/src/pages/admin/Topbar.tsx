// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   Moon, 
//   Sun, 
//   LogOut, 
//   Settings, 
//   User, 
//   Menu, 
//   X,
//   PanelLeftClose,
//   PanelLeftOpen,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react";
// import { useTheme } from "@/components/theme-provider";
// import { useToast } from "@/hooks/use-toast";

// interface TopbarProps {
//   onToggleSidebar: () => void;
//   sidebarOpen: boolean;
// }

// export default function Topbar({ onToggleSidebar, sidebarOpen }: TopbarProps) {
//   const { theme, setTheme } = useTheme();
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [adminUser, setAdminUser] = useState({
//     firstName: "A",
//     lastName: "",
//     email: "",
//   });

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
//     if (storedUser?.firstName) {
//       setAdminUser(storedUser);
//     }
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('[data-dropdown]')) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("admin_token");
//     localStorage.removeItem("admin_user");
//     toast({
//       title: "Admin Logged Out",
//       description: "You have been successfully logged out from the admin panel.",
//       variant: "default",
//     });
//     navigate("/admin/login");
//   };

//   const toggleProfileDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   return (
//     <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
//       <div className="px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Left: Sidebar Toggle + Logo */}
//           <div className="flex items-center space-x-4">
//             {/* ✅ Enhanced Universal Sidebar Toggle Button */}
//             <button
//               onClick={onToggleSidebar}
//               className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
//               aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
//               title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
//             >
//               {/* Mobile icons */}
//               <div className="md:hidden">
//                 {sidebarOpen ? (
//                   <X className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
//                 ) : (
//                   <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
//                 )}
//               </div>
//               {/* Desktop/Tablet icons */}
//               <div className="hidden md:block">
//                 {sidebarOpen ? (
//                   <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
//                 ) : (
//                   <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
//                 )}
//               </div>
//             </button>

//             {/* ✅ Dynamic Logo - Show when sidebar is collapsed or on mobile */}
//             <div className={`flex items-center space-x-3 transition-all duration-300 ${
//               sidebarOpen ? 'md:opacity-0 md:w-0 md:overflow-hidden' : 'md:opacity-100'
//             }`}>
//               <div className="relative group">
//                 <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-all duration-200">
//                   <svg
//                     className="h-4 w-4 sm:h-6 sm:w-6 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2.5"
//                       d="M13 10V3L4 14h7v7l9-11h-7z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 -z-10"></div>
//               </div>
              
//               <div className="min-w-0">
//                 <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//                   Admin Console
//                 </span>
//                 <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">
//                   Management Portal
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right: Actions */}
//           <div className="flex items-center space-x-2">
//             {/* Theme Toggle */}
//             <button
//               onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//               className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
//               aria-label="Toggle theme"
//             >
//               {theme === "light" ? (
//                 <Moon className="h-4 w-4 text-gray-600 group-hover:scale-110 transition-transform" />
//               ) : (
//                 <Sun className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
//               )}
//             </button>

//             {/* Profile Dropdown */}
//             <div className="relative" data-dropdown>
//               <button
//                 onClick={toggleProfileDropdown}
//                 className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-500/20 transition-all flex items-center justify-center group"
//                 aria-label="Profile menu"
//               >
//                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
//                   <span className="text-sm font-semibold text-white">
//                     {adminUser?.firstName?.[0]?.toUpperCase() || "A"}
//                   </span>
//                 </div>
//                 <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
//               </button>

//               {/* Profile Dropdown Menu */}
//               {dropdownOpen && (
//                 <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//                   <div className="px-3 py-2 mb-2">
//                     <div className="font-medium text-gray-900 dark:text-white">
//                       {adminUser?.firstName || "Admin"}{" "}
//                       {adminUser?.lastName || ""}
//                     </div>
//                     <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
//                       {adminUser?.email || "admin@example.com"}
//                     </div>
//                   </div>
//                   <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

//                   <button className="w-full flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
//                     <User className="mr-3 h-4 w-4" />
//                     <span>Profile Settings</span>
//                   </button>
//                   <button className="w-full flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
//                     <Settings className="mr-3 h-4 w-4" />
//                     <span>Account Settings</span>
//                   </button>
//                   <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
//                   >
//                     <LogOut className="mr-3 h-4 w-4" />
//                     <span>Sign Out</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  LogOut, 
  Settings, 
  User, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Topbar({ onToggleSidebar, sidebarOpen }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({
    firstName: "A",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
    if (storedUser?.firstName) {
      setAdminUser(storedUser);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast({
      title: "Admin Logged Out",
      description: "You have been successfully logged out from the admin panel.",
      variant: "default",
    });
    navigate("/admin/login");
  };

  const toggleProfileDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center space-x-4">
            {/* ✅ Professional Universal Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className={`
                h-10 w-10 flex items-center justify-center rounded-lg 
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 
                hover:bg-gray-50 dark:hover:bg-gray-700
                hover:border-gray-300 dark:hover:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                shadow-sm hover:shadow-md
                transition-all duration-200 group
              `}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {/* Mobile icons */}
              <div className="md:hidden">
                {sidebarOpen ? (
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                ) : (
                  <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                )}
              </div>
              
              {/* Desktop/Tablet icons */}
              <div className="hidden md:block">
                {sidebarOpen ? (
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                )}
              </div>
            </button>

            {/* ✅ Status Indicator */}
            <div className="hidden lg:flex items-center ml-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                sidebarOpen 
                  ? 'bg-green-500 shadow-sm shadow-green-500/50' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {sidebarOpen ? 'Expanded' : 'Collapsed'}
              </span>
            </div>

            {/* ✅ Dynamic Logo - Show when sidebar is collapsed or on mobile */}
            <div className={`flex items-center space-x-3 transition-all duration-300 ${
              sidebarOpen ? 'md:opacity-0 md:w-0 md:overflow-hidden' : 'md:opacity-100'
            }`}>
              <div className="relative group">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-all duration-200">
                  <svg
                    className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 -z-10"></div>
              </div>
              
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Admin Console
                </span>
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Management Portal
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* ✅ Professional Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="
                h-9 w-9 flex items-center justify-center rounded-lg
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 
                hover:bg-gray-50 dark:hover:bg-gray-700
                hover:border-gray-300 dark:hover:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                shadow-sm hover:shadow-md
                transition-all duration-200 group
              "
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 group-hover:scale-110 transition-all" />
              )}
            </button>

            {/* ✅ Enhanced Profile Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={toggleProfileDropdown}
                className="
                  relative h-10 w-10 rounded-full 
                  border-2 border-transparent
                  hover:border-purple-500/20 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                  transition-all duration-200 
                  flex items-center justify-center group
                "
                aria-label="Profile menu"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-sm font-semibold text-white">
                    {adminUser?.firstName?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {adminUser?.firstName || "Admin"}{" "}
                      {adminUser?.lastName || ""}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {adminUser?.email || "admin@example.com"}
                    </div>
                  </div>

                  <button className="w-full flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Account Settings</span>
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
