import MapArrayObject from "../Traits/MapArrayObject";
import EffectiveRateData from "../Constants/EffectiveRateData";
import { EffectiveRateEntry } from "../Types";

export default class Provisions extends MapArrayObject {
    company: {
        useBpjsKesehatan: boolean;
        useBpjsKetenagakerjaan: boolean;
        useEffectiveRates: boolean;
        calculateOvertime: boolean;
        calculateBPJSKesehatan: boolean;
        BPJSKesEmpTaxable: boolean;
        BPJSTKEmpTaxable: boolean;
        JKK: boolean;
        JKM: boolean;
        JHT: boolean;
        JIP: boolean;
        jkkRiskGrade: number;
    };
    state: {
        overtimeRegulationCalculation: boolean;
        provinceMinimumWage: number;
        bpjsKesLowerLimit: number;
        bpjsKesUpperLimit: number;
        bpjsTkLowerLimit: number;
        bpjsTkUpperLimit: number;
        highestWage: number;
        bpjsKesCompanyRate: number;
        bpjsKesEmployeeRate: number;
        employeeJhtRate: number;
        companyJhtRate: number;
        employeeJpRate: number;
        companyJpRate: number;
        jkmRate: number;
        pph21EarningsNettLowerLimit: number;
        pph21MonthlyPositionTaxLimit: number;
        pph21AnnualyPositionTaxLimit: number;
        pph21NoNpwpSurchargeRate: number;
        yearOfTariffLayer: number;
        terMonthly: Record<string, EffectiveRateEntry[]>;
    };

    constructor(provisions: Partial<Provisions> = {}) {
        super();
        this.company = {
            useBpjsKesehatan: false,
            useBpjsKetenagakerjaan: false,
            useEffectiveRates: true,
            calculateOvertime: false,
            calculateBPJSKesehatan: false,
            BPJSKesEmpTaxable: false,
            BPJSTKEmpTaxable: false,
            JKK: false,
            JKM: false,
            JHT: false,
            JIP: false,
            jkkRiskGrade: 2
        };
        this.state = {
            overtimeRegulationCalculation: false,
            provinceMinimumWage: 3940972,
            bpjsKesLowerLimit: 3940972,
            bpjsKesUpperLimit: 12000000,
            bpjsTkLowerLimit: 3940972,
            bpjsTkUpperLimit: 8939700,
            highestWage: 8939700,
            bpjsKesCompanyRate: 0.04,
            bpjsKesEmployeeRate: 0.01,
            employeeJhtRate: 2,
            companyJhtRate: 3.7,
            employeeJpRate: 1,
            companyJpRate: 2,
            jkmRate: 0.3,
            pph21EarningsNettLowerLimit: 4500000,
            pph21MonthlyPositionTaxLimit: 500000,
            pph21AnnualyPositionTaxLimit: 6000000,
            pph21NoNpwpSurchargeRate: 0.2,
            yearOfTariffLayer: 2022,
            terMonthly: EffectiveRateData.listOfEffectiveRate
        };
        Object.assign(this, provisions);
    }

}