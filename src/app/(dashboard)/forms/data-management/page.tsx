"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function DataManagementFormsPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Data Management (CRUD) Forms
        </h1>
        <p className="text-gray-600">
          Generic forms for creating, editing, and deleting items like projects,
          tasks, customers, and products.
        </p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Form</TabsTrigger>
          <TabsTrigger value="edit">Edit Form</TabsTrigger>
          <TabsTrigger value="delete">Delete Confirmation</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateEditForm mode="create" />
        </TabsContent>
        <TabsContent value="edit">
          <CreateEditForm mode="edit" />
        </TabsContent>
        <TabsContent value="delete">
          <DeleteConfirmationDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CreateEditFormProps {
  mode: "create" | "edit";
}

function CreateEditForm({ mode }: CreateEditFormProps) {
  const [formData, setFormData] = useState({
    name: mode === "edit" ? "Sample Project" : "",
    category: mode === "edit" ? "development" : "",
    status: mode === "edit" ? "active" : "draft",
    priority: mode === "edit" ? "medium" : "low",
    description: mode === "edit" ? "This is a sample project description." : "",
    dueDate: mode === "edit" ? "2025-12-31" : "",
    budget: mode === "edit" ? "10000" : "",
    assignee: mode === "edit" ? "john" : "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    setTimeout(() => {
      console.log(
        `${mode === "create" ? "Created" : "Updated"} item:`,
        formData,
      );
      setIsLoading(false);
      setIsSaved(true);
      if (mode === "create") {
        setFormData({
          name: "",
          category: "",
          status: "draft",
          priority: "low",
          description: "",
          dueDate: "",
          budget: "",
          assignee: "",
        });
      }
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const categories = [
    { key: "development", label: "Development" },
    { key: "design", label: "Design" },
    { key: "marketing", label: "Marketing" },
    { key: "sales", label: "Sales" },
    { key: "support", label: "Support" },
  ];

  const statuses = [
    { key: "draft", label: "Draft" },
    { key: "active", label: "Active" },
    { key: "on-hold", label: "On Hold" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const priorities = [
    { key: "low", label: "Low" },
    { key: "medium", label: "Medium" },
    { key: "high", label: "High" },
    { key: "urgent", label: "Urgent" },
  ];

  const assignees = [
    { key: "john", label: "John Doe" },
    { key: "jane", label: "Jane Smith" },
    { key: "bob", label: "Bob Johnson" },
    { key: "alice", label: "Alice Williams" },
  ];

  return (
    <Card className="max-w-3xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {mode === "create" ? "Create New Item" : "Edit Item"}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Project Name" required>
              <Input
                required
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Field>

            <Field label="Category" required>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status" required>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority" required>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.key} value={priority.key}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Due Date">
              <Input
                type="date"
                placeholder="Select due date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </Field>

            <Field label="Budget">
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="Enter budget"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className="pl-6"
                />
              </div>
            </Field>
          </div>

          <Field label="Assignee">
            <Select
              value={formData.assignee}
              onValueChange={(value) => handleChange("assignee", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.key} value={assignee.key}>
                    {assignee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Description">
            <Textarea
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
            />
          </Field>

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              {mode === "create"
                ? "Item created successfully!"
                : "Item updated successfully!"}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteConfirmationDemo() {
  const [open, setOpen] = useState(false);
  const [selectedItem] = useState("Sample Project #42");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(() => {
      console.log("Deleted item:", selectedItem);
      setIsDeleting(false);
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleted(false);
        setOpen(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="mt-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Delete Item</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Click the button below to see the delete confirmation modal in
            action.
          </p>

          <div className="p-4 bg-gray-50 rounded-none border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{selectedItem}</p>
                <p className="text-sm text-gray-600">
                  Created on Jan 15, 2025 - Last updated Feb 10, 2025
                </p>
              </div>
              <Button variant="destructive" onClick={() => setOpen(true)}>
                Delete
              </Button>
            </div>
          </div>

          {isDeleted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Item deleted successfully!
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-none">
              <span className="text-2xl text-red-600">!</span>
            </div>
            <p className="text-center font-medium">
              Are you sure you want to delete this item?
            </p>
            <div className="p-3 bg-gray-50 rounded-none">
              <p className="text-sm font-medium text-center">{selectedItem}</p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              This action cannot be undone. The item and all associated data
              will be permanently removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : null}
              {isDeleting ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
