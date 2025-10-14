import React, { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const cloudinaryOptions = [
  {
    name: "Primary Cloud",
    endpoint: "/admin/getsignature"
  }
];

// Update Category Form Component
const UpdateCategoryForm = ({ 
  onSubmit, 
  cloudinaryOptions, 
  initialData,
  loading = false 
}: { 
  onSubmit: (category: any) => void;
  cloudinaryOptions: any[];
  initialData: {
    id: string;
    name: string;
    image: string;
    description: string;
  };
  loading?: boolean;
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [image, setImage] = useState(initialData.image || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData.id,
      name,
      image,
      description
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const selectedCloudOption = cloudinaryOptions[0];
      if (!selectedCloudOption) {
        throw new Error("No cloud configuration found");
      }

      // Get admin token for authentication
      const adminToken = localStorage.getItem("admin_token");
      
      // Check if token exists
      if (!adminToken) {
        throw new Error("Please login again. Admin token missing.");
      }

      console.log("Making signature request with token...");

      // FIXED: Add proper authentication headers
      const signatureResponse = await axios.post(
        `${API_URL}${selectedCloudOption.endpoint}`, 
        {
          cloudName: selectedCloudOption.name
        }, 
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Full signature response:", signatureResponse.data);

      // Use the correct field names from your response
      const { 
        signature, 
        timestamp, 
        CLODINARY_API_KEY, 
        cloud_name,
        uploadUrl 
      } = signatureResponse.data;

      console.log("Received parameters:", {
        signature: signature ? "Yes" : "No",
        timestamp: timestamp ? "Yes" : "No", 
        apiKey: CLODINARY_API_KEY ? "Yes" : "No",
        cloudName: cloud_name ? "Yes" : "No",
        uploadUrl: uploadUrl ? "Yes" : "No"
      });

      if (!signature || !timestamp || !CLODINARY_API_KEY || !cloud_name) {
        throw new Error(`Missing cloudinary parameters. Received: ${JSON.stringify(signatureResponse.data)}`);
      }

      // Upload to Cloudinary using the provided uploadUrl
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", CLODINARY_API_KEY);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("cloud_name", cloud_name);

      console.log("Uploading to Cloudinary with URL:", uploadUrl);

      const cloudinaryResponse = await fetch(
        uploadUrl || `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorText = await cloudinaryResponse.text();
        console.error("Cloudinary error:", errorText);
        throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status}`);
      }

      const data = await cloudinaryResponse.json();
      console.log("Cloudinary upload success:", data);
      
      if (data.secure_url) {
        setImage(data.secure_url);
        console.log("Image URL set:", data.secure_url);
      } else {
        throw new Error("Upload failed - no secure_url returned");
      }
    } catch (error: any) {
      console.error("Upload error details:", error);
      
      let errorMessage = "Image upload failed. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Remove file size limit - only check if it's an image
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.");
        return;
      }
      console.log("File selected:", file.name, "Size:", (file.size / (1024 * 1024)).toFixed(2) + "MB");
      handleImageUpload(file);
    }
  };

  // Add direct image URL input as backup
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="update-name" className="text-sm font-medium">Category Name</label>
        <input
          id="update-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="update-description" className="text-sm font-medium">Description</label>
        <textarea
          id="update-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter category description"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="update-image" className="text-sm font-medium">Category Image</label>
        
        {/* Option 1: File Upload */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Upload Image:</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>

        {/* Option 2: Direct URL Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Or Enter Image URL:</label>
          <input
            value={image}
            onChange={handleImageUrlChange}
            placeholder="Paste image URL here"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {image && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={image}
              alt="Category preview"
              className="h-20 w-20 object-cover rounded-md border"
            />
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={loading || uploading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Category...
          </>
        ) : (
          "Update Category"
        )}
      </Button>
    </form>
  );
};

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/getcategories`, {
          withCredentials: true,
        });
        // Standardize backend category structure to frontend expected structure
        const transformedCategories = res.data.categories?.map((cat: any) => ({
          id: cat.id || cat._id || cat.category,
          name: cat.name || cat.category,
          image: cat.image || cat.category_image,
          description: cat.description || cat.category_description || ""
        })) || [];
        setCategories(transformedCategories);
      } catch (err: any) {
        setCategories([]);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch categories", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  // Add category (connect to backend)
  const handleAddCategory = async (category: any) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      // Map CategoryForm fields to backend fields
      const payload = {
        category: category.name,
        category_image: category.image,
        category_description: category.description,
      };
      const res = await axios.post(`${API_URL}/admin/addcategory`, payload, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
      // Standardize new category object
      const newCategory = {
        id: res.data.category.id || res.data.category._id || res.data.category.category,
        name: res.data.category.name || res.data.category.category,
        image: res.data.category.image || res.data.category.category_image,
        description: res.data.category.description || res.data.category.category_description || ""
      };
      setCategories((prev) => [newCategory, ...prev]);
      setOpen(false);
      toast({
        title: "Category Added",
        description: "The category has been successfully added to your store.",
        variant: "default"
      });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Update category - CORRECT ENDPOINT
  const handleUpdateCategory = async (category: any) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      
      // Payload for update
      const payload = {
        id: category.id,
        name: category.name,
        image: category.image,
        description: category.description
      };

      console.log("Updating category with payload:", payload);

      // CORRECT ENDPOINT - /admin/update/category
      const res = await axios.post(`${API_URL}/admin/update/category`, payload, {
        withCredentials: true,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
      
      // Check response based on your backend
      if (res.data.success || res.data.status === "success") {
        // Update the category in state
        setCategories(prev => prev.map(cat => 
          cat.id === category.id 
            ? {
                ...cat,
                name: category.name,
                image: category.image,
                description: category.description
              }
            : cat
        ));
        
        setUpdateOpen(false);
        setSelectedCategory(null);
        toast({
          title: "Category Updated",
          description: "The category has been successfully updated.",
          variant: "default"
        });
      } else {
        throw new Error(res.data.message || "Update failed");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || err.message || "Failed to update category", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      await axios.post(
        `${API_URL}/admin/deletecategory`,
        { _id: id },
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
        }
      );

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Category Deleted",
        description: "The category has been successfully removed.",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Open update dialog with category data
  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setUpdateOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleAddCategory}
              cloudinaryOptions={cloudinaryOptions}
            />
            <DialogClose asChild>
              <Button variant="outline" className="mt-4">Cancel</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Add your first category to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category._id || category.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                        {category.category || category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.category_image?.[0] || category.image ? (
                        <div className="h-10 w-10 rounded-md border border-gray-200 overflow-hidden">
                          <img
                            src={category.category_image?.[0] || category.image}
                            alt={category.category || category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category._id || category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* UPDATE CATEGORY DIALOG */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <UpdateCategoryForm
              onSubmit={handleUpdateCategory}
              cloudinaryOptions={cloudinaryOptions}
              initialData={{
                id: selectedCategory.id,
                name: selectedCategory.name || selectedCategory.category,
                image: selectedCategory.image || selectedCategory.category_image?.[0] || "",
                description: selectedCategory.description || ""
              }}
              loading={loading}
            />
          )}
          <DialogClose asChild>
            <Button variant="outline" className="mt-4">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog> 
    </Card>
  );
}