"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kita inisialisasi QueryClient di dalam useState agar tidak ter-recreate setiap kali render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data dianggap fresh selama 1 menit
            refetchOnWindowFocus: false, // Biar ga nge-fetch otomatis pas pindah tab browser
            retry: 1, // Kalo gagal, coba 1x lagi
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools ini bakal muncul di pojok kiri bawah (kalo di local) buat ngecek isi cache data kita */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
