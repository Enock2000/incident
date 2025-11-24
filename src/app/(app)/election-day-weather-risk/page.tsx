
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CloudSun, CloudRain, Sun, Wind, Map } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zambiaProvinces } from "@/lib/zambia-locations";

const weatherData = [
    { province: 'Lusaka', temp: '25°C', condition: 'Sunny', wind: '10 km/h', risk: 'Low' },
    { province: 'Copperbelt', temp: '22°C', condition: 'Cloudy', wind: '15 km/h', risk: 'Low' },
    { province: 'Eastern', temp: '28°C', condition: 'Sunny', wind: '5 km/h', risk: 'Low' },
    { province: 'Northern', temp: '18°C', condition: 'Rain', wind: '25 km/h', risk: 'High' },
    { province: 'Southern', temp: '30°C', condition: 'Hot', wind: '8 km/h', risk: 'Medium' },
    { province: 'Western', temp: '32°C', condition: 'Hot', wind: '12 km/h', risk: 'Medium' },
];

const getWeatherIcon = (condition: string) => {
    switch (condition) {
        case 'Sunny': return <Sun className="h-5 w-5 text-yellow-500" />;
        case 'Cloudy': return <CloudSun className="h-5 w-5 text-gray-500" />;
        case 'Rain': return <CloudRain className="h-5 w-5 text-blue-500" />;
        case 'Hot': return <Sun className="h-5 w-5 text-orange-500" />;
        default: return <CloudSun className="h-5 w-5" />;
    }
};

export default function ElectionDayWeatherRiskPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
            Election Day Weather & Risk
        </h1>
        <div className="w-[180px]">
            <Select defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Filter by province..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {zambiaProvinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>National Outlook</CardTitle>
                <CardDescription>Overall weather conditions are favorable with isolated showers in the north.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around items-center">
                    <div className="text-center">
                        <Sun className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                        <p>Mainly Sunny</p>
                    </div>
                    <div className="text-center">
                        <CloudRain className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p>Isolated Rain (North)</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">26°C</p>
                        <p>Avg. Temp</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Risk Hotspots</CardTitle>
                <CardDescription>Provinces with weather conditions that may impact voting.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li className="flex justify-between"><span>Northern Province</span> <Badge variant="destructive">High Risk (Rain)</Badge></li>
                    <li className="flex justify-between"><span>Western Province</span> <Badge variant="secondary">Medium Risk (Heat)</Badge></li>
                </ul>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Provincial Forecast</CardTitle>
            <CardDescription>Weather forecast and risk assessment for each province.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Province</TableHead>
                        <TableHead>Temperature</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Wind</TableHead>
                        <TableHead>Impact Risk</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weatherData.map((data) => (
                        <TableRow key={data.province}>
                            <TableCell className="font-medium">{data.province}</TableCell>
                            <TableCell>{data.temp}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getWeatherIcon(data.condition)}
                                    {data.condition}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Wind className="h-4 w-4 text-muted-foreground" />
                                    {data.wind}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={data.risk === 'High' ? 'destructive' : data.risk === 'Medium' ? 'secondary' : 'default'}>
                                    {data.risk}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
