import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
  };

  return (
    <section className="py-16 gradient-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            {/* Decorative elements */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-background/40 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-heading font-semibold text-primary mb-4">
              Join the Anokhi <span className="text-brand-purple-dark">अदा</span> Family
            </h2>
            <p className="text-lg text-brand-soft-grey">
              Be the first to know about new arrivals & exclusive offers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/90 border-background/50 text-primary placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="whitespace-nowrap"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-sm text-brand-soft-grey mt-4">
            By subscribing, you agree to our privacy policy and terms of service.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;