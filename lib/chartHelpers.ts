// Import tipe data chart dari library chart js
import { ChartData } from "chart.js";
// Import tipe data formulir program dari skema
import { ProgramFormData } from "@/schemas/program";

// Alias tipe buat periode biar ga ngetik panjang panjang
export type ProgramPeriod = ProgramFormData["periods"][number];

// Fungsi buat ngitung total nilai dari array periode
export const sumPeriodValue = (
  // Data program
  prog: ProgramFormData,
  // Callback buat ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
): number => {
  // Reducer buat totalin nilai periode
  return prog.periods.reduce((s, per) => s + valueGetter(per), 0);
};

// Fungsi buat ngurutin dan motong array program sesuai nilai kalkulasi
export const sortAndSlicePrograms = (
  // Data list program
  programs: ProgramFormData[],
  // Callback buat ambil nilai sortir
  valueGetter: (per: ProgramPeriod) => number,
  // Boolean buat urutan turun
  isDesc: boolean = true,
  // Maksimal data yang diambil
  limit: number = 5,
): ProgramFormData[] => {
  // Copy array terus sortir berdasar nilai
  return (
    [...programs]
      // Fungsi sortir
      .sort((a, b) => {
        // Hitung total nilai a
        const valA = sumPeriodValue(a, valueGetter);
        // Hitung total nilai b
        const valB = sumPeriodValue(b, valueGetter);
        // Balikin hasil sortir
        return isDesc ? valB - valA : valA - valB;
      })
      // Potong array
      .slice(0, limit)
  );
};

// Fungsi buat ngerakit dataset bar chart standar
export const createBarDataset = (
  // Label buat dataset
  label: string,
  // Array data angka
  data: (number | null)[],
  // Warna background bar
  backgroundColor: string | string[],
  // Minimal panjang bar
  minBarLength: number = 15,
) => ({
  // Properti label
  label,
  // Properti data
  data,
  // Properti warna
  backgroundColor,
  // Properti panjang bar
  minBarLength,
});

// Fungsi buat ngerakit dataset doughnut chart standar yang udah dibenerin tipenya
export const createDoughnutDataset = (
  // Label buat dataset
  label: string,
  // Array data angka murni tanpa null khusus buat donat
  data: number[],
  // Warna background potongan doughnut
  backgroundColor: string | string[],
) => ({
  // Properti label
  label,
  // Properti data angka
  data,
  // Properti warna
  backgroundColor,
});

// Fungsi buat bikin data chart bar satu dataset otomatis biar ga ribet
export const generateBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
  // Label chart
  label: string,
  // Warna chart
  color: string | string[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Panggil fungsi sortir
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Balikin objek data siap pakai
  return {
    // Label buat sumbu x
    labels: sorted.map((p) => p.name),
    // List dataset
    datasets: [
      // Panggil fungsi create dataset
      createBarDataset(
        label,
        sorted.map((p) => sumPeriodValue(p, valueGetter)),
        color,
      ),
    ],
  };
};

// Fungsi buat bikin data chart doughnut satu dataset otomatis
export const generateDoughnutChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
  // Label chart
  label: string,
  // Array warna chart buat tiap potongan
  color: string[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data maksimal
  limit: number = 5,
): ChartData<"doughnut", number[], unknown> => {
  // Panggil fungsi sortir
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Tampung nilai asli biar gampang dihitung proporsinya
  const realValues = sorted.map((p) => sumPeriodValue(p, valueGetter));

  // Totalin semua nilai asli buat nyari patokan persentase buletannya
  const totalValue = realValues.reduce((sum, val) => sum + val, 0);

  // Set minimal irisan dua persen dari total buletan biar yang jutaan tetep keliatan
  const VISUAL_MIN_PERCENT = 0.02;

  // Hitung batas minimum visualnya dengan cara total dikali persen
  const minVisualValue = totalValue * VISUAL_MIN_PERCENT;

  // Kalo kekecilan paksa naik ke batas minimum visual selain itu biarin normal
  const visualValues = realValues.map((val) => {
    // Kalo emang datanya nol langsung balikin nol biar ga ngerusak chart
    if (val === 0) return 0;
    // Cek kalo lebih kecil dari batas paksa naik ke nilai minimum
    return val < minVisualValue ? minVisualValue : val;
  });

  // Balikin objek data siap pakai
  return {
    // Label buat tiap potongan doughnut
    labels: sorted.map((p) => p.name),
    // List dataset
    datasets: [
      // Panggil fungsi create dataset doughnut pake tipe angka murni
      createDoughnutDataset(
        label,
        // Pake data visual biar irisan kecil ga tenggelem
        visualValues,
        color,
      ),
    ],
  };
};

