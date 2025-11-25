
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref, query } from "firebase/database";
import type { Department } from "@/lib/types";
import { Loader2, Package, Truck, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type AssetStatus = 'Active' | 'Inactive' | 'Maintenance';

type Asset = {
    id: string;
    name: string;
    assetType: 'Vehicle' | 'Equipment' | string;
    status: AssetStatus;
    departmentId: string;
    departmentName?: string;
};

const getAssetIcon = (assetType: string) => {
    switch (assetType) {
        case 'Vehicle':
            return <Truck className="h-4 w-4 text-muted-foreground" />;
        case 'Equipment':
            return <Shield className="h-4 w-4 text-muted-foreground" />;
        default:
            return <Package className="h-4 w-4 text-muted-foreground" />;
    }
};

const getStatusBadgeVariant = (status: AssetStatus) => {
    switch (status) {
        case 'Active':
            return 'default';
        case 'Maintenance':
            return 'secondary';
        case 'Inactive':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function AssetsPage() {
  const database = useDatabase();
  const [searchTerm, setSearchTerm] = useState("");

  const departmentsQuery = useMemoFirebase(() => database ? query(ref(database, 'departments')) : null, [database]);
  const { data: departments, isLoading: departmentsLoading } = useCollection<Department>(departmentsQuery);

  const allAssets = useMemo(() => {
    if (!departments) return [];
    
    const assets: Asset[] = [];
    departments.forEach(dept => {
        if (dept.assets) {
            Object.entries(dept.assets).forEach(([assetId, assetData]) => {
                assets.push({
                    ...(assetData as Omit<Asset, 'id'>),
                    id: assetId,
                    departmentName: dept.name,
                });
            });
        }
    });
    return assets;
  }, [departments]);
  
  const filteredAssets = useMemo(() => {
    if (!allAssets) return [];
    return allAssets.filter(asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAssets, searchTerm]);

  const isLoading = departmentsLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Asset Management
        </h1>
         <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Asset
         </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Departmental Assets</CardTitle>
          <CardDescription>An inventory of all assets across every department.</CardDescription>
           <div className="pt-4">
             <Input 
                placeholder="Search by asset or department name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
             />
           </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAssets && filteredAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getAssetIcon(asset.assetType)}
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.assetType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.departmentName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Package className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-headline">
                    No Assets Found
                </h3>
                <p className="text-muted-foreground">
                    There are no assets to display or none match your search.
                </p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
