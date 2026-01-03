/**
 * Calculate salary components based on monthly wage
 * 
 * Rules:
 * - Basic Salary: 50% of monthly wage
 * - HRA: 50% of basic salary
 * - Standard Allowance: Fixed 4167
 * - Performance Bonus: 8.33% of wage
 * - LTA: 8.33% of wage
 * - Fixed Allowance: Remaining amount (wage - all other components)
 * - PF Employee: 12% of basic salary
 * - PF Employer: 12% of basic salary
 * - Professional Tax: Fixed 200
 */

export interface SalaryComponents {
    monthlyWage: number;
    yearlyWage: number;
    basicSalary: number;
    hra: number;
    standardAllowance: number;
    performanceBonus: number;
    lta: number;
    fixedAllowance: number;
    pfEmployee: number;
    pfEmployer: number;
    professionalTax: number;
}

export const calculateSalaryComponents = (monthlyWage: number, payableDays?: number, totalDaysInMonth?: number): SalaryComponents => {
    // Round to 2 decimal places helper
    const round = (num: number) => Math.round(num * 100) / 100;

    // Calculate yearly wage
    const yearlyWage = round(monthlyWage * 12);

    // If payable days are provided, calculate pro-rated monthly wage
    // Note: Standard Allowance and Professional Tax are usually fixed, but other components pro-rate
    let applicableWage = monthlyWage;
    if (payableDays !== undefined && totalDaysInMonth !== undefined && totalDaysInMonth > 0) {
        applicableWage = (monthlyWage / totalDaysInMonth) * payableDays;
    }

    // Basic Salary: 50% of monthly wage
    const basicSalary = round(applicableWage * 0.5);

    // HRA: 50% of basic salary
    const hra = round(basicSalary * 0.5);

    // Standard Allowance: Fixed amount (Assuming full for simplicity, or pro-rated?)
    // Image says "Any unpaid leave... should automatically reduce the number of payable days during payslip computation".
    // Usually Standard Allowance is taxable benefit, often pro-rated. Let's pro-rate it to be safe/fair.
    const fullStandardAllowance = 4167.00;
    const standardAllowance = (payableDays !== undefined && totalDaysInMonth !== undefined)
        ? round((fullStandardAllowance / totalDaysInMonth) * payableDays)
        : fullStandardAllowance;

    // Performance Bonus: 8.33% of wage
    const performanceBonus = round(applicableWage * 0.0833);

    // LTA: 8.33% of wage
    const lta = round(applicableWage * 0.0833);

    // PF Employee: 12% of basic salary
    const pfEmployee = round(basicSalary * 0.12);

    // PF Employer: 12% of basic salary
    const pfEmployer = round(basicSalary * 0.12);

    // Professional Tax: Fixed amount (usually fixed 200)
    const professionalTax = 200.00;

    // Fixed Allowance: Remaining amount
    const totalAllocated = basicSalary + hra + standardAllowance + performanceBonus + lta;
    // For fixed allowance, we take the difference from the APPLICABLE wage
    const fixedAllowance = round(applicableWage - totalAllocated);

    return {
        monthlyWage,
        yearlyWage,
        basicSalary,
        hra,
        standardAllowance,
        performanceBonus,
        lta,
        fixedAllowance,
        pfEmployee,
        pfEmployer,
        professionalTax,
    };
};

export const validateSalaryComponents = (components: SalaryComponents): { valid: boolean; message?: string } => {
    const total = components.basicSalary +
        components.hra +
        components.standardAllowance +
        components.performanceBonus +
        components.lta +
        components.fixedAllowance;

    if (Math.abs(total - components.monthlyWage) > 1) { // Allow 1 rupee difference for rounding
        return {
            valid: false,
            message: `Total salary components (${total}) exceed monthly wage (${components.monthlyWage})`
        };
    }

    if (components.fixedAllowance < 0) {
        return {
            valid: false,
            message: 'Fixed allowance cannot be negative. Please increase the monthly wage.'
        };
    }

    return { valid: true };
};
