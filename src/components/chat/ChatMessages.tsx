import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types/chat";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

// Utility function to format message timestamps
function formatMessageTime(timestamp: Date, isMobile: boolean = false): string {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // If message is from today, show time only
    if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // If message is from yesterday, show "Yesterday HH:MM"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
        const timeStr = messageDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        return isMobile ? `Yesterday ${timeStr}` : `Yesterday ${timeStr}`;
    }

    // For older messages, show date and time
    return messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// UserMessage Component
interface UserMessageProps {
    message: ChatMessage;
    index: number;
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

function UserMessage({ message, index, isMobile = false, prefersReducedMotion = false }: UserMessageProps) {
    const animationConfig = prefersReducedMotion 
        ? { delay: 0, duration: 0.1 }
        : { delay: index * 0.1, duration: 0.3 };

    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, x: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
            transition={animationConfig}
            className={cn("flex justify-end", isMobile ? "mb-3" : "mb-2")}
        >
            <div className={cn(
                "rounded-lg bg-primary text-primary-foreground rounded-br-sm shadow-sm",
                // Responsive sizing
                isMobile ? [
                    "max-w-[85%] p-3",
                    "text-base leading-relaxed"
                ] : [
                    "max-w-[80%] p-3",
                    "text-sm leading-relaxed"
                ]
            )}>
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
                <div className={cn(
                    "opacity-70 mt-1 text-right",
                    isMobile ? "text-xs" : "text-xs"
                )}>
                    {formatMessageTime(message.timestamp, isMobile)}
                </div>
            </div>
        </motion.div>
    );
}

// AIMessage Component
interface AIMessageProps {
    message: ChatMessage;
    index: number;
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

function AIMessage({ message, index, isMobile = false, prefersReducedMotion = false }: AIMessageProps) {
    const animationConfig = prefersReducedMotion 
        ? { delay: 0, duration: 0.1 }
        : { delay: index * 0.1, duration: 0.3 };

    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, x: -20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
            transition={animationConfig}
            className={cn("flex justify-start", isMobile ? "mb-3" : "mb-2")}
        >
            <div className={cn(
                "flex items-start gap-2",
                isMobile ? "max-w-[85%]" : "max-w-[80%]"
            )}>
                <Avatar className={cn(
                    "mt-1 flex-shrink-0",
                    isMobile ? "h-9 w-9" : "h-8 w-8"
                )}>
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback className="text-xs bg-muted-foreground/10 text-muted-foreground">
                        {DATA.initials}
                    </AvatarFallback>
                </Avatar>
                <div className={cn(
                    "rounded-lg bg-muted text-foreground rounded-bl-sm shadow-sm",
                    isMobile ? "p-3" : "p-3"
                )}>
                    <p className={cn(
                        "break-words whitespace-pre-wrap",
                        isMobile ? "text-base leading-relaxed" : "text-sm leading-relaxed"
                    )}>
                        {message.content}
                    </p>
                    <div className={cn(
                        "text-muted-foreground mt-1",
                        isMobile ? "text-xs" : "text-xs"
                    )}>
                        {formatMessageTime(message.timestamp, isMobile)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// LoadingIndicator Component
interface LoadingIndicatorProps {
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

function LoadingIndicator({ isMobile = false, prefersReducedMotion = false }: LoadingIndicatorProps) {
    return (
        <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, x: -20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
            className={cn("flex justify-start", isMobile ? "mb-3" : "mb-2")}
        >
            <div className={cn(
                "flex items-start gap-2",
                isMobile ? "max-w-[85%]" : "max-w-[80%]"
            )}>
                <Avatar className={cn(
                    "mt-1 flex-shrink-0",
                    isMobile ? "h-9 w-9" : "h-8 w-8"
                )}>
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback className="text-xs bg-muted-foreground/10 text-muted-foreground">
                        {DATA.initials}
                    </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted text-foreground rounded-bl-sm shadow-sm">
                    <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                            <div 
                                className={cn(
                                    "bg-muted-foreground/40 rounded-full",
                                    isMobile ? "w-2.5 h-2.5" : "w-2 h-2",
                                    !prefersReducedMotion && "animate-bounce"
                                )} 
                                style={{ animationDelay: '0ms' }}
                            />
                            <div 
                                className={cn(
                                    "bg-muted-foreground/40 rounded-full",
                                    isMobile ? "w-2.5 h-2.5" : "w-2 h-2",
                                    !prefersReducedMotion && "animate-bounce"
                                )} 
                                style={{ animationDelay: '150ms' }}
                            />
                            <div 
                                className={cn(
                                    "bg-muted-foreground/40 rounded-full",
                                    isMobile ? "w-2.5 h-2.5" : "w-2 h-2",
                                    !prefersReducedMotion && "animate-bounce"
                                )} 
                                style={{ animationDelay: '300ms' }}
                            />
                        </div>
                        <span className={cn(
                            "text-muted-foreground ml-2",
                            isMobile ? "text-sm" : "text-xs"
                        )}>
                            Typing...
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// EmptyState Component
interface EmptyStateProps {
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
}

function EmptyState({ isMobile = false, prefersReducedMotion = false }: EmptyStateProps) {
    const animationConfig = prefersReducedMotion 
        ? { delay: 0, duration: 0.1 }
        : { delay: 0.2, duration: 0.3 };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={animationConfig}
            className={cn(
                "text-center text-muted-foreground px-2",
                isMobile ? "py-6" : "py-6 sm:py-8"
            )}
        >
            <div className={cn(
                "flex flex-col items-center",
                isMobile ? "gap-4" : "gap-3"
            )}>
                <Avatar className={cn(isMobile ? "h-14 w-14" : "h-12 w-12")}>
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback className={cn(
                        "bg-muted-foreground/10 text-muted-foreground",
                        isMobile ? "text-xl" : "text-lg"
                    )}>
                        {DATA.initials}
                    </AvatarFallback>
                </Avatar>
                <p className={cn(
                    isMobile ? "text-base leading-relaxed" : "text-sm sm:text-base"
                )}>
                    Hi! I&apos;m Fazlul. Ask me anything about my experience, skills, or projects!
                </p>
            </div>
        </motion.div>
    );
}

// ChatMessages Component
interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isMobile?: boolean;
    isTablet?: boolean;
    prefersReducedMotion?: boolean;
}

export function ChatMessages({ 
    messages, 
    isLoading, 
    isMobile = false, 
    isTablet = false,
    prefersReducedMotion = false 
}: ChatMessagesProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sort messages by timestamp to ensure chronological order
    const sortedMessages = [...messages].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Auto-scroll the INNER viewport only (avoid scrolling the page)
    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null;
        if (!viewport) return;

        const scrollBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: scrollBehavior });
    }, [messages, isLoading, prefersReducedMotion]);

    // Function to render individual message based on sender type
    const renderMessage = (message: ChatMessage, index: number) => {
        // Validate message data
        if (!message.id || !message.content || !message.sender || !message.timestamp) {
            console.warn('Invalid message data:', message);
            return null;
        }

        return message.sender === 'user' ? (
            <UserMessage 
                key={message.id} 
                message={message} 
                index={index}
                isMobile={isMobile}
                prefersReducedMotion={prefersReducedMotion}
            />
        ) : (
            <AIMessage 
                key={message.id} 
                message={message} 
                index={index}
                isMobile={isMobile}
                prefersReducedMotion={prefersReducedMotion}
            />
        );
    };

    // Responsive minimum height calculation
    const getMinHeight = () => {
        if (isMobile) return "200px";
        if (isTablet) return "240px";
        return "240px sm:280px";
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea
                ref={scrollAreaRef}
                className={cn(
                    "flex-1 h-full",
                    // Responsive padding for scroll area
                    isMobile ? "pr-1" : "pr-2"
                )}
                // Enhanced touch scrolling for mobile
                style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                }}
            >
                <div className={cn(
                    "px-1",
                    // Responsive spacing and minimum height
                    isMobile ? "space-y-0" : "space-y-1",
                    `min-h-[${getMinHeight()}]`
                )}>
                    {sortedMessages.length === 0 ? (
                        <EmptyState 
                            isMobile={isMobile}
                            prefersReducedMotion={prefersReducedMotion}
                        />
                    ) : (
                        <>
                            {sortedMessages.map((message, index) => renderMessage(message, index))}
                            {isLoading && (
                                <LoadingIndicator 
                                    isMobile={isMobile}
                                    prefersReducedMotion={prefersReducedMotion}
                                />
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}