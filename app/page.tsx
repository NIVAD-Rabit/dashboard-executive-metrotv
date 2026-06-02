"use client";

import React, { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";
import BaseChart from "@/components/BaseChart";

export default function ExecutiveDashboardPage() {
  // Buat tampungan state atau nilai yang diselect di per program
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    MOCK_PROGRAMS[0].id,
  );

  // allProgramData
  // Biar optimal dibungkus pake useMemo biar react ga usah render ulang kalo ga ada perubahan di data
  // Data pake Tipe/Ts bawaan ChartJS tipe bar
  // useMemo bakal nyimpen di ram memori browser
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Rapihin data yang berantakan berdasarkan group
    // Pake reduce buat loop sekalian kumpulin data ke satu wadah acc
    // acc = ini wadah sementara buat isi objeknya yang udah jadi atau udah diproses
    // curr = data mentah sekarang pas antrian dilooping satu2
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Cek, kalo di dalem wadah belom ada properti nama kategori si curr
        // Bikin kategorinya terus set angkanya awalnya mulai dari 0
        if (!acc[curr.category]) acc[curr.category] = 0;

        // Kalo kategorinya udah ada, tambahin properti nilai pnl yamg sekarang ke total katergori
        acc[curr.category] += curr.pnl;

        // Balikin wadah yang udah diupdate biar dibaca ke puteran lopping berikutnya
        // Ivaratnya tongkat estafet buat looping berikutnya
        return acc;
      },
      // Set initialvalue si reduce, modal awalnya bikin wadah objek kosong tipe ts objek record<key=string, value=number>
      // Syarat reduce, .reduce( fungsiProses, ModalAwalnya )
      {} as Record<string, number>,
    );

    return {
      labels: Object.keys(grouped),
      datasets: [{ label: "Total PNL (Rp)", data: Object.values(grouped) }],
    };
  }, []);

  // detailProgramData
  // Pake useMemo juga biar chart doughnut ini cuma kerender ulang kalo nilai selectedProgramId (dari dropdown) berubah
  // Kalo milih program yang sama, react tinggal ambil data dari memori browser, ga perlu mikir ulang
  // Cari data program spesifik dari array MOCK_PROGRAMS yang id-nya sama persis kaya yang lagi dipilih di state
  // Pake || MOCK_PROGRAMS[0] buat fallback aja misal id-nya entah kenapa ga ketemu, biar chart ga nge-blank atau error
  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === selectedProgramId) || MOCK_PROGRAMS[0];

    // Balikin format datanya sesuai aturan struktur ChartJS, masukin angka capaian, cost, sama targetnya berurutan sesuai label
    return {
      labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
      datasets: [
        { data: [prog.revenueCapaian, prog.costDirect, prog.revenueTarget] },
      ],
    };
  }, [selectedProgramId]);

  // topPnlData
  // Dibungkus useMemo dengan dependensi kosong [] karena ini datanya statis buat nampilin ranking, biar dihitung sekali aja
  // Pake spread operator [...MOCK_PROGRAMS] buat nge-copy array aslinya dulu
  // Kenapa? Karena fungsi .sort() itu merubah array aslinya (mutating). Kalo ga dicopy, data utama kita bakal ikutan berantakan
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    // .sort((a, b) => b.pnl - a.pnl) ini rumus buat ngurutin dari PNL paling gede ke paling kecil (descending)
    // Habis diurutin, arraynya dipotong pake .slice(0, 5) buat ambil 5 data teratas aja
    const sorted = [...MOCK_PROGRAMS].sort((a, b) => b.pnl - a.pnl).slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [{ label: "PNL Positif (Rp)", data: sorted.map((p) => p.pnl) }],
    };
  }, []);

  // bottomPnlData
  // Konsepnya persis kaya topPnlData, dicopy dulu biar array asli ga mutasi, trus dihitung sekali aja pas render pertama
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Bedanya cuma di rumus cara ngurutinnya
    // .sort((a, b) => a.pnl - b.pnl) ini rumus buat ngurutin dari PNL paling minus ke paling gede (ascending)
    // Jadi urutan program yang paling boncos ada di pucuk atas
    // Trus dipotong pake .slice(0, 5) buat ngambil 5 peringkat paling bawah
    const sorted = [...MOCK_PROGRAMS].sort((a, b) => a.pnl - b.pnl).slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        { label: "PNL Minus/Terendah (Rp)", data: sorted.map((p) => p.pnl) },
      ],
    };
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* executiveHeadline */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
          <LayoutDashboard size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground">
            Programme Performance Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Evaluasi komparatif target, capaian revenue, dan profitabilitas
          </p>
        </div>
      </div>

      {/* dashboardCanvas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* allProgramDataChart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-red-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="PNL Keseluruhan (Per Kelompok Waktu)"
            data={allProgramData}
            height={360}
          />
        </div>

        {/* detailProgramDataChart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-blue-500 flex flex-col p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-foreground">
              Struktur Performa Program
            </h3>

            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary focus:outline-none block px-4 py-2.5 cursor-pointer min-w-[200px] border-none"
            >
              {MOCK_PROGRAMS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center flex-1">
            <div className="sm:col-span-3 min-h-[220px]">
              <BaseChart
                type="doughnut"
                data={detailProgramData}
                height={220}
              />
            </div>

            <div className="sm:col-span-2 p-5 bg-muted rounded-[20px] h-full flex flex-col justify-center border-2 border-purple-500">
              {(() => {
                const p = MOCK_PROGRAMS.find(
                  (x) => x.id === selectedProgramId,
                )!;
                return (
                  <div className="text-sm space-y-4">
                    <div className="flex flex-col border-b border-border/50 pb-3">
                      <span className="text-muted-foreground font-medium mb-1">
                        PNL Bersih
                      </span>
                      <span
                        className={`font-medium text-xl ${p.pnl < 0 ? "text-destructive" : "text-primary"}`}
                      >
                        Rp {p.pnl.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">
                        Target Capaian
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.performaCapaian}% / {p.performaTarget}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">
                        Status Analisis
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.keterangan}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* topPnlDataChart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-green-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="Top 5 Program (PNL Tertinggi)"
            data={topPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>

        {/* bottomPnlDataChart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-yellow-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="Bottom 5 Program (PNL Terendah / Defisit)"
            data={bottomPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>
      </section>
    </div>
  );
}
