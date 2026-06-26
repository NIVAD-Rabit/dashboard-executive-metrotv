import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";

export default function useDashboard() {
  // Buat wadah state nilai pilih berdasar kategori
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Buat wadah state nilai pilih berdasar periode
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");

  // Buat wadah state nilai pilih di per program
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );

  // Buat state buat buka modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  // State tanda buka modal detail
  const [isChartDetailOpen, setIsChartDetailOpen] = useState<boolean>(false);

  // State simpan tipe chart buat modal
  const [chartDetailType, setChartDetailType] = useState<string>("pnl");

  // State simpan judul modal detail
  const [chartDetailTitle, setChartDetailTitle] = useState<string>("");

  // Kumpul opsi periode
  const periodOptions = [
    { label: "All Time", value: "all" },
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "Custom", value: "custom" },
  ];

  // Set tanggal paling baru berdasar mock data
  const lastUpdated = useMemo(() => {
    let latest = new Date(0);
    MOCK_PROGRAMS.forEach((p) => {
      if (p.updatedAt) {
        const d = new Date(String(p.updatedAt));
        if (d > latest) latest = d;
      }
      p.periods?.forEach((per) => {
        const [year, month] = per.month.split("-").map(Number);
        const d = new Date(year, month - 1);
        if (d > latest) latest = d;
      });
    });
    return latest.getTime() === 0
      ? "-"
      : latest.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  }, []);

  // Daftar opsi kategori
  const programCategories = useMemo(() => {
    return MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Cek kalo dalem wadah array belum ada nama kategori saat ini
        if (!acc.includes(curr.category)) {
          // Masuk nama kategori aja ke dalem array wadah
          acc.push(curr.category);
        }

        // Balik wadah array buat putar looping berikut
        return acc;
      },
      // Modal awal rupa wadah array kosong tipe string
      [] as string[],
    );
  }, []);

  // Filter data dinamis berdasar kategori sama periode
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

    // Kalo kategori ga ada yang pilih kasih semua data
    if (!selectedCategory) return result;

    // Kalo kategori ada yang pilih filter berdasar kategori
    return result.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, startMonth, endMonth, selectedPeriod]);

  // Cari rentang waktu dari data filter buat label dashboard
  const displayedPeriodLabel = useMemo(() => {
    if (filteredPrograms.length === 0) return "Data Kosong";

    let min = "9999-99";
    let max = "0000-00";

    filteredPrograms.forEach((p) => {
      p.periods.forEach((per) => {
        if (per.month < min) min = per.month;
        if (per.month > max) max = per.month;
      });
    });

    if (min === max) return min;
    return `${min} s/d ${max}`;
  }, [filteredPrograms]);

  // Nilai kpi buat di card dashboard
  const totalKPI = useMemo(() => {
    // Guna reduce buat kumpul total data revenue, cost, pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        acc.revenue += curr.periods.reduce(
          (s, per) =>
            s +
            per.financials.revenueActual +
            (per.performanceDigital.revenue || 0),
          0,
        );
        acc.cost += curr.periods.reduce(
          (s, per) => s + per.financials.costDirect,
          0,
        );
        acc.pnl += curr.periods.reduce((s, per) => s + per.financials.pnl, 0);
        return acc;
      },
      // Set nilai awal ke nol semua
      { revenue: 0, cost: 0, pnl: 0 },
    );

    // Fungsi cegah error pas bagi angka, biar hasil ga infinity atau nan pas penyebut nol
    // Parameter num itu angka atas, denom angka bawah
    const safeDiv = (num: number, denom: number) =>
      // Kalo angka bawah bukan nol bagi aja, kalo angka bawah nol langsung sebut hasil nol
      denom !== 0 ? num / denom : 0;

    // Fungsi bantu rapih persen biar ga nulis tofixed ulang
    const formatPct = (val: number) => val.toFixed(0).replace(".", ",");

    // Itung persen profit bersih dari revenue
    const profitMarginPct = safeDiv(totals.pnl, totals.revenue) * 100;

    // Cari program sumbang pnl paling gede
    const topContributor =
      filteredPrograms.length > 0
        ? [...filteredPrograms].sort(
            (a, b) =>
              b.periods.reduce((s, per) => s + per.financials.pnl, 0) -
              a.periods.reduce((s, per) => s + per.financials.pnl, 0),
          )[0]
        : null;

    // Map susun card buat render di komponen
    return {
      // Guna objek totals buat balik nilai totals
      totals,

      // Kumpul array card
      cards: [
        {
          title: "Total Revenue",

          // Total duit masuk dari seluruh program
          value: `Rp ${formatBigNumber(totals.revenue)}`,

          // Revenue harus positif
          isPositive: totals.revenue > 0,

          // Total dapat bisnis berapa
          label: "Pendapatan",
        },

        {
          title: "Net Profit",

          // Duit sisa abis potong semua biaya
          value: `Rp ${formatBigNumber(totals.pnl)}`,

          // Untung hijau, rugi merah
          isPositive: totals.pnl >= 0,

          // Bisnis untung atau rugi
          label: totals.pnl >= 0 ? "Profit Bersih" : "Rugi Bersih",
        },

        {
          title: "Profit Margin",

          // Persen profit bersih hadap revenue
          value: `${formatPct(profitMarginPct)}%`,

          // Margin positif anggap sehat
          isPositive: profitMarginPct >= 0,

          // Dari seluruh revenue, berapa persen jadi profit
          label: profitMarginPct >= 0 ? "Margin Sehat" : "Margin Negatif",
        },

        {
          title: "Top Contributor Program",

          // Program sumbang profit paling gede
          value: topContributor?.name || "-",

          // Kalo sumbang profit anggap positif
          isPositive:
            (topContributor
              ? topContributor.periods.reduce(
                  (s, per) => s + per.financials.pnl,
                  0,
                )
              : 0) >= 0,

          // Program mana yang paling sumbang ke bisnis
          label: topContributor
            ? `Rp ${formatBigNumber(topContributor.periods.reduce((s, per) => s + per.financials.pnl, 0))}`
            : "-",
        },
      ],
    };
  }, [filteredPrograms]);

  // Aktif per program berdasar filter kategori
  const activeProgramId = useMemo(() => {
    // Kalo ada program yang lagi pilih dan program itu ada di kategori filter
    if (
      selectedProgramId &&
      filteredPrograms.some((p) => p.id === selectedProgramId)
    ) {
      // Kalo ada tetep pake program yang pilih
      return selectedProgramId;
    }

    // Kalo block if salah masuk ke fallback ambil id program pertama
    return filteredPrograms.length > 0 ? filteredPrograms[0].id : "";
  }, [filteredPrograms, selectedProgramId]);

  // Pnl semua program
  // Biar optimal bungkus pake usememo biar react ga usah render ulang kalo ga ada ubah data
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Rapih data yang acak berdasar grup
    // Guna reduce buat loop kumpul data ke satu wadah acc
    // Acc itu wadah sementara buat isi objek
    // Curr itu data mentah pas antri loop
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Cek kalo dalem wadah belum ada properti nama kategori si curr
        // Bikin kategori terus set angka awal mulai dari nol
        if (!acc[curr.category]) acc[curr.category] = 0;

        // Kalo kategori udah ada, tambah properti nilai pnl ke total kategori
        acc[curr.category] += curr.periods.reduce(
          (s, per) => s + per.financials.pnl,
          0,
        );

        // Balik wadah yang udah update biar baca ke putar looping berikut
        return acc;
      },
      // Set modal awal wadah objek kosong
      {} as Record<string, number>,
    );

    // Ambil key buat label
    const labels = Object.keys(grouped);
    // Ambil value buat data
    const data = Object.values(grouped);

    // Bikin warna latar pas lagi pilih kategori
    const bgColors = labels.map((label, index) => {
      const colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ];
      const baseColor = colors[index % colors.length];
      return !selectedCategory || label === selectedCategory
        ? baseColor
        : baseColor + "26";
    });

    // Map balik struktur chartjs
    return {
      labels,
      datasets: [
        {
          label: "Total PNL (Rp)",
          data,
          backgroundColor: bgColors,
          minBarLength: 15,
        },
      ],
    };
  }, [selectedCategory]);

  // Detail per program
  // Pake usememo biar chart donat cuma render ulang kalo nilai id rubah
  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    // Cari data program spesifik dari array id yang sama persis kaya yang pilih di state
    // Pake fallback program awal misal id ga temu
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === activeProgramId) || MOCK_PROGRAMS[0];

    // Kalo program ga ada balik label sama dataset array kosong
    if (!prog) return { labels: [], datasets: [] };

    // Balik format data sesuai atur struktur chartjs
    return {
      labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
      datasets: [
        {
          data: [
            prog.periods.reduce(
              (s, per) =>
                s +
                per.financials.revenueActual +
                (per.performanceDigital.revenue || 0),
              0,
            ),
            prog.periods.reduce((s, per) => s + per.financials.costDirect, 0),
            prog.periods.reduce(
              (s, per) => s + per.financials.revenueTarget,
              0,
            ),
          ],
        },
      ],
    };
  }, [activeProgramId]);

  // Top pnl data
  // Bungkus usememo data statis buat tampil ranking
  // Pake spread operator buat salin array asli
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    // Rumus urut dari pnl paling gede ke paling kecil
    // Abis urut, array potong buat ambil lima data atas
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          b.periods.reduce((s, per) => s + per.financials.pnl, 0) -
          a.periods.reduce((s, per) => s + per.financials.pnl, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Positif (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.pnl, 0),
          ),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Bottom pnl data
  // Konsep sama kaya top pnl, salin dulu biar array asli ga mutasi
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Beda di rumus urut dari pnl paling minus ke gede
    // Urut program paling rugi ada di pucuk atas
    // Potong ambil lima peringkat paling bawah
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          a.periods.reduce((s, per) => s + per.financials.pnl, 0) -
          b.periods.reduce((s, per) => s + per.financials.pnl, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Minus (Rp)",
          data: sorted.map((p) => {
            const pnl = p.periods.reduce((s, per) => s + per.financials.pnl, 0);
            return pnl < 0 ? pnl : null;
          }),
          backgroundColor: "#ff0000",
          minBarLength: 15,
        },
        {
          label: "Terendah (Rp)",
          data: sorted.map((p) => {
            const pnl = p.periods.reduce((s, per) => s + per.financials.pnl, 0);
            return pnl >= 0 ? pnl : null;
          }),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Top digital revenue
  const topRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          b.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0) -
          a.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
          ),
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
          ),
          backgroundColor: "#17becf",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Bottom digital revenue
  const bottomRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          a.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0) -
          b.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
          ),
          backgroundColor: "#d62728",
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
          ),
          backgroundColor: "#ff7f0e",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Urut data ambil aktual revenue aja buat grafik atas
  const topRevenueData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          b.periods.reduce((s, per) => s + per.financials.revenueActual, 0) -
          a.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target Revenue (Rp)",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Actual Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
          ),
          backgroundColor: "#2ca02c",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Bikin data bottom revenue jadi satu batang, urut dari minus ke gede
  const bottomRevenueData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          a.periods.reduce((s, per) => s + per.financials.revenueActual, 0) -
          b.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target Revenue (Rp)",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Actual Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
          ),
          // Set warna array berdasar nilai aktual buat beda status
          backgroundColor: sorted.map((p) => {
            const rev = p.periods.reduce(
              (s, per) => s + per.financials.revenueActual,
              0,
            );
            return rev >= 0 ? "#ff7f0e" : "#d62728";
          }),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Urut data tvr atas ambil nilai aktual aja
  const topTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => {
        const actA = a.periods.reduce(
          (s, per) => s + per.performanceTV.actualTVR,
          0,
        );
        const actB = b.periods.reduce(
          (s, per) => s + per.performanceTV.actualTVR,
          0,
        );
        return actB - actA;
      })
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target TVR",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.performanceTV.targetTVR, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Pencapaian TVR",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceTV.actualTVR, 0),
          ),
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Urut data share atas ambil nilai aktual aja
  const topTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => {
        const actA = a.periods.reduce(
          (s, per) => s + per.performanceTV.actualShare,
          0,
        );
        const actB = b.periods.reduce(
          (s, per) => s + per.performanceTV.actualShare,
          0,
        );
        return actB - actA;
      })
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target Share",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.performanceTV.targetShare, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Pencapaian Share",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceTV.actualShare, 0),
          ),
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Urut data tvr bawah ambil nilai aktual aja
  const bottomTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => {
        const actA = a.periods.reduce(
          (s, per) => s + per.performanceTV.actualTVR,
          0,
        );
        const actB = b.periods.reduce(
          (s, per) => s + per.performanceTV.actualTVR,
          0,
        );
        return actA - actB;
      })
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target TVR",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.performanceTV.targetTVR, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Pencapaian TVR",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceTV.actualTVR, 0),
          ),
          backgroundColor: "#d62728",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Urut data share bawah ambil nilai aktual aja
  const bottomTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => {
        const actA = a.periods.reduce(
          (s, per) => s + per.performanceTV.actualShare,
          0,
        );
        const actB = b.periods.reduce(
          (s, per) => s + per.performanceTV.actualShare,
          0,
        );
        return actA - actB;
      })
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // {
        //   label: "Target Share",
        //   data: sorted.map((p) =>
        //     p.periods.reduce((s, per) => s + per.performanceTV.targetShare, 0),
        //   ),
        //   backgroundColor: "#4bc0c0",
        //   minBarLength: 15,
        // },
        {
          label: "Pencapaian Share",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceTV.actualShare, 0),
          ),
          backgroundColor: "#d62728",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  return {
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    activeProgramId,
    allProgramData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    filteredPrograms,
    topRevenueData,
    bottomRevenueData,
    topTvPerformanceDataTvr,
    topTvPerformanceDataShare,
    bottomTvPerformanceDataTvr,
    bottomTvPerformanceDataShare,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
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
    isProgramDetailOpen,
    setIsProgramDetailOpen,
  };
}
