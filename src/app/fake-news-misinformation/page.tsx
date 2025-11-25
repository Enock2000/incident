
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bot, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query, orderByChild, equalTo } from "firebase/database";
import type { Incident } from "@/lib/types";

type ClaimStatus = 'Verified' | 'In Progress' | 'Resolved' | 'Reported' | 'Rejected' | 'Team Dispatched';

const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
        case 'Resolved': return <Check className="text-green-500" />;
        case 'Rejected': return <X className="text-red-500" />;
        case 'Verified':
        case 'In Progress': 
        case 'Team Dispatched':
            return <Bot className="text-blue-500 animate-pulse" />;
        default: return null;
    }
}

export default function FakeNewsMisinformationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const database = useDatabase();
  
  const claimsQuery = useMemoFirebase(() =>
    database ? query(ref(database, 'incidents'), orderByChild('category'), equalTo('Other')) : null,
    [database]
  );
  const { data: claims, isLoading } = useCollection<Incident>(claimsQuery);

  const getRisk = (priority: string) => {
    if (priority === 'Critical' || priority === 'High') return 'High';
    if (priority === 'Medium') return 'Medium';
    return 'Low';
  }

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
              {isLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : claims && claims.length > 0 ? (
                  claims.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(claim => (
                    <div key={claim.id} className="p-4 border rounded-lg">
                        <p className="font-medium">{claim.title}</p>
                        <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-2">
                                <Badge variant={getRisk(claim.priority) === 'High' ? 'destructive' : 'secondary'}>Risk: {getRisk(claim.priority)}</Badge>
                            </div>
                            <div className="flex items-center gap-2 font-semibold">
                                {getStatusIcon(claim.status)}
                                <span>{claim.status}</span>
                            </div>
                        </div>
                    </div>
                  ))
              ) : (
                <p className="text-center py-10">No claims to verify at the moment.</p>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
