"use client";

import { motion } from "framer-motion";

interface NameCardProps {
  name: string;
  feedback: "correct" | "wrong" | null;
  shake: boolean;
}

export function NameCard({ name, feedback, shake }: NameCardProps) {
  const isCorrect = feedback === "correct";
  const isWrong = feedback === "wrong";

  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: shake ? [0, -14, 14, -10, 10, 0] : 0,
        boxShadow: isCorrect
          ? "0 0 48px rgba(0, 255, 159, 0.55)"
          : isWrong
            ? "0 0 48px rgba(238, 21, 21, 0.5), 0 0 24px rgba(0, 255, 159, 0.3)"
            : "0 8px 32px rgba(0,0,0,0.35)",
        borderColor: isCorrect
          ? "rgba(0, 255, 159, 0.7)"
          : isWrong
            ? "rgba(238, 21, 21, 0.6)"
            : "rgba(255, 255, 255, 0.12)",
      }}
      transition={{ duration: shake ? 0.5 : 0.35 }}
      className={`glass relative mx-auto w-full max-w-md rounded-3xl border-2 px-8 py-14 text-center ${
        isWrong ? "ring-1 ring-drug-glow/40" : ""
      }`}
    >
      <p className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-text-muted">
        Is this a…
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {name}
      </h2>
    </motion.div>
  );
}
