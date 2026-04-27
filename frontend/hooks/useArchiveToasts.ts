"use client";

import { useCallback } from "react";
import { archiveToaster } from "@/components/ui/toaster";
import { useI18n } from "@/i18n/I18nProvider";

export function useArchiveToasts() {
  const { t } = useI18n();

  const notifyError = useCallback((description: string) => {
    archiveToaster.error({
      title: t("common.error"),
      description,
      duration: 6000,
    });
  }, [t]);

  const notifySuccess = useCallback((description: string) => {
    archiveToaster.success({
      title: t("common.fieldNotice"),
      description,
    });
  }, [t]);

  return {
    notifyError,
    notifySuccess,
  };
}
