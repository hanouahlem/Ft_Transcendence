export function formatFeedTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
