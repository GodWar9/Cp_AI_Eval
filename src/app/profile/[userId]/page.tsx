'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { InitialsAvatar } from '@/components/shared/initials-avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import ContestHeatmap from '@/components/cp-tracker/contest-heatmap';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, subsData] = await Promise.all([
          apiFetch(`/profile/${userId}`),
          apiFetch(`/profile/${userId}/submissions`)
        ]);
        setProfile(profileData);
        setSubmissions(subsData);
      } catch (error) {
        console.error('Failed to load public profile', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">This profile doesn't exist or is private.</p>
      </div>
    );
  }

  const latestCqi = profile.cqiScores?.[0]?.score || 0;

  return (
    <div className="container py-8 mx-auto max-w-5xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:items-start bg-card p-8 rounded-xl border">
        <InitialsAvatar name={profile.displayName} className="h-24 w-24 text-3xl" />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="font-headline text-3xl font-bold">{profile.displayName}</h1>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">CQI Score</span>
              <span className="text-2xl font-mono text-primary font-bold">{Math.round(latestCqi)}</span>
            </div>
            
            <div className="flex flex-col pl-4 border-l">
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Linked Platforms</span>
              <div className="flex gap-2">
                {profile.linkedCodeforcesHandle && <Badge variant="outline" className="border-blue-500 text-blue-500">CF: {profile.linkedCodeforcesHandle}</Badge>}
                {profile.linkedLeetcodeUsername && <Badge variant="outline" className="border-yellow-500 text-yellow-500">LC: {profile.linkedLeetcodeUsername}</Badge>}
                {profile.linkedAtcoderUsername && <Badge variant="outline" className="border-red-500 text-red-500">AC: {profile.linkedAtcoderUsername}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">Activity Heatmap</h2>
        <ContestHeatmap submissions={submissions} />
      </div>
    </div>
  );
}
