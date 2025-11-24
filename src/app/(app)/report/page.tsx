
import { ReportIncidentForm } from "@/components/incidents/report-incident-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportIncidentPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center space-x-4 mb-4">
         <Link href="/">
           <Button variant="outline" size="icon" className="h-8 w-8">
             <ArrowLeft className="h-4 w-4" />
             <span className="sr-only">Back</span>
           </Button>
         </Link>
         <h1 className="text-3xl font-bold tracking-tight font-headline">
           Report an Incident
         </h1>
       </div>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Incident Report</CardTitle>
            <CardDescription>
              Fill out the form below to report an incident. Provide as much detail as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportIncidentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
