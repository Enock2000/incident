'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCollection, useDatabase, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { Department } from "@/lib/types";
import { createStaffUser } from "@/app/actions";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Copy, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialState = { success: false, message: '', username: '', password: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Staff Account
        </Button>
    );
}

interface CreateStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateStaffDialog({ open, onOpenChange }: CreateStaffDialogProps) {
    const [state, formAction] = useActionState(createStaffUser, initialState);
    const { toast } = useToast();
    const database = useDatabase();
    const [showPassword, setShowPassword] = useState(false);

    const departmentsRef = useMemoFirebase(() =>
        database ? ref(database, 'departments') : null,
        [database]
    );

    const { data: departments } = useCollection<Department>(departmentsRef);

    useEffect(() => {
        if (state.success) {
            toast({ title: "Success", description: state.message });
            // Don't close dialog - show credentials
        } else if (state.message && !state.success) {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: `${label} copied to clipboard` });
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset after closing
        setTimeout(() => window.location.reload(), 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Staff Account</DialogTitle>
                    <DialogDescription>
                        Create a new department staff account. Credentials will be auto-generated.
                    </DialogDescription>
                </DialogHeader>

                {state.success && state.username && state.password ? (
                    <div className="space-y-4">
                        <Alert className="bg-success/10 border-success">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <AlertDescription>
                                Staff account created successfully! Share these credentials securely.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <div className="flex gap-2">
                                    <Input value={state.username} readOnly className="font-mono" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(state.username!, 'Username')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Password (Temporary)</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={state.password}
                                            readOnly
                                            className="font-mono pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(state.password!, 'Password')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    ⚠️ This password will not be shown again. Copy and share it securely.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleClose}
                            className="w-full"
                        >
                            Done
                        </Button>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input id="phoneNumber" name="phoneNumber" type="tel" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userType">Role</Label>
                            <Select name="userType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="responseUnit">Response Unit</SelectItem>
                                    <SelectItem value="regionalAuthority">Regional Authority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="departmentId">Department</Label>
                            <Select name="departmentId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments?.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Alert>
                            <AlertDescription>
                                📝 A username and temporary password will be auto-generated.
                            </AlertDescription>
                        </Alert>

                        {state.message && !state.success && (
                            <Alert variant="destructive">
                                <AlertDescription>{state.message}</AlertDescription>
                            </Alert>
                        )}

                        <SubmitButton />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
