import React, { useEffect, useMemo, useState } from "react";
import CategoryForm from "./CategoryForm"; // ONLY used for Add
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Upload } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
const cloudinarySignatureEndpoint = "/admin/getsignature";

type Cat = { id: string; name: string; image?: string; description?: string };

export default function Categories() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);

  // Edit dialog state
  const [editing, setEditing] = useState<Cat | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [editUploading, setEditUploading] = useState<boolean>(false);
  const [editSaving, setEditSaving] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/getcategories`, { withCredentials: true });
        const transformed: Cat[] = res.data.categories?.map((cat: any) => ({
          id: cat.id || cat._id || cat.category,
          name: cat.name || cat.category,
          image: cat.image || cat.category_image,
          description: cat.description || cat.category_description || ""
        })) || [];
        setCategories(transformed);
      } catch (err: any) {
        setCategories([]);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch categories", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const adminAuthHeader = useMemo(() => {
    const adminToken = localStorage.getItem("admin_token");
    return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  }, []);

  // Add category via existing CategoryForm
  const handleAddCategory = async (category: any) => {
    setLoading(true);
    try {
      const payload = {
        category: category.name,
        category_image: category.image,
        category_description: category.description
      };
      const res = await axios.post(`${API_URL}/admin/addcategory`, payload, {
        withCredentials: true,
        headers: adminAuthHeader
      });
      const newCategory: Cat = {
        id: res.data.category.id || res.data.category._id || res.data.category.category,
        name: res.data.category.name || res.data.category.category,
        image: res.data.category.image || res.data.category.category_image,
        description: res.data.category.description || res.data.category.category_description || ""
      };
      setCategories(prev => [newCategory, ...prev]);
      setAddOpen(false);
      toast({ title: "Category Added", description: "The category has been successfully added to your store.", variant: "default" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Inline Cloudinary upload for edit dialog
  const uploadToCloudinary = async (file: File) => {
    setEditUploading(true);
    try {
      // 1) get signature from backend
      const sigRes = await axios.post(
        `${API_URL}${cloudinarySignatureEndpoint}`,
        { Product_name: file.name, Product_category: "category", cloudInstance: "primary" },
        { withCredentials: true, headers: adminAuthHeader }
      );
      const sigPayload = sigRes.data?.signature || {};
      const signature = sigPayload.signature || sigPayload?.signature;
      const timestamp = sigPayload.timestamp;
      const public_id = sigPayload.public_id;
      const api_key = sigPayload.CLOUDINARY_API_KEY || sigPayload.api_key;
      const cloud_name = sigPayload.cloud_name;
      const uploadUrl = sigPayload.uploadUrl || `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

      if (!signature || !timestamp || !public_id || !api_key || !cloud_name) {
        throw new Error("Invalid signature response");
      }

      // 2) upload to Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", api_key);
      form.append("timestamp", String(timestamp));
      form.append("public_id", public_id);
      form.append("signature", signature);

      const up = await fetch(uploadUrl, { method: "POST", body: form });
      if (!up.ok) throw new Error("Cloudinary upload failed");
      const json = await up.json();
      const url = json.secure_url as string;
      if (!url) throw new Error("Missing secure_url");

      setEditImageUrl(url);
      toast({ title: "Uploaded", description: "Image uploaded successfully.", variant: "default" });
    } catch (e: any) {
      toast({ title: "Upload Error", description: e?.message || "Failed to upload image", variant: "destructive" });
      setEditImageUrl("");
    } finally {
      setEditUploading(false);
    }
  };

  // Save edit: send only { id, image } — text remains unchanged
  const saveEditedImage = async () => {
    if (!editing || !editImageUrl) {
      toast({ title: "Missing", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setEditSaving(true);
    try {
      await axios.post(`${API_URL}/admin/update/category`, { id: editing.id, image: editImageUrl }, {
        withCredentials: true,
        headers: adminAuthHeader
      });
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, image: editImageUrl } : c));
      setEditing(null);
      setEditImageUrl("");
      toast({ title: "Image Updated", description: "Category image updated successfully.", variant: "default" });
    } catch (err: any) {
      toast({ title: "Update Error", description: err?.response?.data?.message || "Failed to update image", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${API_URL}/admin/deletecategory`, { _id: id }, {
        withCredentials: true,
        headers: adminAuthHeader
      });
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: "Category Deleted", description: "The category has been successfully removed.", variant: "default" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete category. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Categories</CardTitle>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
              cloudinaryOptions={[
                { name: "Primary Cloud", endpoint: cloudinarySignatureEndpoint },
                { name: "Secondary Cloud", endpoint: cloudinarySignatureEndpoint }
              ]}
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
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                        {category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.image ? (
                        <div className="h-10 w-10 rounded-md border border-gray-200 overflow-hidden">
                          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(category);
                          setEditImageUrl(category.image || "");
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Inline Edit Image Dialog with overflow fixed */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setEditImageUrl(""); } }}>
        <DialogContent className="sm:max-w-lg w-[96vw] sm:w-auto p-0 overflow-hidden">
          {/* Scrollable container */}
          <div className="max-h-[80vh] overflow-y-auto">
            {/* Sticky header */}
            <DialogHeader className="sticky top-0 bg-white/90 backdrop-blur px-6 pt-6 pb-3 border-b">
              <DialogTitle>Edit Category Image</DialogTitle>
            </DialogHeader>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                Updating image for: <span className="font-medium">{editing?.name}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await uploadToCloudinary(file);
                  }}
                  className="max-w-full"
                  disabled={editUploading || editSaving}
                />
                <Button variant="outline" type="button" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Cloudinary
                </Button>
              </div>

              {editImageUrl ? (
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded border overflow-hidden shrink-0">
                    <img src={editImageUrl} alt="preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    {editImageUrl}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditing(null); setEditImageUrl(""); }} disabled={editSaving || editUploading}>
                Cancel
              </Button>
              <Button onClick={saveEditedImage} disabled={!editImageUrl || editSaving || editUploading}>
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
