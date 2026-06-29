import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, XAxis, YAxis } from "recharts";
import { Plus, TrendingUp, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const historyDataFallback = [
  { time: "6 AM", value: 95 },
  { time: "9 AM", value: 110 },
  { time: "12 PM", value: 125 },
  { time: "3 PM", value: 115 },
  { time: "6 PM", value: 120 },
  { time: "9 PM", value: 105 },
];

export function TrackerPage() {
  const [sugarLevel, setSugarLevel] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");

  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [stats, setStats] = useState({
    currentGlucose: 120,
    currentStatus: "Normal",
    weeklyAverage: 112,
    inRangePercentage: 85,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTrackerData = async () => {
    try {
      const statsData = await api.readings.getStats();
      setStats({
        currentGlucose: statsData.currentGlucose,
        currentStatus: statsData.currentStatus,
        weeklyAverage: statsData.weeklyAverage,
        inRangePercentage: statsData.inRangePercentage,
      });

      const dailyData = await api.readings.getDailyTrends();
      setDailyTrends(dailyData.dailyTrends || []);

      const listData = await api.readings.getAll();
      setHistory(listData.readings || []);
    } catch (err: any) {
      console.error("Tracker page load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const handleAddReading = async () => {
    if (!sugarLevel || !mealTime || !timeOfDay) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const todayString = new Date().toISOString().split("T")[0];
      const nowTimeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Capitalize/format meal and timeOfDay properly for readable displays
      const formattedMeal = mealTime
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      await api.readings.add({
        value: Number(sugarLevel),
        meal: formattedMeal,
        timeOfDay: timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1),
        date: todayString,
        time: nowTimeString,
      });

      toast.success("Reading added successfully!");
      setSugarLevel("");
      setMealTime("");
      setTimeOfDay("");
      
      // Refresh page data
      fetchTrackerData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save reading");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Glucose Tracker</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Track and monitor your blood sugar levels</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Reading
            </CardTitle>
            <CardDescription>Record your current glucose level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sugar">Blood Sugar (mg/dL)</Label>
              <Input
                id="sugar"
                type="number"
                placeholder="120"
                value={sugarLevel}
                onChange={(e) => setSugarLevel(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time of Day</Label>
              <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal">Meal Status</Label>
              <Select value={mealTime} onValueChange={setMealTime}>
                <SelectTrigger id="meal">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before-breakfast">Before Breakfast</SelectItem>
                  <SelectItem value="after-breakfast">After Breakfast</SelectItem>
                  <SelectItem value="before-lunch">Before Lunch</SelectItem>
                  <SelectItem value="after-lunch">After Lunch</SelectItem>
                  <SelectItem value="before-dinner">Before Dinner</SelectItem>
                  <SelectItem value="after-dinner">After Dinner</SelectItem>
                  <SelectItem value="bedtime">Bedtime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddReading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reading
            </Button>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-semibold text-gray-900">Smart Features (Coming Soon)</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Connect CGM device</li>
                <li>• NFC scan support</li>
                <li>• Auto reminders after meals</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Graph Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Today's Trend
            </CardTitle>
            <CardDescription>Your glucose levels throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart 
                  data={dailyTrends}
                  margin={isMobile ? { top: 10, right: 5, left: -20, bottom: 5 } : { top: 15, right: 15, left: -5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
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
                    domain={[60, 180]}
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                <TrendingUp className="w-8 h-8 mb-2 stroke-1 text-gray-400 animate-pulse" />
                <p className="text-sm font-semibold">No glucose logs logged today</p>
                <p className="text-xs text-gray-400 mt-1">Enter your first reading in the form to start tracking trends</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700 font-semibold">Target Range</p>
                <p className="text-2xl font-bold text-emerald-900">70-130</p>
                <p className="text-xs text-emerald-600">mg/dL</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-semibold">Average Today</p>
                <p className="text-2xl font-bold text-blue-900">{stats.weeklyAverage}</p>
                <p className="text-xs text-blue-600">mg/dL</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 font-semibold">In Range</p>
                <p className="text-2xl font-bold text-purple-900">{stats.inRangePercentage}%</p>
                <p className="text-xs text-purple-600">of readings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Reading History</CardTitle>
          <CardDescription>Your recent glucose measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((reading, index) => {
                const glucoseVal = reading.level ?? reading.value;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold">{glucoseVal}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{reading.meal}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {reading.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reading.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        glucoseVal >= 70 && glucoseVal <= 130
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {glucoseVal >= 70 && glucoseVal <= 130 ? "Normal" : "Monitor"}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-4 text-gray-500">
                No history found. Insert your first glucose reading using the form above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
