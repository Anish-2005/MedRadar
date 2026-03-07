"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function MedRadarMark({ className, title = "MedRadar logo" }) {
  const gradientId = useId().replace(/:/g, "");
  const ringId = `${gradientId}-ring`;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("h-11 w-11", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="10" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B3D70" />
          <stop offset="100%" stopColor="#1A5B95" />
        </linearGradient>
        <linearGradient id={ringId} x1="21" y1="17" x2="43" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C6E8FF" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="15" fill={`url(#${gradientId})`} />
      <circle cx="32" cy="32" r="16" stroke={`url(#${ringId})`} strokeWidth="2" />
      <path
        d="M16 40H21L25 28L31 38L36 22L42 40H48"
        stroke="#F3FCFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 14V20M29 17H35" stroke="#F3FCFF" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="46.5" cy="18" r="1.3" fill="#F3FCFF" opacity="0.8" />
    </svg>
  );
}

export default function MedRadarLogo({
  className,
  titleClassName,
  subtitleClassName,
  showSubtitle = true,
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <MedRadarMark />
      <div>
        <p className={cn("frost-title font-[var(--font-display)] text-xl font-bold", titleClassName)}>MedRadar</p>
        {showSubtitle ? (
          <p className={cn("frost-subtitle text-xs", subtitleClassName)}>Hospital Resource Optimizer</p>
        ) : null}
      </div>
    </div>
  );
}
