import { TranslateIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { I18nProvider, type Locale, locales, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/localization")({
  component: I18nDemo,
});

/**
 * Gallery demo: a small panel wrapped in the i18n Provider. The locale switcher
 * live-translates every label below it — a greeting with an interpolated name,
 * an interpolated item count, and a couple of form labels — with no reload.
 */
function I18nDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Internationalization
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A minimal, dependency-free i18n seam. Wrap any subtree in{" "}
          <code>I18nProvider</code>, then call <code>t(key, vars)</code> from{" "}
          <code>useTranslation()</code>. Switch the locale to live-translate the
          panel below — including <code>{"{var}"}</code> interpolation.
        </p>
      </div>

      <I18nProvider>
        <TranslatedPanel />
      </I18nProvider>
    </div>
  );
}

function TranslatedPanel() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TranslateIcon size={18} className="text-muted-foreground" />
          {t("app.dashboard")}
        </CardTitle>
        <CardAction>
          <LocaleSwitcher value={locale} onChange={setLocale} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {t("greeting.hello", { name: "Ada" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("greeting.welcome", { app: "Taoracle" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("items.count", { count: 42 })}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="i18n-name">{t("form.name")}</Label>
            <Input id="i18n-name" placeholder="Ada Lovelace" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="i18n-email">{t("form.email")}</Label>
            <Input id="i18n-email" type="email" placeholder="ada@example.com" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline">{t("form.cancel")}</Button>
            <Button>{t("form.save")}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LocaleSwitcher({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="inline-flex border border-border">
      {locales.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
