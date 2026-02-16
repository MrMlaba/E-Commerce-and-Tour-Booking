import { 
  Home, 
  ShoppingBag, 
  MapPin, 
  User, 
  LogOut,
  Package,
  FileText,
  ShoppingCart,
  Calendar,
  Settings,
  Sparkles,
  Crown,
  Users,
  Palette,
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const userMenuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: Home, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200"
  },
  { 
    title: "My Orders", 
    url: "/dashboard/orders", 
    icon: ShoppingBag, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-200"
  },
  { 
    title: "My Bookings", 
    url: "/dashboard/bookings", 
    icon: MapPin, 
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-200"
  },
  { 
    title: "Profile", 
    url: "/dashboard/profile", 
    icon: User, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-200"
  },
];

const adminMenuItems = [
  { 
    title: "Overview", 
    url: "/admin-dashboard", 
    icon: BarChart3, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200"
  },
  { 
    title: "Orders", 
    url: "/admin-dashboard/orders", 
    icon: ShoppingBag, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-200"
  },
  { 
    title: "Tour Bookings", 
    url: "/admin-dashboard/tour-bookings", 
    icon: Calendar, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-200"
  },
  { 
    title: "Products", 
    url: "/admin-dashboard/products", 
    icon: Package, 
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-200"
  },
  { 
    title: "Tours", 
    url: "/admin-dashboard/tours", 
    icon: MapPin, 
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-200"
  },
  { 
    title: "Tour Dates", 
    url: "/admin-dashboard/tour-dates", 
    icon: Calendar, 
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-200"
  },
  { 
    title: "Users", 
    url: "/admin-dashboard/users", 
    icon: Users, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-200"
  },
  { 
    title: "Content", 
    url: "/admin-dashboard/content", 
    icon: FileText, 
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-200"
  },
  { 
    title: "Branding", 
    url: "/admin-dashboard/branding", 
    icon: Palette, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-200"
  },
  { 
    title: "Settings", 
    url: "/admin-dashboard/settings", 
    icon: Settings, 
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-200"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, userRole } = useAuth();
  const currentPath = location.pathname;

  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path.includes('admin-dashboard')) {
      return currentPath === path || (path === '/admin-dashboard' && currentPath === '/admin-dashboard');
    }
    return currentPath === path;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 shadow-lg transition-all duration-300`}
      collapsible="icon"
    >
      {/* Header - Fixed layout to prevent overlap */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-blue-100/50 dark:from-primary/20 dark:via-primary/10 dark:to-blue-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Trigger button with proper spacing */}
          <SidebarTrigger className="hover:bg-primary/15 rounded-lg transition-all duration-200 p-2 hover:shadow-md flex-shrink-0" />
          
          {/* Right side - Title content that hides when collapsed */}
          {!collapsed && (
            <div className="flex items-center gap-3 ml-2 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                {userRole === 'admin' ? (
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  {userRole === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                </h2>
                <p className="text-xs text-muted-foreground font-medium truncate">
                  {userRole === 'admin' ? 'Management Console' : 'Personal Space'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-3 px-2">
            {collapsed ? "•••" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      isActive(item.url) 
                        ? `${item.bgColor} ${item.borderColor} text-foreground shadow-lg shadow-black/5 transform scale-[1.02]` 
                        : 'hover:bg-white/60 hover:shadow-md hover:border hover:border-slate-200/80 dark:hover:bg-slate-700/50'
                    } border backdrop-blur-sm`}
                  >
                    <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-3">
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive(item.url) 
                          ? 'bg-white shadow-sm' 
                          : 'group-hover:bg-white/80 group-hover:shadow-sm'
                      }`}>
                        <item.icon className={`h-4 w-4 transition-all duration-300 ${
                          isActive(item.url) 
                            ? `${item.color} scale-110` 
                            : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                        }`} />
                      </div>
                      {!collapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-sm transition-colors truncate">
                            {item.title}
                          </span>
                          <div className={`h-0.5 w-6 rounded-full transition-all duration-300 ${
                            isActive(item.url) 
                              ? `${item.color.replace('text', 'bg')} opacity-100` 
                              : 'opacity-0'
                          }`} />
                        </div>
                      )}
                      {isActive(item.url) && !collapsed && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-full opacity-60 flex-shrink-0" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out Button */}
        <SidebarGroup className="mt-auto pt-6">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50/80 to-transparent dark:from-slate-900/80 pointer-events-none" />
    </Sidebar>
  );
}