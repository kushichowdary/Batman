
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUndo, FaPercentage } from 'react-icons/fa';

const SubjectCalculator: React.FC = () => {
    const [totalClasses, setTotalClasses] = useState('');
    const [attendedClasses, setAttendedClasses] = useState('');
    const [attendancePercentage, setAttendancePercentage] = useState<number | null>(null);
    const [error, setError] = useState('');

    const resetForm = () => {
        setTotalClasses('');
        setAttendedClasses('');
        setAttendancePercentage(null);
        setError('');
    };

    const calculateAttendance = () => {
        if (!totalClasses || !attendedClasses) {
            setError('Please enter both total and attended classes.');
            return;
        }
        const total = parseInt(totalClasses);
        const attended = parseInt(attendedClasses);

        if (isNaN(total) || isNaN(attended) || total <= 0) {
            setError('Please enter valid positive numbers.');
            return;
        }
        if (attended > total) {
            setError('Attended classes cannot be more than total classes.');
            return;
        }
        setError('');
        const percentage = (attended / total) * 100;
        setAttendancePercentage(Math.round(percentage));
    };

    const getPercentageClass = (percentage: number) => {
        if (percentage >= 85) return 'bg-success/20 text-success border-success/30';
        if (percentage >= 75) return 'bg-warning/20 text-warning border-warning/30';
        return 'bg-primary/20 text-primary border-primary/30';
    };

    const getAttendanceStatus = (percentage: number) => {
        if (percentage >= 85) return 'Excellent! Keep up the great work! 🌟';
        if (percentage >= 75) return 'Good, but aim higher for a buffer. 📈';
        return 'This needs immediate attention! ⚠️';
    };

    return (
        <motion.div 
            className="max-w-2xl mx-auto p-6 md:p-8 bg-card-bg border border-card-border rounded-2xl shadow-2xl space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center">
                <motion.h1 className="text-3xl md:text-4xl font-bold text-light-text mb-2 flex items-center justify-center gap-3">
                    <FaPercentage className="text-primary" /> Subject Calculator
                </motion.h1>
                <p className="text-muted-text">Quickly calculate your attendance for any subject.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="font-semibold text-light-text">Total Classes</label>
                    <input
                        type="number"
                        value={totalClasses}
                        onChange={(e) => setTotalClasses(e.target.value)}
                        placeholder="e.g., 50"
                        className="mt-2 w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
                <div>
                    <label className="font-semibold text-light-text">Attended Classes</label>
                    <input
                        type="number"
                        value={attendedClasses}
                        onChange={(e) => setAttendedClasses(e.target.value)}
                        placeholder="e.g., 40"
                        className="mt-2 w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                    onClick={calculateAttendance}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex-1 flex justify-center items-center gap-2 p-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-colors"
                >
                    Calculate
                </motion.button>
                <motion.button 
                    onClick={resetForm}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex-1 flex justify-center items-center gap-2 p-3 bg-card-border text-muted-text font-bold rounded-lg hover:bg-surface transition-colors"
                >
                    <FaUndo /> Reset
                </motion.button>
            </div>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-3 bg-primary/20 text-primary text-center rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {attendancePercentage !== null && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-xl border ${getPercentageClass(attendancePercentage)} text-center`}
                >
                    <h3 className="text-lg font-semibold text-muted-text">Your Attendance is</h3>
                    <p className="text-6xl font-bold my-2">{attendancePercentage}%</p>
                    <p className="mt-2 font-medium">{getAttendanceStatus(attendancePercentage)}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SubjectCalculator;
