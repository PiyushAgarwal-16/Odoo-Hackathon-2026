import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import salaryRoutes from './routes/salary.routes';
import { errorHandler, notFoundHandler } from './middleware/error';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://odoo-hackathon-2026.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req, res) => {
    res.json({
        message: 'Dayflow HRMS API',
        version: '1.0.0',
        status: 'running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Dayflow HRMS server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
});

export default app;
