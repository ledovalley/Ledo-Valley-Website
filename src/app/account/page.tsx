import EmailSection from "@/components/account/EmailSection";
import ProfileSection from "@/components/account/ProfileSection";

export default function AccountOverview() {
  return (
    <section className="space-y-4">
      <ProfileSection />
      <EmailSection />
    </section>
  );
}
