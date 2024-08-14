import { CALCULATION, LIST_OF_JKK_RISK_GRADE_PERCENT } from "./Constants";
import { TaxStatus } from "./Types";
import MapArrayObject from "./Traits/MapArrayObject";
import OvertimeCalculator from "./Traits/OvertimeCalculator";
import Company from "./DataStructures/Company";
import Employee from "./DataStructures/Employee"
import Provisions from "./DataStructures/Provisions"
import Result from "./DataStructures/Result";
import Pph21 from "./Taxes/Pph21";
import Pph21Commissioner from "./Taxes/Pph21Commissioner";
import Pph21LastTaxPeriod from "./Taxes/Pph21LastTaxPeriod";
import Pph21NonPermanentEmployee from "./Taxes/Pph21NonPermanentEmployee";
import Pph21NotEmployee from "./Taxes/Pph21NotEmployee";
import Pph21Resign from "./Taxes/Pph21Resign";
import Pph21OtherSubject from "./Taxes/Pph21OtherSubject";

export default class PayrollCalculator extends MapArrayObject {
    taxNumber: number = 21;
    taxStatus: TaxStatus = TaxStatus.PERMANENT_EMPLOYEE;
    method: string = 'GROSS';
    frequency: string = 'monthly';
    Provisions: Provisions;
    Employee: Employee;
    Company: Company;
    Result: Result;

    constructor() {
        super();
        this.Provisions = new Provisions();
        this.Employee = new Employee();
        this.Company = new Company();
        this.Result = new Result();
    }

    getCalculation() {
        if (21 == this.taxNumber) {
            return this.calculateBaseOnPph21();
        } else if (23 == this.taxNumber) {
            return this.calculateBaseOnPph23();
        } else if (26 == this.taxNumber) {
            return this.calculateBaseOnPph26();
        }
    }

