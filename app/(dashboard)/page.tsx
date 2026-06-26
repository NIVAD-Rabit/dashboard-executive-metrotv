"use client";

import React, { useState, useMemo } from "react";
import { FilterX, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import useDashboard from "@/hooks/useDashboard";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import BaseChart from "@/components/shared/BaseChart";
import { ChartEvent, ActiveElement, Chart as ChartJS } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";
import StatCard from "@/components/shared/StatCard";
import { GitCompare } from "lucide-react";
import ChartDetailModal from "@/components/shared/ChartDetailModal";

// Impor komponen modal detail program
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";

export default function ExecutiveDashboardPage() {
  const router = useRouter();

  const {
    allProgramData,
    filteredPrograms,
    topRevenueData,
    bottomRevenueData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    activeProgramId,
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
    topTvPerformanceDataTvr,
    topTvPerformanceDataShare,
    bottomTvPerformanceDataTvr,
    bottomTvPerformanceDataShare,
    programCategories,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    lastUpdated,
    displayedPeriodLabel,
    isChartDetailOpen,
    setIsChartDetailOpen,
    chartDetailType,
    setChartDetailType,
    chartDetailTitle,
    setChartDetailTitle,
  } = useDashboard();

  // Bikin state simpan nilai tab buat top tv
  const [topTvTab, setTopTvTab] = useState<"tvr" | "share">("tvr");
  // Bikin state simpan nilai tab buat bottom tv
  const [bottomTvTab, setBottomTvTab] = useState<"tvr" | "share">("tvr");

  // State lokal buat simpan status buka tutup modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  // Cari data program aktif buat lempar ke modal detail
  const activeProgramForModal = useMemo(() => {
    return MOCK_PROGRAMS.find((x) => x.id === activeProgramId) || null;
  }, [activeProgramId]);

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Kontrol filter */}
      <div className="bg-card px-6 py-4 rounded-2xl flex lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Sisi kiri */}
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-sm text-muted-foreground font-medium hidden sm:block">
            Pembaruan terakhir:
          </p>
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
            <RefreshCcw size={10} /> {lastUpdated}
          </span>
        </div>

        <div className="w-full text-center">
          <span className="text-sm text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
            Data Ditampilkan:{" "}
            <span className="font-bold text-foreground">
              {displayedPeriodLabel}
            </span>
          </span>
        </div>

        {/* Sisi kanan */}
        <div className="flex items-center gap-4">
          {/* Sisi kiri dalem */}
          <div className="relative inline-block ">
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory ?? ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer w-fit"
              >
                <option
                  value=""
                  className="bg-card text-foreground"
                  disabled
                  hidden
                >
                  Pilih Kategori
                </option>
                {programCategories.map((categoryName, idx) => (
                  <option
                    key={idx}
                    value={categoryName}
                    className="bg-card text-foreground"
                  >
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
              <svg
                xmlns="http://w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>

          {/* Sisi kanan dalem */}
          <div className="flex flex-row items-center gap-4 ">
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={selectedPeriod ?? ""}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-muted/40 border border-border text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer w-fit"
              >
                {periodOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-card text-foreground"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
                <svg
                  xmlns="http://w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedPeriod === "custom" && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  <span className="text-muted-foreground text-xs">s/d</span>
                  <input
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                (selectedPeriod && selectedPeriod !== "all")) && (
                <button
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory(null);
                    setSelectedPeriod("all");
                  }}
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  <FilterX size={14} /> Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kartu kpi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {totalKPI.cards.map((card, idx) => (
          <React.Fragment key={idx}>
            {/* Statcard komponen lama, simpan aja di komen */}
            <StatCard card={card} />
          </React.Fragment>
        ))}
      </div>

      {/* Grafik */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik semua data program */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2 relative">
          <BaseChart
            // Jenis chart bar
            type="bar"
            // Judul chart
            title="PNL Keseluruhan (Per Kategori)"
            // Sumber data chart
            data={allProgramData}
            // Tinggi kanvas chart, pake satuan piksel
            height={360}
            onExpand={() => {
              setChartDetailType("pnl");
              setChartDetailTitle("PNL Keseluruhan");
              setIsChartDetailOpen(true);
            }}
            options={{
              scales: {
                y: {
                  ticks: {
                    // Pake helper format big number buat format label angka pada sumbu Y
                    callback: function (value: string | number) {
                      return formatBigNumber(Number(value));
                    },
                  },
                },
              },
              // Event klik pas area chart user klik
              // Kasih parameter elemen biar bisa akses properti elemen si chart
              // Chart biar bisa akses properti chart bar, bukan area kosong
              onClick: (
                event: ChartEvent,
                elements: ActiveElement[],
                chart: ChartJS,
              ) => {
                // Cek kalo user klik salah satu chart bar
                if (elements && elements.length > 0) {
                  // Ambil indeks chart yang lagi klik
                  const index = elements[0].index;
                  // Ambil label data chart yang lagi klik berdasar indeks atas
                  const categoryName = chart.data.labels?.[index] as string;

                  // Biar chart bar kaya toggle
                  // Kalo kategori awal klik atau nilai state beda, simpan kategori baru ke dalem state buat filter data
                  // Kalo kategori udah klik terus klik lagi, hapus filter
                  // Parameter prev itu buat banding nilai state sebelum sama yang lagi klik baru
                  setSelectedCategory((prev) =>
                    prev === categoryName ? null : categoryName,
                  );
                } else {
                  setSelectedCategory(null);
                }
              },
              // Event hover pas kursor mouse di atas area chart
              onHover: (event: ChartEvent, chartElement: ActiveElement[]) => {
                // Ambil target elemen html kanvas tempat chart render
                const target = event.native?.target as HTMLElement;
                if (target)
                  // Kalo kursor di atas bar chart chartelement true, ubah kursor jadi tangan pointer
                  // Kalo kursor keluar dari bar chart, balik ke bentuk panah standar
                  target.style.cursor = chartElement[0] ? "pointer" : "default";
              },
            }}
          />
        </div>

        {/* Grafik data detail program */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-10 gap-4 flex-1">
            <div className="sm:col-span-7">
              <BaseChart
                type="doughnut"
                title="Struktur Performa Program"
                data={detailProgramData}
                height={360}
                onExpand={() => {
                  // Buka modal detail program pas klik tombol expand
                  setIsProgramDetailOpen(true);
                }}
              />
            </div>

            <div className="sm:col-span-3 p-4 rounded-[20px] bg-muted gap-2 h-full flex flex-col justify-center">
              {(() => {
                const p = MOCK_PROGRAMS.find((x) => x.id === activeProgramId);
                if (!p) return null;

                const pnl = p.periods.reduce(
                  (s, per) => s + per.financials.pnl,
                  0,
                );
                const targetShare = p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetShare,
                  0,
                );
                const capaianShare = p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualShare,
                  0,
                );
                const status = p.periods[0]?.status || "-";

                return (
                  <>
                    <div className="relative inline-block">
                      <select
                        value={activeProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer w-full"
                      >
                        {filteredPrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
                        <svg
                          xmlns="http://w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="text-sm space-y-4 rounded-full">
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium mb-1">
                          Net PNL:
                        </span>
                        <span
                          className={`font-semibold text-xl ${pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          Rp {formatBigNumber(pnl)}
                        </span>
                      </div>
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Target Share:
                        </span>
                        <span className="font-semibold text-xl text-foreground">
                          {Math.round(capaianShare)}% / {targetShare}%
                        </span>
                      </div>
                      <div className="flex flex-col mb-2 p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Status:
                        </span>
                        <span
                          className={`font-semibold text-xl ${pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/compare")}
                      className="flex items-center justify-center gap-2 w-full bg-card hover:bg-primary hover:text-primary-foreground text-foreground h-10 pl-4 pr-6 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <GitCompare size={18} /> Compare
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Kontainer grafik top bottom pnl */}
      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Tombol panggil detail modal disatuin buat dua grafik biar rapi */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => {
              setChartDetailType("pnl");
              setChartDetailTitle("Top & Bottom PNL Program");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail PNL
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {/* Grafik data top pnl */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Top PNL (${selectedCategory})`
                  : "Top 5 Program (PNL Tertinggi)"
              }
              data={topPnlData}
              options={{
                indexAxis: "y",
                scales: {
                  x: {
                    ticks: {
                      // Pake helper format big number buat format label angka pada sumbu y
                      callback: function (value: string | number) {
                        return formatBigNumber(Number(value));
                      },
                    },
                  },
                },
              }}
              height={360}
            />
          </div>

          {/* Grafik data bottom pnl */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Bottom PNL (${selectedCategory})`
                  : "Bottom 5 Program (PNL Terendah)"
              }
              data={bottomPnlData}
              options={{
                indexAxis: "y",
                scales: {
                  x: {
                    stacked: true,
                    ticks: {
                      // Pake helper format big number buat format label angka pada sumbu y
                      callback: function (value: string | number) {
                        return formatBigNumber(Number(value));
                      },
                    },
                  },
                  y: { stacked: true },
                },
              }}
              height={360}
            />
          </div>
        </div>
      </section>

      {/* Kontainer grafik top bottom digital */}
      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Tombol panggil detail modal disatuin buat dua grafik biar rapi */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => {
              setChartDetailType("digital");
              setChartDetailTitle("Digital Revenue & Views");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail Digital
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {/* Grafik data top digital revenue */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Top Digital Revenue & Views (${selectedCategory})`
                  : "Top 5 Digital (Revenue & Views Tertinggi)"
              }
              data={topRevenueDigitalData}
              options={{
                indexAxis: "y",
                scales: {
                  x: {
                    ticks: {
                      // Pake helper format big number buat format label angka pada sumbu y
                      callback: function (value: string | number) {
                        return formatBigNumber(Number(value));
                      },
                    },
                  },
                },
              }}
              height={360}
            />
          </div>

          {/* Grafik data bottom digital revenue */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Bottom Digital Revenue & Views (${selectedCategory})`
                  : "Bottom 5 Digital (Revenue & Views Terendah)"
              }
              data={bottomRevenueDigitalData}
              options={{
                indexAxis: "y",
                scales: {
                  x: {
                    ticks: {
                      // Pake helper format big number buat format label angka pada sumbu y
                      callback: function (value: string | number) {
                        return formatBigNumber(Number(value));
                      },
                    },
                  },
                },
              }}
              height={360}
            />
          </div>
        </div>
      </section>

      {/* Kontainer grafik top lima sama bottom lima performa tv */}
      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Tombol panggil detail modal sama tombol tab satuin disini biar rapi */}
        <div className="absolute top-6 right-6 flex gap-2 z-10 bg-background/50 backdrop-blur px-2 py-1 rounded-xl border border-border">
          <button
            onClick={() => {
              setChartDetailType("tv");
              setChartDetailTitle("Top & Bottom Performa TV");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer text-muted-foreground hover:bg-muted mr-2 border-r border-border pr-4"
          >
            Detail TV
          </button>
          <button
            onClick={() => {
              setTopTvTab("tvr");
              setBottomTvTab("tvr");
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${topTvTab === "tvr" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            TVR
          </button>
          <button
            onClick={() => {
              setTopTvTab("share");
              setBottomTvTab("share");
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${topTvTab === "share" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-14">
          {/* Grafik data top tv */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Top 5 Performa TV - ${selectedCategory}`
                  : "Top 5 Performa TV"
              }
              data={
                topTvTab === "tvr"
                  ? topTvPerformanceDataTvr
                  : topTvPerformanceDataShare
              }
              // Tambah opsi index axis y biar bar arah datar
              options={{ indexAxis: "y" }}
              height={400}
            />
          </div>

          {/* Grafik data bottom tv */}
          <div className="flex flex-col relative">
            <BaseChart
              type="bar"
              title={
                selectedCategory
                  ? `Bottom 5 Performa TV - ${selectedCategory}`
                  : "Bottom 5 Performa TV"
              }
              data={
                bottomTvTab === "tvr"
                  ? bottomTvPerformanceDataTvr
                  : bottomTvPerformanceDataShare
              }
              // Tambah opsi index axis y biar bar arah datar
              options={{ indexAxis: "y" }}
              height={400}
            />
          </div>
        </div>
      </section>

      <ChartDetailModal
        isOpen={isChartDetailOpen}
        onClose={() => setIsChartDetailOpen(false)}
        title={chartDetailTitle}
        metricType={chartDetailType}
        programCategories={programCategories}
      />

      {/* Render modal detail program di bawah */}
      <ProgramDetailModal
        isOpen={isProgramDetailOpen}
        onClose={() => setIsProgramDetailOpen(false)}
        program={activeProgramForModal}
      />
    </div>
  );
}
