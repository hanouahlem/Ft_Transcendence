export function formatFeedTime(dateString: string, locale = "en") {
  const date = new Date(dateString);

  return date.toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
