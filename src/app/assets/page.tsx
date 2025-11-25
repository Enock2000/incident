
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssetsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Asset Management
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Track Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will be used to track and manage departmental assets like vehicles and equipment. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
