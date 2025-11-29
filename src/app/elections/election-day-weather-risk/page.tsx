
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sun, CloudRain, Wind, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query } from "firebase/database";
import type { PollingStation } from "@/lib/types";

export default function ElectionDayWeatherRiskPage() {
  const database = useDatabase();
  const stationsQuery = useMemoFirebase(() => database ? query(ref(database, 'polling-stations')) : null, [database]);
  const { data: stations, isLoading } = useCollection<PollingStation>(stationsQuery);

  // This would ideally come from a weather API, but for now we'll simulate it
  const getWeatherForProvince = (province: string) => {
    const conditions = [
      { risk: "Low", condition: "Sunny", temp: "28°C", icon: <Sun className="text-yellow-500" /> },
      { risk: "Medium", condition: "Rain Showers", temp: "22°C", icon: <CloudRain className="text-blue-500" /> },
      { risk: "High", condition: "Strong Winds", temp: "30°C", icon: <Wind className="text-gray-500" /> },
      { risk: "Low", condition: "Partly Cloudy", temp: "26°C", icon: <Sun className="text-yellow-500" /> },
    ];
    // Simple hash to get a consistent-ish condition per province
    const index = province.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % conditions.length;
    return conditions[index];
  };

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
            {isLoading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : stations && stations.length > 0 ? (
                stations.slice(0, 5).map((station) => {
                  const weather = getWeatherForProvince(station.province);
                  return (
                     <div key={station.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{weather.icon}</div>
                        <div>
                          <p className="font-bold text-lg">{station.district}, {station.province}</p>
                          <p className="text-sm text-muted-foreground">{weather.condition} - {weather.temp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <AlertTriangle className={`h-5 w-5 ${weather.risk === 'High' ? 'text-red-500' : weather.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                         <span className="font-semibold">{weather.risk} Risk</span>
                      </div>
                    </div>
                  )
                })
            ) : (
               <p className="text-center py-10">No polling station data to assess weather risk.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
