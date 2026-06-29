import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Brain, LineChart, Shield, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function LandingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <span className="font-bold text-lg md:text-xl text-gray-900">DiabeGuide</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-600 hover:text-blue-600 transition">Home</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">About</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Toggle Dark Mode"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </Button>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Sign Up
                </Button>
              </Link>
            </div>
            {/* Mobile Menu Buttons */}
            <div className="flex md:hidden items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Toggle Dark Mode"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </Button>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Smart Diabetes Management with AI
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Track glucose, monitor health, and get AI-powered assistance in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 blur-3xl opacity-30 rounded-full"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Level</p>
                      <p className="text-2xl font-bold text-gray-900">120 mg/dL</p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-end p-4">
                    <div className="flex items-end gap-2 w-full">
                      {[70, 85, 80, 95, 120, 110, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-600 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Powerful Features</h2>
          <p className="text-lg md:text-xl text-gray-600">Everything you need to manage your diabetes effectively</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-blue-100 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle>AI Chatbot</CardTitle>
              <CardDescription>Get instant answers and personalized advice from our AI assistant</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-emerald-100 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Glucose Tracking</CardTitle>
              <CardDescription>Monitor your blood sugar levels with easy-to-use tracking tools</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-purple-100 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Health Reports</CardTitle>
              <CardDescription>Comprehensive analytics and insights into your health trends</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-orange-100 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Smart Monitoring</CardTitle>
              <CardDescription>Real-time alerts and reminders to keep you on track</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-lg">DiabeGuide</span>
              </div>
              <p className="text-gray-400">Smart diabetes management with AI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 DiabeGuide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
