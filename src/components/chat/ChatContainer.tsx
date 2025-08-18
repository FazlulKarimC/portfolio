import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, WifiOff, AlertTriangle } from "lucide-react";
import { ChatState } from "@/types/chat";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ErrorDisplay } from "./ErrorDisplay";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
    chatState: ChatState;
    onCollapse: () => void;
    onInputChange: (value: string) => void;
    onSendMessage: (message: string) => void;
    onRetry: () => void;
    isMobile?: boolean;
    isTablet?: boolean;
    prefersReducedMotion?: boolean;
}

export function ChatContainer({ 
    chatState, 
    onCollapse, 
    onInputChange, 
    onSendMessage, 
    onRetry,
    isMobile = false,
    isTablet = false,
    prefersReducedMotion = false
}: ChatContainerProps) {
    // Responsive animation settings
    const animationConfig = prefersReducedMotion 
        ? { duration: 0.1, ease: "linear" as const }
        : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

    // Responsive height calculations
    const getResponsiveHeight = () => {
        if (isMobile) {
            // On mobile, use more of the viewport but leave space for navigation
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
            const maxHeight = Math.min(viewportHeight * 0.7, 500);
            return `${maxHeight}px`;
        }
        if (isTablet) {
            return "480px";
        }
        return "520px";
    };

    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            transition={animationConfig}
            className="w-full"
        >
            <Card 
                className={cn(
                    "w-full flex flex-col shadow-lg border-border/50",
                    // Responsive padding
                    isMobile ? "p-3" : "p-3 sm:p-4",
                    // Responsive border radius
                    isMobile ? "rounded-lg" : "rounded-xl",
                )}
                style={{ 
                    height: getResponsiveHeight(),
                    // Ensure proper touch scrolling on mobile
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* Chat Header */}
                <div className={cn(
                    "flex items-center justify-between pb-2 border-b border-border/30 flex-shrink-0",
                    isMobile ? "mb-3" : "mb-3 sm:mb-4"
                )}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h3 className={cn(
                            "font-semibold text-foreground truncate",
                            isMobile ? "text-base" : "text-base sm:text-lg"
                        )}>
                            Chat with Fazlul
                        </h3>
                        
                        {/* Network status indicators */}
                        {chatState.networkStatus === 'offline' && (
                            <div className="flex items-center gap-1 text-destructive flex-shrink-0">
                                <WifiOff className="h-3 w-3" />
                                <span className="text-xs hidden sm:inline">Offline</span>
                            </div>
                        )}
                        {chatState.networkStatus === 'slow' && (
                            <div className="flex items-center gap-1 text-warning flex-shrink-0">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs hidden sm:inline">Slow</span>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCollapse}
                        className={cn(
                            "p-0 hover:bg-accent rounded-full flex-shrink-0",
                            // Larger touch target on mobile
                            isMobile ? "h-10 w-10" : "h-8 w-8",
                            !prefersReducedMotion && "transition-colors duration-200"
                        )}
                        aria-label="Close chat"
                    >
                        <X className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                    </Button>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                    {chatState.error && (
                        <ErrorDisplay
                            error={chatState.error}
                            canRetry={chatState.canRetry || false}
                            onRetry={onRetry}
                            networkStatus={chatState.networkStatus || 'online'}
                            isMobile={isMobile}
                            prefersReducedMotion={prefersReducedMotion}
                        />
                    )}
                </AnimatePresence>

                {/* Chat Messages - This is the scrollable area */}
                <ChatMessages
                    messages={chatState.messages}
                    isLoading={chatState.isLoading}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* Chat Input */}
                <ChatInput
                    currentInput={chatState.currentInput}
                    isLoading={chatState.isLoading}
                    onInputChange={onInputChange}
                    onSendMessage={onSendMessage}
                    networkStatus={chatState.networkStatus || 'online'}
                    autoFocus={!isMobile} // Don't auto-focus on mobile to prevent keyboard popup
                    isMobile={isMobile}
                    prefersReducedMotion={prefersReducedMotion}
                />
            </Card>
        </motion.div>
    );
}