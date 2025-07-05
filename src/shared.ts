import type { Component } from "vue";

export interface HelpItem {
  icon: Component;
  title: string;
  description: string;
}

export type ComponentExposed<T> = T extends new (...args: any) => infer E
  ? E
  : T extends (
        props: any,
        ctx: any,
        expose: (exposed: infer E) => any,
        ...args: any
      ) => any
    ? NonNullable<E>
    : {};

export type LogLevel = "error" | "warn" | "info" | "debug";

export type LogEntry = {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
};
