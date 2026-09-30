import { FiMail, FiMapPin, FiPhone, FiClock } from "react-icons/fi";
import { getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import { Card, CardTitle } from "@/components/ui/Card";
import ContactForm from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHero
        title="Contact"
        subtitle={`Reach ${settings?.departmentName || "the department"} for academic and administrative queries.`}
        imageUrl={settings?.heroImageUrl}
        compact
      />

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Department Office</CardTitle>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {settings?.address && (
                <p className="flex gap-3">
                  <FiMapPin className="mt-0.5 shrink-0 text-academic-teal" />
                  {settings.address}
                </p>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 hover:text-academic-teal"
                >
                  <FiMail className="text-academic-teal" />
                  {settings.email}
                </a>
              )}
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 hover:text-academic-teal"
                >
                  <FiPhone className="text-academic-teal" />
                  {settings.phone}
                </a>
              )}
              {settings?.officeHours && (
                <p className="flex gap-3">
                  <FiClock className="mt-0.5 shrink-0 text-academic-teal" />
                  {settings.officeHours}
                </p>
              )}
            </div>
          </Card>

          {settings?.mapEmbedUrl && (
            <Card className="overflow-hidden !p-0">
              <iframe
                title="Department map"
                src={settings.mapEmbedUrl}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </Card>
          )}
        </div>

        <Card>
          <CardTitle className="mb-2">Send a Message</CardTitle>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
            Fill out the form and we will get back to you soon.
          </p>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