    private calculateBaseOnPph21() {
        this.Result.earnings.base = this.Employee.earnings.base;

        // Sum Employee Components for Taxable
        let allowances = this.Employee.components.allowances.sum();
        let deductions = this.Employee.components.deductions.sum();

        this.Result.earnings.monthly.gross = this.Result.earnings.base + allowances - deductions;

        // Caluclate overtimes
        if (this.Provisions.company.calculateOvertime) {
            const overtimeCalculation = OvertimeCalculator.overtimeCalculation(this.Employee.Earnings.base, this.Employee.Overtimes.details, this.Employee.Overtimes.summary)

            this.Result.earnings.overtime.payment = overtimeCalculation.earning;
            this.Result.earnings.overtime.adjustment = overtimeCalculation.adjustment || 0;
            this.Result.earnings.overtime.note = overtimeCalculation.note || null;
            this.Result.earnings.overtime.reports = overtimeCalculation.reports;

            // Lembur ditambahkan sebagai pendapatan bruto bulanan
            this.Result.earnings.monthly.gross += this.Result.earnings.overtime.payment;
        }

        if (this.Employee.permanentStatus) {
            // Cek Apakah Include hitung BPJS Kesehatan
            if (true === this.Provisions.company.calculateBPJSKesehatan && this.Employee.Earnings.bpjsKesBase >= this.Provisions.state.bpjsKesLowerLimit) {
                // Calculate BPJS Kesehatan
                if (this.Employee.earnings.bpjsKesBase < this.Provisions.state.bpjsKesUpperLimit) {
                    this.Company.allowances.BPJSKesehatan = Math.round(this.Employee.earnings.bpjsKesBase * (this.Provisions.state.bpjsKesCompanyRate / 100));
                    this.Employee.components.deductions.BPJSKesehatan = Math.round(this.Employee.earnings.bpjsKesBase * (this.Provisions.state.bpjsKesEmployeeRate / 100));
                } else {
                    this.Company.allowances.BPJSKesehatan = Math.round(this.Provisions.state.bpjsKesUpperLimit * (this.Provisions.state.bpjsKesCompanyRate / 100));
                    this.Employee.components.deductions.BPJSKesehatan = Math.round(this.Provisions.state.bpjsKesUpperLimit * (this.Provisions.state.bpjsKesEmployeeRate / 100));
                }

                // Maximum number of dependents family is 5
                if (5 < this.Employee.numOfDependentsFamily) {
                    this.Employee.components.deductions.BPJSKesehatanFamily = Math.round(this.Employee.components.deductions.BPJSKesehatan * (this.Employee.numOfDependentsFamily - 5));
                }

                // bpjs kes ditanggung oleh company
                if ([2, 4].includes(this.Employee.bpjsKesPayor)) {
                    this.Company.allowances.BPJSKesehatan += Math.round(this.Employee.components.deductions.BPJSKesehatan);
                    this.Employee.components.deductions.BPJSKesehatan = 0;
                }
            }

            // Cek Apakah Include hitung BPJS TK
            const bpjsTkBase = this.Employee.earnings.bpjsKetenagakerjaanBase || 0;
            if (this.Provisions.company.JKK && bpjsTkBase >= this.Provisions.state.bpjsTkLowerLimit) {
                const jkkRiskGrade = LIST_OF_JKK_RISK_GRADE_PERCENT[this.Provisions.company.jkkRiskGrade] || this.Provisions.company.jkkRiskGrade
                this.Company.allowances.JKK = Math.round(bpjsTkBase * (jkkRiskGrade / 100));
            }

            // JKM tidak ada batas atas
            if (this.Provisions.company.JKM && bpjsTkBase >= this.Provisions.state.bpjsTkLowerLimit) {
                this.Company.allowances.JKM = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * (this.Provisions.state.jkmRate / 100));
            }

            // Set nilai pembanding untuk perhitungan JHT dan JIP
            if (this.Provisions.company.JHT && bpjsTkBase >= this.Provisions.state.bpjsTkLowerLimit) {
                if (bpjsTkBase < this.Provisions.state.provinceMinimumWage) {
                    this.Company.allowances.JHT = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * ((this.Provisions.state.companyJhtRate + this.Provisions.state.employeeJhtRate) / 100));
                } else {
                    this.Company.allowances.JHT = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * (this.Provisions.state.companyJhtRate / 100));
                    this.Employee.components.deductions.JHT = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * (this.Provisions.state.employeeJhtRate / 100));
                    if ([2, 4].includes(this.Employee.jhtPayor)) {
                        this.Company.allowances.JHT += Math.round(this.Employee.components.deductions.JHT);
                        this.Employee.components.deductions.JHT = 0;
                    }
                }
            }

            if (this.Provisions.company.JIP && bpjsTkBase >= this.Provisions.state.bpjsTkLowerLimit) {
                if (bpjsTkBase < this.Provisions.state.provinceMinimumWage) {
                    if (this.Employee.earnings.bpjsKetenagakerjaanBase < this.Provisions.state.bpjsTkUpperLimit) {
                        this.Company.allowances.JIP = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * ((this.Provisions.state.companyJpRate + this.Provisions.state.employeeJpRate) / 100));
                    } else {
                        this.Company.allowances.JIP = Math.round(this.Provisions.state.bpjsTkUpperLimit * ((this.Provisions.state.companyJpRate + this.Provisions.state.employeeJpRate) / 100));
                    }
                } else {
                    if (this.Employee.earnings.bpjsKetenagakerjaanBase < this.Provisions.state.bpjsTkUpperLimit) {
                        this.Company.allowances.JIP = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * (this.Provisions.state.companyJpRate / 100));
                        this.Employee.components.deductions.JIP = Math.round(this.Employee.earnings.bpjsKetenagakerjaanBase * (this.Provisions.state.employeeJpRate / 100));
                    } else {
                        this.Company.allowances.JIP = Math.round(this.Provisions.state.bpjsTkUpperLimit * (this.Provisions.state.companyJpRate / 100));
                        this.Employee.components.deductions.JIP = Math.round(this.Provisions.state.bpjsTkUpperLimit * (this.Provisions.state.employeeJpRate / 100));
                    }
                    if ([2, 4].includes(this.Employee.jpPayor)) {
                        this.Company.allowances.JIP += Math.round(this.Employee.components.deductions.JIP);
                        this.Employee.components.deductions.JIP = 0;
                    }
                }
            }

            // Add Employee Deductions
            const deductionExceptions = ['BPJSKesehatan', 'JHT', 'JIP', 'BPJSKesehatanFamily'];
            for (const key in this.Employee.components.deductions) {
                if (deductionExceptions.includes(key)) {
                    continue;
                }
                deductions += this.Employee.components.deductions.get(key);
            }

            // Jika settingan BPJS TK merupakan taxable, maka ditambahkan JKK dan JKM ke bruto
            let companyJKK = 0;
            let companyJKM = 0;
            if (this.Provisions.company.BPJSTKEmpTaxable) {
                companyJKK = this.Company.allowances.JKK;
                companyJKM = this.Company.allowances.JKM;
            }

            // Add Company Benefit (JKK & JKM company allowances) to bruto
            this.Result.earnings.monthly.gross += (companyJKK + companyJKM);
            // Add BPJS Kesehatan to bruto if BPJS Kes Payor = 2 or 3
            if ([2, 3].includes(this.Employee.bpjsKesPayor)) {
                this.Result.earnings.monthly.gross += this.Company.allowances.BPJSKesehatan;
            }

            // Berapa potongan yang diberikan ke bruto
            this.Result.earnings.monthly.gross -= deductions;

            this.Result.earnings.annualy.gross = this.Result.earnings.monthly.gross * this.Employee.monthMultiplier;
            this.Result.earnings.annualy.positionTax = this.Result.earnings.annualy.gross * (5 / 100);
            if (this.Result.earnings.monthly.gross > this.Provisions.state.provinceMinimumWage) {
                /**
                 * According to Undang-Undang Direktur Jenderal Pajak Nomor PER-32/PJ/2015 Pasal 21 ayat 3
                 * Position Deduction is 5% from Annual Gross Income
                 */
                this.Result.earnings.monthly.positionTax = this.Result.earnings.monthly.gross * (5 / 100);

                /**
                 * Maximum Position Deduction in Indonesia is 500000 / month
                 * or 6000000 / year
                 */
                if (!this.Employee.isNewlyJoinedEmployee && this.Result.earnings.monthly.positionTax >= this.Provisions.state.pph21MonthlyPositionTaxLimit) {
                    this.Result.earnings.monthly.positionTax = this.Provisions.state.pph21MonthlyPositionTaxLimit;
                }

                if (this.Employee.isNewlyJoinedEmployee && this.Result.earnings.annualy.positionTax > this.Provisions.state.pph21AnnualyPositionTaxLimit) {
                    this.Result.earnings.monthly.positionTax = this.Provisions.state.pph21MonthlyPositionTaxLimit;
                }
            }

            // Position Tax for December / Last Tax Pph21 calculation
            // this.Employee.lastTaxPeriod.monthlyPositionTax = monthlyPositionTax;

            // Set Irregulars to bruto except for December Period
            const irregulars = (
                this.Employee.onetime.bonus +
                this.Employee.onetime.holidayAllowance +
                this.Employee.onetime.allowances.sum() +
                this.Employee.onetime.deductions.sum() +
                this.Employee.onetime.benefits.sum()
            );
            // Set Irregulars to bruto
            if (this.Employee.monthPeriod == 12) {
                this.Result.bonus.monthly.gross = this.Result.earnings.monthly.gross + irregulars;
            } else {
                this.Result.earnings.monthly.gross += irregulars;
                this.Result.bonus.monthly.gross = this.Result.earnings.monthly.gross;
            }

            // Set Employee Gross Bonus
            this.Result.bonus.annualy.gross = this.Result.bonus.monthly.gross * this.Employee.monthMultiplier;
            this.Result.bonus.monthly.positionTax = 0;
            if (this.Result.bonus.monthly.gross > this.Provisions.state.provinceMinimumWage) {
                let positionTax = this.Result.bonus.monthly.gross * (5 / 100);
                if (!this.Employee.isNewlyJoinedEmployee && positionTax >= this.Provisions.state.pph21MonthlyPositionTaxLimit) {
                    positionTax = this.Provisions.state.pph21MonthlyPositionTaxLimit;
                }
                this.Result.bonus.monthly.positionTax = positionTax;

                let annualPositionCostBonus = positionTax * this.Employee.monthMultiplier;
                if (this.Employee.isNewlyJoinedEmployee && 6000000 < annualPositionCostBonus) {
                    this.Result.bonus.monthly.positionTax = this.Provisions.state.pph21MonthlyPositionTaxLimit;
                }
            }

            // Set Monthly Nett
            this.Result.earnings.monthly.nett = this.Result.earnings.monthly.gross - this.Result.earnings.monthly.positionTax;

            let bpjsKesehatanYearly = 0;
            if (this.Provisions.company.BPJSKesEmpTaxable) {
                this.Result.earnings.monthly.nett -= this.Employee.components.deductions.BPJSKesehatan;
                bpjsKesehatanYearly = this.Employee.components.deductions.BPJSKesehatan * this.Employee.monthMultiplier;
            }

            // Set Annual Nett
            let yearlyPositionCostBonus = this.Result.bonus.monthly.positionTax * this.Employee.monthMultiplier;
            this.Result.bonus.annualy.nett = Math.floor(this.Result.bonus.annualy.gross - yearlyPositionCostBonus - bpjsKesehatanYearly);

            // Jika jhtPayor tipe [2,3] maka menjadi pengurang (karena taxable)
            if (this.Provisions.company.BPJSTKEmpTaxable && [2, 3].includes(this.Employee.jhtPayor)) {
                this.Result.earnings.monthly.nett -= this.Employee.components.deductions.JHT;
                this.Result.bonus.annualy.nett -= (this.Employee.components.deductions.JHT * this.Employee.monthMultiplier);
            }

            // jika jpPayor tipe [2,3] maka menjadi pengurang (karena taxable)
            if (this.Provisions.company.BPJSTKEmpTaxable && [2, 3].includes(this.Employee.jpPayor)) {
                this.Result.earnings.monthly.nett -= this.Employee.components.deductions.JIP;
                this.Result.bonus.annualy.nett -= (this.Employee.components.deductions.JIP * this.Employee.monthMultiplier);
            }

            // Set Bonus Monthly Nett
            this.Result.bonus.monthly.nett = this.Result.bonus.annualy.nett / this.Employee.monthMultiplier;
            switch (this.taxStatus) {
                case 2:
                    // Pegawai Tidak Tetap
                    this.Result.taxable = (new Pph21NonPermanentEmployee(this)).calculate();
                    break;

                case 3:
                case 4:
                case 5:
                    // Bukan Pegawai
                    this.Result.taxable = (new Pph21NotEmployee(this)).calculate();
                    break;

                case 6:
                    // Peserta Kegiatan / Pensiunan
                    this.Result.taxable = (new Pph21OtherSubject(this)).calculate();
                    break;

                case 7:
                    // Komisaris
                    this.Result.taxable = (new Pph21Commissioner(this)).calculate();
                    break;

                default:
                    // Pegawai Tetap
                    if (this.Employee.monthPeriod == 12 || this.Employee.isResignedEmployee) {
                        // PPH 21 December / Masa Pajak terakhir
                        this.Result.taxable = (new Pph21LastTaxPeriod(this)).calculate();
                    } else {
                        // PPH 21 Monthly
                        this.Result.taxable = (new Pph21(this)).calculate();
                    }

                    // PPH 21 Resign terpisah dari pph21 monthly
                    if (this.Employee.isResignedEmployee) {
                        this.Result.resign.allowances.compensationPay = this.Employee.resign.compensationPay;
                        this.Result.resign.allowances.severancePay = this.Employee.resign.severancePay;
                        this.Result.resign.allowances.meritPay = this.Employee.resign.meritPay;
                        this.Result.resign.amount = this.Employee.resign.compensationPay + this.Employee.resign.severancePay + this.Employee.resign.meritPay;
                        this.Result.set('resign', (new Pph21Resign(this)).calculate());
                    }
                    break;
            }

            // Tunjangan Jabatan selain pegawai tetap dan pegawai tidak tetap
            if (2 < this.taxStatus) {
                this.Result.earnings.monthly.positionTax = 0;
                this.Result.earnings.annualy.positionTax = 0;
            }

            // Set Additional Result
            this.Result.set('allowances', this.Employee.components.allowances)
            this.Result.set('deductions', this.Employee.components.deductions)
            this.Result.set('onetime', this.Employee.onetime)
            this.Result.set('company', this.Company.allowances)

            // Set Provisions result
            this.Result.set('BPJSKesEmpTaxable', !!this.Provisions.company.BPJSKesEmpTaxable);
            this.Result.set('BPJSTKEmpTaxable', !!this.Provisions.company.BPJSTKEmpTaxable);
        } else {
            this.Company.allowances.BPJSKesehatan = 0;
            this.Employee.components.deductions.set('BPJSKesehatan', 0);

            this.Employee.components.allowances.set('JKK', 0);
            this.Employee.components.allowances.set('JKM', 0);

            this.Employee.components.allowances.set('JHT', 0);
            this.Employee.components.deductions.set('JHT', 0);

            this.Employee.components.allowances.set('JIP', 0);
            this.Employee.components.deductions.set('JIP', 0);

            // Set result allowances, bonus, deductions
            this.Result.set('allowances', this.Employee.components.allowances);
            this.Result.set('deductions', this.Employee.components.deductions);

            // Pendapatan bersih
            this.Result.earnings.monthly.nett = this.Result.earnings.monthly.gross + this.Result.allowances.sum() - this.Result.deductions.sum();
            this.Result.earnings.annualy.nett = this.Result.earnings.monthly.nett * this.Employee.monthMultiplier;

            this.Result.bonus.monthly.gross = this.Employee.onetime.bonus + this.Employee.onetime.holidayAllowance + this.Employee.onetime.allowances.sum() + this.Employee.onetime.deductions.sum() + this.Employee.onetime.benefits.sum();
            this.Result.bonus.monthly.nett = this.Result.bonus.monthly.gross;
            this.Result.bonus.annualy.gross = this.Result.bonus.monthly.gross * this.Employee.monthMultiplier;
            this.Result.bonus.annualy.nett = this.Result.bonus.annualy.gross;

            if (7 == this.taxStatus) {
                this.Result.taxable = (new Pph21Commissioner(this)).calculate();
            } else {
                this.Result.taxable = (new Pph21(this)).calculate();
            }

            this.Result.takeHomePay = (this.Result.earnings.monthly.nett + this.Result.bonus.monthly.nett) - this.Employee.components.deductions?.penalty?.late + this.Employee.components.deductions?.penalty?.absent;
            this.Result.earnings.monthly.positionTax = 0;
            this.Result.allowances.set('pph21Tax', 0);
            this.Result.takeHomePay = 0;
        }

        switch (this.method) {
            // Pajak ditanggung oleh perusahaan
            case CALCULATION.NETT:
                this.Result.takeHomePay = this.Result.earnings.base + this.Result.earnings.fixedAllowance + this.Result.resign.amount + this.Result.allowances.sum() - (this.Result.deductions.sum());
                this.Result.company.positionTax = this.Result.earnings.monthly.positionTax;
                this.Result.company.pph21Tax = this.Result.taxable.pph.liability.monthly;
                this.Result.company.pph21Resign = this.Result.taxable.pphResign.liability.amount;
                break;
            // Pajak ditanggung oleh karyawan
            case CALCULATION.GROSS:
                this.Result.takeHomePay = this.Result.earnings.base + this.Result.earnings.fixedAllowance + this.Result.resign.amount + this.Result.allowances.sum() - (this.Result.deductions.sum() + this.Result.taxable.pph.liability.monthly) - this.Result.taxable.pphResign.liability.amount;
                if (!this.Result.deductions.positionTax) {
                    this.Result.deductions.positionTax = this.Result.earnings.monthly.positionTax;
                }
                this.Result.deductions.pph21Tax = this.Result.taxable.pph.liability.monthly;
                this.Result.deductions.pph21Resign = this.Result.taxable.pphResign.liability.amount;
                break;
            // Pajak ditanggung oleh perusahaan sebagai tunjangan pajak.
            case CALCULATION.GROSS_UP:
                this.Result.takeHomePay = this.Result.earnings.base + this.Result.earnings.fixedAllowance + this.Result.taxable.pph.liability.monthly + this.Result.resign.amount + this.Result.allowances.sum() - (this.Result.deductions.sum() + this.Result.taxable.pph.liability.monthly);
                this.Result.deductions.positionTax = this.Result.earnings.monthly.positionTax;
                this.Result.deductions.pph21Tax = this.Result.taxable.pph.liability.monthly;
                this.Result.allowances.positionTax = this.Result.earnings.monthly.positionTax;
                this.Result.allowances.pph21Tax = this.Result.taxable.pph.liability.monthly;
                this.Result.deductions.pph21Resign = this.Result.taxable.pphResign.liability.amount;
                this.Result.allowances.pph21Resign = this.Result.taxable.pphResign.liability.amount;
                break;
        }

        return this.Result
    }

    private calculateBaseOnPph23() {
        // TODO: Implement PPH23
        return this.Result
    }

    private calculateBaseOnPph26() {
        // TODO: Implement PPH26
        return this.Result
    }
}