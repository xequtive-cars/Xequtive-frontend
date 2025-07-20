"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, Phone } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function PressPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Press" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Press</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Media resources and press information
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Press Kit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For media inquiries, press releases, and company information, 
              please contact our press team.
            </p>
            <div className="flex items-center gap-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Press kit available upon request</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">press@xequtive.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">+44 78 3105 4649</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 