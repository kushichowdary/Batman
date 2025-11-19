
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUndo, FaPercentage, FaCheck } from 'react-icons/fa';

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
            setError('Enter both values.');
            return;
        }
        const total = parseFloat(totalClasses);
        const attended = parseFloat(attendedClasses);

        if (isNaN(total) || isNaN(attended) || total <= 0) {
            setError('Invalid numbers.');
            return;
        }
        if (attended > total) {
            setError('Attended cannot exceed Total.');
            return;
        }
        setError('');
        const percentage = (attended / total) * 100;
        setAttendancePercentage(parseFloat(percentage.toFixed(2)));
    };

    const getColor = (percentage: number) => {
        if (percentage >= 85) return 'text-success border-success shadow-success/20';
        if (percentage >= 75) return 'text-warning border-warning shadow-warning/20';
        return 'text-primary border-primary shadow-primary/20';
    };

    return (
        <motion.div 
            className="max-w-xl mx-auto mt-10 p-8 bg-accent-light/60 backdrop-blur-md border border-card-border rounded-3xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-surface mb-4 border border-white/5">
                     <FaPercentage className="text-3xl text-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-white">Quick Calc</h1>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider ml-1">Total</label>
                        <input
                            type="number"
                            value={totalClasses}
                            onChange={(e) => setTotalClasses(e.target.value)}
                            className="w-full mt-1 p-4 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary outline-none text-center text-xl font-bold text-white placeholder:text-white/10"
                            placeholder="0"
                        />
                    </div>
                    <div>
                         <label className="text-xs text-text-muted uppercase tracking-wider ml-1">Attended</label>
                        <input
                            type="number"
                            value={attendedClasses}
                            onChange={(e) => setAttendedClasses(e.target.value)}
                            className="w-full mt-1 p-4 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary outline-none text-center text-xl font-bold text-white placeholder:text-white/10"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={calculateAttendance}
                        className="flex-1 py-4 bg-secondary text-accent font-bold rounded-xl shadow-lg hover:bg-cyan-300 transition-all"
                    >
                        Calculate
                    </button>
                    <button 
                        onClick={resetForm}
                        className="px-6 bg-surface border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors"
                    >
                        <FaUndo />
                    </button>
                </div>
            </div>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-4 text-primary text-center text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {attendancePercentage !== null && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-6 rounded-2xl border-2 bg-accent ${getColor(attendancePercentage)} shadow-[0_0_30px_currentColor] text-center`}
                >
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Final Attendance</p>
                    <p className="text-6xl font-extrabold my-2 tracking-tighter">{attendancePercentage}%</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SubjectCalculator;
