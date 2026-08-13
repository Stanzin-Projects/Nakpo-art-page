import { Palette, Award, Users, Heart } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const defaultStats = [
  { icon: Palette, label: 'Artworks Created', value: '200+' },
  { icon: Award, label: 'Exhibitions', value: '15' },
  { icon: Users, label: 'Happy Collectors', value: '500+' },
  { icon: Heart, label: 'Years of Passion', value: '12' },
];

const defaultAbout = {
  title: 'About the Artist',
  subtitle: 'Creating meaningful connections through art',
  description:
    'With over a decade of experience in contemporary art, I create pieces that bridge the gap between traditional techniques and modern expression. My work explores themes of nature, human emotion, and the interconnectedness of all things.',
  image: 'https://images.cdn-files-a.com/uploads/7871374/2000_644a7ebe3625f_filter_645ca89d0848f.png',
  stats: [
    { value: '200+', label: 'Artworks Created' },
    { value: '15', label: 'Exhibitions' },
    { value: '500+', label: 'Happy Collectors' },
    { value: '12', label: 'Years of Passion' },
  ],
};

export function AboutSection({ siteContent }) {
  const aboutData = siteContent?.about || defaultAbout;
  const statsWithIcons = aboutData.stats.map((stat, i) => ({ ...stat, icon: defaultStats[i]?.icon || Palette }));

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start lg:items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight text-foreground">
              {aboutData.title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">{aboutData.subtitle}</p>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>{aboutData.description}</p>
              <p>
                Born and raised in Zanskar, Thangso where the total number of houses is no more than 10, I've been
                creating art for over a decade. My inspiration comes from the vibrant energy of urban life, the
                serenity of nature, and the complex emotions of human experience.
              </p>
              <p>
                I believe art should not just decorate spaces but transform them, creating environments that inspire,
                comfort, and provoke thought.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4">
              {statsWithIcons.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <p className="text-lg sm:text-xl font-medium text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <ImageWithFallback
              src={aboutData.image}
              alt="Artist"
              className="w-full aspect-[3/4] object-cover rounded-lg"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 text-center">
                <h4 className="font-medium mb-2 text-foreground">Inspiration</h4>
                <p className="text-sm text-muted-foreground">Drawing from life experiences and emotions</p>
              </div>
              <div className="p-4 text-center">
                <h4 className="font-medium mb-2 text-foreground">Creation</h4>
                <p className="text-sm text-muted-foreground">Bringing visions to life through various mediums</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
