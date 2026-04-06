"use client";

import { useCallback } from "react";
import { archiveToaster } from "@/components/ui/toaster";

export function useArchiveToasts() {
  const notifyError = useCallback((description: string) => {
    archiveToaster.error({
      title: "Error",
      description,
      duration: 6000,
    });
  }, []);

  const notifySuccess = useCallback((description: string) => {
    archiveToaster.success({
      title: "Field Notice",
      description,
    });
  }, []);

  return {
    notifyError,
    notifySuccess,
  };
}
