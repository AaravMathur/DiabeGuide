import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Droplets, Activity, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { api } from "../services/api";

const weeklyDataFallback = [
  { day: "Mon", morning: 95, evening: 110 },
  { day: "Tue", morning: 102, evening: 115 },
  { day: "Wed", morning: 98, evening: 108 },
  { day: "Thu", morning: 105, evening: 120 },
  { day: "Fri", morning: 100, evening: 112 },
  { day: "Sat", morning: 96, evening: 105 },
  { day: "Sun", morning: 92, evening: 100 },
];

const aiSuggestions = [
  { icon: Droplets, text: "Drink more water throughout the day", color: "text-blue-600" },
  { icon: Activity, text: "Walk for 15 minutes after meals", color: "text-emerald-600" },
  { icon: AlertCircle, text: "Reduce sugar intake in afternoon snacks", color: "text-amber-600" },
];

export function DashboardHome() {
  const [stats, setStats] = useState({
    currentGlucose: 120,
    currentStatus: "Normal",
    changeMessage: "5 mg/dL from last reading",
    weeklyAverage: 108,
    weeklyStatus: "Excellent",
    monthlyReadingsCount: 247,
    readingsCountMessage: "8 readings per day average",
    targetRange: "70-130",
    inRangePercentage: 85
  });

  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [recentReadings, setRecentReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.readings.getStats();
        setStats(statsData);

        const trendsData = await api.readings.getWeeklyTrends();
        setWeeklyTrends(trendsData.weeklyTrends || []);

        const readingsData = await api.readings.getAll();
        setRecentReadings(readingsData.readings || []);
      } catch (err: any) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back! Here's your health overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Current Glucose Level */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardDescription>Current Glucose Level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.currentGlucose}</span>
                <span className="text-xl text-gray-600 mb-1">mg/dL</span>
              </div>
              <Badge 
                className={
                  stats.currentStatus === "Normal"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : stats.currentStatus === "Low"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                }
              >
                {stats.currentStatus}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                {stats.changeMessage.includes("+") ? (
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                )}
                <span>{stats.changeMessage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average This Week */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardDescription>Average This Week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.weeklyAverage}</span>
                <span className="text-xl text-gray-600 mb-1">mg/dL</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {stats.weeklyStatus}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span>Computed from logged data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Readings */}
        <Card className="border-cyan-100">
          <CardHeader>
            <CardDescription>Total Readings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.monthlyReadingsCount}</span>
                <span className="text-xl text-gray-600 mb-1">all-time</span>
              </div>
              <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                Active
              </Badge>
              <div className="flex items-center gap-2 text-sm text-cyan-600">
                <Activity className="w-4 h-4" />
                <span>{stats.readingsCountMessage}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Glucose Trends</CardTitle>
            <CardDescription>Morning, Afternoon, Evening, and Night readings comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={weeklyTrends} 
                  margin={isMobile ? { top: 10, right: 5, left: -20, bottom: 5 } : { top: 15, right: 15, left: -5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="var(--muted-foreground)" 
                    fontSize={isMobile ? 10 : 13}
                    fontFamily="Inter"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={isMobile ? 10 : 13}
                    fontFamily="Inter"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)", 
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: isMobile ? "11px" : "13px",
                      fontFamily: "Inter, sans-serif"
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    iconSize={isMobile ? 6 : 8} 
                    wrapperStyle={{ 
                      fontSize: isMobile ? "10px" : "13px", 
                      fontFamily: "Inter, sans-serif",
                      paddingBottom: "10px",
                      color: "var(--foreground)"
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="morning"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB", r: 4 }}
                    name="Morning"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="afternoon"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: "#F59E0B", r: 4 }}
                    name="Afternoon"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="evening"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                    name="Evening"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="night"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6", r: 4 }}
                    name="Night"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                <Activity className="w-8 h-8 mb-2 stroke-1 text-gray-400 animate-pulse" />
                <p className="text-sm font-semibold">No glucose logs logged this week</p>
                <p className="text-xs text-gray-400 mt-1">Log readings in the Tracker page to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Personalized recommendations for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${suggestion.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{suggestion.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>Your latest glucose measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Sugar Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReadings.length > 0 ? (
                recentReadings.map((reading, index) => (
                  <TableRow key={index}>
                    <TableCell>{reading.date}</TableCell>
                    <TableCell>{reading.time}</TableCell>
                    <TableCell className="font-semibold">{reading.level ?? reading.value} mg/dL</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          (reading.status === "Normal" || (reading.value >= 70 && reading.value <= 130))
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }
                      >
                        {reading.status || (reading.value >= 70 && reading.value <= 130 ? "Normal" : "Monitor")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    No glucose readings logged yet. Go to Tracker to add readings!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
