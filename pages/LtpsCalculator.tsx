
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaUndo, FaCalculator, FaLayerGroup } from 'react-icons/fa';
import jsPDF from 'jspdf';

type HistoryEntry = {
    subject: string;
    percentage: string;
    timestamp: string;
    components: { lect: number, tut: number, pract: number, skill: number };
    status: string;
};

const LtpsCalculator: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [lect, setLect] = useState('');
    const [tut, setTut] = useState('');
    const [pract, setPract] = useState('');
    const [skill, setSkill] = useState('');
    const [attendancePercentage, setAttendancePercentage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [analysis, setAnalysis] = useState<{ status: string; componentAnalysis: string[]; } | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('ltpsHistory');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => {
        localStorage.setItem('ltpsHistory', JSON.stringify(history));
    }, [history]);
    
    const weights = { lecture: 100, tutorial: 25, practical: 50, skilling: 25 };

    const getAttendanceStatus = (percentage: number) => {
        if (percentage >= 85) return 'Excellent';
        if (percentage >= 75) return 'Good';
        return 'Needs Improvement';
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value);
        setErrorMessage('');
    };

    const resetForm = () => {
        setSubject(''); setLect(''); setTut(''); setPract(''); setSkill('');
        setAttendancePercentage(null); setErrorMessage(''); setAnalysis(null);
    };

    const percentage = attendancePercentage ? parseFloat(attendancePercentage) : 0;

    const generatePDF = () => {
        if (!analysis || !attendancePercentage) return;
        const doc = new jsPDF();
        doc.setFillColor(11, 17, 32); 
        doc.rect(0, 0, 210, 297, 'F'); // Dark background
        
        doc.setTextColor(0, 229, 255); // Cyan
        doc.setFontSize(22);
        doc.text('KLU Attendance Report', 105, 20, { align: 'center' });
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(`Subject: ${subject || 'General'}`, 20, 40);
        doc.text(`Overall Attendance: ${attendancePercentage}%`, 20, 50);
        
        if (percentage >= 85) {
            doc.setTextColor(0, 255, 148);
        } else if (percentage >= 75) {
            doc.setTextColor(255, 184, 0);
        } else {
            doc.setTextColor(255, 15, 91);
        }
        doc.text(`Status: ${analysis.status}`, 20, 60);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('Component Breakdown:', 20, 80);
        
        analysis.componentAnalysis.forEach((item, index) => {
            doc.text(`• ${item}`, 25, 90 + (index * 10));
        });
        
        doc.save(`${subject || 'attendance'}-report.pdf`);
    };
    
    const calculateTotal = () => {
        let totalWeight = 0, totalScore = 0;
        const components = [
            { value: lect, weight: weights.lecture, name: 'Lecture' },
            { value: tut, weight: weights.tutorial, name: 'Tutorial' },
            { value: pract, weight: weights.practical, name: 'Practical' },
            { value: skill, weight: weights.skilling, name: 'Skilling' }
        ];

        let hasValidInput = false;
        const breakdown: string[] = [];

        for (const comp of components) {
            if (comp.value !== '') {
                const val = parseFloat(comp.value);
                if (isNaN(val) || val < 0 || val > 100) {
                    setErrorMessage(`Invalid value for ${comp.name}. Use 0-100.`);
                    return;
                }
                hasValidInput = true;
                totalWeight += comp.weight;
                totalScore += val * comp.weight;
                breakdown.push(`${comp.name}: ${val}% (Weight: ${comp.weight})`);
            }
        }

        if (!hasValidInput) {
            setErrorMessage('Enter at least one component percentage.');
            return;
        }

        const calc = totalScore / totalWeight;
        const rounded = calc.toFixed(2);

        setAttendancePercentage(rounded);
        setErrorMessage('');
        
        setAnalysis({
            status: getAttendanceStatus(calc),
            componentAnalysis: breakdown
        });

        setHistory(prev => [{
            subject: subject || 'Untitled',
            percentage: rounded,
            timestamp: new Date().toLocaleString(),
            components: { lect: parseFloat(lect)||0, tut: parseFloat(tut)||0, pract: parseFloat(pract)||0, skill: parseFloat(skill)||0 },
            status: getAttendanceStatus(calc)
        }, ...prev.slice(0, 9)]);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-8 bg-accent-light/50 backdrop-blur-lg border border-card-border rounded-3xl shadow-2xl space-y-8">
            <div className="text-center border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold text-text-main mb-2 flex items-center justify-center gap-3"><FaLayerGroup className="text-secondary"/> L-T-P-S Calculator</h1>
                <p className="text-text-muted">Weighted attendance calculation for multi-component courses.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Subject Name</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Data Structures" className="w-full mt-2 p-4 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary outline-none text-white placeholder:text-white/20"/>
                </div>
                
                {[
                    { label: 'Lecture', val: lect, set: setLect, w: 100, color: 'border-primary' },
                    { label: 'Tutorial', val: tut, set: setTut, w: 25, color: 'border-secondary' },
                    { label: 'Practical', val: pract, set: setPract, w: 50, color: 'border-warning' },
                    { label: 'Skilling', val: skill, set: setSkill, w: 25, color: 'border-success' }
                ].map((item, index) => (
                     <div key={index} className={`bg-surface p-4 rounded-xl border-l-4 ${item.color}`}>
                        <div className="flex justify-between mb-2">
                            <label className="font-semibold text-white">{item.label}</label>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-text-muted">Weight: {item.w}</span>
                        </div>
                        <input type="number" value={item.val} onChange={handleInputChange(item.set)} placeholder="%" className="w-full p-2 bg-accent border border-white/10 rounded focus:border-white/50 outline-none text-white font-mono text-right"/>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-4">
                <motion.button onClick={calculateTotal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow py-4 bg-secondary text-accent font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:bg-cyan-300 transition-colors">
                    Calculate
                </motion.button>
                <motion.button onClick={resetForm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 bg-surface border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors">
                    <FaUndo />
                </motion.button>
            </div>
            
            <AnimatePresence>
                {errorMessage && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-primary/20 border border-primary/50 text-primary text-center rounded-lg text-sm">{errorMessage}</motion.div>}
            </AnimatePresence>

            {attendancePercentage && analysis && (
                <motion.div className="space-y-6 pt-8 border-t border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-surface" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className={`${parseFloat(attendancePercentage) >= 85 ? 'text-success' : parseFloat(attendancePercentage) >= 75 ? 'text-warning' : 'text-primary'}`} strokeDasharray={`${parseFloat(attendancePercentage)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-2xl font-bold text-white block">{attendancePercentage}%</span>
                            </div>
                        </div>
                        <div className="flex-grow space-y-4 w-full">
                            <div className="p-4 bg-surface rounded-xl border border-white/5">
                                <h4 className="text-sm text-text-muted uppercase">Result</h4>
                                <p className="text-xl font-semibold text-white">{analysis.status}</p>
                            </div>
                            <div className="space-y-1">
                                {analysis.componentAnalysis.map((line, i) => (
                                    <p key={i} className="text-sm text-text-muted flex items-center gap-2"><span className="w-1 h-1 bg-secondary rounded-full"></span> {line}</p>
                                ))}
                            </div>
                        </div>
                     </div>
                    <motion.button onClick={generatePDF} whileHover={{ scale: 1.02 }} className="w-full flex justify-center items-center gap-2 p-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                        <FaDownload /> Export Report
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default LtpsCalculator;
