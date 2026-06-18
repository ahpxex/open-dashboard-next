"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function InteractionFilteringFormsPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interaction & Filtering</h1>
        <p className="text-gray-600">
          Forms for user interaction, data filtering, search functionality, and
          support requests.
        </p>
      </div>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
          <TabsTrigger value="contact">Contact/Support</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchFilterForm />
        </TabsContent>
        <TabsContent value="contact">
          <ContactSupportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SearchFilterForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-desc");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const toggleValue = (
    list: string[],
    setList: (next: string[]) => void,
    value: string,
    checked: boolean,
  ) => {
    setList(checked ? [...list, value] : list.filter((item) => item !== value));
  };

  const handleApply = async () => {
    setIsSearching(true);
    setTimeout(() => {
      console.log("Applying filters:", {
        searchQuery,
        status,
        category,
        dateFrom,
        dateTo,
        tags,
        sortBy,
      });

      const mockResults = [
        {
          id: 1,
          title: "Project Alpha",
          status: "active",
          category: "development",
          date: "2025-02-08",
          tags: ["web", "frontend"],
        },
        {
          id: 2,
          title: "Marketing Campaign",
          status: "completed",
          category: "marketing",
          date: "2025-01-15",
          tags: ["social", "ads"],
        },
        {
          id: 3,
          title: "Customer Support System",
          status: "active",
          category: "support",
          date: "2025-02-01",
          tags: ["backend", "api"],
        },
      ];

      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatus([]);
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setTags([]);
    setSortBy("date-desc");
    setResults([]);
  };

  const categories = [
    { key: "all", label: "All Categories" },
    { key: "development", label: "Development" },
    { key: "design", label: "Design" },
    { key: "marketing", label: "Marketing" },
    { key: "sales", label: "Sales" },
    { key: "support", label: "Support" },
  ];

  const sortOptions = [
    { key: "date-desc", label: "Date (Newest First)" },
    { key: "date-asc", label: "Date (Oldest First)" },
    { key: "name-asc", label: "Name (A-Z)" },
    { key: "name-desc", label: "Name (Z-A)" },
    { key: "status-asc", label: "Status" },
  ];

  const statusOptions = [
    { key: "draft", label: "Draft" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const availableTags = [
    { key: "web", label: "Web" },
    { key: "mobile", label: "Mobile" },
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "api", label: "API" },
    { key: "database", label: "Database" },
    { key: "ui-ux", label: "UI/UX" },
    { key: "social", label: "Social" },
    { key: "ads", label: "Ads" },
  ];

  return (
    <div className="space-y-6 mt-4">
      <Card className="max-w-4xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Search & Filter</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Field label="Search">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Status">
                <div className="flex flex-wrap gap-3">
                  {statusOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={status.includes(option.key)}
                        onCheckedChange={(checked) =>
                          toggleValue(
                            status,
                            setStatus,
                            option.key,
                            checked === true,
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Category">
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value ?? "")}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Date From">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Field>
              <Field label="Date To">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Tags">
              <div className="flex flex-wrap gap-3">
                {availableTags.map((tag) => (
                  <label
                    key={tag.key}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Checkbox
                      checked={tags.includes(tag.key)}
                      onCheckedChange={(checked) =>
                        toggleValue(tags, setTags, tag.key, checked === true)
                      }
                    />
                    <span>{tag.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Sort By">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleApply} disabled={isSearching}>
                {isSearching ? <Spinner /> : null}
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="max-w-4xl">
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Search Results ({results.length})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{result.title}</h4>
                    <Badge
                      variant={
                        result.status === "active"
                          ? "outline"
                          : result.status === "completed"
                            ? "default"
                            : "secondary"
                      }
                      className={
                        result.status === "active"
                          ? "border-transparent bg-green-500/15 text-green-700"
                          : undefined
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Category: {result.category}</span>
                    <span>Date: {result.date}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {result.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContactSupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitted(false);

    setTimeout(() => {
      console.log("Support request submitted:", {
        name,
        email,
        subject,
        category,
        priority,
        message,
        attachment: attachment?.name,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);

      setName("");
      setEmail("");
      setSubject("");
      setCategory("");
      setPriority("medium");
      setMessage("");
      setAttachment(null);

      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const categories = [
    { key: "technical", label: "Technical Issue" },
    { key: "billing", label: "Billing Question" },
    { key: "feature", label: "Feature Request" },
    { key: "bug", label: "Bug Report" },
    { key: "account", label: "Account Issue" },
    { key: "other", label: "Other" },
  ];

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mt-4">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-semibold mb-2">
            Thank You for Contacting Us
          </h3>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your message and will get back to you within 24
            hours. A confirmation email has been sent to your inbox.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Contact Support</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Fill out the form below and our support team will get back to you as
            soon as possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" required>
              <Input
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Email" required>
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Subject" required>
            <Input
              required
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category" required>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value ?? "")}
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

            <Field label="Priority" required>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Message"
            required
            description={`${message.length}/2000 characters`}
          >
            <Textarea
              required
              placeholder="Please describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={2000}
            />
          </Field>

          <div>
            <label className="block text-sm font-medium mb-2">
              Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-none p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {attachment ? (
                  <p className="text-sm text-gray-700">
                    <strong>{attachment.name}</strong> (
                    {(attachment.size / 1024).toFixed(2)} KB)
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC (max. 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
