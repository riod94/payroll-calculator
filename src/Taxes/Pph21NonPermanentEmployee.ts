import AbstractPph from "./AbstractPph";

/**
 * Class Pph21NonPermanentEmployee
 */
export default class Pph21NonPermanentEmployee extends AbstractPph {
    public calculate(): any {
        this.calculatePph21();

        return this.result;
    }

    public calculatePph21(): void {
        // Kalkulasi pph21 Pegawai Tidak Tetap Ketentuan 2024 berdasarkan PP No 58 Tahun 2023
        // * <= Rp450ribu/hari 0% x Ph Bruto Harian
        // * > Rp450ribu/hari – Rp2,5 juta/hari 0,5% x Ph Bruto Harian
        // * >= Rp2,5 juta/hari Tarif Psl 17 x 50% x Ph Bruto
        // * Dibayar bulanan Tarif Efektif Bulanan x Ph Bruto

        let monthlyGross = this.calculator.Result.earnings.monthly.gross;

        // 1. PENGHASILAN DIBAYAR BULANAN
        if ('monthly' == this.calculator.frequency) {
            let ptkpStatus = this.calculator.Employee.ptkpStatus;
            let effectiveRate = this.getEffectiveRateMonthly(ptkpStatus, monthlyGross);

            if (effectiveRate.rate) {
                this.result.pph.liability.monthly = Math.floor(monthlyGross * effectiveRate.rate);
                let ter = this.parseTerDetail(monthlyGross, ptkpStatus, effectiveRate);
                this.result.pph.ter = ter;
                this.result.pph.pkp = monthlyGross;

                if ('GROSSUP' == this.calculator.method) {
                    let resultCalculateGrossUp = this.getMonthlyTerGrossUp(monthlyGross, ptkpStatus, effectiveRate);
                    this.result.pph.ter = resultCalculateGrossUp.ter;
                    this.result.pph.pkp = resultCalculateGrossUp.pkp;
                    this.result.pph.liability.monthly = resultCalculateGrossUp.pph;
                }
            }
        }

        // JIKA PENGHASILAN DIBAYAR MINGGUAN MAKA DIKONVERSI MENJADI PENGHASILAN DIBAYAR HARIAN
        monthlyGross = 'weekly' == this.calculator.frequency ? monthlyGross / this.calculator.Employee.rateMultiplier : monthlyGross;

        // 2. PENGHASILAN DIBAYAR HARIAN
        if ('daily' == this.calculator.frequency) {
            // 2.1 PENGHASILAN DIBAYAR HARIAN DENGAN JUMLAH PENGHASILAN ≤ Rp2.500.000 SEHARI
            let effectiveRate = this.getEffectiveRateDaily(monthlyGross);
            if (effectiveRate.rate) {
                this.result.pph.liability.monthly = Math.floor(monthlyGross * effectiveRate.rate);
            }

            // 2.2 PENGHASILAN DIBAYAR HARIAN DENGAN JUMLAH PENGHASILAN > Rp2.500.000 SEHARI
            if (2500000 < monthlyGross) {
                monthlyGross = Math.floor(monthlyGross * 0.5);
                this.result.pph.liability.monthly = 'GROSSUP' == this.calculator.method
                    ? this.getPphGrossUp(monthlyGross) : this.getPph(monthlyGross);
            }
        }

        // KONVERSI PPh HARIAN MENJADI PPh MINGGUAN KETIKA PENGHASILAN DIBAYAR MINGGUAN
        this.result.pph.liability.monthly = 'weekly' == this.calculator.frequency
            ? this.result.pph.liability.monthly * this.calculator.Employee.rateMultiplier
            : this.result.pph.liability.monthly;
    }
}