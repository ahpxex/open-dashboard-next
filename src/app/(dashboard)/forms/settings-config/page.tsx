"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsConfigFormsPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings & Configuration</h1>
        <p className="text-gray-600">
          Forms for managing workspace settings, application configuration, and
          billing information.
        </p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList>
          <TabsTrigger value="workspace">Workspace Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing & Subscription</TabsTrigger>
        </TabsList>
        <TabsContent value="workspace">
          <WorkspaceSettingsForm />
        </TabsContent>
        <TabsContent value="billing">
          <BillingSubscriptionForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkspaceSettingsForm() {
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [timezone, setTimezone] = useState("America/New_York");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    setTimeout(() => {
      console.log("Workspace settings updated:", {
        workspaceName,
        timezone,
        currency,
        language,
        dateFormat,
        timeFormat,
      });
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const timezones = [
    { key: "America/New_York", label: "Eastern Time (ET)" },
    { key: "America/Chicago", label: "Central Time (CT)" },
    { key: "America/Denver", label: "Mountain Time (MT)" },
    { key: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { key: "Europe/London", label: "London (GMT)" },
    { key: "Europe/Paris", label: "Paris (CET)" },
    { key: "Asia/Tokyo", label: "Tokyo (JST)" },
    { key: "Asia/Shanghai", label: "Shanghai (CST)" },
    { key: "Australia/Sydney", label: "Sydney (AEDT)" },
  ];

  const currencies = [
    { key: "USD", label: "US Dollar (USD)" },
    { key: "EUR", label: "Euro (EUR)" },
    { key: "GBP", label: "British Pound (GBP)" },
    { key: "JPY", label: "Japanese Yen (JPY)" },
    { key: "CNY", label: "Chinese Yuan (CNY)" },
    { key: "AUD", label: "Australian Dollar (AUD)" },
    { key: "CAD", label: "Canadian Dollar (CAD)" },
  ];

  const languages = [
    { key: "en", label: "English" },
    { key: "es", label: "Spanish" },
    { key: "fr", label: "French" },
    { key: "de", label: "German" },
    { key: "ja", label: "Japanese" },
    { key: "zh", label: "Chinese" },
  ];

  return (
    <Card className="max-w-3xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">General Settings</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="Workspace Name"
            required
            description="This is the name that will be displayed to your team members"
          >
            <Input
              required
              placeholder="Enter workspace name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Timezone" required>
              <Select
                value={timezone}
                onValueChange={(value) => setTimezone(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.key} value={tz.key}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Currency" required>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.key} value={curr.key}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Language" required>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.key} value={lang.key}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Date Format">
              <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value="MM/DD/YYYY" />
                  <span>MM/DD/YYYY (02/10/2025)</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value="DD/MM/YYYY" />
                  <span>DD/MM/YYYY (10/02/2025)</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value="YYYY-MM-DD" />
                  <span>YYYY-MM-DD (2025-02-10)</span>
                </label>
              </RadioGroup>
            </Field>

            <Field label="Time Format">
              <RadioGroup value={timeFormat} onValueChange={setTimeFormat}>
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value="12h" />
                  <span>12-hour (2:30 PM)</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value="24h" />
                  <span>24-hour (14:30)</span>
                </label>
              </RadioGroup>
            </Field>
          </div>

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Workspace settings saved successfully!
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function BillingSubscriptionForm() {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    setTimeout(() => {
      console.log("Billing information updated:", {
        plan: selectedPlan,
        cardLast4: cardNumber.slice(-4),
        billingAddress,
      });
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const plans = [
    {
      key: "free",
      name: "Free",
      price: "$0",
      description: "For individuals just getting started",
    },
    {
      key: "pro",
      name: "Professional",
      price: "$29",
      description: "For professionals and small teams",
    },
    {
      key: "business",
      name: "Business",
      price: "$99",
      description: "For growing teams and businesses",
    },
    {
      key: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with custom needs",
    },
  ];

  const countries = [
    { key: "US", label: "United States" },
    { key: "CA", label: "Canada" },
    { key: "GB", label: "United Kingdom" },
    { key: "AU", label: "Australia" },
    { key: "DE", label: "Germany" },
    { key: "FR", label: "France" },
    { key: "JP", label: "Japan" },
    { key: "CN", label: "China" },
  ];

  return (
    <Card className="max-w-3xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Billing & Subscription</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Select Plan</h3>
            <RadioGroup
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="space-y-3"
            >
              {plans.map((plan) => (
                <label
                  key={plan.key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <RadioGroupItem value={plan.key} />
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-gray-600">
                        {plan.description}
                      </p>
                    </div>
                    <p className="font-semibold text-primary ml-4">
                      {plan.price}
                      {plan.price !== "Custom" && "/month"}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {selectedPlan !== "free" && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="space-y-4">
                  <Field label="Card Number" required>
                    <Input
                      required
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Expiry Date" required>
                      <Input
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </Field>
                    <Field label="CVC" required>
                      <Input
                        required
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                      />
                    </Field>
                    <Field label="Cardholder Name" required>
                      <Input
                        required
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                <div className="space-y-4">
                  <Field label="Street Address" required>
                    <Input
                      required
                      placeholder="123 Main St"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="City" required>
                      <Input
                        required
                        placeholder="New York"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                      />
                    </Field>
                    <Field label="ZIP / Postal Code" required>
                      <Input
                        required
                        placeholder="10001"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                      />
                    </Field>
                    <Field label="Country" required>
                      <Select
                        value={billingCountry}
                        onValueChange={(value) =>
                          setBillingCountry(value ?? "")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.key} value={country.key}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-none">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your payment information is securely
                  processed through Stripe. We never store your complete card
                  details on our servers.
                </p>
              </div>
            </>
          )}

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Billing information saved successfully!
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              {selectedPlan === "free"
                ? "Downgrade to Free"
                : "Update Subscription"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
