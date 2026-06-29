import { Link, useLocation } from "react-router";
import { LayoutDashboard, TrendingUp, MessageSquare, FileText } from "lucide-react";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: TrendingUp, label: "Tracker", path: "/dashboard/tracker" },
  { icon: MessageSquare, label: "Chatbot", path: "/dashboard/chatbot" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
