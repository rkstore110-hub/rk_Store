import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Power, Gift, Package } from "lucide-react";
import ProductForm from "./ProductForm";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface ProductType {
  _id: string;
  Product_name: string;
  Product_discription: string;
  Product_price: number;
  Hamper_price?: number | null;
  Product_image: string[];
  Product_category: any;
  Product_available: boolean;
  isHamper_product: boolean;
  Product_public_id: string;
}

type AvailabilityFilter = "all" | "available" | "unavailable";

export default function Products() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [productToEdit, setProductToEdit] = useState<ProductType | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const adminToken = localStorage.getItem("admin_token");
        const res = await axios.get(`${API_URL}/admin/getproducts`, {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        });
        setProducts(res.data.product || []);
      } catch (err: any) {
        setProducts([]);
        toast({
          title: "Error",
          description:
            err?.response?.data?.message || "Failed to fetch products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/getcategories`, {
          withCredentials: true,
        });
        const transformedCategories =
          res.data.categories?.map((cat: any) => ({
            id: cat.id || cat._id || cat.category,
            name: cat.name || cat.category,
            image: cat.image || cat.category_image,
            description:
              cat.description || cat.category_description || "",
          })) || [];
        setCategories(transformedCategories);
      } catch (err) {
        const fallbackCategories = [
          { id: "pendants", name: "Pendants", image: "", description: "" },
          { id: "earrings", name: "Earrings", image: "", description: "" },
          { id: "jhumkas", name: "Jhumkas", image: "", description: "" },
          { id: "bracelets", name: "Bracelets", image: "", description: "" },
          { id: "hair-accessories", name: "Hair Accessories", image: "", description: "" },
          { id: "hampers", name: "Hampers", image: "", description: "" },
          { id: "customized-hampers", name: "Customized Hampers", image: "", description: "" },
        ];
        setCategories(fallbackCategories);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [toast]);

  const handleToggleAvailability = async (product: ProductType) => {
    const newAvailability = !product.Product_available;
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id ? { ...p, Product_available: newAvailability } : p
      )
    );

    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(
        `${API_URL}/admin/availabilty`,
        { id: product._id, status: newAvailability },
        { withCredentials: true, headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} }
      );

      toast({
        title: "Availability Updated",
        description: `${product.Product_name} is now ${
          newAvailability ? "Available" : "Unavailable"
        }`,
        variant: newAvailability ? "default" : "destructive",
        duration: 3000,
      });
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, Product_available: !newAvailability } : p
        )
      );
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          `Failed to update ${product.Product_name}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(
        `${API_URL}/admin/deleteproduct`,
        { _id: id, Product_public_id: publicId },
        { withCredentials: true, headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} }
      );
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "Deleted",
        description: "Product removed successfully",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (data: any) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");

      if (productToEdit) {
        await axios.post(
          `${API_URL}/admin/update/product`,
          {
            id: productToEdit._id,
            name: data.name,
            description: data.description,
            price: Number(data.price),
            hamperPrice: data.hamperPrice ? Number(data.hamperPrice) : null,
          },
          { withCredentials: true, headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} }
        );

        setProducts((prev) =>
          prev.map((p) =>
            p._id === productToEdit._id
              ? {
                  ...p,
                  Product_name: data.name,
                  Product_discription: data.description,
                  Product_price: Number(data.price),
                  Hamper_price: data.hamperPrice ? Number(data.hamperPrice) : null,
                }
              : p
          )
        );
        toast({ title: "Updated", description: "Product updated successfully" });
      } else {
        const res = await axios.post(
          `${API_URL}/admin/saveproduct`,
          {
            Product_name: data.name,
            Product_discription: data.description,
            Product_price: Number(data.price),
            Hamper_price: data.hamperPrice ? Number(data.hamperPrice) : null,
            Product_image: data.images || [],
            Product_category: data.category || "",
            Product_available: data.isAvailable ?? true,
            isHamper_product: data.isHamperProduct ?? false,
            Product_public_id: "",
          },
          { withCredentials: true, headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} }
        );

        setProducts((prev) => [res.data.product, ...prev]);
        toast({ title: "Added", description: "Product added successfully" });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setProductToEdit(null);
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (availabilityFilter === "all") return products;
    const isAvailable = availabilityFilter === "available";
    return products.filter((p) => p.Product_available === isAvailable);
  }, [products, availabilityFilter]);

  const AddEditForm = ({
    initialData,
    onSubmit,
  }: {
    initialData?: ProductType | null;
    onSubmit: (data: any) => void;
  }) => {
    const [name, setName] = useState(initialData?.Product_name || "");
    const [description, setDescription] = useState(
      initialData?.Product_discription || ""
    );
    const [price, setPrice] = useState(initialData?.Product_price || 0);
    const [hamperPrice, setHamperPrice] = useState<string>(
      initialData?.Hamper_price != null ? String(initialData.Hamper_price) : ""
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        name,
        description,
        price,
        hamperPrice: hamperPrice === "" ? null : Number(hamperPrice),
      });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 rounded-lg shadow-md dark:shadow-none bg-white dark:bg-gray-800"
      >
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Product Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Regular Price
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              required
            />
          </div>

          <div className="flex flex-col flex-1 mt-4 sm:mt-0">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Hamper Price (Optional)
            </label>
            <input
              type="number"
              min={0}
              value={hamperPrice}
              onChange={(e) => setHamperPrice(e.target.value)}
              placeholder="Leave empty if not applicable"
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-md py-2 transition-all"
        >
          {initialData ? "Update Product" : "Add Product"}
        </Button>
      </form>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-6">
        <div>
          <CardTitle className="text-2xl font-bold">Products</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Manage your products and hamper pricing
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select
            value={availabilityFilter}
            onValueChange={(value: AvailabilityFilter) =>
              setAvailabilityFilter(value)
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({products.length})</SelectItem>
              <SelectItem value="available">
                Available ({products.filter((p) => p.Product_available).length})
              </SelectItem>
              <SelectItem value="unavailable">
                Unavailable ({products.filter((p) => !p.Product_available).length})
              </SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setProductToEdit(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {productToEdit ? "Edit Product" : "Add Product"}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {productToEdit ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the product details below.
                </DialogDescription>
              </DialogHeader>

              {productToEdit ? (
                <AddEditForm
                  initialData={productToEdit}
                  onSubmit={handleProductSubmit}
                />
              ) : (
                <ProductForm
                  onSubmit={handleProductSubmit}
                  categories={categories}
                  cloudinaryOptions={[
                    { name: "Primary Cloud", endpoint: "/api/admin/getsignature" },
                  ]}
                />
              )}

              <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-sm">
              Add your first product to get started with your store.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Hamper Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {product.Product_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[200px]">
                          {product.Product_discription}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`mt-1 text-xs w-24 flex justify-center ${
                            product.Product_available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.Product_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      ₹{product.Product_price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {product.Hamper_price != null
                        ? `₹${product.Hamper_price.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.isHamper_product ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Hamper
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProductToEdit(product);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDelete(product._id, product.Product_public_id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAvailability(product)}
                      >
                        <Power
                          className={`h-4 w-4 ${
                            product.Product_available
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
