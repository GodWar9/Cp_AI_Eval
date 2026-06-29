import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code2, Trophy, BrainCircuit, Activity, ArrowRight, Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]" />
        
        <div className="container relative mx-auto max-w-6xl px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              Now with AI Chatbot Memory 🧠
            </Badge>
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              GO <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ALL IN</span> ON YOUR CODE
            </h1>
            <p className="mx-auto lg:mx-0 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Track your competitive programming journey across Codeforces, LeetCode, and AtCoder. 
              Get AI-powered feedback, climb the global leaderboard, and master algorithms faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:scale-105 transition-transform" asChild>
                <Link href="/signup">Start Tracking Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/leaderboard">View Leaderboard</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-blue-500" /> Codeforces</div>
              <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-yellow-500" /> LeetCode</div>
              <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-red-500" /> AtCoder</div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            {/* CSS-only Abstract Visual */}
            <div className="relative aspect-square w-full max-w-[500px] mx-auto rounded-2xl border bg-card/50 backdrop-blur-sm p-8 shadow-2xl overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
              
              <div className="space-y-4 z-10">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-2 mt-6">
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/20 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-muted-foreground/20 animate-pulse delay-75" />
                  <div className="h-4 w-5/6 rounded bg-muted-foreground/20 animate-pulse delay-150" />
                </div>
              </div>

              <div className="z-10 p-4 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-md">
                <p className="font-mono text-sm text-primary">System.out.println("AC");</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto max-w-6xl px-4 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-headline text-3xl font-bold sm:text-4xl">Everything you need to reach Candidate Master</h2>
          <p className="text-muted-foreground">Stop jumping between platforms. ALL IN brings your stats, live contests, and AI mentoring into one unified dashboard.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Activity className="h-8 w-8 text-blue-500" />}
            title="Unified CP Tracker"
            description="View your Codeforces, LeetCode, and AtCoder submissions in one beautiful heatmap. Track your consistency effortlessly."
          />
          <FeatureCard 
            icon={<Trophy className="h-8 w-8 text-yellow-500" />}
            title="Global Leaderboard"
            description="Compete with peers using our custom Code Quality Index (CQI) algorithm that rewards consistency, volume, and contest ratings."
          />
          <FeatureCard 
            icon={<BrainCircuit className="h-8 w-8 text-emerald-500" />}
            title="Context-Aware AI Mentor"
            description="Chat with an AI that knows your coding history. Upload your code files and get instant, personalized debugging help."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 mt-auto">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">ALL IN</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Built for the GDG Hackathon. Powered by Next.js, Node.js, and Google AI.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/netalgupta/All-In_CodeEvaluator_GDG" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group rounded-2xl border bg-card p-8 transition-all hover:scale-[1.02] hover:shadow-xl hover:border-primary/50 flex flex-col gap-4">
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="font-headline text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
