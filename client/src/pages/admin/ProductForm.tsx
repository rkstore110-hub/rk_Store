
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
import { Loader2, Gift, AlertTriangle } from "lucide-react";
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
  const [hamperPrice, setHamperPrice] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "");
  const [images, setImages] = useState<string[]>([]);
  const [isHamperProduct, setIsHamperProduct] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Validation for hamper pricing
  const validateHamperPrice = () => {
    if (!isHamperProduct || !hamperPrice) return true;

    const regularPrice = parseFloat(price);
    const hamperPriceNum = parseFloat(hamperPrice);

    if (hamperPriceNum <= 0) return false;
    if (hamperPriceNum >= regularPrice) return false;

    return true;
  };

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

    // ✅ Validate hamper pricing
    if (isHamperProduct && hamperPrice && !validateHamperPrice()) {
      toast({
        title: "Invalid Hamper Price",
        description:
          "Hamper price must be greater than 0 and less than regular price",
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
        hamperPrice: isHamperProduct && hamperPrice ? hamperPrice : null,
        category,
        images,
        isHamperProduct,
        isAvailable,
      };

      await onSubmit(productData);

      // ✅ Reset form after successful submission
      setName("");
      setDescription("");
      setPrice("");
      setHamperPrice("");
      setCategory(categories[0]?.id || "");
      setImages([]);
      setIsHamperProduct(false);
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
              <Label htmlFor="product-price">Regular Price (₹) *</Label>
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
              // ✅ This fixes the TypeScript error
              onCheckedChange={(checked) => setIsAvailable(checked === true)}
            />
            <Label htmlFor="product-available" className="text-sm font-medium">
              Product Available for Sale
            </Label>
          </div>

          {/* ✅ Hamper Product Section */}
          <div className="border rounded-lg p-4 bg-orange-50/50 border-orange-200">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="hamper-product"
                checked={isHamperProduct}
                onCheckedChange={(checked) => {
                  setIsHamperProduct(!!checked);
                  if (!checked) {
                    setHamperPrice("");
                  }
                }}
              />
              <Label
                htmlFor="hamper-product"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Gift className="w-4 h-4 text-orange-600" />
                Available for Custom Hampers
              </Label>
            </div>

            {isHamperProduct && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="hamper-price" className="text-orange-800">
                    Hamper Price (₹) - Special pricing for hampers
                  </Label>
                  <Input
                    id="hamper-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={hamperPrice}
                    onChange={(e) => setHamperPrice(e.target.value)}
                    placeholder="Enter special hamper price"
                    className="h-10 border-orange-300 focus:border-orange-500"
                  />
                </div>

                <div className="bg-orange-100 border border-orange-300 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-700">
                      <p className="font-medium mb-1">
                        Hamper Pricing Guidelines:
                      </p>
                      <ul className="space-y-0.5 text-orange-600">
                        <li>• Leave empty to use regular price for hampers</li>
                        <li>
                          • If set, hamper price should be less than regular
                          price
                        </li>
                        <li>
                          • Only hamper-priced products appear in hamper builder
                        </li>
                        {price && hamperPrice && (
                          <li className="font-medium text-orange-800">
                            • Current discount: ₹
                            {(
                              parseFloat(price) - parseFloat(hamperPrice)
                            ).toFixed(2)}
                            (
                            {(
                              ((parseFloat(price) - parseFloat(hamperPrice)) /
                                parseFloat(price)) *
                              100
                            ).toFixed(1)}
                            % off)
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            disabled={loading || !validateHamperPrice()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
