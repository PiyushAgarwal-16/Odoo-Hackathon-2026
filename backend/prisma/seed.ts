import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create admin user
    const adminPassword = await hashPassword('Admin@123');

    const adminUser = await prisma.user.create({
        data: {
            loginId: 'OIADMI20260001',
            email: 'admin@dayflow.com',
            password: adminPassword,
            role: 'ADMIN',
            isFirstLogin: false,
        },
    });

    const adminEmployee = await prisma.employee.create({
        data: {
            userId: adminUser.id,
            employeeCode: 'OIADMI20260001',
            firstName: 'Admin',
            lastName: 'User',
            phone: '+91 9876543210',
            department: 'Management',
            jobPosition: 'System Administrator',
            company: 'Odoo India',
            dateOfJoining: new Date('2026-01-01'),
            workingDaysPerWeek: 5,
            breakTimeHours: 1.0,
        },
    });

    console.log('✅ Admin user created:', {
        loginId: adminUser.loginId,
        email: adminUser.email,
        password: 'Admin@123',
    });

    // Create a sample employee
    const empPassword = await hashPassword('Employee@123');

    const empUser = await prisma.user.create({
        data: {
            loginId: 'OIJODO20260001',
            email: 'john.doe@dayflow.com',
            password: empPassword,
            role: 'EMPLOYEE',
            isFirstLogin: true,
        },
    });

    const employee = await prisma.employee.create({
        data: {
            userId: empUser.id,
            employeeCode: 'OIJODO20260001',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+91 9876543211',
            department: 'Engineering',
            jobPosition: 'Software Developer',
            company: 'Odoo India',
            managerId: adminEmployee.id,
            location: 'Mumbai',
            dateOfJoining: new Date('2026-01-02'),
            dateOfBirth: new Date('1995-05-15'),
            gender: 'MALE',
            nationality: 'Indian',
            maritalStatus: 'SINGLE',
            workingDaysPerWeek: 5,
            breakTimeHours: 1.0,
        },
    });

    console.log('✅ Sample employee created:', {
        loginId: empUser.loginId,
        email: empUser.email,
        password: 'Employee@123',
    });

    // Create salary info for sample employee
    await prisma.salaryInfo.create({
        data: {
            employeeId: employee.id,
            monthlyWage: 50000,
            yearlyWage: 600000,
            basicSalary: 25000,
            hra: 12500,
            standardAllowance: 4167,
            performanceBonus: 4165,
            lta: 4165,
            fixedAllowance: 3,
            pfEmployee: 3000,
            pfEmployer: 3000,
            professionalTax: 200,
        },
    });

    console.log('✅ Salary info created for sample employee');

    // Create leave allocations for sample employee
    const currentYear = new Date().getFullYear();

    await prisma.leaveAllocation.createMany({
        data: [
            {
                employeeId: employee.id,
                leaveType: 'PAID',
                allocatedDays: 24,
                usedDays: 0,
                year: currentYear,
            },
            {
                employeeId: employee.id,
                leaveType: 'SICK',
                allocatedDays: 7,
                usedDays: 0,
                year: currentYear,
            },
            {
                employeeId: employee.id,
                leaveType: 'UNPAID',
                allocatedDays: 5,
                usedDays: 0,
                year: currentYear,
            },
        ],
    });

    console.log('✅ Leave allocations created');

    // Create some sample attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.attendance.create({
        data: {
            employeeId: employee.id,
            date: today,
            checkIn: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
            checkOut: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7 PM
            workHours: 9,
            extraHours: 0,
            status: 'PRESENT',
        },
    });

    console.log('✅ Sample attendance created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin:');
    console.log('     Login ID: OIADMI20260001');
    console.log('     Password: Admin@123');
    console.log('\n   Employee:');
    console.log('     Login ID: OIJODO20260001');
    console.log('     Password: Employee@123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
