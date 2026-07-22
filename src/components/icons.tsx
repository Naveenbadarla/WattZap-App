import {
  Activity,
  BadgeCheck,
  Bell,
  Briefcase,
  Cpu,
  Factory,
  FileText,
  Folder,
  Gauge,
  Home,
  Lightbulb,
  LifeBuoy,
  Map,
  Receipt,
  ScanLine,
  Search,
  Settings,
  Shield,
  Sun,
  Sunrise,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** String → icon mapping so data files can reference icons by name. */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  map: Map,
  factory: Factory,
  lightbulb: Lightbulb,
  bell: Bell,
  wallet: Wallet,
  "file-text": FileText,
  folder: Folder,
  "life-buoy": LifeBuoy,
  settings: Settings,
  briefcase: Briefcase,
  search: Search,
  scan: ScanLine,
  shield: Shield,
  gauge: Gauge,
  receipt: Receipt,
  sun: Sun,
  sunrise: Sunrise,
  activity: Activity,
  cpu: Cpu,
  "badge-check": BadgeCheck,
  zap: Zap,
};

export function AppIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Zap;
  return <Icon className={className} aria-hidden />;
}

export function WattZapLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-ink">
        <Zap className="h-5 w-5" aria-hidden fill="currentColor" />
      </span>
      <span className="text-lg">
        Watt<span className="text-brand-600">Zap</span>
      </span>
    </span>
  );
}
