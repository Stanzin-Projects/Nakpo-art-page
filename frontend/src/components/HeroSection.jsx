import { ArrowDown, Star } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { AnimatedTextCaption } from './AnimatedTextCaption';

const defaultHero = {
  title: 'Where Art Meets Soul',
  subtitle: 'Discover unique artworks that speak to your heart',
  description: 'From abstract expressions to realistic portraits, each piece tells a story waiting to be part of yours.',
  ctaText: 'Explore Gallery',
  backgroundImage: 'https://images.cdn-files-a.com/uploads/7871374/2000_644d45ca0954b.png',
};

export function HeroSection({ siteContent }) {
  const heroData = siteContent?.hero || defaultHero;

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden scroll-mt-16 pt-16">
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span>Original Artwork & Prints</span>
          </div>

          <AnimatedTextCaption />

          <p className="text-base sm:text-lg text-muted-foreground max-w-md">
            {heroData.subtitle}. {heroData.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#gallery"
              className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {heroData.ctaText}
              <span className="ml-2">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center h-11 px-8 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              Commission Art
            </a>
          </div>
        </div>

        <div className="relative">
          <ImageWithFallback
            src={heroData.backgroundImage}
            alt="Featured Artwork by Lopsang"
            className="w-full aspect-[3/4] object-cover rounded-2xl"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ArrowDown className="h-6 w-6 text-muted-foreground animate-bounce" />
      </div>
    </section>
  );
}
