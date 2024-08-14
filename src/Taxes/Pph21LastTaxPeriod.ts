import AbstractPph from "./AbstractPph";
import Pph21 from "./Pph21";

export default class Pph21LastTaxPeriod extends AbstractPph {
    public calculate(): any {
        this.calculatePph21();
        const pph21 = new Pph21(this.calculator);
        pph21.calculatePphBonus();
        return this.result;
    }

    public calculatePph21(): any {
        const total = this.calculator.Result.earnings.monthly.gross
            + this.calculator.Employee.onetime.bonus
            + this.calculator.Employee.onetime.holidayAllowance
            + this.calculator.Employee.onetime.allowances.sum()
            + this.calculator.Employee.lastTaxPeriod.annualGross
            + this.calculator.Employee.lastTaxPeriod.annualHolidayAllowance
            + this.calculator.Employee.lastTaxPeriod.annualBonus
            + this.calculator.Employee.lastTaxPeriod.annualOnetime;

        const maxPositionTax = 500000 * this.calculator.Employee.monthMultiplier;
        const yearlyPositionTax =
            total * (5 / 100) > maxPositionTax ? maxPositionTax : total * (5 / 100);

        const jamsostek =
            this.calculator.Employee.lastTaxPeriod.annualJIPEmployee +
            this.calculator.Employee.lastTaxPeriod.annualJHTEmployee +
            this.calculator.Employee.lastTaxPeriod.annualZakat +
            this.calculator.Employee.components.deductions.get('JIP') +
            this.calculator.Employee.components.deductions.get('JHT');
        const deductions = yearlyPositionTax + jamsostek;
        const nett = Math.round(total - deductions);

        const ptkp = this.getPtkpAmountByPtkpStatus(this.calculator.Employee.ptkpStatus);
        let pkp = nett - ptkp;

        let mustPaidPph21 = 0;
        let annualPph21 = 0;
        if (pkp > 0) {
            const pph21 = new Pph21(this.calculator);
            pkp = pph21.roundDownPkp(pkp);

            if (this.calculator.method === 'GROSSUP') {
                annualPph21 = pph21.grossUpPph(pkp);
            } else {
                annualPph21 = pph21.getPph(pkp);
            }
        }

        if (annualPph21 > 0 && !this.calculator.Employee.hasNPWP) {
            annualPph21 += annualPph21 * (this.calculator.Provisions.state.pph21NoNpwpSurchargeRate / 100);
        }

        mustPaidPph21 = annualPph21 - this.calculator.Employee.lastTaxPeriod.annualPPh21Paid;

        this.calculator.Result.bonus.monthly.positionTax = this.calculator.Result.bonus.monthly.positionTax || yearlyPositionTax / this.calculator.Employee.monthMultiplier;
        this.result.pph.ptkp.amount = ptkp;
        this.result.pph.pkp = pkp > 0 ? pkp : 0;
        this.result.pph.liability.annual =
            mustPaidPph21 > 0 ? mustPaidPph21 * this.calculator.Employee.monthMultiplier : annualPph21;
        this.result.pph.liability.monthly = mustPaidPph21;
        this.calculator.Result.earnings.annualy.gross = total;
        this.calculator.Result.earnings.annualy.nett = nett;

        return this.result;
    }
}