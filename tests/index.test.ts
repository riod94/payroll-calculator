import { describe, expect, test } from '@jest/globals';
import PayrollCalculator from '../dist/index.js';

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

describe('PegawaiTetap', () => {
    // Test case diambil dari Buku PPh 21-26 DJP
    // 1. Penghitungan PPh Pasal 21 atas Pegawai Tetap Yang Menerima/Memperoleh Penghasilan Dalam Satu Tahun Pajak (Halaman: 62-64)
    test("test_case_pegawai_tetap_setahun", () => {
        // Simulasi setahun Tuan A:
        // Berdasarkan status Penghasilan Tidak Kena Pajak Tuan A (K/0) 
        // 1. Tuan A Menerima Gaji sebesar 10.000.000 dan Tunjangan Tetap 20.000.000 setiap bulannya
        // 2. Tuan A mendapatkan uang lembur sebesar 5.000.000 pada bulan Februari dan Mei 2024
        // 3. Tuan A mendapatkan Bonus sebesar 20.000.000 pada bulan juli
        // 4. Tuan A mendapatkan THR sebesar 60.000.000 pada bulan desember
        const yearIncomes = [];
        const monthPeriod = 12;

        const annually = {
            gross: 0,
            jkk: 0,
            jkm: 0,
            bonus: 0,
            THR: 0,
            pph21Paid: 0,
        }
        for (let month = 1; month <= monthPeriod; month++) {
            const calculator = new PayrollCalculator();
            // init State and Company Provisions
            calculator.Provisions.company.BPJSTKEmpTaxable = true; // BPJS TK Ditanggung karyawan
            calculator.Provisions.company.JKM = true;
            calculator.Provisions.company.JKK = true;
            calculator.Provisions.company.jkkRiskGrade = 0.50; // custom jkk risk grade
            // Use customBPJSTK
            calculator.Employee.earnings.bpjsKetenagakerjaanBase = 10000000;

            // init employee
            calculator.Employee.name = 'Tuan A'
            calculator.Employee.ptkpStatus = 'K/0'
            calculator.Employee.hasNPWP = true
            calculator.Employee.permanentStatus = true
            calculator.Employee.yearPeriod = 2024
            calculator.Employee.monthPeriod = month;

            calculator.Employee.earnings.base = 10000000
            calculator.Employee.earnings.baseBeforeProrate = 10000000
            calculator.Employee.components.allowances.set('Tunjangan Jabatan', 20000000)
            if ([2, 5].includes(month)) {
                calculator.Employee.components.allowances.set('Uang Lembur', 5000000)
            }

            if (month === 7) {
                calculator.Employee.onetime.bonus = 20000000
            }

            if (month === monthPeriod) {
                calculator.Employee.onetime.holidayAllowance = 60000000

                // Set Last Tax Period
                calculator.Employee.lastTaxPeriod.annualGross = annually.gross
                calculator.Employee.lastTaxPeriod.annualBonus = annually.bonus
                calculator.Employee.lastTaxPeriod.annualHolidayAllowance = annually.THR
                calculator.Employee.lastTaxPeriod.annualPPh21Paid = annually.pph21Paid
                calculator.Employee.lastTaxPeriod.annualJIPEmployee = 1200000  // dibayar sendiri
                calculator.Employee.lastTaxPeriod.annualZakat = 2400000 // dibayar sendiri
            }
            const result = calculator.getCalculation();

            if (result) {
                const items = {
                    month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
                    base: result.earnings.base,
                    allowance: calculator.Employee.components.allowances.sum(),
                    holidayAllowance: calculator.Employee.onetime.holidayAllowance,
                    bonus: calculator.Employee.onetime.bonus,
                    premi: { JKK: result?.company?.JKK, JKM: result?.company?.JKM },
                    gross: result?.earnings.monthly.gross,
                    terCategory: result?.taxable?.pph?.ter?.category,
                    pph21: result?.taxable?.pph?.liability?.monthly
                }
                yearIncomes.push(items)

                annually.gross += (items.base + items.allowance + items.premi.JKK + items.premi.JKM)
                annually.jkk += result.company.JKK
                annually.jkm += result.company.JKM
                annually.bonus += calculator.Employee.onetime.bonus
                annually.THR += calculator.Employee.onetime.holidayAllowance
                annually.pph21Paid += result?.taxable?.pph?.liability?.monthly
            }
        }

        console.log('yearIncomes Tuan A Pada PT.Z');
        console.table(yearIncomes);
        expect(yearIncomes.pop()?.pph21).toBe(14595000);
    });

    // 2. Penghitungan Pajak Penghasilan Pasal 21 atas Pegawai Tetap yang kewajiban pajak subjektifnya sebagai subjek pajak dalam negeri sudah ada sejak awal tahun kalender, tetapi baru bekerja pada pertengahan tahun (Halaman: 65-66)
    test("test_case_join_tengah_tahun", () => {
        const yearIncomes = [];
        const monthPeriod = 12;

        const annually = {
            gross: 0,
            pph21Paid: 0,
        }
        for (let month = 9; month <= monthPeriod; month++) {
            const calculator = new PayrollCalculator();
            // init State and Company Provisions
            calculator.Provisions.company.BPJSTKEmpTaxable = true; // BPJS TK Ditanggung karyawan

            // init employee
            calculator.Employee.name = 'Tuan B'
            calculator.Employee.ptkpStatus = 'TK/0'
            calculator.Employee.hasNPWP = true
            calculator.Employee.permanentStatus = true
            calculator.Employee.yearPeriod = 2024
            calculator.Employee.monthPeriod = month;
            calculator.Employee.monthMultiplier = 4;

            calculator.Employee.earnings.base = 15500000
            calculator.Employee.earnings.baseBeforeProrate = 15500000

            if (month === monthPeriod) {
                // Set Last Tax Period
                calculator.Employee.lastTaxPeriod.annualGross = annually.gross
                calculator.Employee.lastTaxPeriod.annualPPh21Paid = annually.pph21Paid
                calculator.Employee.lastTaxPeriod.annualJIPEmployee = calculator.Employee.monthMultiplier * 100000  // dibayar sendiri
            }
            const result = calculator.getCalculation();

            if (result) {
                const items = {
                    month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
                    base: result.earnings.base,
                    allowance: calculator.Employee.components.allowances.sum(),
                    gross: result?.earnings.monthly.gross,
                    terCategory: result?.taxable?.pph?.ter?.category,
                    pph21: result?.taxable?.pph?.liability?.monthly
                }
                yearIncomes.push(items)

                annually.gross += (items.base + items.allowance)
                annually.pph21Paid += items.pph21
            }
        }

        console.log('yearIncomes Tuan B Pada PT.Y');
        console.table(yearIncomes);
        expect(yearIncomes.pop()?.pph21).toBe(-2975000);
    })

    // 3. Penghitungan Pajak Penghasilan Pasal 21 atas Pegawai Tetap yang Masih Memiliki Kewajiban Pajak Subjektif saat Berhenti Bekerja pada Tahun Berjalan (Halaman: 68-70)
    test("test_case_resign_tengah_tahun", () => {
        const yearIncomes = [];
        const monthPeriod = 8;

        const annually = {
            gross: 0,
            pph21Paid: 0,
        }
        for (let month = 1; month <= monthPeriod; month++) {
            const calculator = new PayrollCalculator();
            // init State and Company Provisions
            calculator.Provisions.company.BPJSTKEmpTaxable = true; // BPJS TK Ditanggung karyawan

            // init employee
            calculator.Employee.name = 'Tuan D'
            calculator.Employee.ptkpStatus = 'TK/0'
            calculator.Employee.hasNPWP = true
            calculator.Employee.permanentStatus = true
            calculator.Employee.yearPeriod = 2024
            calculator.Employee.monthPeriod = month;
            calculator.Employee.monthMultiplier = 8;

            calculator.Employee.earnings.base = 17500000
            calculator.Employee.earnings.baseBeforeProrate = 17500000

            if (month === monthPeriod) {
                // Set Resignation
                calculator.Employee.isResignedEmployee = true
                // Set Last Tax Period
                calculator.Employee.lastTaxPeriod.annualGross = annually.gross
                calculator.Employee.lastTaxPeriod.annualPPh21Paid = annually.pph21Paid
                calculator.Employee.lastTaxPeriod.annualJIPEmployee = calculator.Employee.monthMultiplier * 100000  // dibayar sendiri
            }
            const result = calculator.getCalculation();

            if (result) {
                const items = {
                    month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
                    base: result.earnings.base,
                    allowance: calculator.Employee.components.allowances.sum(),
                    gross: result?.earnings.monthly.gross,
                    terCategory: result?.taxable?.pph?.ter?.category,
                    pph21: result?.taxable?.pph?.liability?.monthly
                }
                yearIncomes.push(items)

                annually.gross += (items.base + items.allowance)
                annually.pph21Paid += items.pph21
            }
        }

        console.log('yearIncomes Tuan D Pada PT.W');
        console.table(yearIncomes);
        expect(yearIncomes.pop()?.pph21).toBe(-3620000);
    })

    // 4. Penghitungan Pajak Penghasilan Pasal 21 atas Pegawai Tetap yang menerima atau memperoleh penghasilan yang seluruh atau sebagian PPh Pasal 21 terutang ditanggung Pemberi Kerja (Halaman: 76-77)
    test('test_case_gross_up', () => {
        const month = 8
        const calculator = new PayrollCalculator();
        calculator.method = 'GROSSUP';

        calculator.Employee.name = 'Tuan G'
        calculator.Employee.ptkpStatus = 'TK/0'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 1;

        calculator.Employee.earnings.base = 51827997
        calculator.Employee.earnings.baseBeforeProrate = 51827997

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }
        console.log('yearIncomes Tuan G Pada PT.T');
        console.table(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(13777062);
    })

    // 5. Penghitungan Pajak Penghasilan Pasal 21 atas Pegawai Tetap yang menerima atau memperoleh Tunjangan Pajak (Halaman: 77-78)
    test('test_case_netto', () => {
        const month = 8
        const calculator = new PayrollCalculator();
        calculator.method = 'NETT';

        calculator.Employee.name = 'Tuan H'
        calculator.Employee.ptkpStatus = 'K/2'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 12;

        calculator.Employee.earnings.base = 6500000
        calculator.Employee.earnings.baseBeforeProrate = 6500000

        calculator.Employee.components.allowances.set('Tunjangan Pajak', 300000)

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }
        console.log('yearIncomes Tuan H Pada PT.T');
        console.log(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(34000);
    })
});

