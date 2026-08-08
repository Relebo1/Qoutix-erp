import Image from "next/image";
import { Globe, Mail, ExternalLink } from "lucide-react";
import ComingSoonLink from "./ComingSoonLink";

const footerLinks = {
  Product: ["Features", "Pricing", "How It Works", "Changelog"],
  Solutions: ["Freelancers", "Agencies", "Consultants", "Contractors"],
  Resources: ["Help Center", "Blog", "API Docs", "Status"],
  Company: ["About", "Careers", "Contact", "Privacy Policy"],
};

export default function Footer() {
  return (
    <footer className="border-t" id="resources" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-10">
          <div className="lg:col-span-2">
            <Image src="/logo.png" alt="Quotix" width={110} height={32} className="object-contain mb-4" />
            <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: "var(--text-muted)" }}>
              The all-in-one platform for freelancers and small businesses to create quotes, manage clients, and get paid faster.
            </p>
            <div className="flex items-center gap-2">
              {[{ icon: Globe, label: "Website" }, { icon: Mail, label: "Email" }, { icon: ExternalLink, label: "Twitter" }].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:border-blue-400 hover:text-blue-600"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-primary)" }}>{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <ComingSoonLink feature={link} className="text-sm transition-colors hover:text-blue-600" style={{ color: "var(--text-muted)" } as React.CSSProperties}>
                      {link}
                    </ComingSoonLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }} suppressHydrationWarning>
            © {new Date().getFullYear()} Quotix. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built with Next.js · TypeScript · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
