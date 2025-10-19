import { Instagram, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

type Category = { _id?: string; name?: string };

const fadeUp = (delay = 0.1) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: "easeOut", delay },
});

// Logo: refined brand treatment (same as header)
const LogoBrand = () => (
  <span className="inline-flex items-center gap-2" aria-label="RK Store Logo">
    <span
      className="w-9 h-9 rounded-full bg-gradient-to-br from-white/95 to-purple-50 shadow-md flex items-center justify-center border border-purple-200"
      style={{ fontWeight: 800, color: "#4a3c6b", fontSize: "0.9rem" }}
    >
      RK
    </span>
    <span className="hidden sm:inline-block font-semibold tracking-tight text-purple-900" style={{ fontSize: "1.05rem" }}>
      Store
    </span>
  </span>
);

const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/getAllData`, {
          withCredentials: true,
          timeout: 10000,
          signal: controller.signal,
        });
        const cats: Category[] = Array.isArray(data?.data?.categories) ? data.data.categories : [];
        const seen = new Set<string>();
        const norm = cats
          .map((c) => ({ _id: c?._id, name: c?.name?.trim() }))
          .filter((c) => c.name && !seen.has(c.name!.toLowerCase()) && seen.add(c.name!.toLowerCase()));
        setCategories(norm);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error("Footer: Failed fetching categories", e?.message || e);
          setCategories([]);
        }
      } finally {
        setLoadingCats(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const quickLinks = useMemo(
    () => [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Refund", to: "/refund" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
    []
  );

  const email = "rk.store110@gmail.com";
  const phone = "+91 78383 02860";
  const facebookProfile = "https://www.facebook.com/profile.php?id=61582189163547";

  return (
    <footer
      className="relative bg-gradient-to-br from-purple-50/80 via-purple-100/70 to-purple-200/50 border-t border-purple-300/50 overflow-hidden"
      style={{ contentVisibility: "auto", containIntrinsicSize: "680px" }}
    >
      <div className="pointer-events-none absolute top-24 right-0 w-40 h-40 rounded-full bg-purple-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-28 h-28 rounded-full bg-purple-200/25 blur-3xl" />

      <div className="container mx-auto px-4 py-16 relative z-10 text-purple-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          >
            <div className="flex items-center mb-6">
              <LogoBrand />
            </div>
            <p className="mb-6 text-purple-700 leading-relaxed">
              Elegant jewelry for every mood & moment. Handcrafted with love, designed uniquely for you.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://www.instagram.com/rkstore11092"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-purple-700" />
              </motion.a>
              <motion.a
                href={facebookProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-700" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.342v21.317c0 .742.6 1.342 1.325 1.342h11.49v-9.29H9.691v-3.622h3.124V8.41c0-3.1 1.894-4.79 4.658-4.79 1.325 0 2.463.097 2.793.142v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.317h3.59l-.467 3.622h-3.123V24h6.116c.725 0 1.325-.6 1.325-1.341V1.342C24 .6 23.4 0 22.675 0z"/></svg>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
          >
            <h4 className="text-xl font-bold mb-6 select-none cursor-default">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-purple-800 hover:text-purple-700 transition-colors flex items-start group"
                  >
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.18 }}
          >
            <h4 className="text-xl font-bold mb-6 select-none cursor-default">Categories</h4>
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {loadingCats ? (
                <>
                  <li className="h-4 w-40 bg-purple-200 rounded animate-pulse" />
                  <li className="h-4 w-32 bg-purple-200 rounded animate-pulse" />
                  <li className="h-4 w-24 bg-purple-200 rounded animate-pulse" />
                </>
              ) : categories.length > 0 ? (
                categories.map((cat, idx) => {
                  const name = cat.name || "";
                  const slug = name.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <li key={cat._id || `${name}-${idx}`}>
                      <Link
                        to={`/category/${slug}`}
                        className="text-purple-800 hover:text-purple-700 transition-colors flex items-start group"
                      >
                        <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {name}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="text-purple-500 text-sm select-none">No categories available.</li>
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.24 }}
          >
            <h4 className="text-xl font-bold mb-6 select-none cursor-default">Contact Us</h4>
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Mail size={18} className="text-purple-700" />
                </div>
                <a href={`mailto:${email}`} className="text-purple-800 hover:text-purple-700 transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Phone size={18} className="text-purple-700" />
                </div>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-purple-800 hover:text-purple-700 transition-colors">
                  {phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-purple-300 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-purple-600"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 }}
        >
          <p className="mb-4 md:mb-0 select-none">© 2025 RK Store. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-purple-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-purple-700 transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;