import * as React from "react";

import { cn } from "../../lib/utils";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`bg-[hsl(var(--card))] border border-[hsl(var(--muted))] rounded-lg shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div
      className={`border-b border-[hsl(var(--muted))] p-4 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-lg font-bold ${className}`} {...props} />;
}
