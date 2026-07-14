import axios from "axios";
// Import tipe data program dari skema validasi
import { ProgramFormData, programFormSchema } from "@/schemas/program";

// Bikin instance khusus axios biar konfigurasinya rapi dan terpusat
const apiClient = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.backend-mtv.com",

  // Setel batas waktu request maksimal sepuluh detik
  timeout: 10000,
  // Pastiin header kiriman berformat json
  headers: {
    // Definisi tipe konten json
    "Content-Type": "application/json",
  },
});

// Bikin interface buat nangkep respons mentah dari json yang strukturnya beda
export interface RawDashboardResponse {
  // Properti master data buat relasi
  masterData: Record<string, unknown>;
  // Properti payload data buat rincian metrik
  payloadData: Record<string, unknown>;
}

// Bikin interface balasan yang dipake hook
export interface FetchProgramsResponse {
  // Array nampung data program asli siap pake
  data: ProgramFormData[];
  // Objek penampung parameter filter yang aktif digunakan saat fetch
  params: {
    // Properti opsional karena boleh bernilai undefined atau string
    startPeriod?: string;
    // Parameter bulan akhir batasan filter opsional
    endPeriod?: string;
    // Properti wajib bebentuk string (misal: "2026")
    year: string;
  };
  // Array nampung pesan error kalo ada
  errors: string[];
}

// Fungsi fetch list program buat ditarik ama react query
export const fetchProgramsByRange = async (
  // Parameter bulan awal filter filter opsional
  startPeriod?: string,
  // Parameter bulan akhir batasan filter opsional
  endPeriod?: string,
  // Parameter string tahun dokumen opsional
  year: string = "2026",
): Promise<FetchProgramsResponse> => {
  
  // Pipa keran buat bacend pak Lukman atau mas Ismail nanti
  // Pas backend idup, ganti url "/data.json" jadi endpoint, misal "/api/v1/programs"
  const response = await apiClient.get<unknown>(
    // Tembak langsung file json di folder public
    `/data.json`,
  );

  // Ambil data mentahnya
  const rawData = response.data;
  const mappedData: ProgramFormData[] = [];
  const validationErrors: string[] = [];

  if (Array.isArray(rawData)) {
    rawData.forEach((item, index) => {
      const parsedData = programFormSchema.safeParse(item);

      if (parsedData.success) {
        mappedData.push(parsedData.data);
      } else {
        validationErrors.push(`Baris ${index + 1} gagal divalidasi`);
        console.error(
          `Baris ${index + 1} gagal divalidasi`,
          parsedData.error.format(),
        );
      }
    });
  }

  // Balikin hasil data bongkahan utuh yang udah dipetain
  return {
    // Isi data
    data: mappedData,
    params: {
      // Berikan nilai variabel aslinya secara langsung tanpa tanda tanya
      startPeriod: startPeriod,
      // Parameter bulan akhir batasan filter opsional
      endPeriod: endPeriod,
      year: year,
    },
    // Isi error kosong
    errors: validationErrors,
  };
}  

  // Buka/tutup keran
  // Sekarang keran "data.json" udah ditutup, sistem cuma nembak ke Google Sheet aja pake try-catch di bawah ini.
  // Kalo nanti mau buka 2 keran lagi (json + sheet), komen blok try-catch di bawah, terus ganti pake kode "Promise.allSettled" yang sebelumnya.
  // Kalo mau full balik ke "data.json", hapus komen di blok diatas terus komen sesianya

//   // Siapin dua ember kosong buat nampung balasan
//   let mappedData: ProgramFormData[] = [];
//   let validationErrors: string[] = [];

//   // Tembak keran server endpoint google sheet aja (keran lokal ditutup)
//   try {
//     // Disable any sementara biar ga bawel tscnya, karena format response google sheet beda
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const sheetResponse = await apiClient.get<any>(
//       `/api/v1/programs?year=${year}`,
//     );

//     // Tarik list program siap pakai dari payload data responsenya
//     const sheetData = sheetResponse.data?.data || [];
//     // Tarik list string error hasil zod tracking sheetnya
//     const sheetErrors = sheetResponse.data?.errors || [];

//     // Kalo data array siap pake, langsung sembur dan gabungin ke ember data utama
//     if (Array.isArray(sheetData)) {
//       mappedData = [...mappedData, ...sheetData];
//     }

//     // Kalo ada laporan error, sembur sekalian ke dalem ember error utama
//     if (Array.isArray(sheetErrors)) {
//       validationErrors = [...validationErrors, ...sheetErrors];
//     }
//   } catch (error) {
//     // Catet error kalo gagal ngubungin server API sheet
//     validationErrors.push("Gagal narik data dari Google Sheet API");
//   }

//   // Balikin hasil data bongkahan utuh gabungan yang udah dipetain
//   return {
//     // Isi data cuma dari keran sheet doang
//     data: mappedData,
//     params: {
//       // Berikan nilai variabel aslinya secara langsung tanpa tanda tanya
//       startPeriod: startPeriod,
//       // Parameter bulan akhir batasan filter opsional
//       endPeriod: endPeriod,
//       year: year,
//     },
//     // Isi rekap error
//     errors: validationErrors,
//   };
// };

// Fungsi buat nyuntik data program baru ke server
export const createProgram = async (
  // Parameter objek data utuh hasil ketikan form
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Kalo backend udah jadi, hapus promise timer
  await new Promise((resolve) => setTimeout(resolve, 800));

  // const response = await apiClient.post<ProgramFormData>(
  //   `/api/v1/programs`,
  //   data,
  // );
  // return response.data;

  // Balikin data bohongan sisa simulasi
  return { ...data, id: `PRG-NEW-${Date.now()}` };
};

// Fungsi buat nimpah atau ngedit data program lama
export const updateProgram = async (
  // Parameter string id unik sasaran update
  id: string,
  // Parameter objek data baru yang mau ditiban ke dalem database
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Hapus timer pas backend asli udah ada
  await new Promise((resolve) => setTimeout(resolve, 800));

  // const response = await apiClient.put<ProgramFormData>(
  //   `/api/v1/programs/${id}`,
  //   data,
  // );
  // return response.data;

  // Balikin simulasi balasan
  return data;
};

// Fungsi sakti buat ngehapus data dari peredaran
export const deleteProgram = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // await apiClient.delete(`/api/v1/programs/${id}`);
};
