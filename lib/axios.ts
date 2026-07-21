import axios from "axios";

// Bikin instance khusus axios biar konfigurasinya rapi dan terpusat
export const apiClient = axios.create({
  // Setel batas waktu request maksimal 10 detik
  timeout: 10000,
  // Pastiin header kiriman formatnya json
  headers: {
    // Definisi tipe konten json
    "Content-Type": "application/json",
  },
});
