import React, { useEffect, useState } from "react";
import BannerForm from "./BannerForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const cloudinaryOptions = [
  {
    name: "Primary Cloud",
    endpoint: "/api/admin/getsignature"
  },
  {
    name: "Secondary Cloud",
    endpoint: "/api/admin/getsignature"
  }
];

export default function Banners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/getbanners`, { withCredentials: true });
        setBanners(res.data.banners || []);
      } catch (err: any) {
        setBanners([]);
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to fetch banners",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [toast]);

  // Add banner
  const handleAddBanner = async (banner: any) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await axios.post(
        `${API_URL}/admin/addbanner`,
        banner,
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        }
      );
      setBanners(res.data.Banners || []);
      setOpen(false);
      toast({
        title: "Banner Added",
        description: "The banner has been successfully added.",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add banner",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (_id: string, Banner_public_id: string) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(
        `${API_URL}/admin/deletebanner`,
        { _id, Banner_public_id },
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        }
      );
      setBanners((prev) => prev.filter((b) => b._id !== _id));
      toast({
        title: "Banner Deleted",
        description: "The banner has been successfully removed.",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete banner",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-heading font-semibold">Banners</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 font-body">
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Banner</DialogTitle>
            </DialogHeader>
            <BannerForm onSubmit={handleAddBanner} cloudinaryOptions={cloudinaryOptions} />
            <DialogClose asChild>
              <Button variant="outline" className="mt-4 dark:border-gray-700 dark:hover:bg-gray-800 font-body">
                Cancel
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-body">
            No banners found. Add your first banner to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner._id} className="group relative bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="aspect-[2/1] w-full overflow-hidden">
                  <img 
                    src={banner.BannerUrl} 
                    alt={banner.BannerTitle} 
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 dark:bg-black">
                  <h3 className="font-heading font-medium text-gray-900 dark:text-white mb-2">
                    {banner.BannerTitle}
                  </h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full font-body"
                    onClick={() => handleDelete(banner._id, banner.Banner_public_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 