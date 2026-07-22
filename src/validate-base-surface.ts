/**
 * Base-surface validation for the forthcoming mobile kernel.
 *
 * Imports the framework-free ports and services the React Native kernel will
 * build on, proving `@sinemacula/foundation` is importable and free of any web
 * framework from a non-web consumer, and that a mobile adapter can implement a
 * base port. Type-check-only; no runtime behaviour is exercised.
 *
 * @author      Ben Carey <bdmc@sinemacula.co.uk>
 * @copyright   2026 Sine Macula Limited
 */

import { FoundationBootError } from '@sinemacula/foundation/app/foundation-boot-error';
import type { FoundationConfig } from '@sinemacula/foundation/app/foundation-config';
import { appStorage, installStorage, resetFoundationServices } from '@sinemacula/foundation/app/services';
import type { AnalyticsTracker } from '@sinemacula/foundation/analytics/analytics-tracker';
import type { ConnectivityMonitor } from '@sinemacula/foundation/connectivity/connectivity-monitor';
import type { FeatureFlags } from '@sinemacula/foundation/feature-flags/feature-flags';
import type { HttpClient } from '@sinemacula/foundation/http/http-client';
import type { Logger } from '@sinemacula/foundation/logging/logger';
import type { Confirmer } from '@sinemacula/foundation/notifications/confirmer';
import type { Toaster } from '@sinemacula/foundation/notifications/toaster';
import type { RealtimeConnection } from '@sinemacula/foundation/realtime/realtime-connection';
import type { ErrorReporter } from '@sinemacula/foundation/reporting/error-reporter';
import type { KeyValueStorage } from '@sinemacula/foundation/storage/key-value-storage';
import { MemoryStorage } from '@sinemacula/foundation/storage/memory-storage';
import type { ColorSchemeApplier, SystemColorSchemeSource } from '@sinemacula/foundation/theme/color-scheme-service';

/**
 * A synchronous storage adapter shaped like React Native's MMKV, proving the
 * sync `KeyValueStorage` port (the ratified storage decision) is implementable
 * on mobile without an async backend.
 */
class MmkvShapedStorage implements KeyValueStorage {
    readonly #map = new Map<string, string>();

    get(key: string): string | null {
        return this.#map.get(key) ?? null;
    }

    set(key: string, value: string): void {
        this.#map.set(key, value);
    }

    remove(key: string): void {
        this.#map.delete(key);
    }
}

/**
 * The framework-free base surface the mobile kernel consumes. Referencing every
 * port here proves each is importable and coherent from the base package.
 */
export interface MobileBaseSurface {
    readonly storage: KeyValueStorage;
    readonly http: HttpClient;
    readonly toaster: Toaster;
    readonly confirmer: Confirmer;
    readonly connectivity: ConnectivityMonitor;
    readonly schemeSource: SystemColorSchemeSource;
    readonly schemeApplier: ColorSchemeApplier;
    readonly realtime: RealtimeConnection;
    readonly logger: Logger;
    readonly reporter: ErrorReporter;
    readonly analytics: AnalyticsTracker;
    readonly featureFlags: FeatureFlags;
    readonly config: FoundationConfig;
}

/**
 * Prove the base service registry drives from a non-web consumer.
 *
 * @returns a fresh MMKV-shaped storage after a registry round-trip
 */
export function validateBaseServiceRegistry(): KeyValueStorage {
    const storage = new MmkvShapedStorage();

    installStorage(storage);
    const resolved = appStorage();
    resetFoundationServices();

    return resolved satisfies KeyValueStorage;
}

/** Prove the base's fallback in-memory storage is importable on mobile. */
export const mobileFallbackStorage: KeyValueStorage = new MemoryStorage();

/** Prove a base error type is importable + constructible on mobile. */
export const sampleBootError = new FoundationBootError('mobile skeleton');
