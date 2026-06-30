

// Box Filter Utama

import { RefreshCcw } from "lucide-react";

<div className="bg-card px-6 py-4 rounded-2xl flex lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex shrink-0 sm:flex-col items-center gap-2">
          {/* Teks label update */}
          <p className="text-lg text-muted-foreground font-medium hidden sm:text-base sm:block">
            Pembaruan terakhir:
          </p>
          {/* Badge waktu update */}
          <span className="text-[14px] md:text-[16px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
            {/* Ikon refresh */}
            <RefreshCcw className="size-[14px] md:size-[16px]" /> {lastUpdated}
          </span>
        </div>

        {/* Kontainer label periode */}
        <div className="w-full text-center">
          {/* Badge label periode aktif */}
          <span className="text-sm text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
            {/* Teks data ditampilkan */}
            Data Ditampilkan: {/* Nilai periode aktif */}
            <span className="font-bold text-foreground">
              {displayedPeriodLabel}
            </span>
          </span>
        </div>

        {/* Kontainer filter kategori dan periode */}
        <div className="flex items-center gap-4">
          {/* Select buat filter kategori */}
          <CustomSelect
            // Nilai filter aktif
            value={selectedCategory ?? ""}
            // Update state kategori
            onChange={setSelectedCategory}
            // List opsi kategori
            options={programCategories.map((c) => ({ label: c, value: c }))}
            // Teks placeholder
            placeholder="Pilih Kategori"
            // Atur lebar fit
            width="fit"
          />

          {/* Kontainer filter periode */}
          <div className="flex flex-row items-center gap-4">
            {/* Select buat filter periode */}
            <CustomSelect
              // Nilai periode aktif
              value={selectedPeriod ?? ""}
              // Update state periode
              onChange={setSelectedPeriod}
              // List opsi periode
              options={periodOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              // Style css
              className="w-full sm:w-auto"
              // Atur lebar fit
              width="fit"
            />

            {/* Kontainer tanggal custom */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Cek kalo periode custom aktif */}
              {selectedPeriod === "custom" && (
                // Kontainer input tanggal
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Input bulan awal */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state awal
                    value={startMonth}
                    // Update state awal
                    onChange={(e) => setStartMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  {/* Teks s/d */}
                  <span className="text-muted-foreground text-xs">s/d</span>
                  {/* Input bulan akhir */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state akhir
                    value={endMonth}
                    // Update state akhir
                    onChange={(e) => setEndMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}
              {/* Kondisional buat tampilin tombol reset filter */}
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                (selectedPeriod && selectedPeriod !== "all")) && (
                // Tombol reset filter
                <button
                  // Fungsi buat kosongin semua state filter
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory(null);
                    setSelectedPeriod("all");
                  }}
                  // Styling tombol reset
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  {/* Ikon filter x */}
                  <FilterX size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/*mobile */}
        
        
      </div>