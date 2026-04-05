"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";

export const archiveToaster = createToaster({
  placement: "top",
  overlap: true,
  gap: 16,
  max: 4,
});

export function AppToaster() {
  return (
    <Toaster toaster={archiveToaster}>
      {(toast) => (
        <Toast.Root key={toast.id}>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
          </div>
          <Toast.CloseTrigger aria-label="Dismiss notification">
            Dismiss
          </Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
}
