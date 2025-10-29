
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaUndo, FaHistory, FaChevronLeft, FaChevronRight, FaStar, FaCheckCircle, FaCalculator } from 'react-icons/fa';
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
    const [analysis, setAnalysis] = useState<{ status: string; componentAnalysis: string[]; recommendations: string[] } | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('ltpsHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to parse history from localStorage", error);
        }
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
        const value = event.target.value;
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
            setter(value);
            setErrorMessage('');
        } else {
            setErrorMessage('Please enter a value between 0 and 100.');
        }
    };

    const resetForm = () => {
        setSubject(''); setLect(''); setTut(''); setPract(''); setSkill('');
        setAttendancePercentage(null); setErrorMessage(''); setAnalysis(null);
    };

    const generatePDF = () => {
        if (!analysis || !attendancePercentage) return;
        const doc = new jsPDF();
        doc.setTextColor("#D7263D");
        doc.setFontSize(22);
        doc.text('Attendance Report', 105, 20, { align: 'center' });
        
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(14);
        doc.text(`Subject: ${subject || 'N/A'}`, 20, 40);
        doc.setFontSize(16);
        doc.text(`Overall Attendance: ${attendancePercentage}%`, 20, 50);
        doc.setFontSize(12);
        doc.text(`Status: ${analysis.status}`, 20, 60);

        doc.setTextColor("#D7263D");
        doc.setFontSize(16);
        doc.text('Component Analysis:', 20, 80);
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(12);
        analysis.componentAnalysis.forEach((item, index) => doc.text(`• ${item}`, 25, 90 + (index * 8)));
        
        doc.save(`${subject || 'attendance'}-report.pdf`);
    };

    const calculateTotal = () => {
        let totalWeight = 0, totalScore = 0;
        const components = [
            { value: lect, weight: weights.lecture },
            { value: tut, weight: weights.tutorial },
            { value: pract, weight: weights.practical },
            { value: skill, weight: weights.skilling }
        ];

        let hasValidInput = false;
        for (const comp of components) {
            if (comp.value !== '') {
                const val = parseFloat(comp.value);
                if (isNaN(val) || val < 0 || val > 100) {
                    setErrorMessage('Please enter valid percentages (0-100).');
                    return;
                }
                hasValidInput = true;
                totalWeight += comp.weight;
                totalScore += val * comp.weight;
            }
        }

        if (!hasValidInput) {
            setErrorMessage('Please enter at least one component percentage.');
            return;
        }

        const calculatedPercentage = totalScore / totalWeight;
        const roundedPercentage = calculatedPercentage.toFixed(2);

        setAttendancePercentage(roundedPercentage);
        setErrorMessage('');
        
        const componentValues = { lect: parseFloat(lect) || 0, tut: parseFloat(tut) || 0, pract: parseFloat(pract) || 0, skill: parseFloat(skill) || 0 };

        const newAnalysis = {
            status: getAttendanceStatus(calculatedPercentage),
            componentAnalysis: Object.entries(componentValues).filter(([, val]) => val > 0).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}%`),
            recommendations: []
        };
        setAnalysis(newAnalysis);

        const newHistoryEntry: HistoryEntry = {
            subject: subject || 'Untitled',
            percentage: roundedPercentage,
            timestamp: new Date().toLocaleString(),
            components: componentValues,
            status: newAnalysis.status
        };
        setHistory(prev => [newHistoryEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-6 md:p-8 bg-card-bg border border-card-border rounded-2xl shadow-2xl space-y-8">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-light-text mb-2 flex items-center justify-center gap-3"><FaCalculator className="text-primary"/> L-T-P-S Calculator</h1>
                <p className="text-muted-text">Calculate weighted attendance for subjects with different components.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="font-semibold text-light-text">Subject Name (Optional)</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Data Structures" className="mt-2 w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                </div>
                {[
                    { label: 'Lecture (%)', value: lect, setter: setLect, weight: weights.lecture },
                    { label: 'Tutorial (%)', value: tut, setter: setTut, weight: weights.tutorial },
                    { label: 'Practical (%)', value: pract, setter: setPract, weight: weights.practical },
                    { label: 'Skilling (%)', value: skill, setter: setSkill, weight: weights.skilling }
                ].map((input, index) => (
                     <div key={index}>
                        <label className="font-semibold text-light-text flex justify-between items-center">{input.label} <span className="text-xs font-mono px-2 py-1 bg-primary/20 text-primary rounded-full">{input.weight} weight</span></label>
                        <input type="number" value={input.value} onChange={handleInputChange(input.setter)} placeholder="0-100" className="mt-2 w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <motion.button onClick={calculateTotal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 flex justify-center items-center gap-2 p-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-colors">
                    Calculate
                </motion.button>
                <motion.button onClick={resetForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 flex justify-center items-center gap-2 p-3 bg-card-border text-muted-text font-bold rounded-lg hover:bg-surface transition-colors">
                    <FaUndo /> Reset
                </motion.button>
            </div>
            
            <AnimatePresence>
                {errorMessage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-primary/20 text-primary text-center rounded-lg">{errorMessage}</motion.div>}
            </AnimatePresence>

            {attendancePercentage && analysis && (
                <motion.div className="space-y-6 pt-6 border-t border-card-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="p-6 rounded-xl bg-surface">
                        <h3 className="text-lg font-semibold text-muted-text">Overall Weighed Attendance</h3>
                        <p className="text-5xl font-bold text-primary">{attendancePercentage}%</p>
                        <p className="mt-2 text-sm">Status: <strong className="font-semibold">{analysis.status}</strong></p>
                    </div>
                     <div className="p-6 rounded-xl bg-surface">
                        <h3 className="text-xl font-bold mb-4 text-light-text">Component Breakdown</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-text">
                            {analysis.componentAnalysis.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                    <motion.button onClick={generatePDF} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex justify-center items-center gap-2 p-3 bg-success/80 text-white font-bold rounded-lg shadow-lg hover:bg-success transition-colors">
                        <FaDownload /> Download Report
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default LtpsCalculator;
