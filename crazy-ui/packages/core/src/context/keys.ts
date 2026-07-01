/**
 * Injection Keys (Framework-agnostic)
 *
 * 用 `unique symbol` 而非 Vue 的 `InjectionKey<T>`，保持 core 包不依赖 Vue。
 * Hooks 层使用时 cast 为 Vue 的 `InjectionKey<T>` 获得类型安全。
 *
 * 所有 key 在此统一定义，hooks 和 vue-adapter 通过 import 同一个 key 实现解耦。
 */

// ConfigProvider 上下文
export const namespaceInjectionKey: unique symbol = Symbol('namespace');
export const zIndexCounterInjectionKey: unique symbol = Symbol('zIndexCounter');
export const localeInjectionKey: unique symbol = Symbol('locale');
export const sizeInjectionKey: unique symbol = Symbol('size');
export const teleportInjectionKey: unique symbol = Symbol('teleport');

// Overlay 体系
export const overlayManagerInjectionKey: unique symbol = Symbol('overlayManager');

// Form 体系
export const formInjectionKey: unique symbol = Symbol('form');
export const formItemInjectionKey: unique symbol = Symbol('formItem');
