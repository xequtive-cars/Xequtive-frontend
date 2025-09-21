"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Clock } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import ContactMessageForm from "@/components/forms/ContactMessageForm";

export default function ContactPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Contact" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get in touch with our team
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Contact Information - 20% width */}
        <div className="w-full lg:w-[30%]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Phone</h3>
                  <p className="text-muted-foreground text-sm">+44 78 3105 4649</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Email</h3>
                  <p className="text-muted-foreground text-sm">info@xequtive.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Support Hours</h3>
                  <p className="text-muted-foreground text-sm">24/7 Customer Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Message Form - 80% width */}
        <div className="w-full lg:w-[70%]">
          <Card>
            <CardContent className="p-8">
              <ContactMessageForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
} 