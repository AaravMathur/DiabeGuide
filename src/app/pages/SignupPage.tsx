import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Activity, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    
    try {
      const data = await api.auth.registerOtp(username, email, password);
      toast.success("OTP sent to your email!");
      if (data.devOtp) {
        toast.info(`[Dev Helper] Registration OTP: ${data.devOtp}`, { duration: 10000 });
      }
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to register details");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await api.auth.verifyOtp(email, otp);
      toast.success("Account verified successfully!");
      setStep("success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjOTNjNWZkIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/90 shadow-2xl border-blue-100">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              {step === "success" ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Activity className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl">
              {step === "details" && "Create Account"}
              {step === "otp" && "Verify Email"}
              {step === "success" && "Success!"}
            </CardTitle>
            <CardDescription>
              {step === "details" && "Join DiabeGuide and start managing your health"}
              {step === "otp" && "Enter the verification code sent to your email"}
              {step === "success" && "Your account has been created successfully"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === "details" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Send OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block">Enter 6-digit code</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                onClick={handleVerifyOTP}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={otp.length !== 6}
              >
                Verify OTP
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("details")}>
                Go Back
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          )}

          {step === "details" && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
