import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from './Landing.module.css';

export const LandingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3500, stopOnInteraction: true })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <div className={styles.container}>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {/* Slide 1 */}
          <div className={styles.emblaSlide}>
            <div className={styles.slideContent}>
              <div className={styles.logoContainer}>
                <img src="/GBG_NoText-no_bg.png" alt="Grow Baby Grow Logo" className={styles.logo} />
              </div>
              <h1 className={styles.title}>Grow Baby Grow</h1>
              <p className={styles.subtitle}>
                Your offline-first clinical companion for proactive parenting.
              </p>
              <div className={styles.reviewBadge}>
                
                <span>Medically reviewed by experienced Doctors</span>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div className={styles.emblaSlide}>
            <div className={styles.slideContent}>
              <div className={styles.iconGroup}>
                <span className={styles.largeIcon}>📈</span>
              </div>
              <h1 className={styles.title}>Track Growth</h1>
              <p className={styles.subtitle}>
                Monitor your baby's physical and cognitive growth with milestones.
              </p>
              <div className={styles.reviewBadge}>
                
                <span>Based on AIIMS and IAP guidelines</span>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div className={styles.emblaSlide}>
            <div className={styles.slideContent}>
              <div className={styles.iconGroup}>
                <span className={styles.largeIcon}>💉</span>
              </div>
              <h1 className={styles.title}>Never Miss a Vaccine</h1>
              <p className={styles.subtitle}>
                Stay on top of the Vaccination Schedule and set reminders for next vaccine
              </p>
              <div className={styles.reviewBadge}>
                
                <span>Based on National Immunization Schedule</span>
              </div>
            </div>
          </div>

          {/* Slide 4 */}
          <div className={styles.emblaSlide}>
            <div className={styles.slideContent}>
              <div className={styles.iconGroup}>
                <span className={styles.largeIcon}>🔒</span>
              </div>
              <h1 className={styles.title}>Offline & Private</h1>
              <p className={styles.subtitle}>
                Your baby's data never leaves your device. It is Secure & private
              </p>
              <div className={styles.reviewBadge}>
                
                <span>Multilingual Support Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.dots}>
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === selectedIndex ? styles.dotSelected : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button 
          className={styles.primaryButton}
          onClick={() => navigate('/onboarding')}
        >
          Get Started
        </button>

        <div className={styles.legalLinks}>
          <button onClick={() => navigate('/privacy')} className={styles.link}>Privacy Policy</button>
          <span className={styles.dotSeparator}>•</span>
          <button onClick={() => navigate('/terms')} className={styles.link}>Terms of Service</button>
        </div>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} Grow Baby Grow. All rights reserved.
        </p>
      </div>
    </div>
  );
};
