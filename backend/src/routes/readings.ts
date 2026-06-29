import { Router, Response } from "express";
import { Reading } from "../models/Reading.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

const getStartOfWeekDateString = (): string => {
  const now = new Date();
  const day = now.getDay();
  // Adjust Monday as start of week (0 is Sunday, 1 is Monday... 6 is Saturday)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    const parts = timeStr.trim().split(" ");
    const timePart = parts[0]; // e.g. "09:42"
    const ampm = parts[1]?.toLowerCase(); // e.g. "pm"
    
    let [hours, minutes] = timePart.split(":").map(Number);
    if (ampm === "pm" && hours !== 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
    
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return new Date(`${dateStr}T${hh}:${mm}:00`);
  } catch (e) {
    return new Date(dateStr);
  }
};

// 1. Add new glucose reading
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const { value, meal, timeOfDay, date, time } = req.body;

  if (!value || !meal || !timeOfDay || !date || !time) {
    res.status(400).json({ message: "All reading parameters are required" });
    return;
  }

  try {
    const reading = new Reading({
      userId: req.user?.id,
      value: Number(value),
      meal,
      timeOfDay,
      date,
      time
    });

    await reading.save();

    res.status(201).json({
      message: "Reading added successfully",
      reading
    });
  } catch (error) {
    console.error("Add reading error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Get all glucose readings for the current user (newest first)
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const readings = await Reading.find({ userId: req.user?.id });

    if (readings.length === 0) {
      res.status(200).json({ readings: [], isMock: false });
      return;
    }

    const sorted = [...readings].sort((a, b) => {
      return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
    });

    res.status(200).json({ readings: sorted.slice(0, 100) });
  } catch (error) {
    console.error("Get readings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Get health stats summary (for Dashboard cards and Tracker stats)
router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const allReadings = await Reading.find({ userId });

    if (allReadings.length === 0) {
      res.status(200).json({
        currentGlucose: 0,
        currentStatus: "No Data",
        changeMessage: "Log readings to calculate trends",
        weeklyAverage: 0,
        weeklyStatus: "No Data",
        monthlyReadingsCount: 0,
        readingsCountMessage: "No logs registered",
        targetRange: "70-130",
        inRangePercentage: 0,
        isMock: false
      });
      return;
    }

    // Sort by date/time to find the latest clinically
    const sorted = [...allReadings].sort((a, b) => {
      return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
    });

    const currentReadingObj = sorted[0];
    const currentGlucose = currentReadingObj.value;
    
    // Status definitions
    const getStatus = (val: number): string => {
      if (val < 70) return "Low";
      if (val > 130 && val <= 180) return "Slightly High";
      if (val > 180) return "High";
      return "Normal";
    };
    
    const currentStatus = getStatus(currentGlucose);

    // Calculate glucose difference from previous reading
    let changeMessage = "Initial reading";
    if (sorted.length > 1) {
      const prevGlucose = sorted[1].value;
      const diff = currentGlucose - prevGlucose;
      if (diff > 0) {
        changeMessage = `+${diff} mg/dL from last reading`;
      } else if (diff < 0) {
        changeMessage = `${diff} mg/dL from last reading`;
      } else {
        changeMessage = "No change from last reading";
      }
    }

    // Filter readings for the current calendar week (starting Monday)
    const mondayStr = getStartOfWeekDateString();
    const weeklyReadings = allReadings.filter(r => r.date >= mondayStr);

    let weeklyAverage = 0;
    let weeklyStatus = "No Data";
    let inRangePercentage = 0;

    if (weeklyReadings.length > 0) {
      const total = weeklyReadings.reduce((sum, r) => sum + r.value, 0);
      weeklyAverage = Math.round(total / weeklyReadings.length);
      weeklyStatus = weeklyAverage >= 70 && weeklyAverage <= 130 ? "Excellent" : "Monitor";
      
      const inRangeCount = weeklyReadings.filter(r => r.value >= 70 && r.value <= 130).length;
      inRangePercentage = Math.round((inRangeCount / weeklyReadings.length) * 100);
    }

    // Monthly/Total Readings (all time)
    const monthlyReadingsCount = allReadings.length;

    res.status(200).json({
      currentGlucose,
      currentStatus,
      changeMessage,
      weeklyAverage,
      weeklyStatus,
      monthlyReadingsCount,
      readingsCountMessage: `${Math.round(allReadings.length / 7) || 1} readings per day average`,
      targetRange: "70-130",
      inRangePercentage,
      isMock: false
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Get weekly trends (Dashboard line chart)
router.get("/weekly-trends", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const mondayStr = getStartOfWeekDateString();
    
    // Fetch only current calendar week's readings
    const readings = await Reading.find({ 
      userId, 
      date: { $gte: mondayStr } 
    });

    if (readings.length === 0) {
      res.status(200).json({ weeklyTrends: [], isMock: false });
      return;
    }

    // Map database date to weekday (Mon-Sun) and group by timeOfDay
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize day map
    const trendsMap: Record<string, { morning: number[]; afternoon: number[]; evening: number[]; night: number[] }> = {
      Mon: { morning: [], afternoon: [], evening: [], night: [] },
      Tue: { morning: [], afternoon: [], evening: [], night: [] },
      Wed: { morning: [], afternoon: [], evening: [], night: [] },
      Thu: { morning: [], afternoon: [], evening: [], night: [] },
      Fri: { morning: [], afternoon: [], evening: [], night: [] },
      Sat: { morning: [], afternoon: [], evening: [], night: [] },
      Sun: { morning: [], afternoon: [], evening: [], night: [] }
    };

    readings.forEach(r => {
      try {
        const d = new Date(r.date);
        const dayName = days[d.getDay()];
        if (trendsMap[dayName]) {
          const tOfDay = r.timeOfDay.toLowerCase();
          if (tOfDay === "morning") {
            trendsMap[dayName].morning.push(r.value);
          } else if (tOfDay === "afternoon") {
            trendsMap[dayName].afternoon.push(r.value);
          } else if (tOfDay === "evening") {
            trendsMap[dayName].evening.push(r.value);
          } else if (tOfDay === "night") {
            trendsMap[dayName].night.push(r.value);
          }
        }
      } catch (e) {
        // Ignore date parsing issues
      }
    });

    const weeklyTrends = Object.keys(trendsMap).map(day => {
      const item = trendsMap[day];
      
      const morningAvg = item.morning.length > 0 
        ? Math.round(item.morning.reduce((sum, v) => sum + v, 0) / item.morning.length)
        : null;
        
      const afternoonAvg = item.afternoon.length > 0 
        ? Math.round(item.afternoon.reduce((sum, v) => sum + v, 0) / item.afternoon.length)
        : null;
        
      const eveningAvg = item.evening.length > 0 
        ? Math.round(item.evening.reduce((sum, v) => sum + v, 0) / item.evening.length)
        : null;

      const nightAvg = item.night.length > 0 
        ? Math.round(item.night.reduce((sum, v) => sum + v, 0) / item.night.length)
        : null;

      return {
        day,
        morning: morningAvg,
        afternoon: afternoonAvg,
        evening: eveningAvg,
        night: nightAvg
      };
    });

    // Make sure we output in Mon -> Sun order
    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const orderedTrends = orderedDays.map(d => weeklyTrends.find(t => t.day === d)!);

    res.status(200).json({ weeklyTrends: orderedTrends, isMock: false });
  } catch (error) {
    console.error("Get weekly trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 5. Get daily trend (Tracker area chart for today's hours)
router.get("/daily-trends", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Find readings for today (or latest date if today doesn't have readings)
    const allReadings = await Reading.find({ userId }).sort({ date: -1 });
    
    if (allReadings.length === 0) {
      res.status(200).json({ dailyTrends: [], isMock: false });
      return;
    }

    const latestDate = allReadings[0].date;
    const latestReadings = allReadings.filter(r => r.date === latestDate);

    // Group by standard slots for the chart
    // Slots: 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
    const slots = [
      { time: "6 AM", hourMin: 5, hourMax: 8, values: [] as number[] },
      { time: "9 AM", hourMin: 8, hourMax: 11, values: [] as number[] },
      { time: "12 PM", hourMin: 11, hourMax: 14, values: [] as number[] },
      { time: "3 PM", hourMin: 14, hourMax: 17, values: [] as number[] },
      { time: "6 PM", hourMin: 17, hourMax: 20, values: [] as number[] },
      { time: "9 PM", hourMin: 20, hourMax: 23, values: [] as number[] },
    ];

    latestReadings.forEach(r => {
      // Parse time. E.g. "08:30 AM" or "02:15 PM"
      try {
        const parts = r.time.split(" ");
        const timePart = parts[0];
        const ampm = parts[1]?.toLowerCase();
        
        let [hours, minutes] = timePart.split(":").map(Number);
        if (ampm === "pm" && hours !== 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;
        
        slots.forEach(slot => {
          if (hours >= slot.hourMin && hours < slot.hourMax) {
            slot.values.push(r.value);
          }
        });
      } catch (e) {
        // Skip parsing errors
      }
    });

    const dailyTrends = slots
      .map(slot => {
        const avg = slot.values.length > 0
          ? Math.round(slot.values.reduce((sum, v) => sum + v, 0) / slot.values.length)
          : null;
          
        return {
          time: slot.time,
          value: avg
        };
      })
      .filter(slot => slot.value !== null);

    res.status(200).json({ dailyTrends, date: latestDate, isMock: false });
  } catch (error) {
    console.error("Get daily trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
