import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { ArrowRight, Gift, Sparkles, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Black Friday Deals",
    description: "Huge savings on premium pet products - Up to 70% off!",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&q=80&w=1920",
    link: "/black-friday",
    theme: "black-friday",
    badge: "Limited Time",
    countdown: true
  },
  {
    id: 2,
    title: "Personalized Pet Products",
    description: "Discover products tailored to your dog's unique needs and preferences",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1920&q=80",
    link: "/categories",
    theme: "default"
  },
  // ... other existing slides
];

const BlackFridayCountdown = () => {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const blackFriday = new Date('2024-11-29T00:00:00');
      const now = new Date();
      const difference = blackFriday.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex space-x-4 text-white mt-4">
      <div className="text-center">
        <div className="bg-black/30 rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs">Days</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-black/30 rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs">Hours</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-black/30 rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs">Minutes</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-black/30 rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs">Seconds</div>
        </div>
      </div>
    </div>
  );
};

const HeroSlideshow: React.FC = () => {
  return (
    <div className="relative h-[600px] bg-gray-900">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} bg-white"></span>`;
          },
        }}
        navigation
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="h-full">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative z-20 h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    {slide.badge && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                        slide.theme === 'black-friday' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {slide.theme === 'black-friday' ? <Tag className="w-4 h-4 mr-1" /> : <Gift className="w-4 h-4 mr-1" />}
                        {slide.badge}
                      </span>
                    )}
                    <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${
                      slide.theme === 'black-friday' ? 'animate-pulse' : ''
                    }`}>
                      {slide.title}
                    </h2>
                    <p className="text-xl text-gray-200 mb-8">
                      {slide.description}
                    </p>
                    {slide.countdown && <BlackFridayCountdown />}
                    <Link
                      to={slide.link}
                      className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${
                        slide.theme === 'black-friday'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {slide.theme === 'black-friday' ? 'Shop Black Friday Deals' : 'Explore Now'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlideshow;