import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatTriggerProps {
    onExpand: () => void;
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

export function ChatTrigger({ onExpand, isMobile = false, prefersReducedMotion = false }: ChatTriggerProps) {
    // Responsive animation settings
    const animationConfig = prefersReducedMotion 
        ? { duration: 0.1, ease: "linear" as const }
        : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

    const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        onExpand();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleInteraction(e);
        }
    };

    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={animationConfig}
            onClick={handleInteraction}
            className={cn(
                "cursor-pointer w-full",
                // Enhanced touch target for mobile
                isMobile && "touch-manipulation"
            )}
            role="button"
            aria-label="Open AI chat"
            tabIndex={0}
        >
            <Input
                placeholder={isMobile ? "Ask me anything..." : "Ask me anything"}
                className={cn(
                    "w-full rounded-lg border border-input bg-background transition-all duration-200",
                    "focus:ring-1 focus:ring-ring hover:shadow-sm",
                    // Mobile-optimized sizing and spacing
                    isMobile ? [
                        "px-4 py-3.5 text-base", // Larger touch targets
                        "min-h-[48px]", // Minimum touch target size
                        "hover:bg-accent/30", // Subtle hover on mobile
                    ] : [
                        "px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base",
                        "hover:bg-accent/50",
                    ],
                    // Enhanced focus styles for keyboard navigation
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // Smooth transitions
                    !prefersReducedMotion && "transition-all duration-200"
                )}
                readOnly
                tabIndex={-1} // Prevent double focus
                onKeyDown={handleKeyDown}
                // Prevent mobile keyboard from appearing
                inputMode="none"
                autoComplete="off"
                // Accessibility improvements
                aria-hidden="true"
            />
        </motion.div>
    );
}