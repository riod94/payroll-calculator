import { OvertimeCalculationType, OvertimeDetailsType, OvertimeMultiplierDetailType, OvertimeSummaryType } from "../Types";

export default class OvertimeCalculator {
    /**
     * OvertimeCalculatorTrait::$overtime
     */
    public static $overtime: {
        earning: number;
        reports: any[];
        note?: string | null;
        adjustment?: number;
    } = {
            earning: 0,
            reports: [],
        };

    /**
    * Perhitungan overtime lama
    */
    public static overtimeCalculation(baseEarning: number = 0, overtimeDetails: OvertimeDetailsType[], summary: OvertimeSummaryType): OvertimeCalculationType {
        let overtimeAmount: number = summary.totalOvertimePayment ?? 0;
        let overtimeReports: OvertimeDetailsType[] = [];

        if (overtimeDetails.length) {
            for (const overtime of overtimeDetails) {
                let overtimeRate: number = 1 <= overtime.overtimeRate ? overtime.overtimeRate : baseEarning / 173;
                let overtimePay: number = overtimeRate * overtime.overtimeMultiplier;
                overtime.overtimeRate = overtimeRate;
                overtime.overtimePay = overtimePay;
                overtime.totalPay = overtimePay + overtime.mealAllowance;
                overtimeReports.push(this.parseReportOvertime(overtime));
                if (0 == overtimeAmount) {
                    overtimeAmount += overtime.totalPay;
                }
            }
        }

        this.$overtime.note = summary.note ?? null;
        this.$overtime.adjustment = summary.overtimeAdjustment ?? 0;
        this.$overtime.earning = overtimeAmount;
        this.$overtime.reports = overtimeReports;

        return this.$overtime;
    }

    /**
     * Parsing data overtime lama
     */
    private static parseReportOvertime(overtime: OvertimeDetailsType): OvertimeDetailsType {
        if (!overtime || Object.keys(overtime).length === 0) {
            return overtime;
        }

        let multiplierDetails: OvertimeMultiplierDetailType[] = [];
        if (overtime.overtimeMultiplierDetail && overtime.overtimeMultiplierDetail.length) {
            for (const detail of overtime.overtimeMultiplierDetail) {
                multiplierDetails.push({
                    hours: detail['hours'],
                    multiplier: detail['multiplier'],
                    multiply: detail['multiply'] ?? detail['multiplier_amount'] ?? detail['multiplier'],
                });
            }
        }

        return {
            overtimeType: overtime.overtimeType,
            compensationType: overtime.compensationType,
            payMethod: overtime.payMethod,
            overtimeDate: overtime.overtimeDate,
            overtimeDuration: overtime.overtimeDuration,
            overtimeMultiplier: overtime.overtimeMultiplier,
            overtimeMultiplierDetail: multiplierDetails,
            mealAllowanceCount: overtime.mealAllowanceCount,
            mealAllowance: overtime.mealAllowance,
            overtimeRate: overtime.overtimeRate,
            overtimePay: overtime.overtimePay,
            totalPay: overtime.totalPay,
        };
    }
}