import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { LegalPage, LegalSection } from "@/components/site/LegalPage"
import { SUPPORT_EMAIL } from "@/lib/site"

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 3, 2026">
      {/* The product rule, front and center. */}
      <div className="rounded-2xl border border-violet/25 bg-violet/[0.07] p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
          <ShieldAlert className="size-5 text-brand" />
          Research, not investment advice
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          HakiSense is a research tool. It does <strong className="text-text-primary">not</strong>{" "}
          provide investment, financial, legal or tax advice, and it never issues BUY, HOLD or
          SELL recommendations. Nothing produced by the service is an offer or solicitation to
          buy or sell any security. You are solely responsible for your own decisions and should
          consult a licensed professional before acting.
        </p>
      </div>

      <LegalSection heading="1. Acceptance of terms">
        <p>
          By creating an account or using HakiSense, you agree to these Terms. If you do not
          agree, do not use the service.
        </p>
      </LegalSection>

      <LegalSection heading="2. The service">
        <p>
          HakiSense assembles structured equity-research analyst reports from primary sources. Output
          may contain errors, omissions, or out-of-date information, and is provided for
          informational and research purposes only.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <p>
          You are responsible for safeguarding your credentials and for activity under your
          account. Provide accurate information and keep it current. Notify us promptly of any
          unauthorized use.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <ul>
          <li>Don&apos;t misuse, disrupt, or attempt to gain unauthorized access to the service.</li>
          <li>Don&apos;t scrape, resell, or redistribute output in violation of these Terms.</li>
          <li>Don&apos;t use the service to break the law or infringe others&apos; rights.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Intellectual property">
        <p>
          The service, its software and its branding are owned by HakiSense and its licensors.
          Source documents referenced in an analyst report remain the property of their respective
          owners.
        </p>
      </LegalSection>

      <LegalSection heading="6. No warranty">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind, express or implied, including accuracy, fitness for a
          particular purpose, or non-infringement.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          To the fullest extent permitted by law, HakiSense is not liable for any indirect,
          incidental, or consequential damages, or for any investment losses, arising from your
          use of — or reliance on — the service.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes">
        <p>
          We may update these Terms from time to time. Material changes will be reflected by the
          &ldquo;last updated&rdquo; date above. Continued use after changes means you accept the
          revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use our{" "}
          <Link to="/contact">contact page</Link>. See also our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
