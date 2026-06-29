import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertCircle, Phone, MapPin, Heart, Siren, AlertTriangle, Pill } from "lucide-react";
import { Badge } from "../components/ui/badge";

const symptoms = [
  { icon: AlertTriangle, title: "Severe Hypoglycemia", description: "Blood sugar below 54 mg/dL", severity: "critical" },
  { icon: AlertCircle, title: "Hyperglycemia", description: "Blood sugar above 250 mg/dL", severity: "high" },
  { icon: Heart, title: "Chest Pain", description: "Unusual chest discomfort", severity: "critical" },
  { icon: AlertCircle, title: "Confusion/Dizziness", description: "Mental confusion or extreme dizziness", severity: "high" },
];

const firstAidTips = [
  {
    title: "Low Blood Sugar (Hypoglycemia)",
    steps: [
      "Check blood sugar immediately",
      "Consume 15g of fast-acting carbs (juice, glucose tablets)",
      "Recheck after 15 minutes",
      "If still low, repeat and call for help",
    ],
  },
  {
    title: "High Blood Sugar (Hyperglycemia)",
    steps: [
      "Check blood sugar level",
      "Drink plenty of water",
      "Check for ketones if above 240 mg/dL",
      "Contact healthcare provider",
    ],
  },
  {
    title: "Severe Emergency",
    steps: [
      "Call emergency services immediately",
      "Stay calm and keep the person comfortable",
      "Monitor vital signs",
      "Do not leave the person alone",
    ],
  },
];

export function EmergencyPage() {
  const handleEmergencyCall = () => {
    window.location.href = "tel:911";
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 flex items-center gap-2">
          <Siren className="w-6 h-6 md:w-8 md:h-8" />
          Emergency Assistance
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Quick access to emergency resources and first aid information</p>
      </div>

      {/* Emergency Actions */}
      <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Phone className="w-6 h-6" />
              Emergency Services
            </CardTitle>
            <CardDescription>Call immediately for life-threatening situations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleEmergencyCall}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-16 text-lg"
            >
              <Phone className="w-6 h-6 mr-2" />
              Call 911
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Contact Doctor
            </CardTitle>
            <CardDescription>Reach your healthcare provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-16 text-lg">
              <Phone className="w-6 h-6 mr-2" />
              Call Your Doctor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Recognize Emergency Symptoms
          </CardTitle>
          <CardDescription>Call for help immediately if you experience any of these</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {symptoms.map((symptom, index) => {
              const Icon = symptom.icon;
              return (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                    symptom.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      symptom.severity === "critical" ? "bg-red-600" : "bg-orange-600"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{symptom.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                    <Badge
                      className={`mt-2 ${
                        symptom.severity === "critical"
                          ? "bg-red-600 text-white hover:bg-red-600"
                          : "bg-orange-600 text-white hover:bg-orange-600"
                      }`}
                    >
                      {symptom.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* First Aid Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-600" />
            First Aid Guidelines
          </CardTitle>
          <CardDescription>What to do while waiting for help</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {firstAidTips.map((tip, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                <ol className="space-y-2">
                  {tip.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Feature */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Nearby Hospitals (Coming Soon)
          </CardTitle>
          <CardDescription>We're working on showing nearby emergency facilities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            This feature will help you locate the nearest hospitals and emergency care centers based on your location.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          <strong>Important:</strong> This information is for guidance only. In a medical emergency, always call emergency services immediately. Do not rely solely on this app for emergency medical decisions.
        </p>
      </div>
    </div>
  );
}
