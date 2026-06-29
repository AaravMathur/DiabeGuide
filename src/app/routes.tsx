import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { TrackerPage } from "./pages/TrackerPage";
import { ChatbotPage } from "./pages/ChatbotPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { ReportsPage } from "./pages/ReportsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const basename = window.location.pathname.startsWith("/DiabeGuide") ? "/DiabeGuide" : "/";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "tracker", Component: TrackerPage },
      { path: "chatbot", Component: ChatbotPage },
      { path: "profile", Component: ProfilePage },
      { path: "reports", Component: ReportsPage },
      { path: "emergency", Component: EmergencyPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
], { basename });
