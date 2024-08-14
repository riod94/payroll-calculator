import Company from "../DataStructures/Company";
import Employee from "../DataStructures/Employee";
import Provisions from "../DataStructures/Provisions";
import Result from "../DataStructures/Result";

interface EffectiveRateEntry {
    from: number;
    until: number;
    rate: number;
}

interface OvertimeDetailsType {
    overtimeType: string,
    compensationType: string,
    payMethod: string,
    overtimeRate: number,
    overtimeDate: Date,
    overtimeDuration: number,
    overtimeMultiplier: number,
    overtimePay: number,
    totalPay: number,
    mealAllowanceCount: number,
    mealAllowance: number,
    overtimeMultiplierDetail: any[],
}

interface OvertimeMultiplierDetailType {
    hours: number,
    multiplier: number,
    multiply: number
}

interface OvertimeSummaryType {
    duration: number,
    dutationHour: number,
    overtimePay: number,
    overtimeAdjustment: number,
    totalOvertimePayment: number,
    note: string | null,
}

interface OvertimeCalculationType {
    earning: number;
    reports: OvertimeDetailsType[];
    note?: string | null;
    adjustment?: number;
}

interface ParseTerDetailType {
    gross: number,
    category: string,
    from: number,
    until: number,
    rate: number,
}

interface PPHRateLayer {
    index: number,
    from: number,
    until: number,
    rate_percentage: number,
    benefit: number,
    subtract: number,
    gross_up_from: number,
    gross_up_until: number,
}

interface PPHRateLayerList { [key: number]: PPHRateLayer[] }

interface PTKPList {
    [key: string]: number,
}

interface JKKRiskGradePercent {
    [key: number]: number,
}

interface PTKPCategory {
    [key: string]: string,
}

interface TerDaily {
    from: number,
    until: number,
    rate: number,
}

interface PayrollCalculatorTypes {
    Provisions: Provisions;
    Employee: Employee;
    Company: Company;
    Result: Result;
}

enum TaxStatus {
    PERMANENT_EMPLOYEE = 1, // Pegawai Tetap
    NON_PERMANENT_EMPLOYEE = 2, // Pegawai Tidak Tetap
    NOT_EMPLOYEE_WHO_ARE_SUSTAINABLE = 3, // Bukan Pegawai berkesinambungan
    NOT_EMPLOYEE_WHO_ARE_SUSTAINABLE_AND_HAVE_OTHER_INCOME = 4,  // Bukan Pegawai berkesinambungan dan Memiliki penghasilan lainnya
    NOT_EMPLOTEE_WHO_ARE_UNSUSTAINABLE = 5, // Bukan Pegawai tidak berkesinambungan
    OTHER_SUBJECTS = 6, // Subject pajak lainnya seperti: Peserta Kegiatan, Pensiunan dan Bukan Pegawai
    BOARD_OF_COMMISSIONERS = 7, // Dewan Pengawas / Komisaris
    FOREIGN_INDIVIDUAL_TAXPAYER = 8, // Wajib Pajak Asing
}

export {
    EffectiveRateEntry,
    OvertimeDetailsType,
    OvertimeMultiplierDetailType,
    OvertimeSummaryType,
    OvertimeCalculationType,
    ParseTerDetailType,
    PPHRateLayer,
    PPHRateLayerList,
    PTKPList,
    JKKRiskGradePercent,
    PTKPCategory,
    TerDaily,
    PayrollCalculatorTypes,
    TaxStatus
}