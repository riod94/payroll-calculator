import AbstractPph from "./AbstractPph";

/**
 * Pph21 Bukan Pegawai
 * Dibagi menjadi 3 Kategori
 *
 * 1. Bukan pegawai yang bersifat berkesinambungan. (taxStatus = 3)
 *      - (50% * Penghasilan Bruto) - (PTKP PerBulan) => tarif Pasal 17 bersifat kumulatif
 *      - Harus Memiliki NPWP dan Penghasilan > 1 Bulan
 * 2. Bukan pegawai yang bersifat berkesinambungan dan memiliki penghasilan lainnya. (taxStatus = 4)
 *      - (50% * Penghasilan Bruto) => tarif Pasal 17 bersifat kumulatif
 * 3. Bukan pegawai yang bersifat tidak berkesinambungan. (taxStatus = 5)
 *      - (50 % * Penghasilan Bruto) => tarif Pasal 17 tidak bersifat kumulatif
 */
export default class Pph21NotEmployee extends AbstractPph {

    public calculate(): any {
        if (this.calculator.Provisions.company.useEffectiveRates) {
            this.calculatePph21TER();
        } else {
            this.calculatePph21NotEmployee();
        }

        return this.result;
    }

    /**
     * Menghitung PPH21 untuk wajib pajak bukan karyawan.
     *
     * @return void
     */
    public calculatePph21NotEmployee(): void {
        // Menghitung pendapatan tahunan
        this.result.pph.pkp = (this.calculator.Result.earnings.monthly.gross + this.calculator.Employee.lastTaxPeriod.annualGross + this.calculator.Employee.lastTaxPeriod.annualHolidayAllowance + this.calculator.Employee.lastTaxPeriod.annualBonus + this.calculator.Employee.lastTaxPeriod.annualOnetime) / 12;

        // Menghitung PPH21 tahunan yang sudah dibayar
        let yearlyPph21Paid = this.calculator.Employee.lastTaxPeriod.annualPPh21Paid;

        let annualLiability = 0;
        let ptkpAmount = 0;
        switch (this.calculator.taxStatus) {
            // Rumus => 50% x Penghasilan Bruto - PTKP perbulan (Berlaku Pasal 17 Kumulatif)
            case 3: // 'Bukan pegawai yang Bersifat Berkesinambungan tidak punya penghasilan lain'
                // Menghitung PTKP tahunan sesuai jumlah tanggungan keluarga
                this.result.pph.ptkp.amount = this.getPtkpAmountByPtkpStatus(this.calculator.Employee.ptkpStatus) / 12;

                // Hitung PTKP perbulan ditambahkan dengan PTKP yang sudah dipotong sebelumnya
                ptkpAmount = (this.calculator.Employee.monthMultiplier * this.result.pph.ptkp.amount) + this.result.pph.ptkp.amount;

                // Untuk perhitungan dari fungsi getPphGrossUp tidak perlu dibagi 50% penghasilan brutonya karena sudah dibagikan di fungsinya
                if ('GROSSUP' == this.calculator.method) {
                    // Menghitung PKP setelah dikurangi PTKP perbulan
                    this.result.pph.pkp -= ptkpAmount;
                    annualLiability = this.getPphGrossUp(this.result.pph.pkp, true);
                } else {
                    // Menghitung PKP setelah dikali 50% kemudian dikurangi PTKP perbulan
                    this.result.pph.pkp = (this.result.pph.pkp / 2) - ptkpAmount;
                    annualLiability = this.getPph(this.result.pph.pkp);
                }

                // Mengurangi kewajiban PPH21 yang sudah dibayar
                annualLiability -= yearlyPph21Paid;
                break;

            // Rumus => 50% x Penghasilan Bruto (Berlaku Pasal 17 Kumulatif)
            case 4: // 'Bukan pegawai yang Bersifat Berkesinambungan dan memiliki penghasilan lain'
                // Untuk perhitungan dari fungsi getPphGrossUp tidak perlu dibagi 50% penghasilan brutonya karena sudah dibagikan di fungsinya
                if ('GROSSUP' == this.calculator.method) {
                    annualLiability = this.getPphGrossUp(this.result.pph.pkp, true);
                } else {
                    // Menghitung PKP setelah dikali 50%
                    this.result.pph.pkp = (this.result.pph.pkp / 2);
                    annualLiability = this.getPph(this.result.pph.pkp);
                }

                // Mengurangi kewajiban PPH21 yang sudah dibayar
                annualLiability -= yearlyPph21Paid;
                break;

            // Rumus => 50% x Penghasilan Bruto (Pasal 17 Tidak Kumulatif)
            case 5: // 'Bukan pegawai yang Bersifat Tidak Berkesinambungan' => hanya sekali menerima penghasilan jika dibulan selanjutnya ada menerima penghasilan lagi bisa diubah menjadi tax status 3 atau 4
                // Set PKP hanya hitung gross
                this.result.pph.pkp = this.calculator.Result.earnings.monthly.gross;

                // Untuk perhitungan dari fungsi getPphGrossUp tidak perlu dibagi 50% penghasilan brutonya karena sudah dibagikan di fungsinya
                if ('GROSSUP' == this.calculator.method) {
                    annualLiability = this.getPphGrossUp(this.result.pph.pkp, true);
                } else {
                    // Menghitung PKP setelah dikali 50%
                    this.result.pph.pkp = (this.result.pph.pkp / 2);
                    annualLiability = this.getPph(this.result.pph.pkp);
                }
                break;
        }

        // Round annual liability
        this.result.pph.liability.annual = Math.round(annualLiability);

        // Menentukan kewajiban PPH21 tahunan dan bulanan
        this.result.pph.liability.annual = this.result.pph.liability.monthly = annualLiability;

    }

    public calculatePph21TER(): void {
        let monthlyGross = this.calculator.Result.earnings.monthly.gross;

        this.result.pph.pkp = monthlyGross;

        let annualLiability = 0;

        // Untuk perhitungan dari fungsi getPphGrossUp tidak perlu dibagi 50% penghasilan brutonya karena sudah dibagikan di fungsinya
        if ('GROSSUP' == this.calculator.method) {
            annualLiability = this.getPphGrossUp(this.result.pph.pkp, true);
        } else {
            // Menghitung PKP setelah dikali 50%
            this.result.pph.pkp = (this.result.pph.pkp / 2);
            annualLiability = this.getPph(this.result.pph.pkp);
        }

        // Menentukan kewajiban PPH21 tahunan dan bulanan
        this.result.pph.liability.annual = this.result.pph.liability.monthly = annualLiability;
    }
}
