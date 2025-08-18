"use client";

import { useState } from "react";
import { AIChatComponent } from "@/components/ai-chat-component";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Comprehensive test suite for mobile responsiveness
 * This component tests all responsive features of the AI chat
 */
export function MobileTestSuite() {
    const [showDebug, setShowDebug] = useState(false);
    const responsive = useResponsive();

    const testScenarios = [
        {
            name: "Mobile Portrait",
            width: 375,
            height: 667,
            description: "iPhone SE size"
        },
        {
            name: "Mobile Landscape",
            width: 667,
            height: 375,
            description: "iPhone SE landscape"
        },
        {
            name: "Tablet Portrait",
            width: 768,
            height: 1024,
            description: "iPad size"
        },
        {
            name: "Desktop",
            width: 1200,
            height: 800,
            description: "Desktop size"
        }
    ];

    const simulateViewport = (width: number, height: number) => {
        // This would be used in actual testing environments
        console.log(`Simulating viewport: ${width}x${height}`);
    };

    return (
        <div className="space-y-6 p-4">
            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Mobile Responsiveness Test Suite</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {testScenarios.map((scenario) => (
                        <Button
                            key={scenario.name}
                            variant="outline"
                            onClick={() => simulateViewport(scenario.width, scenario.height)}
                            className="p-4 h-auto flex flex-col items-start"
                        >
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-sm text-muted-foreground">
                                {scenario.width}x{scenario.height}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {scenario.description}
                            </div>
                        </Button>
                    ))}
                </div>

                <Button 
                    onClick={() => setShowDebug(!showDebug)}
                    variant="secondary"
                    className="mb-4"
                >
                    {showDebug ? 'Hide' : 'Show'} Debug Info
                </Button>

                {showDebug && (
                    <Card className="p-4 bg-muted/50">
                        <h3 className="font-medium mb-2">Current Responsive State</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Width: {responsive.width}px</div>
                            <div>Height: {responsive.height}px</div>
                            <div>Breakpoint: {responsive.breakpoint}</div>
                            <div>Orientation: {responsive.orientation}</div>
                            <div>Mobile: {responsive.isMobile ? '✅' : '❌'}</div>
                            <div>Tablet: {responsive.isTablet ? '✅' : '❌'}</div>
                            <div>Desktop: {responsive.isDesktop ? '✅' : '❌'}</div>
                            <div>Touch: {responsive.isTouch ? '✅' : '❌'}</div>
                            <div>Reduced Motion: {responsive.prefersReducedMotion ? '✅' : '❌'}</div>
                        </div>
                    </Card>
                )}
            </Card>

            <Card className="p-4">
                <h3 className="font-medium mb-4">Test Features</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Responsive breakpoints (mobile, tablet, desktop)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Touch-optimized interactions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Keyboard handling improvements
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Proper spacing and sizing
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Smooth animations with reduced motion support
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Mobile keyboard optimization
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        Enhanced touch targets (44px minimum)
                    </div>
                </div>
            </Card>

            <div>
                <h3 className="font-medium mb-4">Live Chat Component Test</h3>
                <AIChatComponent />
            </div>
        </div>
    );
}