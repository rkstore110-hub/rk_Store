import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "../../components/admin/ImageUploader";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  onSubmit: (category: any) => void;
  cloudinaryOptions: { name: string; endpoint: string; }[]; 
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, cloudinaryOptions }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description, image });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-6 pt-0">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Necklaces"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="Describe this category..."
            className="min-h-[100px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label>Category Image</Label>
          <ImageUploader onUpload={urls => setImage(urls[0])} cloudinaryOptions={cloudinaryOptions} />
          {image && (
            <div className="mt-4 relative aspect-square w-24 rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={image}
                alt="Category"
                className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}
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
              Adding Category...
            </>
          ) : (
            "Add Category"
          )}
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};

export default CategoryForm;