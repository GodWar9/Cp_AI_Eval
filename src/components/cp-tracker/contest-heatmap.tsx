'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

interface Submission {
  submittedAt: string | Date;
  verdict: string;
}

interface ContestHeatmapProps {
  submissions?: Submission[];
}

export default function ContestHeatmap({ submissions = [] }: ContestHeatmapProps) {
  // Generate last 365 days
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = [];
    
    // Create a map of date string to submission count
    const counts = new Map<string, number>();
    submissions.forEach(sub => {
      const d = new Date(sub.submittedAt);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString();
      result.push({
        date: d,
        count: counts.get(key) || 0,
      });
    }
    return result;
  }, [submissions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Your coding consistency over the last year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* Scrollable container for mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
              {days.map((day, i) => {
                // Determine color intensity based on count
                let bgClass = 'bg-muted';
                if (day.count > 0) bgClass = 'bg-primary/20';
                if (day.count > 2) bgClass = 'bg-primary/40';
                if (day.count > 4) bgClass = 'bg-primary/60';
                if (day.count > 6) bgClass = 'bg-primary/80';
                if (day.count > 8) bgClass = 'bg-primary';

                return (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-sm ${bgClass} transition-colors hover:ring-2 hover:ring-ring`}
                    title={`${day.date.toDateString()}: ${day.count} submissions`}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-primary/20" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/60" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
