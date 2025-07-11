import { useI18n } from "@/hooks/useI18n";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8 w-auto sm:h-10" }: LogoProps) {
  const { language } = useI18n();

  const getLogoUrl = () => {
    switch (language) {
      case "ru":
        return "https://www.fargo.uz/ru";
      case "uz":
        return "https://www.fargo.uz/uz";
      case "en":
      default:
        return "https://www.fargo.uz";
    }
  };

  const handleLogoClick = () => {
    window.open(getLogoUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="bg-white p-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleLogoClick}
    >
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fb7fed7c8ef1d42a2b3043b6730b6b9cb%2F7c8299f51f074291865f9830b9ae00ec?format=webp&width=800"
        alt="FARGO"
        className={className}
      />
    </div>
  );
}
