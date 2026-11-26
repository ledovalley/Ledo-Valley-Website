import EmailSection from "@/components/account/EmailSection";
import ProfileSection from "@/components/account/ProfileSection";
import ReferralSection from "@/components/account/ReferralSection";

export default function AccountOverview() {
  return (
    <section className="space-y-4">
      <ProfileSection />
      <EmailSection />
      <ReferralSection />
    </section>
  );
}
