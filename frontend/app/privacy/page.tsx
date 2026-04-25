"use client";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useI18n } from "@/i18n/I18nProvider";

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <LegalPageLayout
      eyebrow={t("legal.privacy.eyebrow")}
      title={t("legal.privacy.title")}
      summary={t("legal.privacy.summary")}
      updatedAt={t("legal.privacy.updatedAt")}
      alternateLink={{ href: "/terms", label: t("legal.privacy.alternateLink") }}
      notes={[
        {
          label: t("legal.privacy.notes.appliesToLabel"),
          value: t("legal.privacy.notes.appliesToValue"),
        },
        {
          label: t("legal.privacy.notes.processedByLabel"),
          value: t("legal.privacy.notes.processedByValue"),
        },
        {
          label: t("legal.privacy.notes.mainFocusLabel"),
          value: t("legal.privacy.notes.mainFocusValue"),
        },
      ]}
      sections={[
        {
          title: t("legal.privacy.sections.data.title"),
          body: t("legal.privacy.sections.data.body"),
        },
        {
          title: t("legal.privacy.sections.why.title"),
          body: t("legal.privacy.sections.why.body"),
        },
        {
          title: t("legal.privacy.sections.storage.title"),
          body: t("legal.privacy.sections.storage.body"),
        },
        {
          title: t("legal.privacy.sections.security.title"),
          body: t("legal.privacy.sections.security.body"),
        },
        {
          title: t("legal.privacy.sections.requests.title"),
          body: t("legal.privacy.sections.requests.body"),
        },
      ]}
    />
  );
}
