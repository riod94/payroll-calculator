import MapArrayObject from "../Traits/MapArrayObject";
import { LIST_OF_PTKP } from "../Constants";
import { OvertimeDetailsType } from "../Types";

export default class Employee extends MapArrayObject {
    name: string = '';
    taxable: boolean = true;
    permanentStatus: boolean = true;
    yearPeriod: number = new Date().getFullYear();
    monthPeriod: number = new Date().getMonth() + 1;
    ptkpStatus: keyof typeof LIST_OF_PTKP = 'TK/0';
    hasNPWP: boolean = false;
    maritalStatus: boolean = false;
    numberOfDependentsFamily: number = 0;
    /**
     * 0 = not paid
     * 2 = by company
     * 3 = by employee
     */
    jhtPayor: number = 3;
    bpjsKesPayor: number = 3;
    jpPayor: number = 3;

    /**
     * For monthly or yearly frequency
     */
    monthMultiplier: number = 12;
    /**
     * For daily or weekly frequency
     */
    rateMultiplier: number = 1;
    isNewlyJoinedEmployee: boolean = false;
    isResignedEmployee: boolean = false;
    earnings: {
        baseBeforeProrate: number;
        base: number;
        bpjsKesBase: number;
        bpjsKetenagakerjaanBase: number;
        onetimeAllowance: number;
        onetimeDeduction: number;
        onetimeBenefit: number;
    }
    components: {
        allowances: MapArrayObject;
        deductions: MapArrayObject;
        benefits: MapArrayObject;
    };
    onetime: {
        allowances: MapArrayObject;
        deductions: MapArrayObject;
        benefits: MapArrayObject;
        bonus: number;
        holidayAllowance: number;
    }
    overtimes: {
        details: OvertimeDetailsType[],
        summary: {
            duration: number;
            dutationHour: number;
            overtimePay: number;
            overtimeAdjustment: number;
            totalOvertimePayment: number;
            note: string | null;
        }
    };
    resign: {
        repayment: boolean;
        compensationPay: number;
        severancePay: number;
        meritPay: number;
        remainingLoan: number;
        bpjsKes: number;
        bpjsKesFamily: number;
        bpjsTK: number;
    };
    lastTaxPeriod: {
        annualGross: number;
        annualJIPEmployee: number;
        annualJHTEmployee: number;
        annualBonus: number;
        annualHolidayAllowance: number;
        annualOnetime: number;
        annualPPh21Paid: number;
        annualZakat: number;
        annualOtherDonation: number;
    };

    constructor(employee: Partial<Employee> = {}) {
        super();
        this.earnings = {
            baseBeforeProrate: 0,
            base: 0,
            bpjsKesBase: 0,
            bpjsKetenagakerjaanBase: 0,
            onetimeAllowance: 0,
            onetimeDeduction: 0,
            onetimeBenefit: 0
        };
        this.components = {
            allowances: new MapArrayObject,
            deductions: new MapArrayObject,
            benefits: new MapArrayObject,
        };
        this.onetime = {
            allowances: new MapArrayObject,
            deductions: new MapArrayObject,
            benefits: new MapArrayObject,
            bonus: 0,
            holidayAllowance: 0
        };
        this.overtimes = {
            details: [],
            summary: {
                duration: 0,
                dutationHour: 0,
                overtimePay: 0,
                overtimeAdjustment: 0,
                totalOvertimePayment: 0,
                note: null
            }
        };
        this.resign = {
            repayment: false,
            compensationPay: 0,
            severancePay: 0,
            meritPay: 0,
            remainingLoan: 0,
            bpjsKes: 0,
            bpjsKesFamily: 0,
            bpjsTK: 0
        };
        this.lastTaxPeriod = {
            annualGross: 0,
            annualJIPEmployee: 0,
            annualJHTEmployee: 0,
            annualBonus: 0,
            annualHolidayAllowance: 0,
            annualOnetime: 0,
            annualPPh21Paid: 0,
            annualZakat: 0,
            annualOtherDonation: 0
        };
        Object.assign(this, employee);
    }
}