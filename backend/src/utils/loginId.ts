import prisma from '../config/database';

const COMPANY_CODE = process.env.COMPANY_CODE || 'OI';

/**
 * Generate login ID in format: OIJODO20220001
 * OI = Company Code (Odoo India)
 * JODO = First two letters of first name + first two letters of last name
 * 2022 = Year of joining
 * 0001 = Serial number for that year
 */
export const generateLoginId = async (
    firstName: string,
    lastName: string,
    dateOfJoining: Date
): Promise<string> => {
    // Get first two letters of first name and last name (uppercase)
    const firstInitials = firstName.substring(0, 2).toUpperCase();
    const lastInitials = lastName.substring(0, 2).toUpperCase();
    const nameCode = firstInitials + lastInitials;

    // Get year of joining
    const year = dateOfJoining.getFullYear();

    // Find the latest serial number for this year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const employees = await prisma.employee.findMany({
        where: {
            dateOfJoining: {
                gte: startOfYear,
                lte: endOfYear,
            },
        },
        orderBy: {
            employeeCode: 'desc',
        },
        take: 1,
    });

    let serialNumber = 1;

    if (employees.length > 0) {
        // Extract serial number from last employee code
        const lastCode = employees[0].employeeCode;
        const lastSerial = parseInt(lastCode.slice(-4));
        serialNumber = lastSerial + 1;
    }

    // Format serial number with leading zeros (4 digits)
    const serialStr = serialNumber.toString().padStart(4, '0');

    // Construct login ID: COMPANY_CODE + NAME_CODE + YEAR + SERIAL
    const loginId = `${COMPANY_CODE}${nameCode}${year}${serialStr}`;

    return loginId;
};
