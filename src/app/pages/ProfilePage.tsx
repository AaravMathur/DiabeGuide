import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User as UserIcon, Mail, Phone, Calendar, Weight, Activity, Heart, Shield, Download, Edit2, Camera } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("+1 234 567 8900");
  const [age, setAge] = useState("45");
  const [weight, setWeight] = useState("75");
  const [diabetesType, setDiabetesType] = useState("type2");
  const [emergencyContact, setEmergencyContact] = useState("+1 234 567 8901");
  const [healthScore, setHealthScore] = useState(85);
  const [memberSince, setMemberSince] = useState("January 2026");
  const [avatar, setAvatar] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Image size must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Fetch current profile details on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.auth.getMe();
        if (data.user) {
          const u = data.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setAge(String(u.age || ""));
          setWeight(String(u.weight || ""));
          setDiabetesType(u.diabetesType || "type2");
          setEmergencyContact(u.emergencyContact || "");
          setHealthScore(u.healthScore || 85);
          setAvatar(u.avatar || "");
          
          if (u.createdAt) {
            const dateStr = new Date(u.createdAt).toLocaleDateString([], {
              year: "numeric",
              month: "long"
            });
            setMemberSince(dateStr);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    loadProfile();
  }, []);

  // 2. Save edited profile details
  const handleSave = async () => {
    try {
      await api.auth.updateProfile({
        name,
        phone,
        age: Number(age),
        weight: Number(weight),
        diabetesType,
        emergencyContact,
        avatar
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile details");
    }
  };

  const handleExportReports = () => {
    toast.success("Reports exported successfully!");
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getHealthScoreText = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Attention";
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={
            isEditing
              ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              : ""
          }
        >
          {isEditing ? "Save Changes" : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-32 h-32 relative group overflow-hidden rounded-full border border-gray-200">
                {avatar && <AvatarImage src={avatar} className="object-cover w-full h-full" />}
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-4xl">
                  {name ? getInitials(name) : "JD"}
                </AvatarFallback>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200">
                    <Camera className="w-8 h-8" />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </Avatar>
            </div>
            <CardTitle>{name || "John Doe"}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">{memberSince}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Heart className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Glucose Target Range</p>
                  <p className="font-semibold text-gray-900">70 - 130 mg/dL</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="font-semibold text-gray-900">{getHealthScoreText(healthScore)} ({healthScore})</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={true} // Email is immutable as user login identifier
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diabetes">Diabetes Type</Label>
                <Select value={diabetesType} onValueChange={setDiabetesType} disabled={!isEditing}>
                  <SelectTrigger id="diabetes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type1">Type 1</SelectItem>
                    <SelectItem value="type2">Type 2</SelectItem>
                    <SelectItem value="prediabetes">Prediabetes</SelectItem>
                    <SelectItem value="gestational">Gestational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="emergency" className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                Emergency Contact
              </Label>
              <Input
                id="emergency"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                disabled={!isEditing}
                placeholder="+1 234 567 8901"
              />
              <p className="text-xs text-gray-500">
                This contact will be notified in case of emergency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your health reports and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportReports} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Reports as PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
