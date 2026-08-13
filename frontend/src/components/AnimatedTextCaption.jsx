import { useState, useEffect } from 'react';

const DEFAULT_CAPTIONS = [
  'Bringing Imagination to Paper',
  'Lines That Speak Stories',
  'Every Sketch Has a Soul',
  'Art in Every Stroke',
  'Shadows and Light in Harmony',
];

export function AnimatedTextCaption({ className = '', textSize = 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl', animationDuration = 4000, customCaptions }) {
  const captions = customCaptions || DEFAULT_CAPTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      const t = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % captions.length);
        setTimeout(() => setIsVisible(true), 100);
      }, 400);
      return () => clearTimeout(t);
    }, animationDuration);
    return () => clearInterval(interval);
  }, [captions.length, animationDuration]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <h1
        className={`font-medium leading-tight transition-all duration-500 ${textSize} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {captions[currentIndex]}
      </h1>
      <div
        className={`h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-4 transition-all duration-700 ${
          isVisible ? 'w-16 opacity-60' : 'w-0 opacity-0'
        }`}
      />
    </div>
  );
}
