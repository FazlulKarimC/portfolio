"use client";

import { AnimatePresence } from "framer-motion";
import { AIChatComponentProps } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useResponsive } from "@/hooks/useResponsive";
import { ChatTrigger, ChatContainer } from "./chat";

export function AIChatComponent({
    className,
    defaultExpanded = false
}: AIChatComponentProps) {
    const { chatState, handlers } = useChatLogic({ defaultExpanded });
    const { isMobile, isTablet, prefersReducedMotion } = useResponsive();

    return (
        <div className={cn(
            "mx-auto w-full",
            // Desktop/tablet: centered with max width and padding
            !isMobile && "max-w-2xl px-3 sm:px-4 lg:px-0",
            // Mobile: full-width edge-to-edge
            isMobile && "max-w-none px-0",
            className
        )}>
            <AnimatePresence mode="wait">
                {!chatState.isExpanded ? (
                    <ChatTrigger 
                        key="trigger" 
                        onExpand={handlers.handleExpand}
                        isMobile={isMobile}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                ) : (
                    <ChatContainer
                        key="container"
                        chatState={chatState}
                        onCollapse={handlers.handleCollapse}
                        onInputChange={handlers.handleInputChange}
                        onSendMessage={handlers.handleSendMessage}
                        onRetry={handlers.handleRetry}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}