describe('PegawaiTidakTetap', () => {
    // Penghitungan PPh Pasal 21 atas Pegawai Tidak Tetap Yang Menerima/Memperoleh Upah Harian ≤ Rp2,5 Juta/Hari
    test('test_case_upah_harian_dibawah_2500000', () => {
        const month = 12
        const calculator = new PayrollCalculator();
        calculator.taxStatus = TaxStatus.NON_PERMANENT_EMPLOYEE
        calculator.frequency = 'daily';

        calculator.Employee.name = 'Tuan K'
        calculator.Employee.ptkpStatus = 'K/2'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true;
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 1;

        calculator.Employee.earnings.base = 500000

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }

        console.log(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(2500);
    })
    test('test_case_upah_harian_diatas_2500000', () => {
        const month = 8
        const calculator = new PayrollCalculator();
        calculator.taxStatus = TaxStatus.NON_PERMANENT_EMPLOYEE
        calculator.frequency = 'daily';

        calculator.Employee.name = 'Tuan M'
        calculator.Employee.ptkpStatus = 'TK/0'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true;
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 1;

        calculator.Employee.earnings.base = 15000000

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }

        console.log(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(375000);
    })
    test('test_case_upah_bulanan', () => {
        const month = 12
        const payrolls = [
            4000000,
            7000000,
            1000000,
            7000000,
            8000000,
            6000000,
            7000000,
            8000000,
            6000000,
            9000000,
            2000000,
            8000000
        ]

        const yearIncomes = [];
        let pph21 = 0;
        for (let i = 0; i < month; i++) {
            const calculator = new PayrollCalculator();
            calculator.taxStatus = TaxStatus.NON_PERMANENT_EMPLOYEE
            calculator.frequency = 'monthly';

            calculator.Employee.name = 'Tuan M'
            calculator.Employee.ptkpStatus = 'TK/0'
            calculator.Employee.hasNPWP = true
            calculator.Employee.permanentStatus = true;
            calculator.Employee.yearPeriod = 2024
            calculator.Employee.monthPeriod = month;
            calculator.Employee.monthMultiplier = 1;

            calculator.Employee.earnings.base = payrolls[i]

            const result = calculator.getCalculation();
            if (result) {
                const items = {
                    month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
                    base: result.earnings.base,
                    gross: result?.earnings.monthly.gross,
                    TER: result?.taxable?.pph?.ter,
                    pph21: result?.taxable?.pph?.liability?.monthly
                }
                yearIncomes.push(items)
                pph21 += result?.taxable?.pph?.liability?.monthly
            }
        }
        console.table(yearIncomes);
        expect(pph21).toBe(870000);
    })
})

