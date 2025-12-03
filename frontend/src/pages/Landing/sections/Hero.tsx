import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';

// Placeholder images - replace these with actual image URLs
// You can add images to public/images/ folder and reference them as '/images/image1.jpg'
const carouselImages = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80', // Education/Students
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80', // Team/Community
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80', // Networking
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80', // Graduation
];

export default function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="text-acces-black py-20 px-5 text-center min-h-[70vh] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1.5s] ease-in-out"
            style={{
              backgroundImage: `url(${image})`,
              opacity: index === currentIndex ? 1 : 0,
              transform: `scale(${index === currentIndex ? 1.05 : 1})`
            }}
          />
        ))}
      </div>

      {/* Dark Overlay for better text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(135deg, rgba(0, 48, 73, 0.75) 0%, rgba(193, 18, 31, 0.65) 100%)`
        }}
      />

      {/* Top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-[3]"
        style={{
          background: `linear-gradient(90deg, ${colors.red} 0%, ${colors.blue} 100%)`
        }}
      />

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-[2]">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full border-0 cursor-pointer transition-all duration-300 p-0 ${
              index === currentIndex ? 'w-8 bg-acces-beige' : 'w-2.5 bg-acces-beige/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="max-w-4xl w-full z-[2] relative">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight text-acces-beige drop-shadow-lg">
          ACCES Kenya Alumni
        </h1>

        <p className="text-base sm:text-lg md:text-xl mt-2.5 text-acces-beige font-semibold leading-relaxed drop-shadow-md italic border-l-4 border-acces-red pl-4 my-4 mx-auto max-w-2xl">
          Alleviating poverty through education
        </p>

        <p className="text-lg sm:text-xl md:text-2xl mt-5 text-acces-beige font-normal leading-relaxed drop-shadow-md">
          Track. Connect. Engage.
        </p>

        <p className="text-sm sm:text-base md:text-lg mt-4 text-acces-beige/95 max-w-2xl mx-auto mt-4 drop-shadow-sm">
          Join over 5,000 ACCES Kenya alumni in staying connected, informed, and engaged with our community.
        </p>

        {!user ? (
          <div className="mt-10 flex flex-wrap gap-5 justify-center">
            <Link
              to="/register"
              className="inline-block bg-acces-blue text-acces-beige px-8 py-3.5 font-semibold rounded-lg no-underline transition-all duration-300 shadow-lg text-base border-2 border-acces-beige hover:-translate-y-0.5 hover:shadow-xl hover:bg-acces-red"
            >
              Register Now
            </Link>
            
            <Link
              to="/login"
              className="inline-block bg-acces-beige/20 text-acces-beige px-8 py-3.5 font-semibold rounded-lg no-underline border-2 border-acces-beige transition-all duration-300 text-base backdrop-blur-sm hover:bg-acces-beige hover:text-acces-blue"
            >
              Login
            </Link>
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-5 justify-center">
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
              className="inline-block bg-acces-blue text-acces-beige px-8 py-3.5 font-semibold rounded-lg transition-all duration-300 shadow-lg text-base border-2 border-acces-beige hover:-translate-y-0.5 hover:shadow-xl hover:bg-acces-red cursor-pointer"
            >
              Go to Dashboard
            </button>
            <Link
              to="/profile"
              className="inline-block bg-acces-beige/20 text-acces-beige px-8 py-3.5 font-semibold rounded-lg no-underline border-2 border-acces-beige transition-all duration-300 text-base backdrop-blur-sm hover:bg-acces-beige hover:text-acces-blue"
            >
              View Profile
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
