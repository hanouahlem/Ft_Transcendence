import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Public Archive Record"
      title="Terms of Service"
      summary="These terms define how this Field Notes instance can be used during the ft_transcendence project, including account behavior, published content, and platform access."
      updatedAt="April 23, 2026"
      alternateLink={{ href: "/privacy", label: "Privacy Policy" }}
      notes={[
        { label: "Applies To", value: "All registered users and visitors of this project instance." },
        { label: "Context", value: "Educational deployment for a 42 school group project." },
        { label: "Main Focus", value: "Acceptable use, account handling, and service limitations." },
      ]}
      sections={[
        {
          title: "Scope of the Service",
          body: "Field Notes is a social web application where users create accounts, publish posts, react to content, and connect with other users. The platform exists for educational demonstration and project evaluation purposes.",
        },
        {
          title: "User Responsibilities",
          body: "Users remain responsible for the content they publish and the actions performed through their account. Content must not be unlawful, abusive, fraudulent, or intended to disrupt the service or misuse another user's data.",
        },
        {
          title: "Accounts and Access",
          body: "Accounts are personal and must not be shared. Users must protect their credentials and notify the team if unauthorized access is suspected. Access may be restricted if abusive or unsafe behavior is detected.",
        },
        {
          title: "Service Availability",
          body: "This project is provided as-is. Features, data, and uptime may change during development, debugging, demonstrations, or evaluation sessions. The team may suspend parts of the service temporarily when necessary.",
        },
        {
          title: "Moderation and Contact",
          body: "The project team may remove content or restrict access to preserve platform stability, safety, and compliance with the school project context. Questions about these terms can be addressed to the team maintaining the deployment.",
        },
      ]}
    />
  );
}
