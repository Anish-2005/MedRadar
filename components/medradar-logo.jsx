"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function MedRadarMark({ className, title = "MedRadar logo" }) {
  const gradientId = useId().replace(/:/g, "");
  const crystalId = `${gradientId}-crystal`;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("h-11 w-11", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="7" y1="6" x2="57" y2="59" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDF2FF" />
          <stop offset="45%" stopColor="#67B0EB" />
          <stop offset="100%" stopColor="#0A3968" />
        </linearGradient>
        <linearGradient id={crystalId} x1="17" y1="12" x2="43" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#BFE4FF" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${gradientId})`} />
      <path d="M32 10L47 22L41 45H23L17 22L32 10Z" fill={`url(#${crystalId})`} />
      <path d="M19 24L32 15L45 24" stroke="#ECF8FF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.75" />
      <path d="M26 27H31V22H33V27H38V29H33V34H31V29H26V27Z" fill="#F7FDFF" />
      <path d="M13 41H20L24 34L30 45L36 36L39 41H51" stroke="#F7FDFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46.5" cy="15.5" r="1.4" fill="#F4FCFF" />
      <circle cx="50.5" cy="20.5" r="0.95" fill="#E2F5FF" />
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
