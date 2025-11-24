
"use client";

import React, { useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zambiaProvinces } from "@/lib/zambia-locations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const initialState = {
  message: "",
  issues: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Account
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signup, initialState);
  const [province, setProvince] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [date, setDate] = React.useState<Date>();

  const districtsForSelectedProvince = useMemo(() => {
    const selectedProvince = zambiaProvinces.find(p => p.name === province);
    return selectedProvince ? selectedProvince.districts : [];
  }, [province]);

  const handleProvinceChange = (value: string) => {
      setProvince(value);
      setDistrict(''); // Reset district when province changes
  };

  return (
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
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
        />
      </div>
       <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" name="phoneNumber" required />
        </div>
         <div className="space-y-2">
          <Label htmlFor="nrc">NRC Number</Label>
          <Input id="nrc" name="nrc" placeholder="e.g., 123456/10/1" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    />
                </PopoverContent>
            </Popover>
            <input type="hidden" name="dateOfBirth" value={date ? date.toISOString() : ''} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" name="occupation" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
              <Select name="province" required onValueChange={handleProvinceChange} value={province}>
                <SelectTrigger><SelectValue placeholder="Select province..." /></SelectTrigger>
                <SelectContent>
                    {zambiaProvinces.map(p => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="district">District</Label>
             <Select name="district" required disabled={!province} onValueChange={setDistrict} value={district}>
                <SelectTrigger><SelectValue placeholder="Select district..." /></SelectTrigger>
                <SelectContent>
                    {districtsForSelectedProvince.map(d => (
                         <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
       {state?.message && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.message}
            {state.issues && state.issues.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                    {state.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline hover:text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
