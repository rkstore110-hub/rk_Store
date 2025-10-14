import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();
  
  // Mock image URL
  const aboutImage = "https://images.unsplash.com/photo-1649972904349?w=600&h=600&fit=crop";

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-50 to-white">
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-200/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-20 w-72 h-72 rounded-full bg-pink-200/30 blur-3xl"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            >
              Crafting elegance,
              <br />
              <span className="text-purple-600">one jewel at a time</span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              At Anokhi अदा, we believe every woman deserves to feel beautiful and confident. 
              Our handcrafted jewelry pieces are designed to celebrate your unique style and 
              complement your personality.
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            >
              From traditional jhumkas to contemporary pendants, each piece is carefully 
              curated to bring out your inner radiance. We use premium materials and 
              traditional craftsmanship techniques to create jewelry that lasts a lifetime.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="rounded-full px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-lg font-semibold shadow-lg"
                onClick={() => navigate("/about")}
              >
                Our Story
              </Button>
            </motion.div>
          </motion.div>

          {/* Image with floating testimonial */}
          <motion.div 
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl border-8 border-white shadow-xl">
                <img
                  src={'https://media.istockphoto.com/id/1372149793/photo/close-up-shot-of-a-happy-beautiful-woman-putting-on-the-silver-necklace.jpg?s=612x612&w=0&k=20&c=TDy3mqkkARliY8xh8YAXqFLhqKLqaeLv2rE0PiX67fk='}
                  alt="Happy customer wearing jewelry"
                  className="w-full h-[500px] object-cover transform transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              {/* Floating testimonial */}
              <motion.div 
                className="absolute -bottom-6 -right-6 bg-white p-5 rounded-xl shadow-lg max-w-xs border border-purple-100 z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                whileHover={{ rotate: 2 }}
              >
                <p className="text-sm italic text-gray-600 mb-2">
                  "Every piece tells a story of elegance and grace"
                </p>
                <p className="text-xs font-medium text-purple-600">
                  - Anokhi अदा Team
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;