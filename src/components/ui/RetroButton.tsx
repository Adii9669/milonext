"use client";

import { ReactNode } from "react";

type RetroButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "type1" | "type2";
};

export default function RetroButton({
  children,
  onClick,
  className = "",
  type = "button",
  variant = "type1",
}: RetroButtonProps) {
  const baseStyle = `
    uppercase tracking-widest
    transition-all duration-150`;

  const variants = {
    type1: `
      border-2 border-[#1a1a40]
      px-3 py-3 font-bold
      rounded-[15px]
      bg-[#FFFFF5]
      text-[#black]
      shadow-[6px_6px_0px_0px_#F5F5F5]
      hover:translate-y-[6px]
      hover:shadow-[3px_3px_0px_0px_#F5F5F5]
    `,
    type2: `
      px-10 py-3
      border-2 border-[#F5F5F5]
      bg-transparent text-[#F5F5F5]
      shadow-[8px_8px_0px_0px_#F5F5F5]
      hover:translate-x-[3px] hover:translate-y-[3px]
      hover:shadow-[4px_4px_0px_0px_#F5F5F5]
    `,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
