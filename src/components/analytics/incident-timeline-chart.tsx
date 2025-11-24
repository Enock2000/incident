
'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import type { Incident } from '@/lib/types';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';

const chartConfig = {
  incidents: {
    label: 'Incidents',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function IncidentTimelineChart({ incidents }: { incidents: Incident[] }) {
  const chartData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyCounts: Record<string, number> = {};

    // Initialize the last 30 days with 0 incidents
    for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'MMM d');
        dailyCounts[formattedDate] = 0;
    }

    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.dateReported);
      if (incidentDate >= thirtyDaysAgo) {
        const formattedDate = format(incidentDate, 'MMM d');
        if (dailyCounts.hasOwnProperty(formattedDate)) {
            dailyCounts[formattedDate] += 1;
        }
      }
    });
    
    return Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, incidents: count }))
        .reverse(); // To show earliest date first
  }, [incidents]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="incidents" fill="var(--color-incidents)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

    