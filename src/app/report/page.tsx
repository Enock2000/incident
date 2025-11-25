
import { ReportIncidentForm } from "@/components/incidents/report-incident-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportIncidentPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <Card>
            <CardHeader>
                <CardTitle>Report a New Incident</CardTitle>
                <CardDescription>
                    Fill out the form below to report an incident. Please provide as much detail as possible.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReportIncidentForm />
            </CardContent>
       </Card>
    </div>
  );
}
