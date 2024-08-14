import PayrollCalculator from "..";
import EffectiveRateData from "../Constants/EffectiveRateData";
import { LIST_OF_PTKP, PPH_RATE_LAYER_LIST, TER_DAILY } from "../Constants";
import { EffectiveRateEntry, ParseTerDetailType, TerDaily } from "../Types";

/**
 * Class AbstractPph
 */
export default abstract class AbstractPph {
    public calculator: PayrollCalculator;
    public result: {
        pph: {
            ptkp: {
                status: string;
                amount: number;
            };
            pkp: number;
            ter: ParseTerDetailType;
            liability: {
                rule: number;
                monthly: number;
                annual: number;
                monthlyGrossUp: number;
            };
        },
        pphBonus: {
            ptkp: {
                status: string;
                amount: number;
            };
            pkp: number;
            ter: ParseTerDetailType;
            liability: {
                rule: number;
                monthly: number;
                annual: number;
                monthlyGrossUp: number;
            };
        },
        pphResign: {
            ptkp: {
                status: string;
                amount: number;
            };
            pkp: number;
            ter: ParseTerDetailType;
            liability: {
                rule: number;
                amount: number;
            };
            additional: {
                remainingLoan: number;
                bpjsKes: number;
                bpjsKesFamily: number;
                bpjsTK: number;
            }
        },
    };

    /**
     * AbstractPph::calculate
     *
     * @returns SplArrayObject
     */
    abstract calculate(): void;

    constructor(calculator: PayrollCalculator) {
        const defaultTer = {
            gross: 0,
            category: '',
            from: 0,
            until: 0,
            rate: 0,
        };
        this.calculator = calculator;
        this.result = {
            pph: {
                ptkp: {
                    status: '',
                    amount: 0
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    monthly: 0,
                    annual: 0,
                    monthlyGrossUp: 0
                }
            },
            pphBonus: {
                ptkp: {
                    status: '',
                    amount: 0
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    monthly: 0,
                    annual: 0,
                    monthlyGrossUp: 0
                }
            },
            pphResign: {
                ptkp: {
                    status: '',
                    amount: 0
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    amount: 0
                },
                additional: {
                    remainingLoan: 0,
                    bpjsKes: 0,
                    bpjsKesFamily: 0,
                    bpjsTK: 0
                }
            }
        };
    }

    /**
     * AbstractPph::getRate
     *
     * @param int $monthlyNetIncome
     *
     * @return float
     */
    public getRate(monthlyNetIncome: number): number {
        let rate = 5;
        const pphRateLayer = PPH_RATE_LAYER_LIST[this.calculator.Provisions.state.yearOfTariffLayer];

        for (const item of pphRateLayer) {
            if (monthlyNetIncome > item.from && monthlyNetIncome <= item.until) {
                rate = item.rate_percentage;
            }
        }

        return rate;
    }

    public roundDownPkp(pkp: number): number {
        /** SE-12/PJ.431/1991
         * Dalam hal tarif Pasal 17 UU PPh 1984 diterapkan atas Penghasilan Kena Pajak maka dasar pengenaannya dibulatkan ke bawah menjadi ribuan penuh
         */
        return Math.floor(pkp / 1000) * 1000;
    }

    public grossUpPph(pkp = 0): number {
        const pphRateLayer = PPH_RATE_LAYER_LIST[this.calculator.Provisions.state.yearOfTariffLayer];
        let idx = 1;
        let pph21Annual = 0;
        let subtract = 0;
        let rate = (5 / 100);

        while (0 < pkp) {
            for (const item of pphRateLayer) {
                if (item.index == idx) {
                    rate = item.rate_percentage;
                    subtract = 0 < item.until ? (item.until - item.from) : 0;
                    break;
                }
            }
            let tmpPkp = pkp - subtract;
            if (pkp >= subtract && 3 >= idx) {
                tmpPkp = subtract;
            } else {
                tmpPkp = pkp;
            }
            pph21Annual += tmpPkp * rate;
            pkp = pkp - tmpPkp;
            idx++;
        }

        return pph21Annual;
    }

