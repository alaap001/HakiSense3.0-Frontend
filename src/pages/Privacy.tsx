import { Link } from "react-router-dom"

import { LegalPage, LegalSection } from "@/components/site/LegalPage"
import { SUPPORT_EMAIL } from "@/lib/site"

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 3, 2026">
      <LegalSection heading="Overview">
        <p>
          This policy explains what information HakiSense (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
          collects when you use the service, how we use it, and the choices you have. We aim to
          collect only what we need to run the product.
        </p>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <ul>
          <li>
            <strong>Account information</strong> — your email address and the display name you
            provide when you sign up.
          </li>
          <li>
            <strong>Research activity</strong> — the tickers you research and the analyst reports
            generated for your account, so you can revisit them.
          </li>
          <li>
            <strong>Technical data</strong> — basic, standard logs (such as timestamps and
            error information) needed to operate and secure the service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use information">
        <ul>
          <li>To authenticate you and provide the research features you request.</li>
          <li>To store your run history so it&apos;s available when you return.</li>
          <li>To maintain security, debug issues, and improve reliability.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use your research activity to
          provide investment advice.
        </p>
      </LegalSection>

      <LegalSection heading="Service providers">
        <p>
          Authentication and data storage are handled by Supabase. Research processing relies on
          third-party model and data providers. These processors receive only the data needed to
          perform their function and are expected to protect it.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and local storage">
        <p>
          We use local storage in your browser to keep you signed in (your session token). We do
          not use third-party advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention">
        <p>
          We keep your account and research history until you delete your account or ask us to
          remove it. To request deletion, see the{" "}
          <Link to="/settings">danger zone in Settings</Link> or email us.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can access and update your profile from your account, change your email and
          password in Settings, and request deletion of your account and data at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use our{" "}
          <Link to="/contact">contact page</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
