import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatWidgetProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
    variant?: "default" | "critical" | "warning" | "success" | "info";
}

const variants = {
    default: "from-slate-500/10 to-slate-500/5 border-slate-200/20 text-slate-700",
    critical: "from-red-500/10 to-red-500/5 border-red-200/20 text-red-700",
    warning: "from-amber-500/10 to-amber-500/5 border-amber-200/20 text-amber-700",
    success: "from-emerald-500/10 to-emerald-500/5 border-emerald-200/20 text-emerald-700",
    info: "from-blue-500/10 to-blue-500/5 border-blue-200/20 text-blue-700",
};

const iconVariants = {
    default: "bg-slate-100 text-slate-600",
    critical: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600",
    success: "bg-emerald-100 text-emerald-600",
    info: "bg-blue-100 text-blue-600",
};

export function StatWidget({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    variant = "default",
}: StatWidgetProps) {
    return (
        <Card className={cn("overflow-hidden border bg-gradient-to-br shadow-sm transition-all hover:shadow-md", variants[variant], className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
                            {trend && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-1.5 py-0.5 rounded-full",
                                        trend.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    )}
                                >
                                    {trend.positive ? "+" : ""}{trend.value}% {trend.label}
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