    /**
     * Calculates the gross-up amount based on the given PKP (taxable income) and employee status.
     *
     * @param int $pkp The taxable income.
     * @param bool $notEmployee Indicates whether the person is an employee or not. Default is false.
     * @return float The annual liability after gross-up calculation.
     */
    public getPphGrossUp(pkp: number, notEmployee = false): number {
        const pphRateLayer = PPH_RATE_LAYER_LIST[this.calculator.Provisions.state.yearOfTariffLayer];
        const basePercentageRate = 100;
        let subtract = 0;
        let annualLiability = 0;
        let benefit = 0;
        let percentageRate = 100;
        let baseRate = 5;
        let rate = (baseRate / percentageRate);

        pphRateLayer.forEach((item) => {
            baseRate = notEmployee ? item.rate_percentage / 2 : item.rate_percentage;
            baseRate = baseRate * basePercentageRate;
            percentageRate = basePercentageRate - baseRate;
            rate = baseRate / percentageRate;

            if (pkp > item.from && pkp <= item.until) {
                benefit = item.benefit;
                subtract = item.subtract;
                // Rumus Gross Up = (PKP - Subtract) * Rate + Benefit, khusus bukan pegawai = PKP * Rate
                annualLiability = notEmployee ? ((pkp - item.from) * rate) : ((pkp - subtract) * rate) + benefit;
            }
        })

        return annualLiability;
    }

    /**
     * Calculate the annual PPH (Pajak Penghasilan) based on the given PKP (Penghasilan Kena Pajak).
     *
     * @param pkp The Penghasilan Kena Pajak.
     * @returns The annual PPH.
     */
    public getPph(pkp: number = 0): number {
        const pphRateLayer = PPH_RATE_LAYER_LIST[this.calculator.Provisions.state.yearOfTariffLayer];
        let idx = 1;
        let pph21Annual = 0;
        let subtract = 0;
        let rate = 5 / 100;

        while (0 < pkp) {
            for (const item of pphRateLayer) {
                if (item.index === idx) {
                    rate = item.rate_percentage;
                    subtract = 0 < item.until ? (item.until - item.from) : 0;
                    break;
                }
            }
            let tmpPkp = pkp - subtract;
            if (pkp >= subtract && 3 >= idx) {
                tmpPkp = subtract;
            } else {
                tmpPkp = pkp;
                subtract = pkp;
            }
            pph21Annual += tmpPkp * rate;
            idx++;
            pkp -= subtract;
        }

        return pph21Annual;
    }

    /**
     * Calculates TER gross-up amount based on the given PKP (taxable income), Monthly Gross, and Effective Rate.
     *
     * @param monthlyGross The monthly gross income.
     * @param ptkpStatus The status of PTKP.
     * @param effectiveRate The effective rate.
     * @returns The object containing TER, PPH, and PKP values.
     */
    getMonthlyTerGrossUp(monthlyGross: number, ptkpStatus: keyof typeof LIST_OF_PTKP, effectiveRate: EffectiveRateEntry): {
        ter: ParseTerDetailType,
        pph: number,
        pkp: number,
    } {
        let tmpTer = this.parseTerDetail(monthlyGross, ptkpStatus, effectiveRate);
        let tmpDecimal = tmpTer.rate * 100;
        let tmpPphGrossUp = (monthlyGross * tmpDecimal) / (100 - tmpDecimal);
        let tmpGross = monthlyGross + tmpPphGrossUp;

        let newEffectiveRate = this.getEffectiveRateMonthly(ptkpStatus, tmpGross);
        tmpTer = this.parseTerDetail(tmpGross, ptkpStatus, newEffectiveRate);

        if (tmpGross > effectiveRate.until) {
            return this.getMonthlyTerGrossUp(monthlyGross, ptkpStatus, newEffectiveRate);
        }

        tmpTer.gross = Math.floor(monthlyGross);
        tmpPphGrossUp = Math.floor(tmpPphGrossUp);
        tmpGross = Math.floor(tmpGross);

        return {
            ter: tmpTer,
            pph: tmpPphGrossUp,
            pkp: tmpGross,
        };
    }

