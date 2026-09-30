"use client";

import Link from "next/link";
import {
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import { useSettings } from "@/hooks/useSettings";

const socialIcons = [
  { key: "facebook" as const, Icon: FiFacebook },
  { key: "twitter" as const, Icon: FiTwitter },
  { key: "linkedin" as const, Icon: FiLinkedin },
  { key: "youtube" as const, Icon: FiYoutube },
  { key: "instagram" as const, Icon: FiInstagram },
];

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-academic-navy text-slate-200 dark:border-slate-800">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">
            {settings?.departmentName || "Department"}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {settings?.universityName || "University"}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300/90">
            {settings?.departmentDescription ||
              "Department information will appear here once configured in settings."}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
            Quick Links
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["/", "Home"],
              ["/about", "About"],
              ["/faculty", "Faculty"],
              ["/notices", "Notices"],
              ["/resources", "Resources"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-slate-300 transition hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
            Contact
          </h4>
          {settings?.address && (
            <p className="flex gap-2">
              <FiMapPin className="mt-0.5 shrink-0" />
              <span>{settings.address}</span>
            </p>
          )}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-2 transition hover:text-white"
            >
              <FiMail />
              {settings.email}
            </a>
          )}
          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-2 transition hover:text-white"
            >
              <FiPhone />
              {settings.phone}
            </a>
          )}
          {settings?.officeHours && (
            <p className="flex gap-2">
              <FiClock className="mt-0.5 shrink-0" />
              <span>{settings.officeHours}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-3">
            {socialIcons.map(({ key, Icon }) => {
              const href = settings?.socialLinks?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-academic-teal"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {year} {settings?.universityName || "University"} —{" "}
        {settings?.departmentName || "Department"}. All rights reserved.
      </div>
    </footer>
  );
}
