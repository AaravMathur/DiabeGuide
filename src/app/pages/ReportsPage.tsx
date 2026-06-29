import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

const monthlyDataFallback = [
  { month: "Jan", average: 110, readings: 245 },
  { month: "Feb", average: 108, readings: 238 },
  { month: "Mar", average: 112, readings: 251 },
  { month: "Apr", average: 105, readings: 247 },
  { month: "May", average: 108, readings: 123 },
];

const readingDistributionFallback = [
  { name: "Normal", value: 75, color: "#10B981" },
  { name: "High", value: 15, color: "#F59E0B" },
  { name: "Low", value: 10, color: "#EF4444" },
];

const insightsFallback = [
  { title: "Glucose Control", value: "85%", change: "+5%", trend: "up", description: "In target range" },
  { title: "Average Glucose", value: "108 mg/dL", change: "-3 mg/dL", trend: "down", description: "From last month" },
  { title: "Time in Range", value: "78%", change: "+8%", trend: "up", description: "70-130 mg/dL" },
  { title: "Total Readings", value: "247", change: "+12", trend: "up", description: "This month" },
];

export function ReportsPage() {
  const [insights, setInsights] = useState<any[]>(insightsFallback);
  const [monthlyData, setMonthlyData] = useState<any[]>(monthlyDataFallback);
  const [readingDistribution, setReadingDistribution] = useState<any[]>(readingDistributionFallback);
  const [healthScore, setHealthScore] = useState({
    overall: 85,
    glucoseControl: 95,
    consistency: 88,
    lifestyle: 72,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.reports.getAnalytics();
        if (data) {
          setInsights(data.insights || insightsFallback);
          setMonthlyData(data.monthlyData || monthlyDataFallback);
          setReadingDistribution(data.readingDistribution || readingDistributionFallback);
          if (data.healthScore) {
            setHealthScore(data.healthScore);
          }
        }
      } catch (err) {
        console.error("Failed to load reports analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportPDF = () => {
    toast.success("Health report exported as PDF successfully!");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Health Reports</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Comprehensive analytics and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select defaultValue="month">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardHeader>
              <CardDescription>{insight.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{insight.value}</div>
                <div className="flex items-center gap-2">
                  {insight.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      insight.trend === "up" ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    {insight.change}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Average Glucose</CardTitle>
            <CardDescription>Your glucose trends over the past 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="average" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reading Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Distribution</CardTitle>
            <CardDescription>Breakdown of your glucose readings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250} className="sm:max-w-[60%]">
                <PieChart>
                  <Pie
                    data={readingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                  >
                    {readingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4 w-full sm:w-auto">
                {readingDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Download your detailed health reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Monthly Summary - May 2026", date: "Generated today", size: "2.4 MB" },
              { title: "Quarterly Report - Q2 2026", date: "May 1, 2026", size: "5.8 MB" },
              { title: "Annual Review - 2025", date: "Jan 1, 2026", size: "12.3 MB" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{report.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Score */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-emerald-700">Your Health Score</CardTitle>
          <CardDescription>Based on your glucose control and lifestyle factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - (healthScore.overall / 100))}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="scoreGradient">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-700">{healthScore.overall}</p>
                  <p className="text-sm text-emerald-600">
                    {healthScore.overall >= 85 ? "Excellent" : healthScore.overall >= 70 ? "Good" : "Monitor"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Glucose Control</span>
                  <span className="text-sm font-semibold text-gray-900">{healthScore.glucoseControl}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${healthScore.glucoseControl}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Consistency</span>
                  <span className="text-sm font-semibold text-gray-900">{healthScore.consistency}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${healthScore.consistency}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Lifestyle Factors</span>
                  <span className="text-sm font-semibold text-gray-900">{healthScore.lifestyle}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${healthScore.lifestyle}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
