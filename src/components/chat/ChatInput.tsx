import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    currentInput: string;
    isLoading: boolean;
    onInputChange: (value: string) => void;
    onSendMessage: (message: string) => void;
    networkStatus: 'online' | 'offline' | 'slow';
    autoFocus?: boolean;
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

export function ChatInput({ 
    currentInput, 
    isLoading, 
    onInputChange, 
    onSendMessage, 
    networkStatus, 
    autoFocus = false,
    isMobile = false,
    prefersReducedMotion = false
}: ChatInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when component mounts or autoFocus prop changes
    // Skip auto-focus on mobile to prevent unwanted keyboard popup
    useEffect(() => {
        if (autoFocus && !isMobile && inputRef.current && !isLoading) {
            // Small delay to ensure the component is fully rendered
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoFocus, isLoading, isMobile]);
    const handleSendMessage = () => {
        const trimmedMessage = currentInput.trim();
        if (trimmedMessage && !isLoading) {
            onSendMessage(trimmedMessage);
            // On mobile, blur the input to hide keyboard after sending
            if (isMobile && inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const characterCount = currentInput.length;
    const isOverLimit = characterCount > 500;
    const isEmpty = !currentInput.trim();
    const isOffline = networkStatus === 'offline';
    const isSlow = networkStatus === 'slow';

    return (
        <div className={cn(
            "border-t border-border/30 flex-shrink-0",
            isMobile ? "pt-3" : "pt-3 sm:pt-4"
        )}>
            <div className={cn("flex", isMobile ? "gap-2" : "gap-2")}>
                <div className="flex-1 relative">
                    <Input
                        ref={inputRef}
                        placeholder={
                            isOffline 
                                ? "You're offline..." 
                                : isSlow 
                                    ? "Slow connection..." 
                                    : isMobile 
                                        ? "Ask me anything..."
                                        : "Ask me anything"
                        }
                        value={currentInput}
                        onChange={(e) => onInputChange(e.target.value)}
                        className={cn(
                            "transition-all",
                            // Responsive text sizing
                            isMobile ? "text-base" : "text-sm sm:text-base",
                            // Enhanced mobile input styling
                            isMobile && [
                                "min-h-[44px]", // Minimum touch target
                                "px-4 py-3", // Larger padding for easier typing
                                "rounded-lg", // Consistent border radius
                            ],
                            // Desktop styling
                            !isMobile && "px-3 py-2",
                            // State-based styling
                            isOverLimit && "border-destructive focus:ring-destructive",
                            isOffline && "bg-muted/50 text-muted-foreground",
                            // Animation preferences
                            !prefersReducedMotion && "duration-200"
                        )}
                        maxLength={500}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isOffline}
                        aria-describedby="character-count"
                        // Mobile-specific attributes
                        autoCapitalize={isMobile ? "sentences" : "off"}
                        autoCorrect={isMobile ? "on" : "off"}
                        spellCheck={isMobile}
                        // Prevent zoom on iOS
                        style={isMobile ? { fontSize: '16px' } : undefined}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center">
                            <div className={cn(
                                "flex items-center gap-2 text-muted-foreground",
                                isMobile ? "text-sm" : "text-xs"
                            )}>
                                <div className="flex gap-1">
                                    <div 
                                        className={cn(
                                            "bg-muted-foreground/60 rounded-full",
                                            isMobile ? "w-2 h-2" : "w-1.5 h-1.5",
                                            !prefersReducedMotion && "animate-bounce"
                                        )} 
                                        style={{ animationDelay: '0ms' }}
                                    />
                                    <div 
                                        className={cn(
                                            "bg-muted-foreground/60 rounded-full",
                                            isMobile ? "w-2 h-2" : "w-1.5 h-1.5",
                                            !prefersReducedMotion && "animate-bounce"
                                        )} 
                                        style={{ animationDelay: '150ms' }}
                                    />
                                    <div 
                                        className={cn(
                                            "bg-muted-foreground/60 rounded-full",
                                            isMobile ? "w-2 h-2" : "w-1.5 h-1.5",
                                            !prefersReducedMotion && "animate-bounce"
                                        )} 
                                        style={{ animationDelay: '300ms' }}
                                    />
                                </div>
                                <span>Sending...</span>
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    size={isMobile ? "default" : "sm"}
                    disabled={isEmpty || isLoading || isOverLimit || isOffline}
                    onClick={handleSendMessage}
                    className={cn(
                        // Responsive sizing and padding
                        isMobile ? [
                            "px-4 py-3 min-h-[44px]", // Larger touch target
                            "min-w-[44px]", // Ensure square aspect for icon-only state
                        ] : [
                            "px-3 sm:px-4",
                        ],
                        // State-based styling
                        isSlow && "bg-warning/80 hover:bg-warning",
                        // Animation preferences
                        !prefersReducedMotion && "transition-all duration-200"
                    )}
                    aria-label="Send message"
                    title={
                        isOffline 
                            ? "You're offline" 
                            : isSlow 
                                ? "Slow connection - response may take longer" 
                                : "Send message"
                    }
                >
                    {isLoading ? (
                        <div className={cn(
                            "border-2 border-current border-t-transparent rounded-full",
                            isMobile ? "w-5 h-5" : "w-4 h-4",
                            !prefersReducedMotion && "animate-spin"
                        )} />
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Send className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                            <span className={cn(
                                isMobile ? "hidden" : "hidden sm:inline"
                            )}>
                                Send
                            </span>
                        </div>
                    )}
                </Button>
            </div>

            {/* Character count with visual feedback */}
            <div
                id="character-count"
                className={cn(
                    "mt-1 text-right",
                    isMobile ? "text-sm" : "text-xs",
                    // Color-based feedback
                    isOverLimit
                        ? "text-destructive font-medium"
                        : characterCount > 400
                            ? "text-warning"
                            : "text-muted-foreground",
                    // Animation preferences
                    !prefersReducedMotion && "transition-colors duration-200"
                )}
            >
                {characterCount}/500
                {isOverLimit && (
                    <span className="ml-1 text-destructive">
                        ({characterCount - 500} over limit)
                    </span>
                )}
            </div>
        </div>
    );
}