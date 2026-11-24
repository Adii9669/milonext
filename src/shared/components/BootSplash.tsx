"use client";

import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/src/features/auth/stores/authStores";

const MIN_VISIBLE_MS = 600;
const FAILSAFE_MS = 10000;

export default function BootSplash() {
    const authLoading = useAuthStore((state) => state.isLoading);
    const [pageLoaded, setPageLoaded] = useState(
        () => typeof document !== "undefined" && document.readyState === "complete"
    );
    const [visible, setVisible] = useState(true);
    const mountedAtRef = useRef(0);

    const dismiss = useCallback(async () => {
        setVisible(false);

        if (!Capacitor.isNativePlatform()) return;

        try {
            const { SplashScreen } = await import("@capacitor/splash-screen");
            await SplashScreen.hide();
        } catch {
            // A missing plugin must never leave the web overlay up.
        }
    }, []);

    useEffect(() => {
        mountedAtRef.current = Date.now();

        const markLoaded = () => setPageLoaded(true);
        window.addEventListener("load", markLoaded, { once: true });
        if (document.readyState === "complete") queueMicrotask(markLoaded);

        const failsafe = window.setTimeout(() => void dismiss(), FAILSAFE_MS);
        return () => {
            window.removeEventListener("load", markLoaded);
            window.clearTimeout(failsafe);
        };
    }, [dismiss]);

    useEffect(() => {
        if (!pageLoaded || authLoading || !visible) return;

        const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAtRef.current));
        const timer = window.setTimeout(() => void dismiss(), remaining);
        return () => window.clearTimeout(timer);
    }, [pageLoaded, authLoading, visible, dismiss]);

    if (!visible) return null;

    return (
        <div className="oc-boot-splash" role="status" aria-live="polite" aria-label="Loading Onechat">
            <svg className="oc-boot-splash__logo" viewBox="0 0 640 640" aria-hidden="true">
                <path d="M399.7 160.2C410.8 149.1 515.2 83.2 538.9 107C562.6 130.7 496.8 235.1 485.7 246.2C474.6 257.3 446.3 247.1 422.6 223.3C398.8 199.6 388.5 171.3 399.7 160.2zM205.9 132.1C169.6 111.5 118 88.6 101.6 105.1C85 121.7 108.7 174.5 129.5 210.8C148 178.6 174.3 151.5 205.9 132.1zM502.7 238C506 249.3 505.4 258.7 500 264.1C479.7 284.4 412.5 237.1 390.7 194C372.7 161.7 379.6 140.6 405.6 145.3C411.3 141.7 417.9 137.7 425.2 133.7C395.4 118.2 361.6 109.4 325.7 109.4C206.6 109.4 110.1 205.9 110.1 325C110.1 444 206.6 540.6 325.7 540.6C444.8 540.6 541.3 444.1 541.3 325C541.3 286.6 531.2 250.5 513.6 219.2C509.7 226.2 506 232.5 502.7 238z" />
            </svg>
            <span className="oc-boot-splash__wordmark">ONECHAT</span>
            <span className="oc-boot-splash__spinner" aria-hidden="true" />
        </div>
    );
}
