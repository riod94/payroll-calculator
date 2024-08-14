# Payroll Calculator

A comprehensive payroll calculator library to support Hihono projects.

## Getting Started

```sh
npm install payroll-calculator
```

## How to use

Test case diambil dari Buku PPh 21-26 DJP
Contoh: Penghitungan PPh Pasal 21 atas Pegawai Tetap Yang Menerima/Memperoleh Penghasilan Dalam Satu Tahun Pajak (Halaman: 62-64)

```typescript
import PayrollCalculator from "payroll-calculator";

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
};
for (let month = 1; month <= monthPeriod; month++) {
	const calculator = new PayrollCalculator();
	// init State and Company Provisions
	calculator.Provisions.company.BPJSTKEmpTaxable = true; // BPJS TK Ditanggung karyawan
	calculator.Provisions.company.JKM = true;
	calculator.Provisions.company.JKK = true;
	calculator.Provisions.company.jkkRiskGrade = 0.5; // custom jkk risk grade
	// Use customBPJSTK
	calculator.Employee.earnings.bpjsKetenagakerjaanBase = 10000000;

	// init employee
	calculator.Employee.name = "Tuan A";
	calculator.Employee.ptkpStatus = "K/0";
	calculator.Employee.hasNPWP = true;
	calculator.Employee.permanentStatus = true;
	calculator.Employee.yearPeriod = 2024;
	calculator.Employee.monthPeriod = month;

	calculator.Employee.earnings.base = 10000000;
	calculator.Employee.earnings.baseBeforeProrate = 10000000;
	calculator.Employee.components.allowances.set("Tunjangan Jabatan", 20000000);
	if ([2, 5].includes(month)) {
		calculator.Employee.components.allowances.set("Uang Lembur", 5000000);
	}

	if (month === 7) {
		calculator.Employee.onetime.bonus = 20000000;
	}

	if (month === monthPeriod) {
		calculator.Employee.onetime.holidayAllowance = 60000000;

		// Set Last Tax Period
		calculator.Employee.lastTaxPeriod.annualGross = annually.gross;
		calculator.Employee.lastTaxPeriod.annualBonus = annually.bonus;
		calculator.Employee.lastTaxPeriod.annualHolidayAllowance = annually.THR;
		calculator.Employee.lastTaxPeriod.annualPPh21Paid = annually.pph21Paid;
		calculator.Employee.lastTaxPeriod.annualJIPEmployee = 1200000; // dibayar sendiri
		calculator.Employee.lastTaxPeriod.annualZakat = 2400000; // dibayar sendiri
	}
	const result = calculator.getCalculation();

	if (result) {
		const items = {
			month: new Date(2024, month - 1, 1).toLocaleDateString("id-ID", {
				month: "long",
			}),
			base: result.earnings.base,
			allowance: calculator.Employee.components.allowances.sum(),
			holidayAllowance: calculator.Employee.onetime.holidayAllowance,
			bonus: calculator.Employee.onetime.bonus,
			premi: { JKK: result?.company?.JKK, JKM: result?.company?.JKM },
			gross: result?.earnings.monthly.gross,
			terCategory: result?.taxable?.pph?.ter?.category,
			pph21: result?.taxable?.pph?.liability?.monthly,
		};
		yearIncomes.push(items);

		annually.gross +=
			items.base + items.allowance + items.premi.JKK + items.premi.JKM;
		annually.jkk += result.company.JKK;
		annually.jkm += result.company.JKM;
		annually.bonus += calculator.Employee.onetime.bonus;
		annually.THR += calculator.Employee.onetime.holidayAllowance;
		annually.pph21Paid += result?.taxable?.pph?.liability?.monthly;
	}
}

console.log("yearIncomes Tuan A Pada PT.Z");
console.table(yearIncomes);
```
