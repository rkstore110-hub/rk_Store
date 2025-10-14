import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "../../components/admin/ImageUploader";
import { Loader2 } from "lucide-react";

interface BannerFormProps {
  onSubmit: (banner: any) => void;
  cloudinaryOptions: { name: string; endpoint: string; }[];
}

const BannerForm: React.FC<BannerFormProps> = ({ onSubmit, cloudinaryOptions }) => {
  const [image, setImage] = useState<string>("");
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [publicId, setPublicId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ BannerUrl: image, BannerTitle: title, Banner_public_id: publicId || image });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-6 pt-0">
        <div className="space-y-2">
          <Label>Banner Image</Label>
          <ImageUploader onUpload={urls => setImage(urls[0])} cloudinaryOptions={cloudinaryOptions} />
          {image && (
            <div className="mt-4 relative aspect-[2/1] w-full max-w-md rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={image}
                alt="Banner"
                className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-title">Banner Title</Label>
          <Input
            id="banner-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. Summer Collection"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-link">Link (optional)</Label>
          <Input
            id="banner-link"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="e.g. /collections/summer"
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Banner...
            </>
          ) : (
            "Add Banner"
          )}
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};

export default BannerForm;