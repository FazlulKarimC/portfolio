import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
    error: string;
    canRetry: boolean;
    onRetry: () => void;
    networkStatus: 'online' | 'offline' | 'slow';
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

export function ErrorDisplay({ 
    error, 
    canRetry, 
    onRetry, 
    networkStatus,
    isMobile = false,
    prefersReducedMotion = false
}: ErrorDisplayProps) {
    const getNetworkIcon = () => {
        const iconSize = isMobile ? "h-5 w-5" : "h-4 w-4";
        switch (networkStatus) {
            case 'offline':
                return <WifiOff className={iconSize} />;
            case 'slow':
                return <AlertTriangle className={iconSize} />;
            default:
                return <Wifi className={iconSize} />;
        }
    };

    const animationConfig = prefersReducedMotion 
        ? { duration: 0.1 }
        : { duration: 0.3 };

    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={animationConfig}
            className={cn(
                "bg-destructive/10 border border-destructive/20 rounded-lg flex-shrink-0",
                isMobile ? "mb-3 p-4" : "mb-3 p-3"
            )}
        >
            <div className={cn(
                "flex items-start",
                isMobile ? "gap-3" : "gap-2"
            )}>
                <div className={cn(
                    "flex items-center gap-2 text-destructive flex-1 min-w-0"
                )}>
                    {getNetworkIcon()}
                    <span className={cn(
                        "font-medium",
                        isMobile ? "text-base" : "text-sm"
                    )}>
                        {networkStatus === 'offline' ? 'Connection Issue' : 'Error'}
                    </span>
                </div>
                {canRetry && (
                    <Button
                        variant="outline"
                        size={isMobile ? "sm" : "sm"}
                        onClick={onRetry}
                        className={cn(
                            "flex-shrink-0",
                            isMobile ? [
                                "h-9 px-3 text-sm",
                                "min-w-[80px]" // Ensure adequate touch target
                            ] : [
                                "h-7 px-2 text-xs"
                            ]
                        )}
                    >
                        <RefreshCw className={cn(
                            "mr-1",
                            isMobile ? "h-4 w-4" : "h-3 w-3"
                        )} />
                        Retry
                    </Button>
                )}
            </div>
            <p className={cn(
                "text-destructive/80 mt-1 leading-relaxed",
                isMobile ? "text-base" : "text-sm"
            )}>
                {error}
            </p>
        </motion.div>
    );
}