describe('BukanPegawai', () => {
    test('test_case_tidak_berkesinambungan', () => {
        const month = 8
        const calculator = new PayrollCalculator();
        calculator.taxStatus = TaxStatus.NOT_EMPLOTEE_WHO_ARE_UNSUSTAINABLE
        calculator.frequency = 'monthly';

        calculator.Employee.name = 'Tuan U'
        calculator.Employee.ptkpStatus = 'TK/0'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true;
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 1;

        calculator.Employee.earnings.base = 400000000

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }

        console.log(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(24000000);
    })
    test('test_case_berkesinambungan', () => {
        const month = 12
        const payrolls = [
            45000000,
            49000000,
            47000000,
            40000000,
            44000000,
            52000000,
            40000000,
            35000000,
            45000000,
            44000000,
            43000000,
            40000000
        ]

        const yearIncomes = [];
        let pph21 = 0;
        for (let i = 0; i < month; i++) {
            const calculator = new PayrollCalculator();
            calculator.taxStatus = TaxStatus.NOT_EMPLOYEE_WHO_ARE_SUSTAINABLE
            calculator.frequency = 'monthly';

            calculator.Employee.name = 'Tuan M'
            calculator.Employee.ptkpStatus = 'TK/0'
            calculator.Employee.hasNPWP = true
            calculator.Employee.permanentStatus = true;
            calculator.Employee.yearPeriod = 2024
            calculator.Employee.monthPeriod = month;
            calculator.Employee.monthMultiplier = 1;

            calculator.Employee.earnings.base = payrolls[i]

            const result = calculator.getCalculation();
            if (result) {
                const items = {
                    month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
                    base: result.earnings.base,
                    gross: result?.earnings.monthly.gross,
                    TER: result?.taxable?.pph?.ter,
                    pph21: result?.taxable?.pph?.liability?.monthly
                }
                yearIncomes.push(items)
                pph21 += result?.taxable?.pph?.liability?.monthly
            }
        }
        console.table(yearIncomes);
        expect(pph21).toBe(13100000);
    })
})

describe('Pph21_Lainnya', () => {
    test('test_case_peserta_kegiatan', () => {
        const month = 9
        const calculator = new PayrollCalculator();
        calculator.taxStatus = TaxStatus.OTHER_SUBJECTS
        calculator.frequency = 'monthly';

        calculator.Employee.name = 'Tuan W'
        calculator.Employee.ptkpStatus = 'TK/0'
        calculator.Employee.hasNPWP = true
        calculator.Employee.permanentStatus = true;
        calculator.Employee.yearPeriod = 2024
        calculator.Employee.monthPeriod = month;
        calculator.Employee.monthMultiplier = 1;

        calculator.Employee.earnings.base = 200000000

        const result = calculator.getCalculation();
        const items = {
            method: calculator.method,
            month: new Date(2024, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }),
            base: result?.earnings.base,
            allowance: calculator.Employee.components.allowances.sum(),
            gross: result?.earnings.monthly.gross,
            ter: result?.taxable?.pph?.ter,
            pph21: result?.taxable?.pph?.liability?.monthly
        }

        console.log(items);
        expect(result?.taxable?.pph?.liability?.monthly).toBe(24000000);
    })
})