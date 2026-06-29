'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, ExternalLink, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';

interface Contest {
  id: string;
  name: string;
  platform: 'codeforces' | 'leetcode' | 'atcoder';
  status: 'upcoming' | 'live' | 'ended';
  startTime: string;
  url: string;
}

export default function ContestTimeline() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    async function loadContests() {
      try {
        const data = await apiFetch('/contests');
        setContests(data);
      } catch (error) {
        console.error('Failed to load contests', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadContests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for WebSocket updates to contest statuses
    socket.on('contest:update', (updatedContest: Contest) => {
      setContests(prev => {
        const existing = prev.findIndex(c => c.id === updatedContest.id);
        if (existing >= 0) {
          const newContests = [...prev];
          newContests[existing] = updatedContest;
          return newContests;
        } else {
          return [updatedContest, ...prev].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        }
      });
    });

    return () => {
      socket.off('contest:update');
    };
  }, [socket]);

  // Filter out older ended contests for the sidebar
  const displayContests = contests
    .filter(c => c.status !== 'ended' || new Date(c.startTime).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000)
    .slice(0, 10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Contests</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Contests</CardTitle>
          {isConnected && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live updates active" />}
        </div>
        <CardDescription>Live schedule from all platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayContests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming contests found.</p>
          ) : (
            displayContests.map((contest, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    contest.status === 'live' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 
                    contest.status === 'upcoming' ? 'border-primary bg-primary/10 text-primary' : 
                    'border-muted bg-muted text-muted-foreground'
                  }`}>
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  {i !== displayContests.length - 1 && (
                    <div className="w-px h-full bg-border my-2" />
                  )}
                </div>
                
                <div className="flex flex-col gap-2 pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight">{contest.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm capitalize text-muted-foreground">{contest.platform}</span>
                        {contest.status === 'live' && (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">LIVE</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {new Date(contest.startTime).toLocaleString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={contest.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}