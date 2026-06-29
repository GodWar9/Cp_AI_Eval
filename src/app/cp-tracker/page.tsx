'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ContestHeatmap from '@/components/cp-tracker/contest-heatmap';
import ContestTimeline from '@/components/cp-tracker/contest-timeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, Code2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CPTrackerPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/profile/${user.id}/submissions`);
        setSubmissions(res);
      } catch (error) {
        console.error('Failed to load submissions', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-headline text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view your CP Tracker.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tight">CP Tracker</h1>
        <p className="text-muted-foreground mt-2">Monitor your progress across Codeforces, LeetCode, and AtCoder.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <ContestHeatmap submissions={submissions} />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest activity across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No submissions found.</p>
                    <p className="text-sm text-muted-foreground mt-1">Link your accounts in your profile to start tracking.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/profile">Link Platforms</Link>
                    </Button>
                  </div>
                ) : (
                  submissions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          sub.platform === 'leetcode' ? 'bg-yellow-500/10 text-yellow-500' :
                          sub.platform === 'codeforces' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          <Code2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{sub.problemName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{sub.platform}</span>
                            <span>•</span>
                            <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={sub.verdict === 'Accepted' || sub.verdict === 'OK' || sub.verdict === 'AC' ? 'default' : 'destructive'} 
                             className={sub.verdict === 'Accepted' || sub.verdict === 'OK' || sub.verdict === 'AC' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                        {sub.verdict}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <ContestTimeline />
        </div>
      </div>
    </div>
  );
}
