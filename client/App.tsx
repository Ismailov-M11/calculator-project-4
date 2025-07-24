import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/components/I18nProvider";
import Index from "./pages/Index";
import WarehousesFull from "./pages/WarehousesFull";
import NotFound from "./pages/NotFound";

// Suppress ResizeObserver errors that are common with Radix UI components
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.(
      "ResizeObserver loop completed with undelivered notifications",
    ) ||
    args[0]?.includes?.("ResizeObserver loop limit exceeded")
  ) {
    return;
  }
  originalError.apply(console, args);
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default routes without language prefix */}
            <Route path="/" element={<Index />} />
            <Route path="/warehouses" element={<WarehousesFull />} />

            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<Index />} />
            <Route path="/:lang/warehouses" element={<WarehousesFull />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
