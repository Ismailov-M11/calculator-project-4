import { Link, useLocation } from "react-router-dom";
import { Calculator, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";

export function Navigation() {
  const { t } = useI18n();
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: Calculator,
      label: t.calculator,
    },
    {
      path: "/warehouses",
      icon: Building,
      label: t.warehouses,
    },
  ];

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Button
            key={item.path}
            asChild
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={`gap-2 ${isActive ? "bg-black hover:bg-gray-800 text-white" : ""}`}
          >
            <Link to={item.path}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
