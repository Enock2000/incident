
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sun, CloudRain, Wind, AlertTriangle, MapPin } from "lucide-react";

export default function ElectionDayWeatherRiskPage() {
  const weatherRisks = [
    { district: "Lusaka", province: "Lusaka", risk: "Low", condition: "Sunny", temp: "28°C", icon: <Sun className="text-yellow-500" /> },
    { district: "Kitwe", province: "Copperbelt", risk: "Medium", condition: "Heavy Rain", temp: "22°C", icon: <CloudRain className="text-blue-500" /> },
    { district: "Livingstone", province: "Southern", risk: "High", condition: "Strong Winds", temp: "30°C", icon: <Wind className="text-gray-500" /> },
    { district: "Chipata", province: "Eastern", risk: "Low", condition: "Partly Cloudy", temp: "26°C", icon: <Sun className="text-yellow-500" /> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Election Day Weather & Risk
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Weather Risk Assessment</CardTitle>
          <CardDescription>Potential weather-related disruptions for key districts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weatherRisks.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{area.icon}</div>
                  <div>
                    <p className="font-bold text-lg">{area.district}, {area.province}</p>
                    <p className="text-sm text-muted-foreground">{area.condition} - {area.temp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <AlertTriangle className={`h-5 w-5 ${area.risk === 'High' ? 'text-red-500' : area.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                   <span className="font-semibold">{area.risk} Risk</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
