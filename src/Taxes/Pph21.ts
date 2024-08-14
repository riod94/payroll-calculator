import { LIST_OF_PTKP } from "../Constants";
import AbstractPph from "./AbstractPph";

export default class Pph21 extends AbstractPph {
    calculate() {
        if (this.calculator.Provisions.company.useEffectiveRates) {
            this.calculateTER();
        } else {
            this.calculatePph();
            this.calculatePphBonus();
        }

        return this.result;
    }

    calculatePph() {
        /**
         * PPh21 dikenakan bagi yang memiliki penghasilan lebih dari 4500000
         */
        if (this.calculator.Result.earnings.monthly.nett > this.calculator.Provisions.state.pph21EarningsNettLowerLimit && this.calculator.Employee.taxable) {
            // Annual PTKP base on number of dependents family
            this.result.pph.ptkp.amount = LIST_OF_PTKP[this.calculator.Employee.ptkpStatus];

            // Get Earnings Tax
            let earningTax = (this.calculator.Result.earnings.annualy.nett - this.result.pph.ptkp.amount) * (this.getRate(this.calculator.Result.earnings.monthly.nett) / 100);

            // Get PKP (Penghasilan Kena Pajak) Setahun
            this.result.pph.pkp = this.roundDownPkp(this.calculator.Result.earnings.annualy.nett + this.calculator.Employee.onetime.holidayAllowance + this.calculator.Employee.onetime.bonus) - this.result.pph.ptkp.amount;

            this.result.pph.liability.annual = this.result.pph.pkp - earningTax;

            // Gross Or Gross Up Calculation
            if (this.calculator.method === 'GROSSUP') {
                const annualLiability = this.grossUpPph(this.result.pph.pkp);
                this.result.pph.liability.annual = annualLiability;
                this.result.pph.pkp = this.roundDownPkp(this.result.pph.pkp + (this.result.pph.liability.annual / this.calculator.Employee.monthMultiplier));
            } else {
                const annualLiability = this.getPph(this.result.pph.pkp);
                this.result.pph.liability.annual = annualLiability;
            }

            // Surcharge for No Npwp
            if (0 < this.result.pph.liability.annual) {
                if (!this.calculator.Employee.hasNpwp) {
                    this.result.pph.liability.annual = this.result.pph.liability.annual + (this.result.pph.liability.annual * (this.calculator.Provisions.state.pph21NoNpwpSurchargeRate / 100));
                }

                this.result.pph.liability.monthly = this.result.pph.liability.annual / this.calculator.employee.monthMultiplier;
            } else {
                this.result.pph.liability.annual = 0;
                this.result.pph.liability.monthly = 0;
            }
        } else {
            this.result.pph.liability.annual = 0;
            this.result.pph.liability.monthly = 0;
        }

        return this.result;
    }

    calculatePphBonus() {
        this.calculator.Employee.earnings.onetimeAllowance = this.calculator.Employee.onetime.allowances.sum() + this.calculator.Employee.onetime.bonus + this.calculator.Employee.onetime.holidayAllowance;
        if (this.calculator.Employee.earnings.onetimeAllowance > this.calculator.Provisions.state.pph21EarningsNettLowerLimit && this.calculator.Employee.taxable) {
            // Annual PTKP base on number of dependents family
            this.result.pphBonus.ptkp.amount = LIST_OF_PTKP[this.calculator.Employee.ptkpStatus];

            // Get PKP Setahun
            this.result.pphBonus.pkp = this.roundDownPkp((this.calculator.Employee.earnings.onetimeAllowance * this.calculator.Employee.monthMultiplier) - this.result.pphBonus.ptkp.amount);

            // Gross Or Gross Up Calculation
            if ('GROSSUP' == this.calculator.method) {
                let annualLiability = this.grossUpPph(this.result.pphBonus.pkp);
                this.result.pphBonus.liability.annual = annualLiability;
                this.result.pphBonus.pkp = this.roundDownPkp(this.result.pphBonus.pkp + (this.result.pphBonus.liability.annual / this.calculator.Employee.monthMultiplier));
            } else {
                let annualLiability = this.getPph(this.result.pphBonus.pkp);
                this.result.pphBonus.liability.annual = annualLiability;
            }

            if (this.result.pphBonus.liability.annual > 0) {
                if (!this.calculator.Employee.hasNPWP) {
                    this.result.pphBonus.liability.annual = this.result.pphBonus.liability.annual + (this.result.pphBonus.liability.annual * (this.calculator.Provisions.state.pph21NoNpwpSurchargeRate / 100));
                }

                this.result.pphBonus.liability.monthly = this.result.pphBonus.liability.annual / this.calculator.Employee.monthMultiplier;
            } else {
                this.result.pphBonus.liability.annual = 0;
                this.result.pphBonus.liability.monthly = 0;
            }
        } else {
            this.result.pphBonus.liability.annual = 0;
            this.result.pphBonus.liability.monthly = 0;
        }

        return this.result;
    }

    calculateTER() {
        // Implementasi perhitungan Pph 21 Berdasarkan Tarif Efektif Rata-Rata sesuai peraturan PP No 58 Tahun 2023

        // Untuk Saat ini Semua penghasil baik teratur ataupun tidak teratur menjadi penambah bruto
        // Untuk JHT dan JP yang dibayar karyawan tidak dimasukkan dulu sebagai pengurang penghasilan bruto

        const ptkpStatus = this.calculator.Employee.ptkpStatus;

        const monthlyGross = this.calculator.Result.earnings.monthly.gross;

        const effectiveRate = this.getEffectiveRateMonthly(ptkpStatus, monthlyGross);

        // Hitung pph 21 berdasarkan tarif efektif rata-rata
        if (effectiveRate.rate !== undefined) {
            this.result.pph.liability.monthly = Math.floor(monthlyGross * effectiveRate.rate);
            const ter = this.parseTerDetail(monthlyGross, ptkpStatus, effectiveRate);
            this.result.pph.ter = ter;

            // Set PTKP dan PKP
            const ptkp = this.getPtkpAmountByPtkpStatus(ptkpStatus);
            this.result.pph.ptkp.amount = ptkp;
            this.result.pph.pkp = monthlyGross;

            if (this.calculator.method === 'GROSSUP') {
                const resultCalculateGrossUp = this.getMonthlyTerGrossUp(monthlyGross, ptkpStatus, effectiveRate);
                this.result.pph.ter = resultCalculateGrossUp.ter;
                this.result.pph.pkp = resultCalculateGrossUp.pkp;
                this.result.pph.liability.monthly = resultCalculateGrossUp.pph;
            }
        }

        return this.result;
    }

}