    /**
     * State::getPtkp
     *
     * @param int numOfDependentsFamily
     * @param bool married
     *
     * @return string
     */
    public getPtkp(numOfDependentsFamily: number, married?: boolean): string {
        const prefix = married ? 'K/' : 'TK/';
        const dependent = numOfDependentsFamily > 3 ? 3 : numOfDependentsFamily;
        return `${prefix}${dependent}`;
    }

    /**
     * State::getPtkpAmount
     *
     * @param int  numOfDependentsFamily
     * @param bool married
     *
     * @return float
     */
    public getPtkpAmount(numOfDependentsFamily: number, married?: boolean): number {
        const ptkp = this.getPtkp(numOfDependentsFamily, married);
        return LIST_OF_PTKP[ptkp]
    }

    /**
     * State::getPtkpAmountByPtkpStatus
     *
     * @param string ptkpStatus
     *
     * @return float
     */
    public getPtkpAmountByPtkpStatus(ptkpStatus: keyof typeof LIST_OF_PTKP): number {
        return LIST_OF_PTKP[ptkpStatus];
    }

    /**
     * State::getPtkpCategory
     *
     * @param string ptkpStatus
     *
     * @return string
     */
    public getPtkpCategory(ptkpStatus: keyof typeof LIST_OF_PTKP): string {
        return EffectiveRateData.listOfPTKPCategory[ptkpStatus];
    }

    /**
     * State::getBPJSKesehatanGrade
     *
     * @param int $grossTotalIncome
     *
     * @return int
     */
    public getBPJSKesehatanGrade(grossTotalIncome: number): number {
        if (4000000 >= grossTotalIncome) {
            return 2;
        } else if (8000000 <= grossTotalIncome) {
            return 1;
        }

        return 3;
    }

    /**
     * State::getEffectiveRateDaily
     *
     * @param number $bruto
     *
     * @return object
     */
    public getEffectiveRateDaily(bruto: number): TerDaily {
        const rates = TER_DAILY;

        let rateCategory: TerDaily = {
            from: 0,
            until: 0,
            rate: 0,
        };
        rates.forEach(item => {
            if (bruto > item.from && bruto <= item.until) {
                rateCategory = item;
            }
        });

        return rateCategory;
    }

    /**
     *  State::getEffectiveRateMonthly
     *
     *  @param string $ptkp
     *  @param int    $bruto
     *
     *  @return object
     */
    public getEffectiveRateMonthly(ptkp: keyof typeof LIST_OF_PTKP = 'TK/0', bruto: number = 0): EffectiveRateEntry {
        // Ambil lapisan Tarif Efektif rata2 berdasarkan PTKP
        const category = this.getPtkpCategory(ptkp);
        const rates = EffectiveRateData.listOfEffectiveRate[category] || EffectiveRateData.listOfEffectiveRate['A'] || [];

        let rateCategory: EffectiveRateEntry = {
            from: 0,
            until: 0,
            rate: 0,
        };
        for (const item of rates) {
            if (item.from !== undefined && item.until !== undefined && item.rate !== undefined && bruto > item.from && bruto <= item.until) {
                rateCategory = item;
                break;
            }
        }

        return rateCategory;
    }

    /**
     * State::parseTerDetail
     *
     * @param number grossMonthly
     * @param string ptkp
     * @param array  rateDetails
     *
     * @return object
     */
    public parseTerDetail(grossMonthly: number = 0, ptkp: keyof typeof LIST_OF_PTKP = 'TK/0', rateDetails: EffectiveRateEntry = { from: 0, until: 0, rate: 0 }): ParseTerDetailType {
        return {
            gross: grossMonthly,
            category: this.getPtkpCategory(ptkp),
            from: rateDetails.from || 0,
            until: rateDetails.until || 0,
            rate: rateDetails.rate || 0,
        };
    }
}
