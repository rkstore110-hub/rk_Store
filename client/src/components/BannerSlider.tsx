import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import axios, { AxiosResponse } from "axios";

const API_URL: string = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const SWIPER_MODULES = [Autoplay, Pagination, EffectFade, Navigation];

interface Banner {
  _id: string;
  BannerUrl: string;
  BannerTitle?: string;
  BannerDescription?: string;
  BannerLink?: string;
}

interface BannerApiResponse {
  banners: Banner[];
  success?: boolean;
  message?: string;
}

interface BannerSliderProps {
  className?: string;
  headerHeight?: number;
  autoplayDelay?: number;
  showPlayPause?: boolean;
}

const BannerSkeleton: React.FC<{ className?: string; headerHeight?: number }> = ({ className }) => (
  <div className={`w-full relative ${className || ""} pt-16`}>
    <div className="w-full relative overflow-hidden bg-amber-50">
      <Skeleton className="w-full h-full bg-gradient-to-br from-amber-100 to-stone-100" style={{ aspectRatio: "16/9", maxHeight: "550px" }} />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="w-2 h-2 rounded-full bg-white/60" />
        ))}
      </div>
    </div>
  </div>
);

const BannerError: React.FC<{ className?: string; headerHeight?: number; onRetry?: () => void }> = ({ className, onRetry }) => (
  <div className={`w-full relative ${className || ""} pt-16`}>
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="p-8 text-center bg-gradient-to-br from-amber-50/50 to-stone-50/70 border-amber-100 shadow-inner">
        <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-stone-800 mb-2">Unable to load banners</h3>
        <p className="text-stone-600 mb-4">Please check your connection and try again</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-amber-700 text-white hover:bg-amber-800 rounded-lg">
            Try Again
          </Button>
        )}
      </Card>
    </div>
  </div>
);

