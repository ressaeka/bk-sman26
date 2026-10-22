"use client";

import React from "react";
import { KonselingRequestForm } from "@/components/siswa/konseling/KonselingRequestForm";

export default function SiswaAjukanKonselingPage() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <KonselingRequestForm />
      </div>
    </div>
  );
}
