import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Cloud, Shield, TrendingUp, Newspaper, History } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              Google Chrome AI Challenge 2025
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Legislator Lens
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform civic engagement with{' '}
              <span className="text-primary font-semibold">hybrid AI</span> - combining on-device
              Chrome AI with powerful cloud intelligence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/test/cloud-ai">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  See Demo
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">30+</div>
                <div className="text-sm text-muted-foreground">News Sources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">90%</div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Privacy First</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hybrid AI Explanation */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Power of Hybrid AI
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Best of both worlds: Chrome's on-device AI for privacy + Cloud AI for deep insights
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Chrome AI */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Chrome AI (On-Device)</CardTitle>
                  </div>
                  <CardDescription>Fast, private, offline-capable</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">100% Private</div>
                      <div className="text-sm text-muted-foreground">
                        Your data never leaves your device
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Instant Responses</div>
                      <div className="text-sm text-muted-foreground">
                        No network latency, works offline
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Zero Cost</div>
                      <div className="text-sm text-muted-foreground">
                        No API calls, no bills
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cloud AI */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Cloud className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Cloud AI</CardTitle>
                  </div>
                  <CardDescription>Deep analysis, real-time data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <History className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Historical Context</div>
                      <div className="text-sm text-muted-foreground">
                        Gemini AI finds similar bills from 15+ years
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Newspaper className="h-5 w-5 text-teal-500 mt-0.5" />
                    <div>
                      <div className="font-medium">News Correlation</div>
                      <div className="text-sm text-muted-foreground">
                        30+ articles from Guardian, Google News, NewsAPI
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Smart Caching</div>
                      <div className="text-sm text-muted-foreground">
                        90% cost reduction with intelligent caching
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                AI-Powered Legislative Analysis
              </h2>
              <p className="text-xl text-muted-foreground">
                Understand bills faster with intelligent insights
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Bill Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chrome AI generates instant summaries, key points, and TL;DR versions - all
                    on-device and private
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gemini AI finds similar bills from congressional history, showing trends and
                    outcomes to predict success
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    News Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Multi-source news aggregation with timeline visualization and sentiment
                    analysis from trusted outlets
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Civic Engagement?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands using AI to stay informed about legislation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/test/cloud-ai">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Try Demo First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