const BannerSlider: React.FC<BannerSliderProps> = ({
  className = "",
  headerHeight = 80,
  autoplayDelay = 4000,
  showPlayPause = true,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const swiperInstanceRef = useRef<SwiperType | null>(null);
  const aliveRef = useRef(true);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res: AxiosResponse<BannerApiResponse> = await axios.get(`${API_URL}/api/getbanners`, {
        withCredentials: true,
        timeout: 10000,
      });
      if (res.data.success !== false && Array.isArray(res.data.banners)) {
        if (aliveRef.current) setBanners(res.data.banners);
      } else {
        throw new Error(res.data.message || "Failed to fetch banners");
      }
    } catch (err) {
      if (aliveRef.current) {
        setError(true);
        setBanners([]);
      }
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchBanners();
    return () => {
      aliveRef.current = false;
      const s = swiperInstanceRef.current;
      if (s) {
        s.autoplay?.stop?.();
        s.destroy(true, false);
        swiperInstanceRef.current = null;
      }
    };
  }, [fetchBanners]);

  const togglePlayPause = useCallback(() => {
    const s = swiperInstanceRef.current;
    if (!s) return;
    if (isPlaying) s.autoplay?.stop?.();
    else s.autoplay?.start?.();
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget as HTMLImageElement;
    target.src = "/fallback-banner.jpg";
    target.onerror = null;
  }, []);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperInstanceRef.current = swiper;
    if (document.visibilityState === "hidden") {
      swiper.autoplay?.stop?.();
      setIsPlaying(false);
    }
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      const s = swiperInstanceRef.current;
      if (!s) return;
      if (document.visibilityState === "hidden") {
        s.autoplay?.stop?.();
        setIsPlaying(false);
      } else if (!PREFERS_REDUCED_MOTION && banners.length > 1) {
        s.autoplay?.start?.();
        setIsPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [banners.length]);

  const swiperEffect = PREFERS_REDUCED_MOTION ? undefined : ("fade" as any);
  const swiperFadeEffect = PREFERS_REDUCED_MOTION ? undefined : { crossFade: true };
  const swiperAutoplay =
    !PREFERS_REDUCED_MOTION && banners.length > 1
      ? { delay: Math.max(2000, autoplayDelay), disableOnInteraction: false, pauseOnMouseEnter: true }
      : false;
  const swiperNavigation = banners.length > 1 ? { prevEl: ".swiper-button-prev-custom", nextEl: ".swiper-button-next-custom" } : false;

  if (loading) return <BannerSkeleton className={className} headerHeight={headerHeight} />;
  if (error) return <BannerError className={className} headerHeight={headerHeight} onRetry={fetchBanners} />;
  if (!banners.length) return null;

  return (
    <motion.section
      className={`w-full relative ${className} pt-16`}
      initial={PREFERS_REDUCED_MOTION ? undefined : { opacity: 0, y: 12 }}
      animate={PREFERS_REDUCED_MOTION ? undefined : { opacity: 1, y: 0 }}
      transition={PREFERS_REDUCED_MOTION ? undefined : { duration: 0.25 }}
    >
      {showPlayPause && (
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-amber-800/80 bg-amber-50/80 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-200 shadow">
            <span className="font-medium text-amber-900">{String(currentSlide + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(banners.length).padStart(2, "0")}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePlayPause}
            className="hidden md:flex items-center space-x-2 bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 rounded-full"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
        </div>
      )}

      <div className="w-full relative overflow-hidden bg-amber-50">
        <Swiper
          modules={SWIPER_MODULES}
          spaceBetween={0}
          slidesPerView={1}
          loop={banners.length > 1}
          effect={swiperEffect}
          fadeEffect={swiperFadeEffect as any}
          speed={450}
          autoplay={swiperAutoplay as any}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet !bg-amber-200 !w-2 !h-2 !rounded-full opacity-80",
            bulletActiveClass: "swiper-pagination-bullet-active !bg-amber-700 !w-8 !h-2 !rounded-full shadow",
            renderBullet: (index: number, className: string): string =>
              `<span class="${className} cursor-pointer hover:!bg-amber-400" aria-label="Go to slide ${index + 1}"></span>`,
          }}
          navigation={swiperNavigation as any}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          className="w-full group banner-slider"
          style={{ aspectRatio: "16/9" }}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner._id} className="relative">
              <div
                className="relative w-full h-full overflow-hidden cursor-pointer banner-slide"
                onClick={() =>
                  banner.BannerLink && window.open(banner.BannerLink, "_blank", "noopener,noreferrer")
                }
              >
                <img
                  src={banner.BannerUrl}
                  alt={banner.BannerTitle || `Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-[5000ms] hover:scale-105 rounded-xl border border-amber-100 shadow-xs"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                  width={1920}
                  height={1080}
                  onError={handleImageError}
                  style={{ objectPosition: "center center", minHeight: "100%", minWidth: "100%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/10 to-transparent pointer-events-none" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {banners.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="swiper-button-prev-custom absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/70 border border-amber-100 text-amber-700 hover:bg-amber-200 transition-all duration-200 opacity-80 hover:opacity-100 rounded-full"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-7 h-7" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="swiper-button-next-custom absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/70 border border-amber-100 text-amber-700 hover:bg-amber-200 transition-all duration-200 opacity-80 hover:opacity-100 rounded-full"
              aria-label="Next slide"
            >
              <ChevronRight className="w-7 h-7" />
            </Button>
          </>
        )}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .banner-slider { aspect-ratio: 16/9; max-height: 550px; }
            .banner-slider .swiper-pagination { bottom: 20px !important; z-index: 10; }
            .banner-slider .swiper-pagination-bullet { margin: 0 4px !important; transition: all 0.3s; }
            .banner-slider .swiper-pagination-bullet:hover { transform: scale(1.13) !important; background: #eab308 !important; }
            .banner-slider .swiper-pagination-bullet-active { opacity: 1 !important; }
            .banner-slide { position: relative; aspect-ratio: 16/9; }
            .banner-slider .swiper-slide img { filter: brightness(1) contrast(1.01) saturate(1.01); }
            @media (max-width: 640px) {
              .banner-slider { aspect-ratio: 3/2; max-height: 300px; min-height: 200px; }
              .banner-slide { aspect-ratio: 3/2; }
              .banner-slider .swiper-pagination { bottom: 14px !important; }
            }
            @media (max-width: 480px) {
              .banner-slider { aspect-ratio: 4/3; max-height: 200px; min-height: 160px; }
              .banner-slide { aspect-ratio: 4/3; }
            }
            @media (max-width: 360px) {
              .banner-slider { max-height: 140px; min-height: 110px; }
            }
          `,
        }}
      />
    </motion.section>
  );
};

export default BannerSlider;
