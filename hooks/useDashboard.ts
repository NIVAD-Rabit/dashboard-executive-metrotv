import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";

export default function useDashboard() {
  // Buat tampungan state atau nilai yang diselect di per program
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    MOCK_PROGRAMS[0].id,
  );

  // PNL All Program
  // Biar optimal dibungkus pake useMemo biar react ga usah render ulang kalo ga ada perubahan di data
  // Data pake Tipe/Ts bawaan ChartJS tipe bar
  // useMemo bakal nyimpen di ram memori browser
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Rapihin data yang berantakan berdasarkan group 'grouped'
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

  // Detail Per-Program
  // Pake useMemo juga biar chart donat ini cuma kerender ulang kalo nilai selectedProgramId (dari dropdown) berubah
  // Kalo milih program yang sama, react tinggal ambil data dari memori browser, ga perlu mikir ulang
  // Cari data program spesifik dari array MOCK_PROGRAMS yang id-nya sama persis kaya yang lagi dipilih di state
  // Pake || MOCK_PROGRAMS[0] buat fallback aja misal id-nya ga ketemu, biar chart ga nge-blank atau error
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

  // Top PNL
  // Dibungkus useMemo dengan dependensi kosong [] soalnya ini datanya statis buat nampilin ranking, biar diitung sekali aja
  // Pake spread operator [...MOCK_PROGRAMS] buat nge-copy array aslinya dulu
  // Soalnya fungsi .sort() itu ngerubah array aslinya (mutating). Kalo ga dicopy, data utama bakal ikutan berantakan
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    // .sort((a, b) => b.pnl - a.pnl) ini rumus buat ngurutin dari PNL paling gede ke paling kecil (descending)
    // Abis diurutin, arraynya dipotong pake .slice(0, 5) buat ambil 5 data teratas aja
    const sorted = [...MOCK_PROGRAMS].sort((a, b) => b.pnl - a.pnl).slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [{ label: "PNL Positif (Rp)", data: sorted.map((p) => p.pnl) }],
    };
  }, []);

  // Bottom PNL
  // Konsepnya sama kaya Top PNL, dicopy dulu biar array asli ga mutasi, trus diitung sekali aja pas render pertama
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Bedanya cuma di rumus cara ngurutinnya
    // .sort((a, b) => a.pnl - b.pnl) ini rumus buat ngurutin dari PNL paling minus ke paling gede (ascending)
    // Jadi urutan program yang paling boncos ada di pucuk atas
    // Trus dipotong pake .slice(0, 5) buat ngambil 5 peringkat paling bawah
    const sorted = [...MOCK_PROGRAMS].sort((a, b) => a.pnl - b.pnl).slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [{ label: "PNL Minus (Rp)", data: sorted.map((p) => p.pnl) }],
    };
  }, []);

  return {
    selectedProgramId,
    setSelectedProgramId,
    allProgramData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
  };
}
