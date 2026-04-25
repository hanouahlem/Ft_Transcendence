"use client";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useI18n } from "@/i18n/I18nProvider";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <LegalPageLayout
      eyebrow={t("legal.terms.eyebrow")}
      title={t("legal.terms.title")}
      summary={t("legal.terms.summary")}
      updatedAt={t("legal.terms.updatedAt")}
      alternateLink={{ href: "/privacy", label: t("legal.terms.alternateLink") }}
      notes={[
        {
          label: t("legal.terms.notes.appliesToLabel"),
          value: t("legal.terms.notes.appliesToValue"),
        },
        {
          label: t("legal.terms.notes.contextLabel"),
          value: t("legal.terms.notes.contextValue"),
        },
        {
          label: t("legal.terms.notes.mainFocusLabel"),
          value: t("legal.terms.notes.mainFocusValue"),
        },
      ]}
      sections={[
        {
          title: t("legal.terms.sections.scope.title"),
          body: t("legal.terms.sections.scope.body"),
        },
        {
          title: t("legal.terms.sections.responsibilities.title"),
          body: t("legal.terms.sections.responsibilities.body"),
        },
        {
          title: t("legal.terms.sections.accounts.title"),
          body: t("legal.terms.sections.accounts.body"),
        },
        {
          title: t("legal.terms.sections.availability.title"),
          body: t("legal.terms.sections.availability.body"),
        },
        {
          title: t("legal.terms.sections.moderation.title"),
          body: t("legal.terms.sections.moderation.body"),
        },
      ]}
    />
  );
}
