
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUndo, FaCalculator, FaChartLine, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TotalCalculator: React.FC = () => {
    const [totalClasses, setTotalClasses] = useState('');
    const [attendedClasses, setAttendedClasses] = useState('');
    const [projectedAbsences, setProjectedAbsences] = useState('');
    const [currentPercentage, setCurrentPercentage] = useState<number | null>(null);
    const [projectedPercentage, setProjectedPercentage] = useState<number | null>(null);
    const [classesNeeded85, setClassesNeeded85] = useState<number | null>(null);
    const [classesNeeded75, setClassesNeeded75] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [showErp, setShowErp] = useState(false);

    const calculateProjectedAttendance = useCallback(() => {
        const total = parseInt(totalClasses);
        const attended = parseInt(attendedClasses);
        const absences = parseInt(projectedAbsences);

        if (isNaN(total) || isNaN(attended) || isNaN(absences) || total <= 0) {
            setProjectedPercentage(null);
            return;
        }

        if (absences > attended) {
            setError('Projected absences cannot be more than attended classes.');
            setProjectedPercentage(null);
            return;
        }
        setError('');
        const projected = ((attended - absences) / total) * 100;
        setProjectedPercentage(Math.round(projected));
    }, [totalClasses, attendedClasses, projectedAbsences]);

    useEffect(() => {
        if (projectedAbsences) {
            calculateProjectedAttendance();
        } else {
            setProjectedPercentage(null);
        }
    }, [projectedAbsences, calculateProjectedAttendance]);

    const resetForm = () => {
        setTotalClasses('');
        setAttendedClasses('');
        setProjectedAbsences('');
        setCurrentPercentage(null);
        setProjectedPercentage(null);
        setClassesNeeded85(null);
        setClassesNeeded75(null);
        setError('');
    };

    const calculateClassesNeeded = (current: number, total: number, targetPercentage: number): number => {
        if ( (current / total) * 100 >= targetPercentage) return 0;

        let classesNeeded = 0;
        let futureAttended = current;
        let futureTotal = total;

        while (((futureAttended) / (futureTotal)) * 100 < targetPercentage) {
            futureAttended++;
            futureTotal++;
            classesNeeded++;
            if (classesNeeded > 200) return Infinity; // Safety break
        }
        return classesNeeded;
    };

    const calculateAttendance = () => {
        if (!totalClasses || !attendedClasses) {
            setError('Please enter both total and attended classes.');
            return;
        }
        const total = parseInt(totalClasses);
        const attended = parseInt(attendedClasses);

        if (isNaN(total) || isNaN(attended) || total <= 0) {
            setError('Please enter valid numbers for classes.');
            return;
        }
        if (attended > total) {
            setError('Attended classes cannot be more than total classes.');
            return;
        }
        setError('');
        const percentage = (attended / total) * 100;
        setCurrentPercentage(Math.round(percentage));
        
        setClassesNeeded85(calculateClassesNeeded(attended, total, 85));
        setClassesNeeded75(calculateClassesNeeded(attended, total, 75));

        if (projectedAbsences) {
            calculateProjectedAttendance();
        }
    };

    const getPercentageClass = (percentage: number) => {
        if (percentage >= 85) return 'bg-success/20 text-success border-success/30';
        if (percentage >= 75) return 'bg-warning/20 text-warning border-warning/30';
        return 'bg-primary/20 text-primary border-primary/30';
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    
    return (
        <motion.div 
            className="max-w-4xl mx-auto p-6 md:p-8 bg-card-bg border border-card-border rounded-2xl shadow-2xl space-y-8"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="text-center">
                <motion.h1 className="text-3xl md:text-4xl font-bold text-light-text mb-2 flex items-center justify-center gap-3">
                    <FaCalculator className="text-primary" /> Attendance Predictor
                </motion.h1>
                <p className="text-muted-text">Track your current standing and project future attendance easily.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                     <label className="font-semibold text-light-text">Total Classes</label>
                    <input type="number" value={totalClasses} onChange={(e) => setTotalClasses(e.target.value)} placeholder="e.g., 50" className="w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                </div>
                 <div className="md:col-span-1 space-y-4">
                    <label className="font-semibold text-light-text">Attended Classes</label>
                    <input type="number" value={attendedClasses} onChange={(e) => setAttendedClasses(e.target.value)} placeholder="e.g., 40" className="w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                </div>
                 <div className="md:col-span-1 space-y-4">
                    <label className="font-semibold text-light-text">Planned Absences</label>
                    <input type="number" value={projectedAbsences} onChange={(e) => setProjectedAbsences(e.target.value)} placeholder="e.g., 2" className="w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <motion.button onClick={calculateAttendance} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 flex justify-center items-center gap-2 p-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-colors">
                    <FaChartLine /> Calculate
                </motion.button>
                <motion.button onClick={resetForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 flex justify-center items-center gap-2 p-3 bg-card-border text-muted-text font-bold rounded-lg hover:bg-surface transition-colors">
                    <FaUndo /> Reset
                </motion.button>
            </div>
            
             <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-primary/20 text-primary text-center rounded-lg">{error}</motion.div>}
            </AnimatePresence>

            {currentPercentage !== null && (
                <motion.div className="space-y-6 pt-6 border-t border-card-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-xl border ${getPercentageClass(currentPercentage)}`}>
                            <h3 className="text-lg font-semibold text-muted-text">Current Attendance</h3>
                            <p className="text-5xl font-bold">{currentPercentage}%</p>
                            <p className="mt-2 text-sm">{currentPercentage >= 85 ? "Excellent! Keep it up! 🌟" : currentPercentage >= 75 ? "Good, stay consistent! 👍" : "Needs attention! ⚠️"}</p>
                        </div>
                        <AnimatePresence>
                        {projectedPercentage !== null && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-xl border ${getPercentageClass(projectedPercentage)}`}>
                                <h3 className="text-lg font-semibold text-muted-text">Projected (w/ {projectedAbsences} absences)</h3>
                                <p className="text-5xl font-bold">{projectedPercentage}%</p>
                                <p className="mt-2 text-sm">{projectedPercentage >= 75 ? "You're still on track!" : "Be careful with more absences!"}</p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    <div className="p-6 bg-surface rounded-xl">
                        <h3 className="text-xl font-bold mb-4 text-light-text">Improvement Plan</h3>
                        <div className="space-y-3">
                            <p>To reach <strong className="text-success">85%</strong> attendance, you need to attend <strong className="text-success">{classesNeeded85 === Infinity ? "many" : classesNeeded85}</strong> more classes consecutively.</p>
                            <p>To reach <strong className="text-warning">75%</strong> (minimum), you need to attend <strong className="text-warning">{classesNeeded75 === Infinity ? "many" : classesNeeded75}</strong> more classes consecutively.</p>
                        </div>
                    </div>
                </motion.div>
            )}

        </motion.div>
    );
};

export default TotalCalculator;
