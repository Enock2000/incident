
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileWarning, Check, AlertCircle, TrendingUp, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const reports = [
    { id: 'FN001', claim: 'Polling stations in Lusaka closing early.', source: 'Social Media', status: 'Debunked', risk: 'High', timestamp: '10:00 AM' },
    { id: 'FN002', claim: 'Candidate X seen meeting with foreign officials.', source: 'Blog Post', status: 'Verifying', risk: 'Medium', timestamp: '11:30 AM' },
    { id: 'FN003', claim: 'Ballot papers pre-marked.', source: 'WhatsApp', status: 'Debunked', risk: 'High', timestamp: '09:15 AM' },
    { id: 'FN004', claim: 'Election day postponed in Copperbelt.', source: 'SMS', status: 'Verifying', risk: 'High', timestamp: '12:00 PM' },
];

export default function FakeNewsMisinformationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Fake News & Misinformation
        </h1>
        <Link href="/report?category=Fake%20News">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Report Claim
            </Button>
        </Link>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Verification</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'Verifying').length}</div>
            <p className="text-xs text-muted-foreground">Claims currently being investigated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debunked Claims</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'Debunked').length}</div>
            <p className="text-xs text-muted-foreground">Claims confirmed as false</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending Source</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Social Media</div>
            <p className="text-xs text-muted-foreground">Most common source of reports</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Misinformation Tracker</CardTitle>
            <CardDescription>A real-time log of reported fake news and misinformation claims.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Claim</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell className="font-medium max-w-sm truncate">{report.claim}</TableCell>
                            <TableCell><Badge variant="outline">{report.source}</Badge></TableCell>
                            <TableCell>
                                <Badge variant={report.risk === 'High' ? 'destructive' : 'secondary'}>{report.risk}</Badge>
                            </TableCell>
                            <TableCell>{report.status}</TableCell>
                            <TableCell className="text-right">
                                 <Select>
                                    <SelectTrigger className="w-[120px] h-8">
                                        <SelectValue placeholder="Take Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="verify">Start Verification</SelectItem>
                                        <SelectItem value="debunk">Mark as Debunked</SelectItem>
                                        <SelectItem value="escalate">Escalate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
