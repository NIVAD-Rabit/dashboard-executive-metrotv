"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";
import useDashboard from "@/hooks/useDashboard";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import BaseChart from "@/components/shared/BaseChart";

export default function ExecutiveDashboardPage() {
  const {
    allProgramData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    selectedProgramId,
    setSelectedProgramId,
  } = useDashboard();

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Title Page */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        {/* <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
          <LayoutDashboard size={28} />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            PNL Program
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Evaluasi target, capaian revenue, dan profitabilitas
          </p>
        </div>
      </div>

      {/* Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All program data chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-red-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="PNL Keseluruhan (Per Kategori)"
            data={allProgramData}
            height={360}
          />
        </div>

        {/* Detail program data chart */}
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

        {/* Top PNL Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-green-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="Top 5 Program (PNL Tertinggi)"
            data={topPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>

        {/* Bottom PNL Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-yellow-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title="Bottom 5 Program (PNL Terendah)"
            data={bottomPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>
      </section>
    </div>
  );
}
