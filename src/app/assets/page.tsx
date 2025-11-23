
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collectionGroup, query, orderBy } from "firebase/firestore";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Asset = {
    id: string;
    name: string;
    assetType: string;
    status: string;
    departmentId: string;
}

export default function AssetsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const assetsQuery = useMemoFirebase(
    () => 
        firestore && user 
            ? query(collectionGroup(firestore, 'assets'), orderBy('name'))
            : null,
    [firestore, user]
  );
  const { data: assets, isLoading } = useCollection<Asset>(assetsQuery);


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Asset Management
      </h1>
      
      {!assets || assets.length === 0 ? (
         <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
            <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <Package className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4 text-2xl font-headline">
                No Assets Found
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground">
                There are no assets being tracked in the system.
            </p>
            </CardContent>
        </Card>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>All Assets</CardTitle>
                <CardDescription>This is a list of all assets across all departments, fetched using a collection group query.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Department ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell className="font-medium">{asset.name}</TableCell>
                                <TableCell>{asset.assetType}</TableCell>
                                <TableCell>
                                    <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'}>{asset.status}</Badge>
                                </TableCell>
                                <TableCell>{asset.departmentId}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
