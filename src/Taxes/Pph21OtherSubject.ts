import AbstractPph from "./AbstractPph";

/**
* Class Pph21OtherSubject
*/
export default class Pph21OtherSubject extends AbstractPph {
    public calculate(): any {
        this.calculatePph21();

        return this.result;
    }

    public calculatePph21(): void {
        // = Ph. Bruto x Tarif Ps. 17
        this.result.pph.pkp = this.calculator.Result.earnings.monthly.gross;
        let annualLiability = 0;

        // Untuk perhitungan dari fungsi getPphGrossUp tidak perlu dibagi 50% penghasilan brutonya karena sudah dibagikan di fungsinya
        if ('GROSSUP' == this.calculator.method) {
            annualLiability = this.getPphGrossUp(this.result.pph.pkp, true);
        } else {
            // Menghitung PKP setelah dikali 50%
            this.result.pph.pkp = (this.result.pph.pkp);
            annualLiability = this.getPph(this.result.pph.pkp);
        }

        // Menentukan kewajiban PPH21 tahunan dan bulanan
        this.result.pph.liability.annual = this.result.pph.liability.monthly = annualLiability;
    }
}