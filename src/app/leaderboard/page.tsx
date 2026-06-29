'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { InitialsAvatar } from '@/components/shared/initials-avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowUpRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatarUrl: string | null;
  score: number;
  breakdown: any;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await apiFetch('/leaderboard?limit=50');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground mt-2">Ranked by Code Quality Index (CQI)</p>
        </div>
        <Trophy className="h-12 w-12 text-yellow-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">Rank</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead className="text-right">CQI Score</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No developers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="text-center font-bold">
                        {user.rank === 1 && <span className="text-yellow-500 text-lg">🥇</span>}
                        {user.rank === 2 && <span className="text-gray-400 text-lg">🥈</span>}
                        {user.rank === 3 && <span className="text-amber-600 text-lg">🥉</span>}
                        {user.rank > 3 && `#${user.rank}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={user.name} />
                          <div>
                            <Link href={`/profile/${user.id}`} className="font-medium hover:underline hover:text-primary transition-colors">
                              {user.name}
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        {Math.round(user.score).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/profile/${user.id}`}>
                          <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                            Profile <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Badge>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