// Fungsi buat bikin data chart bar dua dataset otomatis biar ga ribet
export const generateDoubleBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi sort
  sortGetter: (per: ProgramPeriod) => number,
  // List getter tiap dataset
  getters: {
    // Fungsi ambil nilai
    getter: (per: ProgramPeriod) => number;
    // Label dataset
    label: string;
    // Warna dataset
    color: string | string[];
  }[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Sortir program
  const sorted = sortAndSlicePrograms(programs, sortGetter, isDesc, limit);

  // Balikin objek data multi dataset
  return {
    // Label sumbu x
    labels: sorted.map((p) => p.name),
    // Mapping dataset dari list getters
    datasets: getters.map((g) =>
      createBarDataset(
        g.label,
        sorted.map((p) => sumPeriodValue(p, g.getter)),
        g.color,
      ),
    ),
  };
};

// Fungsi buat bikin chart donat banyak metrik dari satu sumber data
export const generateMultiMetricDoughnutData = <T>(
  // Objek data sumber buat ditarik nilainya
  sourceData: T,
  // Array berisi list konfigurasi metrik
  metrics: {
    // Teks label nama metrik
    label: string;
    // Fungsi callback penarik nilai angka dari data sumber
    getter: (data: T) => number;
    // String kode warna heksadesimal buat potongan donat
    color: string;
  }[],
  // String label teks buat nama dataset defaultnya kosong
  datasetLabel: string = "",
): ChartData<"doughnut", number[], unknown> => {
  // Tarik semua nilai asli dari data sumber pake fungsi getter map
  const realValues = metrics.map((m) => m.getter(sourceData));

  // Totalin semua nilai asli buat nyari patokan persentase buletannya pake angka absolut
  const totalValue = realValues.reduce((sum, val) => sum + Math.abs(val), 0);

  // Kalo totalnya nol langsung balikin isi kosong biar ga error chartnya
  if (totalValue === 0) {
    // Return objek kosong buat label dan dataset
    return { labels: [], datasets: [] };
  }

  // Set minimal irisan dua persen dari total buletan biar keliatan
  const VISUAL_MIN_PERCENT = 0.02;

  // Hitung batas minimum visualnya dengan cara total dikali persen
  const minVisualValue = totalValue * VISUAL_MIN_PERCENT;

  // Kalo kekecilan paksa naik ke batas minimum visual selain itu biarin normal
  const visualValues = realValues.map((val) => {
    // Kalo emang datanya nol langsung balikin nol biar ga ngerusak proporsi chart
    if (val === 0) return 0;
    // Bikin wadah nilai absolut biar ga kacau pas ada angka minus
    const absVal = Math.abs(val);
    // Cek kalo lebih kecil dari batas paksa naik ke nilai minimum
    return absVal < minVisualValue ? minVisualValue : absVal;
  });

  // Balikin objek data siap pakai buat chart js
  return {
    // Ambil semua teks label dari array konfigurasi metrik map
    labels: metrics.map((m) => m.label),
    // List dataset chart
    datasets: [
      // Panggil fungsi create dataset doughnut pake tipe angka murni
      createDoughnutDataset(
        // Masukin nama dataset ke label
        datasetLabel,
        // Pake data visual biar irisan kecil ga tenggelem
        visualValues,
        // Ambil semua warna dari array konfigurasi metrik map
        metrics.map((m) => m.color),
      ),
    ],
  };
};
