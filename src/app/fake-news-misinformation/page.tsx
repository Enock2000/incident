
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bot, Check, X } from "lucide-react";
import { useState } from "react";

type ClaimStatus = 'Verifying' | 'False' | 'True' | 'Unverified';

const claims = [
    { id: 1, text: "Polling stations will close at 2 PM today.", status: 'False' as ClaimStatus, source: "Social Media", risk: "High" },
    { id: 2, text: "Candidate X seen meeting with foreign officials.", status: 'Verifying' as ClaimStatus, source: "Blog Post", risk: "Medium" },
    { id: 3, text: "ECZ announces delay in vote counting.", status: 'True' as ClaimStatus, source: "Official Press Release", risk: "Low" },
    { id: 4, text: "Extra ballot papers found in a warehouse in Ndola.", status: 'Unverified' as ClaimStatus, source: "Citizen Report", risk: "High" },
];

const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
        case 'True': return <Check className="text-green-500" />;
        case 'False': return <X className="text-red-500" />;
        case 'Verifying': return <Bot className="text-blue-500 animate-pulse" />;
        default: return null;
    }
}

export default function FakeNewsMisinformationPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Fake News & Misinformation
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Claim Verification Hub</CardTitle>
          <CardDescription>Track and verify rumors and claims circulating online.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 mb-6">
            <Input 
              type="text" 
              placeholder="Search for a claim or keyword..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit"><Search className="mr-2 h-4 w-4" /> Verify</Button>
          </div>

           <div className="space-y-4">
                {claims.filter(c => c.text.toLowerCase().includes(searchTerm.toLowerCase())).map(claim => (
                    <div key={claim.id} className="p-4 border rounded-lg">
                        <p className="font-medium">{claim.text}</p>
                        <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Source: {claim.source}</span>
                                <Badge variant={claim.risk === 'High' ? 'destructive' : 'secondary'}>Risk: {claim.risk}</Badge>
                            </div>
                            <div className="flex items-center gap-2 font-semibold">
                                {getStatusIcon(claim.status)}
                                <span>{claim.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
