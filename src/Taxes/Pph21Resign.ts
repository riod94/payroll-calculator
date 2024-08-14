import AbstractPph from './AbstractPph';
import Pph21 from './Pph21';

export default class Pph21Resign extends AbstractPph {

    calculate() {
        this.calculatePph21Resign();
        this.calculatePph21Adjustment();

        const pph21 = new Pph21(this.calculator);
        pph21.calculatePphBonus();

        return this.result;
    }

    private calculatePph21Resign(): any {
        const ptkp = this.result.pphResign.ptkp.amount;
        const gross = this.calculator.Employee.resign.compensationPay + this.calculator.Employee.resign.severancePay + this.calculator.Employee.resign.meritPay;

        let pkp = gross - ptkp;

        if (0 < pkp) {
            const pph21Resign = this.layerOfTaxableIncome(pkp);
            this.result.pphResign.pkp = pkp;
            this.result.pphResign.liability.amount = Math.floor(pph21Resign);
        }

        this.result.pphResign.additional.remainingLoan = this.calculator.Employee.resign.remainingLoan;
        this.result.pphResign.additional.bpjsKes = this.calculator.Employee.resign.bpjsKes;
        this.result.pphResign.additional.bpjsKesFamily = this.calculator.Employee.resign.bpjsKesFamily;
        this.result.pphResign.additional.bpjsTK = this.calculator.Employee.resign.bpjsTK;

        return this.result;
    }

    private calculatePph21Adjustment(): any {
        const total = this.calculator.Employee.lastTaxPeriod.annualGross + this.calculator.Result.earnings.monthly.gross + this.calculator.Employee.lastTaxPeriod.annualHolidayAllowance + this.calculator.Employee.lastTaxPeriod.annualBonus + this.calculator.Employee.lastTaxPeriod.annualOnetime;;

        const maxPositionTax = 500000 * this.calculator.Employee.monthMultiplier;
        const yearlyPositionTax = (total * (5 / 100)) > maxPositionTax ? maxPositionTax : total * (5 / 100);

        const jamsostek = this.calculator.Employee.lastTaxPeriod.annualJIPEmployee + this.calculator.Employee.lastTaxPeriod.annualJHTEmployee + this.calculator.Employee.components.deductions.JIP + this.calculator.Employee.components.deductions.JHT;
        const deductions = yearlyPositionTax + jamsostek;
        const nett = total - deductions;

        const ptkp = this.getPtkpAmountByPtkpStatus(this.calculator.Employee.ptkpStatus);
        let pkp = nett - ptkp;
        let mustPaidPph21 = 0;
        let annualPph21 = 0;
        if (0 < pkp) {
            const pph21 = new Pph21(this.calculator);
            pkp = pph21.roundDownPkp(pkp);

            if ('GROSSUP' == this.calculator.method) {
                annualPph21 = pph21.grossUpPph(pkp);
            } else {
                annualPph21 = pph21.getPph(pkp);
            }
        }

        if (0 < annualPph21 && false === this.calculator.Employee.hasNPWP) {
            annualPph21 = annualPph21 + (annualPph21 * (this.calculator.Provisions.state.pph21NoNpwpSurchargeRate / 100));
        }

        mustPaidPph21 = annualPph21 - this.calculator.Employee.lastTaxPeriod.annualPPh21Paid;

        this.calculator.Result.bonus.monthly.positionTax = yearlyPositionTax / this.calculator.Employee.monthMultiplier;
        this.result.pph.ptkp.amount = ptkp;
        this.result.pph.pkp = 0 < pkp ? pkp : 0;
        this.result.pph.liability.annual = 0 < mustPaidPph21 ? (mustPaidPph21 * this.calculator.Employee.monthMultiplier) : annualPph21;
        this.result.pph.liability.monthly = mustPaidPph21;
        this.calculator.Result.earnings.annualy.gross = total;
        this.calculator.Result.earnings.annualy.nett = nett;

        return this.result;
    }

    public layerOfTaxableIncome(pkp: number): number {
        let idx = 1;
        let pph21 = 0;
        while (0 < pkp) {
            let pengurang, rate;
            if (1 == idx) {
                pengurang = 50000000;
                rate = 5 / 100;
            } else if (2 == idx) {
                pengurang = 25000000;
                rate = 2.5 / 100;
            } else {
                break;
            }
            pph21 += (pengurang * rate);
            pkp -= pengurang;
            idx++;
        }

        return pph21;
    }
}
