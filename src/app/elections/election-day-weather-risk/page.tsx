'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { PollingStation } from "@/lib/types";
import { useEffect, useState } from "react";

const WEATHER_API_KEY = '48ede7dd937a45dc978161013253011';

interface WeatherData {
  location: string;
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export default function ElectionDayWeatherRiskPage() {
  const database = useDatabase();
  const stationsRef = useMemoFirebase(() => database ? ref(database, 'polling-stations') : null, [database]);
  const { data: stations, isLoading } = useCollection<PollingStation>(stationsRef);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    if (!stations || stations.length === 0) return;

    const fetchWeather = async () => {
      setLoadingWeather(true);
      const weatherMap: Record<string, WeatherData> = {};

      // Get unique locations (province/district combinations)
      const uniqueLocations = Array.from(
        new Set(stations.map(s => `${s.province}, ${s.district}`))
      );

      try {
        for (const location of uniqueLocations) {
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=no`
          );

          if (response.ok) {
            const data = await response.json();
            const condition = data.current.condition.text;
            const temp = data.current.temp_c;
            const humidity = data.current.humidity;
            const wind = data.current.wind_kph;

            // Determine risk level based on conditions
            let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
            if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm') || wind > 30) {
              riskLevel = 'High';
            } else if (temp > 35 || humidity > 80 || wind > 20) {
              riskLevel = 'Medium';
            }

            weatherMap[location] = {
              location,
              condition,
              temperature: temp,
              humidity,
              windSpeed: wind,
              riskLevel
            };
          }
        }
        setWeatherData(weatherMap);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [stations]);

  if (isLoading || loadingWeather) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stationsWithWeather = stations?.map(station => ({
    ...station,
    weather: weatherData[`${station.province}, ${station.district}`]
  })) || [];

  const highRiskCount = stationsWithWeather.filter(s => s.weather?.riskLevel === 'High').length;
  const mediumRiskCount = stationsWithWeather.filter(s => s.weather?.riskLevel === 'Medium').length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Election Day Weather & Risk Assessment
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk Areas</CardTitle>
            <Cloud className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediumRiskCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stations Monitored</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stationsWithWeather.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weather Conditions by Station</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stationsWithWeather.map(station => (
              <div key={station.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{station.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {station.province}, {station.district}
                  </p>
                  {station.weather && (
                    <p className="text-sm mt-1">
                      {station.weather.condition} • {station.weather.temperature}°C •
                      Wind: {station.weather.windSpeed} km/h • Humidity: {station.weather.humidity}%
                    </p>
                  )}
                </div>
                {station.weather && (
                  <Badge variant={
                    station.weather.riskLevel === 'High' ? 'destructive' :
                      station.weather.riskLevel === 'Medium' ? 'default' :
                        'secondary'
                  }>
                    {station.weather.riskLevel} Risk
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
