import LegalLayout from "../components/LegalLayou";


export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Effective Date: April 2026</p>
      <p>
        Red Line Care collects your **Name, Email, and Profile Picture** when you log in via Facebook, Instagram, or TikTok.
      </p>
      <p>
        We use this data strictly to manage your **Apex Rewards** points and account. We do not share, sell, or rent your data to third parties.
      </p>
      <p>
        You may request data correction or deletion at any time by contacting us at: 
        <span className="text-white ml-2">ask.redlinedetailing@gmail.com</span>
      </p>
    </LegalLayout>
  );
}