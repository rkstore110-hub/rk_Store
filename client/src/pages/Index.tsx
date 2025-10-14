import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import FeaturedProducts from "@/components/FeaturedProducts";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import BannerSlider from "@/components/BannerSlider";
import CategoryGrid from "@/components/CategoryGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
      <AnnouncementBar />
      <Header />
      {/* Full-width banner section */}
      <BannerSlider />
      
      {/* Rest of the content with pastel purple background */}
      <div className="bg-gradient-to-br from-purple-100/50 via-purple-50/30 to-pink-50/50">
        <CategoryGrid />
        <FeaturedProducts />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
