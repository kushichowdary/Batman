
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUndo, FaCalculator, FaCalendarCheck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const TotalCalculator: React.FC = () => {
    const [totalClasses, setTotalClasses] = useState('');
    const [attendedClasses, setAttendedClasses] = useState('');
    const [projectedAbsences, setProjectedAbsences] = useState('');
    const [currentPercentage, setCurrentPercentage] = useState<number | null>(null);
    const [projectedPercentage, setProjectedPercentage] = useState<number | null>(null);
    const [classesNeeded85, setClassesNeeded85] = useState<number | null>(null);
    const [classesNeeded75, setClassesNeeded75] = useState<number | null>(null);
    const [error, setError] = useState('');

    const calculateProjectedAttendance = useCallback(() => {
        const total = parseFloat(totalClasses);
        const attended = parseFloat(attendedClasses);
        const absences = parseFloat(projectedAbsences);

        if (isNaN(total) || isNaN(attended) || isNaN(absences) || total <= 0) {
            setProjectedPercentage(null);
            return;
        }

        if (absences > attended) {
            // Just a warning, but let it calculate if possible, though logically weird if absences > attended implies you removed more classes than attended
            // Assuming absences are FUTURE absences from total? No, usually "Attended - Absences" means removing past attendance? 
            // "Attendance When Absent" usually implies: "If I miss X more classes, what will my % be?"
            // Formula: (Attended) / (Total + Absences) if total doesn't include future.
            // OR: (Attended) / (Total) where Total includes the future classes you will miss.
            // Let's stick to the logic: New % = Attended / (Total + NewMissed) ?
            // The original logic was: `(attended - absences) / total`. This implies removing attendance from past. 
            // Let's assume user wants to know: "If I miss next X classes".
            // Current: Attended/Total. Next X classes missed: Attended / (Total + X).
            
            // REVISING LOGIC for "Attendance When Absent": 
            // Usually students ask: "If I take leave for 2 days (approx 10 classes), what happens?"
            // New Total = Total + Absences. New Attended = Attended. 
            // PERCENTAGE = (Attended) / (Total + Absences).
            
            // HOWEVER, sticking to original logic if that's what KLU students expect, but `(attended - absences) / total` implies correcting a mistake or removing past attendance.
            // Let's implement the standard "Projection": 
            // "If I miss the NEXT [x] classes..."
            // New Percentage = Attended / (Total + Absences).
            
            const newTotal = total + absences;
            const projected = (attended / newTotal) * 100;
            setProjectedPercentage(parseFloat(projected.toFixed(2)));
            return;
        }
        
        // If logic was correcting past attendance (original code):
        // const projected = ((attended - absences) / total) * 100;
        
        // I will stick to the "Future Absence" logic as it makes more sense for a calculator.
        const newTotal = total + absences;
        const projected = (attended / newTotal) * 100;
        setProjectedPercentage(parseFloat(projected.toFixed(2)));

    }, [totalClasses, attendedClasses, projectedAbsences]);

    useEffect(() => {
        if (projectedAbsences && totalClasses && attendedClasses) {
            calculateProjectedAttendance();
        } else {
            setProjectedPercentage(null);
        }
    }, [projectedAbsences, calculateProjectedAttendance, totalClasses, attendedClasses]);

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

    const calculateClassesNeeded = (currentAttended: number, currentTotal: number, targetPercentage: number): number => {
        if ( (currentAttended / currentTotal) * 100 >= targetPercentage) return 0;

        let needed = 0;
        // Formula: (Attended + x) / (Total + x) >= Target/100
        // 100(Attended + x) >= Target(Total + x)
        // 100Attended + 100x >= TargetTotal + Targetx
        // 100x - Targetx >= TargetTotal - 100Attended
        // x(100 - Target) >= TargetTotal - 100Attended
        // x >= (TargetTotal - 100Attended) / (100 - Target)
        
        const numerator = (targetPercentage * currentTotal) - (100 * currentAttended);
        const denominator = 100 - targetPercentage;
        
        if (denominator === 0) return Infinity; // Impossible to reach 100% if you missed one, unless target is < 100.
        
        const x = numerator / denominator;
        return Math.ceil(x);
    };

    const calculateAttendance = () => {
        if (!totalClasses || !attendedClasses) {
            setError('Please enter both total and attended classes.');
            return;
        }
        const total = parseFloat(totalClasses);
        const attended = parseFloat(attendedClasses);

        if (isNaN(total) || isNaN(attended) || total <= 0) {
            setError('Please enter valid numbers.');
            return;
        }
        if (attended > total) {
            setError('Attended classes cannot be greater than Total classes.');
            return;
        }
        setError('');
        const percentage = (attended / total) * 100;
        setCurrentPercentage(parseFloat(percentage.toFixed(2)));
        
        setClassesNeeded85(calculateClassesNeeded(attended, total, 85));
        setClassesNeeded75(calculateClassesNeeded(attended, total, 75));

        if (projectedAbsences) {
            calculateProjectedAttendance();
        }
    };

    const getColor = (p: number) => {
        if (p >= 85) return 'text-success';
        if (p >= 75) return 'text-warning';
        return 'text-primary';
    };
    
    const getBorderColor = (p: number) => {
        if (p >= 85) return 'border-success';
        if (p >= 75) return 'border-warning';
        return 'border-primary';
    };

    return (
        <motion.div 
            className="max-w-3xl mx-auto p-8 bg-accent-light/50 backdrop-blur-lg border border-card-border rounded-3xl shadow-2xl space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center border-b border-white/5 pb-6">
                <motion.h1 className="text-3xl font-bold text-text-main mb-2 flex items-center justify-center gap-3">
                    <FaCalculator className="text-secondary" /> Absence Projector
                </motion.h1>
                <p className="text-text-muted">Analyze current standing and simulate future absences.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { label: "Total Classes", val: totalClasses, set: setTotalClasses, ph: "e.g. 100" },
                    { label: "Attended Classes", val: attendedClasses, set: setAttendedClasses, ph: "e.g. 85" },
                    { label: "Future Absences", val: projectedAbsences, set: setProjectedAbsences, ph: "Classes to miss" }
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">{item.label}</label>
                         <input 
                            type="number" 
                            value={item.val} 
                            onChange={(e) => item.set(e.target.value)} 
                            placeholder={item.ph} 
                            className="w-full p-4 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-white transition-all placeholder:text-white/20 font-mono"
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button onClick={calculateAttendance} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,15,91,0.3)] hover:bg-primary-dark transition-all">
                    Analyze Status
                </motion.button>
                <motion.button onClick={resetForm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-8 py-4 bg-surface border border-white/10 text-text-muted font-bold rounded-xl hover:bg-white/10 transition-all">
                    <FaUndo />
                </motion.button>
            </div>
            
             <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-primary/10 border border-primary/50 text-primary text-center rounded-xl flex items-center justify-center gap-2"><FaExclamationTriangle/> {error}</motion.div>}
            </AnimatePresence>

            {currentPercentage !== null && (
                <motion.div className="space-y-8 pt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Current Stats */}
                        <div className={`relative p-8 rounded-2xl border-2 ${getBorderColor(currentPercentage)} bg-surface overflow-hidden`}>
                            <div className={`absolute -right-4 -top-4 text-9xl opacity-10 ${getColor(currentPercentage)}`}><FaCalendarCheck/></div>
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Current Status</h3>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className={`text-6xl font-extrabold ${getColor(currentPercentage)}`}>{currentPercentage}%</span>
                            </div>
                            <p className="mt-4 text-sm text-text-muted border-t border-white/10 pt-2">
                                {currentPercentage >= 85 ? "Safe Zone. Keep it up!" : currentPercentage >= 75 ? "Warning Zone. Be careful." : "Critical Zone! Action needed."}
                            </p>
                        </div>

                        {/* Projected Stats */}
                        <AnimatePresence>
                        {projectedPercentage !== null ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`relative p-8 rounded-2xl border border-white/10 bg-surface`}>
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">After {projectedAbsences} Absences</h3>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className={`text-6xl font-extrabold ${getColor(projectedPercentage)}`}>{projectedPercentage}%</span>
                                </div>
                                <p className="mt-4 text-sm text-text-muted border-t border-white/10 pt-2">
                                    Projection based on missing the next {projectedAbsences} classes.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center p-8 rounded-2xl border border-white/5 bg-surface/50 text-text-muted text-sm italic">
                                Enter "Future Absences" to see projection.
                            </div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Recovery Plan */}
                    {(classesNeeded85! > 0 || classesNeeded75! > 0) && (
                        <div className="p-6 bg-accent border border-white/10 rounded-xl">
                            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><FaCheckCircle className="text-secondary"/> Recovery Plan</h3>
                            <div className="space-y-3 text-sm">
                                {classesNeeded85! > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                        <span>To reach <strong className="text-success">85%</strong></span>
                                        <span className="px-3 py-1 bg-success/20 text-success rounded font-bold">{classesNeeded85} classes</span>
                                    </div>
                                )}
                                {classesNeeded75! > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                        <span>To reach <strong className="text-warning">75%</strong></span>
                                        <span className="px-3 py-1 bg-warning/20 text-warning rounded font-bold">{classesNeeded75} classes</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-text-muted mt-3 text-center">*Consecutive classes required without absence.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default TotalCalculator;
