
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center glass-effect p-8 rounded-lg animate-fade-in">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 mb-6">
          <div className="text-4xl">404</div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the page you were looking for.
        </p>
        <Button asChild className="hover-effect">
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
