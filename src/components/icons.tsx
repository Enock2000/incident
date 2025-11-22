import { cn } from "@/lib/utils";

export function ZtisLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M4 4h16v4l-8 8-8-8V4z" fill="hsl(var(--primary) / 0.1)"/>
      <path d="M4 4l8 8 8-8" stroke="hsl(var(--primary))"/>
      <text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fill="hsl(var(--primary))">ZTIS</text>
    </svg>
  );
}
