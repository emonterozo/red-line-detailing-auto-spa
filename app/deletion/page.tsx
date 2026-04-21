import LegalLayout from "../components/LegalLayou";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Data Deletion">
      <p>To delete your Red Line Care account and data:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Log in to your Social Media account (Facebook/Instagram).</li>
        <li>
          Go to <strong>Settings & Privacy &gt; Apps and Websites</strong>.
        </li>
        <li>
          Find <strong>Red Line Care</strong> and click <strong>Remove</strong>.
        </li>
      </ul>
      <p>
        For manual deletion from our MongoDB database, please email
        <span className="text-white ml-2">ask.redlinedetailing@gmail.com {" "}</span>
        with the subject &quot;Delete My Account.&quot;
      </p>
    </LegalLayout>
  );
}
