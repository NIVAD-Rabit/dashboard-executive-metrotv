import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, FilterX } from "lucide-react";
import BaseChart from "@/components/shared/BaseChart";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";

// Modal kosong
const emptySubscribe = () => () => {};

// Prop tipe
interface ChartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  metricType: string;
  programCategories: string[];
}

export default function ChartDetailModal({
  isOpen,
  onClose,
  title,
  metricType,
  programCategories,
}: ChartDetailModalProps) {
  // Susun state portal
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // State kumpul data kategori
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // State kumpul data periode
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  // State bulan mulai
  const [startMonth, setStartMonth] = useState<string>("");
  // State bulan batas
  const [endMonth, setEndMonth] = useState<string>("");
  // State urut data grafik
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // State ganti tab metrik tv buat tvr atau share
  const [tvTab, setTvTab] = useState<"tvr" | "share">("tvr");

  // Opsi dropdown periode
  const periodOptions = [
    { label: "All Time", value: "all" },
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "Custom", value: "custom" },
  ];

  // Saring data program berdasar opsi dropdown sama tanggal
  const filteredPrograms = useMemo(() => {
    let result = [...MOCK_PROGRAMS];

    if (selectedPeriod === "custom") {
      if (startMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      }
      if (endMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
      }
    } else if (selectedPeriod && selectedPeriod !== "all") {
      // Ambil waktu hari ini buat bates filter periode otomatis
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const firstMonthOfYear = `${currentYear}-01`;

      let minMonth = "";
      if (selectedPeriod === "ytd") minMonth = firstMonthOfYear;
      else if (selectedPeriod === "mtd") minMonth = currentMonthStr;

      result = result.filter((p) =>
        p.periods.some(
          (per) => per.month >= minMonth && per.month <= currentMonthStr,
        ),
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [selectedCategory, startMonth, endMonth, selectedPeriod]);

  // Tentu tipe chart dari prop metrik
  type ModalChartType = "bar" | "doughnut";
  const chartType: ModalChartType =
    metricType === "performance" ? "doughnut" : "bar";

  // Susun struktur data chart dari program yang udah disaring
  const chartData = useMemo<
    ChartData<ModalChartType, number[], unknown>
  >(() => {
    if (filteredPrograms.length === 0) return { labels: [], datasets: [] };

    if (metricType === "pnl") {
      // Urut data pnl berdasar opsi
      const sorted = [...filteredPrograms].sort((a, b) => {
        const pnlB = b.periods.reduce((s, per) => s + per.financials.pnl, 0);
        const pnlA = a.periods.reduce((s, per) => s + per.financials.pnl, 0);
        return sortOrder === "desc" ? pnlB - pnlA : pnlA - pnlB;
      });

      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Net PNL (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.pnl, 0),
            ),
            backgroundColor: sorted.map((p) => {
              const pnl = p.periods.reduce(
                (s, per) => s + per.financials.pnl,
                0,
              );
              return pnl >= 0 ? "#16a34a" : "#d62728";
            }),
            minBarLength: 15,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    if (metricType === "digital") {
      // Urut data digital berdasar opsi
      const sorted = [...filteredPrograms].sort((a, b) => {
        const revB = b.periods.reduce(
          (s, per) => s + per.performanceDigital.revenue,
          0,
        );
        const revA = a.periods.reduce(
          (s, per) => s + per.performanceDigital.revenue,
          0,
        );
        return sortOrder === "desc" ? revB - revA : revA - revB;
      });

      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Digital Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce(
                (s, per) => s + per.performanceDigital.revenue,
                0,
              ),
            ),
            backgroundColor: "#1f77b4",
            minBarLength: 15,
          },
          {
            label: "Digital Views",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
            ),
            backgroundColor: "#17becf",
            minBarLength: 15,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    if (metricType === "combo" || metricType === "revenue") {
      // Urut data revenue berdasar opsi
      const sorted = [...filteredPrograms].sort((a, b) => {
        const revB = b.periods.reduce(
          (s, per) => s + per.financials.revenueActual,
          0,
        );
        const revA = a.periods.reduce(
          (s, per) => s + per.financials.revenueActual,
          0,
        );
        return sortOrder === "desc" ? revB - revA : revA - revB;
      });

      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Target Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
            ),
            backgroundColor: "#4bc0c0",
            minBarLength: 15,
          },
          {
            label: "Actual Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
            ),
            // Ubah warna baris revenue jadi hijau
            backgroundColor: "#2ca02c",
            minBarLength: 15,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    if (metricType === "tv") {
      // Cek kalo tab tvr yang aktif
      if (tvTab === "tvr") {
        // Urut data tv berdasar opsi
        const sorted = [...filteredPrograms].sort((a, b) => {
          const actB = b.periods.reduce(
            (s, per) => s + per.performanceTV.actualTVR,
            0,
          );
          const actA = a.periods.reduce(
            (s, per) => s + per.performanceTV.actualTVR,
            0,
          );
          return sortOrder === "desc" ? actB - actA : actA - actB;
        });

        return {
          labels: sorted.map((p) => p.name),
          datasets: [
            {
              label: "Target TVR",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetTVR,
                  0,
                ),
              ),
              backgroundColor: "#4bc0c0",
              minBarLength: 15,
            },
            {
              label: "Aktual TVR",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualTVR,
                  0,
                ),
              ),
              backgroundColor: "#1f77b4",
              minBarLength: 15,
            },
          ],
        } as ChartData<ModalChartType, number[], unknown>;
      } else {
        // Urut data tv berdasar opsi
        const sorted = [...filteredPrograms].sort((a, b) => {
          const actB = b.periods.reduce(
            (s, per) => s + per.performanceTV.actualShare,
            0,
          );
          const actA = a.periods.reduce(
            (s, per) => s + per.performanceTV.actualShare,
            0,
          );
          return sortOrder === "desc" ? actB - actA : actA - actB;
        });

        return {
          labels: sorted.map((p) => p.name),
          datasets: [
            {
              label: "Target Share (%)",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetShare,
                  0,
                ),
              ),
              backgroundColor: "#4bc0c0",
              minBarLength: 15,
            },
            {
              label: "Aktual Share (%)",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualShare,
                  0,
                ),
              ),
              backgroundColor: "#ff7f0e",
              minBarLength: 15,
            },
          ],
        } as ChartData<ModalChartType, number[], unknown>;
      }
    }

    if (metricType === "performance") {
      // Kumpul total nilai buat chart donat
      const revCapaian = filteredPrograms.reduce(
        (acc, p) =>
          acc +
          p.periods.reduce(
            (s, per) =>
              s +
              per.financials.revenueActual +
              (per.performanceDigital.revenue || 0),
            0,
          ),
        0,
      );
      const costDirect = filteredPrograms.reduce(
        (acc, p) =>
          acc + p.periods.reduce((s, per) => s + per.financials.costDirect, 0),
        0,
      );
      const revTarget = filteredPrograms.reduce(
        (acc, p) =>
          acc +
          p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
        0,
      );

      return {
        labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
        datasets: [
          {
            data: [revCapaian, costDirect, revTarget],
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    return { labels: [], datasets: [] } as ChartData<
      ModalChartType,
      number[],
      unknown
    >;
  }, [filteredPrograms, metricType, sortOrder, tvTab]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
      <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            Detail Data, {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="bg-card px-6 py-4 rounded-2xl flex flex-wrap lg:flex-nowrap lg:items-center justify-between gap-4 border border-border/50">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
              >
                {/* Ubah warna background opsi list dropdown, biar kontras pas ganti tema */}
                <option value="" className="bg-background text-foreground">
                  Semua Kategori
                </option>
                {programCategories.map((c, i) => (
                  <option
                    key={i}
                    value={c}
                    className="bg-background text-foreground"
                  >
                    {c}
                  </option>
                ))}
              </select>

              {chartType !== "doughnut" && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
                >
                  <option
                    value="desc"
                    className="bg-background text-foreground"
                  >
                    Tertinggi ke Terendah
                  </option>
                  <option value="asc" className="bg-background text-foreground">
                    Terendah ke Tertinggi
                  </option>
                </select>
              )}
            </div>

            {metricType === "tv" && (
              // Wadah tombol tab detail tv
              <div className="flex bg-muted/40 p-1 rounded-full border border-border w-full lg:w-auto">
                <button
                  onClick={() => setTvTab("tvr")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors w-full sm:w-auto cursor-pointer ${tvTab === "tvr" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  TVR
                </button>
                <button
                  onClick={() => setTvTab("share")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors w-full sm:w-auto cursor-pointer ${tvTab === "share" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Share
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
              >
                {periodOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-background text-foreground"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>

              {selectedPeriod === "custom" && (
                <div className="flex items-center gap-2">
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
                    setSelectedCategory("");
                    setSelectedPeriod("all");
                  }}
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  <FilterX size={14} /> Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="bg-card shadow-sm rounded-2xl border border-border p-4 overflow-y-auto overflow-x-hidden custom-scrollbar h-[600px]">
            {/* Atur tinggi chart dinamis berdasar jumlah data, lebar tetep full layar */}
            <div
              style={{
                width: "100%",
                height:
                  chartType === "bar"
                    ? `${Math.max(500, filteredPrograms.length * 40)}px`
                    : "500px",
              }}
            >
              <BaseChart
                type={chartType}
                data={chartData}
                height={
                  chartType === "bar"
                    ? Math.max(500, filteredPrograms.length * 40)
                    : 500
                }
                showZoomControls={true}
                options={{
                  // Set arah bar vertikal dari atas ke bawah, aktifin zoom y
                  indexAxis: chartType === "bar" ? "y" : "x",
                  maintainAspectRatio: false,
                  plugins: {
                    zoom: {
                      // Set mode zoom buat tombol
                      // Ubah mode xy biar sumbu angka ikut ubah skala
                      zoom: {
                        mode: "xy",
                      },
                      // Ubah mode xy biar grafik geser bebas
                      pan: {
                        enabled: true,
                        mode: "xy",
                      },
                    },
                  },
                  scales:
                    chartType === "bar"
                      ? {
                          x: {
                            ticks: {
                              // Pake helper format big number buat format label
                              callback: function (value: string | number) {
                                return formatBigNumber(Number(value));
                              },
                            },
                          },
                          y: {
                            ticks: {
                              // Paksa label tampil semua jangan potong
                              autoSkip: false,
                            },
                          },
                        }
                      : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
