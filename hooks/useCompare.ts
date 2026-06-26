import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ChartData } from "chart.js";
import { ProgramFormData } from "@/schemas/program";

export function useCompare() {
  // Ambil data program dari API pake useQuery
  // Kalo data belum dapet, defaultnya array kosong []
  // isLoading bakal true selama proses fetch
  const { data: programs = [], isLoading } = useQuery({
    // Key unik buat nyimpen cache data ini, ibarat nama map/folder di dalem memori React Query
    queryKey: ["programs"],
    // Fungsi asinkron buat manggil endpoint API-nya
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Bikin state buat nyimpen id program pertama (Program A) yang dipilih user
  const [progAId, setProgAId] = useState<string>("");
  // Bikin state buat nyimpen id program kedua (Program B) yang dipilih user
  const [progBId, setProgBId] = useState<string>("");

  const [selectedPeriodA, setSelectedPeriodA] = useState<string>("");
  const [selectedPeriodB, setSelectedPeriodB] = useState<string>("");

  const periodOptions = useMemo(() => {
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

  // Pake useMemo biar pencarian objek program A nggak dirender ulang terus-terusan
  // Bakal nyari data ulang cuma kalo isi array 'programs' atau 'progAId' berubah
  const progA = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progAId) || null,
    [programs, progAId],
  );
  // Sama kaya di atas, tapi ini buat nyari full data objek program B
  const progB = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progBId) || null,
    [programs, progBId],
  );

  // Cari periode terkini buat masing-masing program
  const pA = useMemo(() => {
    if (!progA?.periods?.length) return null;
    if (selectedPeriodA) {
      const found = progA.periods.find((p) => p.month === selectedPeriodA);
      if (found) return found;
      return {
        id: `empty-A`,
        month: selectedPeriodA,
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        performanceDigital: { views: 0, revenue: 0 },
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        inventory: { spot: 0, adRate: 0 },
        status: "-",
      };
    }
    return [...progA.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progA, selectedPeriodA]);

  const pB = useMemo(() => {
    if (!progB?.periods?.length) return null;
    if (selectedPeriodB) {
      const found = progB.periods.find((p) => p.month === selectedPeriodB);
      if (found) return found;
      return {
        id: `empty-B`,
        month: selectedPeriodB,
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        performanceDigital: { views: 0, revenue: 0 },
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        inventory: { spot: 0, adRate: 0 },
        status: "-",
      };
    }
    return [...progB.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progB, selectedPeriodB]);

  // Kalkulasi ROI (Return on Investment) = ((Revenue - Cost) / Cost) * 100
  // Kalo progA ada datanya, itung persentase ROI
  // Kalo costDirect nol, bagi sama 1 biar ga error 'Infinity'
  const totalRevA = pA
    ? (pA.financials?.revenueActual ?? 0) +
      (pA.performanceDigital?.revenue ?? 0)
    : 0;

  const roiA = pA
    ? ((totalRevA - (pA.financials?.costDirect ?? 0)) /
        ((pA.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  // Itung ROI buat program B juga pake rumus yang sama persis
  const totalRevB = pB
    ? (pB.financials?.revenueActual ?? 0) +
      (pB.performanceDigital?.revenue ?? 0)
    : 0;

  const roiB = pB
    ? ((totalRevB - (pB.financials?.costDirect ?? 0)) /
        ((pB.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  // Fungsi buat nuker posisi Program A sama Program B pas tombol swap diklik
  const handleSwap = () => {
    // Kalo dua-duanya kosong, gausah ngapa-ngapain
    if (!progAId && !progBId) return;

    const currentA = progAId;
    const currentB = progBId;
    const currentPerA = selectedPeriodA;
    const currentPerB = selectedPeriodB;

    // Tuker statenya
    setProgAId(currentB);
    setProgBId(currentA);
    setSelectedPeriodA(currentPerB);
    setSelectedPeriodB(currentPerA);
  };

  // Helper buat ngatur warna background card secara otomatis berdasarkan siapa yang nilainya lebih gede
  // Program A menang = warna biru
  // Program B menang = warna oranye. Seri = warna standar
  const getCardStyle = (valA: number, valB: number) => {
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    // Kalo angkanya persis sama alias Seri / Seimbang
    return "bg-card border-border";
  };

  // Helper buat ngatur warna teks tulisan pemenangnya. Logikanya sama plek kaya fungsi di atas.
  const getWinnerTextColor = (valA: number, valB: number) => {
    if (valA > valB) return "text-[#1f77b4]";
    if (valB > valA) return "text-[#ff7f0e]";
    // Seri / Seimbang
    return "text-foreground";
  };

  // Bikin struktur data buat Grouped Bar Chart yang nampilin komparasi target, revenue, cost, pnl
  const comparisonData = useMemo<ChartData<"bar">>(() => {
    // Kalo salah satu program belum dipilih, balikin data kosong biar chart ga error
    if (!progA || !progB) return { labels: [], datasets: [] };

    return {
      // Label buat sumbu X (kategori di bawah chart)
      labels: [
        "Target Revenue",
        "Actual TV Rev",
        "Digital Rev",
        "Cost Direct",
        "Net PNL",
      ],
      datasets: [
        {
          // Data bar kelompok pertama buat Program A
          label: progA.name,
          // Urutan angka ini harus sama persis posisinya kaya urutan 'labels' di atas
          data: [
            pA?.financials?.revenueTarget ?? 0,
            pA?.financials?.revenueActual ?? 0,
            pA?.performanceDigital?.revenue ?? 0,
            pA?.financials?.costDirect ?? 0,
            pA?.financials?.pnl ?? 0,
          ],
          // Kasih warna biru
          // buat chart bar Program A
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          // Data bar kelompok kedua buat Program B
          label: progB.name,
          data: [
            pB?.financials?.revenueTarget ?? 0,
            pB?.financials?.revenueActual ?? 0,
            pB?.performanceDigital?.revenue ?? 0,
            pB?.financials?.costDirect ?? 0,
            pB?.financials?.pnl ?? 0,
          ],
          // Kasih warna oranye buat chart bar Program B
          backgroundColor: "#ff7f0e",
          minBarLength: 15,
        },
      ],
    };
    // Chart cuma di-generate ulang kalo data program A, B, atau periode terkininya ganti
  }, [progA, progB, pA, pB]);

  return {
    programs,
    isLoading,
    progAId,
    setProgAId,
    progBId,
    setProgBId,
    progA,
    progB,
    pA,
    pB,
    roiA,
    roiB,
    selectedPeriodA,
    setSelectedPeriodA,
    selectedPeriodB,
    setSelectedPeriodB,
    periodOptions,
    handleSwap,
    getCardStyle,
    getWinnerTextColor,
    comparisonData,
  };
}
