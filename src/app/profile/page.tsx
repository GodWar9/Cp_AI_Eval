'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

import { InitialsAvatar } from '@/components/shared/initials-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Github, Globe, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Platform forms
  const [codeforces, setCodeforces] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [atcoder, setAtcoder] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const data = await apiFetch('/profile/me');
        setProfileData(data);
        setCodeforces(data.linkedCodeforcesHandle || '');
        setLeetcode(data.linkedLeetcodeUsername || '');
        setAtcoder(data.linkedAtcoderUsername || '');
      } catch (error) {
        console.error('Failed to load full profile', error);
      }
    }
    loadProfile();
  }, [user]);

  const handleSavePlatforms = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/profile/me/platforms', {
        method: 'PATCH',
        body: JSON.stringify({ codeforces, leetcode, atcoder })
      });
      toast({ title: 'Platforms Updated', description: 'Your linked platforms have been saved.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !profileData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestCqi = profileData.cqiScores?.[0]?.score || 0;

  return (
    <div className="container py-8 mx-auto max-w-5xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:items-start">
        <InitialsAvatar name={profileData.displayName || profileData.email} className="h-32 w-32 text-4xl" />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="font-headline text-4xl font-bold">{profileData.displayName}</h1>
            <p className="text-xl text-primary">{profileData.email}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border min-w-[120px] items-center md:items-start">
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">CQI Score</span>
              <span className="text-3xl font-mono text-primary font-bold">{Math.round(latestCqi)}</span>
            </div>
            
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border min-w-[120px] items-center md:items-start">
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Linked</span>
              <div className="flex gap-2 mt-2">
                {profileData.linkedCodeforcesHandle && <Badge variant="outline" className="border-blue-500 text-blue-500">CF</Badge>}
                {profileData.linkedLeetcodeUsername && <Badge variant="outline" className="border-yellow-500 text-yellow-500">LC</Badge>}
                {profileData.linkedAtcoderUsername && <Badge variant="outline" className="border-red-500 text-red-500">AC</Badge>}
                {!profileData.linkedCodeforcesHandle && !profileData.linkedLeetcodeUsername && !profileData.linkedAtcoderUsername && (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="platforms">Linked Platforms</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platforms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Programming Platforms</CardTitle>
              <CardDescription>
                Link your handles to track your submissions and participate in the global leaderboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="codeforces" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-500" />
                    Codeforces Handle
                  </Label>
                  <Input 
                    id="codeforces" 
                    placeholder="e.g. tourist" 
                    value={codeforces}
                    onChange={(e) => setCodeforces(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leetcode" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-yellow-500" />
                    LeetCode Username
                  </Label>
                  <Input 
                    id="leetcode" 
                    placeholder="e.g. alex" 
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="atcoder" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-red-500" />
                    AtCoder Username
                  </Label>
                  <Input 
                    id="atcoder" 
                    placeholder="e.g. chokudai" 
                    value={atcoder}
                    onChange={(e) => setAtcoder(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSavePlatforms} disabled={isSaving} className="mt-4">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Handles
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional account settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
