import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Public Archive Record"
      title="Privacy Policy"
      summary="This policy explains what data the project processes, why it is needed to run the application, and how the team handles account and activity information inside this deployment."
      updatedAt="April 23, 2026"
      alternateLink={{ href: "/terms", label: "Terms of Service" }}
      notes={[
        { label: "Applies To", value: "Account data, profile data, posts, comments, and friendship activity." },
        { label: "Processed By", value: "The team operating this project instance and its backend services." },
        { label: "Main Focus", value: "Data usage, retention, security, and user requests." },
      ]}
      sections={[
        {
          title: "What Data We Process",
          body: "The application processes the data required to provide its features, including usernames, email addresses, authentication data, profile details, posts, comments, notifications, and friendship interactions.",
        },
        {
          title: "Why We Process It",
          body: "This data is used to authenticate users, display profiles and content, operate social features, maintain account relationships, and keep the application secure and functional during normal use.",
        },
        {
          title: "Storage and Retention",
          body: "Project data is stored in the database backing this deployment. It may remain available for the lifetime of the instance unless removed for moderation, debugging, maintenance, or explicit user requests handled by the team.",
        },
        {
          title: "Security Measures",
          body: "The project uses common safeguards such as authenticated API access and protected password storage. Even with these measures, no system can promise absolute security, and users should avoid sharing sensitive personal information.",
        },
        {
          title: "Your Requests",
          body: "Users may ask the team to correct or remove data associated with their account, within the limits of the educational and technical context of the project. Requests are handled by the team maintaining the running instance.",
        },
      ]}
    />
  );
}
