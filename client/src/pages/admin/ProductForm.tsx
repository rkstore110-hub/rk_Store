import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "../../components/admin/ImageUploader";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  onSubmit: (product: any) => void;
  categories: { id: string; name: string }[];
  cloudinaryOptions: { name: string; endpoint: string }[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  categories,
  cloudinaryOptions,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "");
  const [images, setImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Enhanced validation
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Error",
        description: "Valid product price is required",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "At least one product image is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name,
        description,
        price,
        category,
        images,
        isAvailable,
      };

      await onSubmit(productData);

      // ✅ Reset form after successful submission
      setName("");
      setDescription("");
      setPrice("");
      setCategory(categories[0]?.id || "");
      setImages([]);
      setIsAvailable(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Elegant Pendant"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Price (₹) *</Label>
              <Input
                id="product-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={1}
                step="0.01"
                placeholder="e.g. 999"
                className="h-10"
              />
            </div>
          </div>

          {/* ✅ Product Availability */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="product-available"
              checked={isAvailable}
              onCheckedChange={(checked) => setIsAvailable(checked === true)}
            />
            <Label htmlFor="product-available" className="text-sm font-medium">
              Product Available for Sale
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description *</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the product..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="product-category" className="h-10">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Images *</Label>
            <ImageUploader
              onUpload={setImages}
              cloudinaryOptions={cloudinaryOptions}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Product-${idx}`}
                      className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ))}
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
                Adding Product...
              </>
            ) : (
              "Add Product!"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
