import MapArrayObject from "../Traits/MapArrayObject";
import { OvertimeDetailsType, ParseTerDetailType } from "../Types";

export default class Result extends MapArrayObject {
    takeHomePay: number = 0;
    earnings: {
        base: number,
        fixedAllowance: number,
        annualy: {
            nett: number,
            gross: number,
            positionTax: number,
        },
        monthly: {
            nett: number,
            gross: number,
            positionTax: number,
        },
        overtime: {
            payment: number,
            adjustment: number
            note: string | null,
            reports: OvertimeDetailsType[],
        }
    };
    bonus: {
        monthly: {
            gross: number,
            nett: number,
            positionTax: number,
        },
        annualy: {
            gross: number,
            nett: number,
            positionTax: number,
        },
    };
    resign: {
        amount: number,
        allowances: {
            compensationPay: number,
            severancePay: number,
            meritPay: number,
        },
    };
    taxable: {
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
        },
    }

    constructor() {
        super();
        const defaultTer = {
            gross: 0,
            category: '',
            from: 0,
            until: 0,
            rate: 0,
        }
        this.earnings = {
            base: 0,
            fixedAllowance: 0,
            annualy: {
                nett: 0,
                gross: 0,
                positionTax: 0,
            },
            monthly: {
                nett: 0,
                gross: 0,
                positionTax: 0,
            },
            overtime: {
                payment: 0,
                adjustment: 0,
                note: null,
                reports: [],
            }
        };
        this.bonus = {
            monthly: {
                gross: 0,
                nett: 0,
                positionTax: 0,
            },
            annualy: {
                gross: 0,
                nett: 0,
                positionTax: 0,
            },
        };
        this.resign = {
            amount: 0,
            allowances: {
                compensationPay: 0,
                severancePay: 0,
                meritPay: 0,
            },
        };
        this.taxable = {
            pph: {
                ptkp: {
                    status: '',
                    amount: 0,
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    monthly: 0,
                    annual: 0,
                    monthlyGrossUp: 0,
                },
            },
            pphBonus: {
                ptkp: {
                    status: '',
                    amount: 0,
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    monthly: 0,
                    annual: 0,
                    monthlyGrossUp: 0,
                },
            },
            pphResign: {
                ptkp: {
                    status: '',
                    amount: 0,
                },
                pkp: 0,
                ter: defaultTer,
                liability: {
                    rule: 0,
                    amount: 0,
                },
            },
        }

        Object.assign(this, this.earnings, this.bonus, this.resign);
    }
}