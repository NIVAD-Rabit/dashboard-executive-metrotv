// Import instance axios dari library
import { apiClient } from "@/lib/axios";
// Import tipe data program dari skema validasi zod
import { ProgramFormData, programFormSchema } from "@/schemas/program";

// Bikin interface balesan yang dipake hook
export interface FetchProgramsResponse {
  // Array nampung data program asli siap pake
  data: ProgramFormData[];
  // Objek tampungan parameter filter yang aktif dipake pas fetch
  params: {
    // Properti opsional, boleh bernilai undefined atau string
    startPeriod?: string;
    // Parameter bulan akhir batasan filter opsional
    endPeriod?: string;
    // Properti wajib bebentuk string (misal: "2026")
    year: string;
  };
  // Array nampung pesan error kalo ada
  errors: string[];
}

// Bikin interface kerangka standar balesan dari api biar bebas dari any
export interface StandardApiResponse {
  // Properti opsional data array program
  data?: ProgramFormData[];
  // Properti opsional data array string error
  errors?: string[];
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
  // Tarik posisi tuas keran dari env, kalo kosong pasang default ke sheet
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "sheet";

  // Siapin dua ember kosong buat nampung balesan
  let mappedData: ProgramFormData[] = [];
  let validationErrors: string[] = [];

  // Buka blok tangkapan antisipasi error pas nembak keran
  try {
    // Percabangan logika ala keran hotel buat nentuin kemana data ditembak
    if (dataSource === "json") {
      // Keran diputer ke lokal, tembak langsung file json di folder public
      const response = await apiClient.get<unknown>(`/data.json`);
      // Ambil data mentahnya
      const rawData = response.data;

      // Bongkar balesan json dan saring pake zod
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
    } else if (dataSource === "backend") {
      // Keran diputer ke server asli pak Lukman atau mas Ismail
      // Tarik alamat dasar dari env
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

      // Tembak api backend pake tipe standar bebas any
      const response = await apiClient.get<StandardApiResponse>(
        `${baseUrl}/api/v1/programs?year=${year}`,
      );

      // Tarik list program siap pakai dari payload data responsenya
      const backendData = response.data?.data;
      // Tarik list string error hasil tangkepan backend
      const backendErrors = response.data?.errors;

      // Kalo data array beneran ada isinya, langsung sembur dan gabungin ke ember utama
      if (Array.isArray(backendData)) {
        mappedData = [...backendData];
      }

      // Kalo ada laporan error, sembur sekalian ke dalem ember error
      if (Array.isArray(backendErrors)) {
        validationErrors = [...backendErrors];
      }
    } else {
      // Keran diputer ke sheet, nembak ke server endpoint google sheet bawaan next js
      // Tembak api sheet lokal pake tipe standar tanpa any
      const sheetResponse = await apiClient.get<StandardApiResponse>(
        `/api/programs?year=${year}`,
      );

      // Tarik list program siap pakai dari payload data responsenya
      const sheetData = sheetResponse.data?.data;
      // Tarik list string error hasil zod tracking sheetnya
      const sheetErrors = sheetResponse.data?.errors;

      // Kalo data array siap pake beneran ada, sembur dan gabungin ke ember data utama
      if (Array.isArray(sheetData)) {
        mappedData = [...sheetData];
      }

      // Kalo ada laporan error, sembur sekalian ke dalem ember error utama
      if (Array.isArray(sheetErrors)) {
        validationErrors = [...sheetErrors];
      }
    }
  } catch (error) {
    // Catet error kalo gagal ngubungin server sesuai nama kerannya
    validationErrors.push(`Gagal narik data dari keran ${dataSource}`);
  }

  // Balikin hasil data bongkahan utuh dari keran yang lagi nyala
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
    // Isi rekap error
    errors: validationErrors,
  };
};

// Fungsi buat nyuntik data program baru ke server
export const createProgram = async (
  // Parameter objek data utuh hasil ketikan form
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Kalo backend udah jadi, hapus promise timer
  await new Promise((resolve) => setTimeout(resolve, 800));

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

  // Balikin simulasi balesan
  return data;
};

// Fungsi sakti buat ngehapus data dari peredaran
export const deleteProgram = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
};
