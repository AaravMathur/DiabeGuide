import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { Activity, LayoutDashboard, TrendingUp, MessageSquare, User, FileText, AlertCircle, LogOut, Bell, Menu, Sun, Moon, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MobileNav } from "../components/MobileNav";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Tracker", path: "/dashboard/tracker" },
  { icon: MessageSquare, label: "Chatbot", path: "/dashboard/chatbot" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
  { icon: AlertCircle, label: "Emergency", path: "/dashboard/emergency" },
];

export interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { name: "John Doe", email: "john@example.com" };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "welcome",
      title: "Welcome to DiabeGuide!",
      text: "Start logging your blood glucose readings on the Tracker page.",
      time: "Just now",
      read: false,
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);

  // Dark mode theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const fetchUser = () => {
      api.auth.getMe()
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => {
          console.error("Session verification failed:", err);
        });
    };

    fetchUser();

    window.addEventListener("profile-updated", fetchUser);
    return () => {
      window.removeEventListener("profile-updated", fetchUser);
    };
  }, []);

  // Listen for chatbot response event
  useEffect(() => {
    const handleChatbotResponse = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      
      const newNotif: NotificationItem = {
        id: Math.random().toString(),
        title: detail.title || "New Message Received",
        text: detail.text || "Chatbot response is ready to be viewed",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setBellAnimating(true);
      
      // Trigger a toast alert
      toast.info(newNotif.title, {
        description: newNotif.text.substring(0, 60) + (newNotif.text.length > 60 ? "..." : "")
      });
    };

    window.addEventListener("chatbot-response-ready", handleChatbotResponse);
    return () => {
      window.removeEventListener("chatbot-response-ready", handleChatbotResponse);
    };
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleOutsideClick = () => {
      setShowNotifications(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showNotifications]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setBellAnimating(false);
    // Mark notifications as read when dropdown is opened
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    api.auth.logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">DiabeGuide</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] flex md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

          {/* Drawer Content */}
          <aside 
            className="relative flex h-full w-64 max-w-[80vw] flex-col bg-white dark:bg-card border-r border-gray-200 dark:border-border p-6 pb-8 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-foreground">DiabeGuide</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
              {navItems
                .filter(item => !["/dashboard", "/dashboard/tracker", "/dashboard/chatbot", "/dashboard/reports"].includes(item.path))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="pt-4 border-t border-gray-200 dark:border-border">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-4 py-3 md:px-8 md:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Logo and Hamburger on the left for mobile screens only */}
            <div className="flex items-center gap-2 md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-full p-1 -ml-1 text-gray-700 dark:text-gray-300"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-foreground">DiabeGuide</span>
            </div>

            {/* Empty space helper on desktop */}
            <div className="hidden md:block"></div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme Toggle Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="relative hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition text-gray-600 dark:text-gray-400"
                title="Toggle Dark Mode"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </Button>

              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBellClick}
                  className={`relative transition-all duration-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full ${
                    bellAnimating ? "animate-bell-ring text-blue-600 bg-blue-50 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                  )}
                </Button>

                {showNotifications && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-border">
                      <span className="font-semibold text-sm text-gray-900 dark:text-foreground">Notifications</span>
                      {notifications.some(n => !n.read) && (
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-50 dark:border-border last:border-b-0 transition flex gap-3 ${
                              !notif.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-foreground truncate">{notif.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.text}</p>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">{notif.time}</span>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-400 text-xs">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/dashboard/profile" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  {user?.avatar && <AvatarImage src={user.avatar} className="object-cover w-full h-full" />}
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs md:text-sm">
                    {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "JD"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground leading-none">{user?.name || "John Doe"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-none">{user?.email || "john@example.com"}</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
