
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VoterSafetyIncidentPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Voter Safety Incident
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder page for Voter Safety Incidents. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
