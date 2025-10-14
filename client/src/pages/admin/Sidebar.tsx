// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   FolderTree,
//   Image,
//   Users,
//   X,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
//   const location = useLocation();
//   const isActive = (path: string) => location.pathname === `/admin${path}`;

//   const navItems = [
//     { 
//       path: "", 
//       label: "Dashboard",
//       icon: LayoutDashboard
//     },
//     { 
//       path: "/products", 
//       label: "Products",
//       icon: Package
//     },
//     { 
//       path: "/categories", 
//       label: "Categories",
//       icon: FolderTree
//     },
//     { 
//       path: "/banners", 
//       label: "Banners",
//       icon: Image
//     },
//     { 
//       path: "/users", 
//       label: "Users",
//       icon: Users
//     },
//   ];

//   const handleNavClick = () => {
//     // Only close sidebar on mobile when navigating
//     if (window.innerWidth < 768) {
//       onClose();
//     }
//   };

//   return (
//     <>
//       {/* ✅ Mobile Sidebar (slide over) */}
//       <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:hidden ${
//         isOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}>
//         <div className="flex flex-col h-full">
//           {/* Mobile Header */}
//           <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
//             <div className="flex items-center">
//               <div className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-purple-600 dark:bg-purple-500">
//                 ADMIN
//               </div>
//               <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Dashboard</span>
//             </div>
//             <button
//               onClick={onClose}
//               className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//             >
//               <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//             </button>
//           </div>
          
//           {/* Mobile Navigation */}
//           <div className="flex-1 overflow-y-auto py-4">
//             <nav className="px-2 space-y-1">
//               {navItems.map((item) => {
//                 const isActiveRoute = isActive(item.path);
//                 const Icon = item.icon;
//                 return (
//                   <Link
//                     key={item.path}
//                     to={`/admin${item.path}`}
//                     onClick={handleNavClick}
//                     className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
//                       isActiveRoute
//                         ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
//                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
//                     }`}
//                   >
//                     <div className={`mr-3 flex-shrink-0 ${
//                       isActiveRoute 
//                         ? "text-purple-600 dark:text-purple-400" 
//                         : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
//                     }`}>
//                       <Icon className="h-5 w-5" />
//                     </div>
//                     {item.label}
//                     {isActiveRoute && (
//                       <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
//                     )}
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Desktop/Tablet Sidebar - Single responsive container */}
//       <div className={`hidden md:flex md:flex-shrink-0 relative transition-all duration-300 ease-in-out ${
//         isOpen ? 'md:w-64' : 'md:w-16'
//       }`}>
//         <div className="flex flex-col w-full relative bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
//           {/* ✅ Expand/Collapse Toggle Button */}
//           <button
//             onClick={onClose}
//             className={`absolute top-4 ${isOpen ? 'right-4' : 'right-2'} z-10 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ${
//               isOpen ? 'opacity-100' : 'opacity-0 hover:opacity-100'
//             }`}
//             title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
//           >
//             {isOpen ? (
//               <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//             ) : (
//               <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//             )}
//           </button>

//           {/* Sidebar Header */}
//           <div className="flex items-center flex-shrink-0 px-4 pt-5 pb-4">
//             {isOpen ? (
//               // ✅ Expanded Header
//               <div className="flex items-center animate-in fade-in duration-300">
//                 <div className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-purple-600 dark:bg-purple-500">
//                   ADMIN
//                 </div>
//                 <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
//                   Dashboard
//                 </span>
//               </div>
//             ) : (
//               // ✅ Collapsed Header
//               <div className="flex items-center justify-center w-full animate-in fade-in duration-300">
//                 <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center rounded-xl shadow-lg">
//                   <span className="text-sm font-bold text-white">A</span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Navigation */}
//           <div className="flex-grow flex flex-col mt-4">
//             <nav className={`flex-1 space-y-1 ${isOpen ? 'px-2' : 'px-2'}`}>
//               {navItems.map((item) => {
//                 const isActiveRoute = isActive(item.path);
//                 const Icon = item.icon;
//                 return (
//                   <Link
//                     key={item.path}
//                     to={`/admin${item.path}`}
//                     className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
//                       isActiveRoute
//                         ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
//                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
//                     }`}
//                     title={!isOpen ? item.label : ""}
//                   >
//                     {/* Icon */}
//                     <div className={`flex-shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'} ${
//                       isActiveRoute 
//                         ? "text-purple-600 dark:text-purple-400" 
//                         : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
//                     }`}>
//                       <Icon className="h-5 w-5" />
//                     </div>
                    
//                     {/* ✅ Label with smooth transition */}
//                     {isOpen && (
//                       <span className="animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">
//                         {item.label}
//                       </span>
//                     )}
                    
