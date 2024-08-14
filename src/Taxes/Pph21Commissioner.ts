import { PPH_RATE_LAYER_LIST } from "../Constants";
import AbstractPph from "./AbstractPph";
import Pph21 from "./Pph21";

/**
 * Class Pph21Commissioner
 */
export default class Pph21Commissioner extends AbstractPph {
    public calculate(): any {
        this.calculatePph21Commissioner();

        const pph21 = new Pph21(this.calculator);
        pph21.calculatePphBonus();

        return this.result;
    }

    private calculatePph21Commissioner() {
        if (this.calculator.Provisions.company.useEffectiveRates) {
            const ptkpStatus = this.calculator.Employee.ptkpStatus;

            const monthlyGross = this.calculator.Result.earnings.monthly.gross;

            const effectiveRate = this.getEffectiveRateMonthly(ptkpStatus, monthlyGross);

            if (effectiveRate.rate) {
                this.result.pph.liability.monthly = Math.floor(monthlyGross * effectiveRate.rate);
                const ter = this.parseTerDetail(monthlyGross, ptkpStatus, effectiveRate);
                this.result.pph.ter = ter;

                const ptkp = this.getPtkpAmountByPtkpStatus(ptkpStatus);
                this.result.pph.ptkp.amount = ptkp;
                this.result.pph.pkp = monthlyGross;

                if ('GROSSUP' === this.calculator.method) {
                    const resultCalculateGrossUp = this.getMonthlyTerGrossUp(monthlyGross, ptkpStatus, effectiveRate);
                    this.result.pph.ter = resultCalculateGrossUp.ter;
                    this.result.pph.pkp = resultCalculateGrossUp.pkp;
                    this.result.pph.liability.monthly = resultCalculateGrossUp.pph;
                }
            }
        } else {
            this.calculator.Result.earnings.annualy.gross = this.calculator.Result.earnings.monthly.gross
                + this.calculator.Employee.pph21December.yearlyGross
                + this.calculator.Employee.pph21December.thr
                + this.calculator.Employee.pph21December.bonus;

            const pph21Commissioner = this.layerOfTaxableIncome(this.calculator.Result.earnings.annualy.gross);
            this.result.pph.liability.annual = pph21Commissioner.pph21;
            this.result.pph.liability.monthly = this.result.pph.liability.annual
                - this.calculator.Employee.pph21December.paidPph21;
            this.calculator.Result.earnings.monthly.nett = this.calculator.Result.earnings.monthly.gross
                - this.result.pph.liability.monthly;
            this.calculator.Result.earnings.annualy.nett =
                0 < this.calculator.Employee.pph21December.paidPph21
                    ? (this.calculator.Result.earnings.annualy.gross - this.calculator.Employee.pph21December.paidPph21)
                    : (this.calculator.Result.earnings.annualy.gross - this.result.pph.liability.annual);
        }

        return this.result;
    }

    public layerOfTaxableIncome(cumulative: number): { pph21: number, layer: number } {
        let result: { pph21: number, layer: number } = { pph21: 0, layer: 0 };
        // get lapisan tarif pasal 17 sesuai tahun berjalan
        let pphRateLayer: { index: number, rate_percentage: number, from: number, until: number }[] = PPH_RATE_LAYER_LIST[this.calculator.Provisions.state.yearOfTariffLayer];
        let idx: number = 1;
        let subtractor: number = 0;
        let rate: number = 0;
        // kurangkan nilai kumulatif dengan lapisan tarif untuk mendapatkan rate sampai hasil kumulatif jadi 0
        while (0 < cumulative) {
            result.layer = idx;
            for (let item of pphRateLayer) {
                if (item.index == idx) {
                    rate = item.rate_percentage;
                    subtractor = 0 < item.until ? (item.until - item.from) : 0;
                    break;
                }
            }
            let tmpPkp: number = cumulative - subtractor;
            if (cumulative >= subtractor && 3 >= idx) {
                tmpPkp = subtractor;
            } else {
                tmpPkp = cumulative;
                subtractor = cumulative;
            }
            result.pph21 += tmpPkp * rate;
            idx++;
            cumulative -= subtractor;
        }

        return result;
    }
}