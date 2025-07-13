import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function DashboardCard({ 
  title, 
  description, 
  icon: IconComponent, 
  onClick,
  className = ""
}: DashboardCardProps) {
  return (
    <Card 
      className={`flex flex-col items-center justify-center gap-2
                  w-40 h-40 md:w-48 md:h-48 rounded-2xl
                  bg-muted/40 hover:bg-muted transition
                  hover:scale-[1.03] cursor-pointer
                  border shadow-sm hover:shadow-md ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Acceder al módulo ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
        <IconComponent className="text-3xl md:text-4xl text-primary mb-2" />
        <h3 className="text-sm md:text-base font-medium text-foreground">{title}</h3>
      </CardContent>
    </Card>
  );
}