//                     {/* ✅ Active indicator */}
//                     {isActiveRoute && isOpen && (
//                       <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-in fade-in duration-300"></div>
//                     )}
                    
//                     {/* ✅ Collapsed state active indicator */}
//                     {isActiveRoute && !isOpen && (
//                       <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-full animate-in fade-in duration-300"></div>
//                     )}

//                     {/* ✅ Tooltip for collapsed state */}
//                     {!isOpen && (
//                       <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                         {item.label}
//                       </div>
//                     )}
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* ✅ Footer section for collapsed state */}
//           {!isOpen && (
//             <div className="p-4 border-t border-gray-200 dark:border-gray-800">
//               <div className="flex justify-center">
//                 <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
//                   <span className="text-xs font-semibold text-white">
//                     {/* You can add user initial here */}
//                     U
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;


import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Image,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === `/admin${path}`;

  const navItems = [
    { 
      path: "", 
      label: "Dashboard",
      icon: LayoutDashboard
    },
    { 
      path: "/products", 
      label: "Products",
      icon: Package
    },
    { 
      path: "/categories", 
      label: "Categories",
      icon: FolderTree
    },
    { 
      path: "/banners", 
      label: "Banners",
      icon: Image
    },
    { 
      path: "/users", 
      label: "Users",
      icon: Users
    },
    {
      path:"/business",
      label:"business",
      icon: BriefcaseBusiness
    }
  ];

  const handleNavClick = () => {
    // Only close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* ✅ Mobile Sidebar (slide over) */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700">
                ADMIN
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Dashboard</span>
            </div>
            
            {/* ✅ Professional Mobile Close Button */}
            <button
              onClick={onClose}
              className="
                h-9 w-9 flex items-center justify-center rounded-lg
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 
                hover:bg-gray-50 dark:hover:bg-gray-700
                hover:border-gray-300 dark:hover:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                shadow-sm hover:shadow-md
                transition-all duration-200 group
              "
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => {
                const isActiveRoute = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={`/admin${item.path}`}
                    onClick={handleNavClick}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActiveRoute
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-700/50"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className={`mr-3 flex-shrink-0 ${
                      isActiveRoute 
                        ? "text-purple-600 dark:text-purple-400" 
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.label}
                    {isActiveRoute && (
                      <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full shadow-sm shadow-purple-500/50"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ✅ Desktop/Tablet Sidebar - Single responsive container */}
      <div className={`hidden md:flex md:flex-shrink-0 relative transition-all duration-300 ease-in-out ${
        isOpen ? 'md:w-64' : 'md:w-16'
      }`}>
        <div className="flex flex-col w-full relative bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
          {/* ✅ Professional Expand/Collapse Toggle Button */}
          <button
            onClick={onClose}
            className={`
              absolute top-6 ${isOpen ? 'right-4' : 'right-2'} z-10
              h-8 w-8 flex items-center justify-center
              rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 
              hover:bg-gray-50 dark:hover:bg-gray-700
              hover:border-gray-300 dark:hover:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
              shadow-sm hover:shadow-md
              transition-all duration-200 group
              ${isOpen ? 'opacity-100' : 'opacity-0 hover:opacity-100 -translate-x-1 hover:translate-x-0'}
            `}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Sidebar Header */}
          <div className="flex items-center flex-shrink-0 px-4 pt-5 pb-4">
            {isOpen ? (
              // ✅ Expanded Header
              <div className="flex items-center animate-in fade-in duration-300">
                <div className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700">
                  ADMIN
                </div>
                {/* <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
                  Dashboard
                </span> */}
              </div>
            ) : (
              // ✅ Collapsed Header
              <div className="flex items-center justify-center w-full animate-in fade-in duration-300">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center rounded-xl shadow-lg">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex-grow flex flex-col mt-4">
            <nav className={`flex-1 space-y-1 ${isOpen ? 'px-2' : 'px-2'}`}>
              {navItems.map((item) => {
                const isActiveRoute = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={`/admin${item.path}`}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                      isActiveRoute
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-700/50 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={!isOpen ? item.label : ""}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'} ${
                      isActiveRoute 
                        ? "text-purple-600 dark:text-purple-400" 
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* ✅ Label with smooth transition */}
                    {isOpen && (
                      <span className="animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                    
                    {/* ✅ Active indicator */}
                    {isActiveRoute && isOpen && (
                      <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-in fade-in duration-300 shadow-sm shadow-purple-500/50"></div>
                    )}
                    
                    {/* ✅ Collapsed state active indicator */}
                    {isActiveRoute && !isOpen && (
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-full animate-in fade-in duration-300"></div>
                    )}

                    {/* ✅ Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
