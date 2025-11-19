
import React, { useState, useEffect, useCallback, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaCalendarAlt, FaClipboardList, FaFileAlt, FaClock, FaBook, FaCloudSunRain, FaStickyNote, FaUniversity, FaTrash, FaPlay, FaPause, FaForward, FaTimes, FaArrowRight } from 'react-icons/fa';

type Stat = {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
};

type Weather = {
  condition: string;
  temp: number | string;
  description: string;
  rainChance: number;
};

type Note = {
    id: number;
    text: string;
    date: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [showRainWarning, setShowRainWarning] = useState(false);
    const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);

    // Modals State
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showResourcesModal, setShowResourcesModal] = useState(false);

    // Timer State
    const [timerTime, setTimerTime] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
    
    // Notes State
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);

    // --- Weather Logic ---
    const getKLUWeather = useCallback(async () => {
        setIsLoadingWeather(true);
        const API_KEY = "960502d5599b08fc80f5ceecf0f8701c";
        const locations = ['Vaddeswaram,Guntur,IN', 'Guntur,IN'];
        let weatherFound = false;

        for (const location of locations) {
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.cod === 200) {
                        const weather = data.weather?.[0];
                        const clouds = data.clouds?.all ?? 0;
                        const rainChance = data.rain ? 100 : Math.min(clouds, 30); // Estimate rain chance based on clouds if not raining
                        
                        const getWeatherEmoji = (icon?: string) => {
                            if (!icon) return '🌤️';
                            const code = icon.slice(0, 2);
                            switch (code) {
                                case '01': return '☀️'; case '02': return '🌤️';
                                case '03': return '🌥️'; case '04': return '☁️';
                                case '09': return '🌧️'; case '10': return '🌦️';
                                case '11': return '⛈️'; case '13': return '❄️';
                                case '50': return '🌫️'; default: return '🌤️';
                            }
                        };

                        const current = {
                            condition: getWeatherEmoji(weather?.icon),
                            temp: Math.round(data.main.temp),
                            description: weather?.description || '',
                            rainChance: rainChance
                        };
                        setCurrentWeather(current);
                        if (rainChance > 50) {
                            setShowRainWarning(true);
                            setTimeout(() => setShowRainWarning(false), 8000);
                        }
                        weatherFound = true;
                        break;
                    }
                }
            } catch (error) {
                console.warn(`Weather fetch failed for ${location}`, error);
            }
        }

        // Fallback if API fails
        if (!weatherFound) {
             console.log("Using fallback weather data");
             setCurrentWeather({
                 condition: '⛅',
                 temp: 28,
                 description: 'Campus Weather (Simulated)',
                 rainChance: 15
             });
        }
        
        setIsLoadingWeather(false);
    }, []);

    // --- Notes Logic ---
    const saveNote = () => {
        if (noteText.trim()) {
            const newNote: Note = { id: Date.now(), text: noteText, date: new Date().toLocaleString() };
            const updatedNotes = [newNote, ...notes];
            setNotes(updatedNotes);
            localStorage.setItem('klu_quickNotes', JSON.stringify(updatedNotes));
            setNoteText('');
        }
    };
    
    const deleteNote = (id: number) => {
        const updatedNotes = notes.filter(note => note.id !== id);
        setNotes(updatedNotes);
        localStorage.setItem('klu_quickNotes', JSON.stringify(updatedNotes));
    };

    // --- Timer Logic ---
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleStartTimer = () => {
        setTimerMode('work');
        setTimerTime(25 * 60);
        setShowTimerModal(true);
        setIsTimerRunning(true);
        // Try requesting permission, but don't block
        try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
                Notification.requestPermission().catch(() => {});
            }
        } catch (e) { console.log('Notification permission error', e); }
    };
    
    const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
    
    const handleSkipTimer = () => {
        const nextMode = timerMode === 'work' ? 'break' : 'work';
        setTimerMode(nextMode);
        setTimerTime(nextMode === 'work' ? 25 * 60 : 5 * 60);
        setIsTimerRunning(true);
    };

    const handleStopTimer = () => {
        setIsTimerRunning(false);
        setShowTimerModal(false);
        setTimerMode('work');
        setTimerTime(25 * 60);
    };

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout> | null = null;
        if (isTimerRunning && timerTime > 0) {
            interval = setInterval(() => {
                setTimerTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isTimerRunning && timerTime <= 0) {
            try {
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    new Notification('KLU Timer', { body: `${timerMode === 'work' ? 'Focus' : 'Break'} session complete!` });
                }
            } catch(e){}
            handleSkipTimer();
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isTimerRunning, timerTime, timerMode]);

    useEffect(() => {
        getKLUWeather();
        try {
            const savedNotes = localStorage.getItem('klu_quickNotes');
            if (savedNotes) setNotes(JSON.parse(savedNotes));
        } catch (e) { console.error("Notes load error", e); }
    }, [getKLUWeather]);

    const stats: Record<'daily' | 'weekly' | 'monthly', Stat[]> = {
        daily: [
            { label: 'Attendance Rate', value: '85%', trend: '+2%', trendUp: true },
            { label: 'Classes Today', value: '6' },
            { label: 'Present Today', value: '5' }
        ],
        weekly: [
            { label: 'Week Progress', value: '90%', trend: 'stable', trendUp: true },
            { label: 'Total Classes', value: '25' },
            { label: 'Missed', value: '2', trend: '-1', trendUp: true }
        ],
        monthly: [
            { label: 'Monthly Target', value: '95%' },
            { label: 'Current Avg', value: '87%', trend: '+5%', trendUp: true },
            { label: 'Classes Left', value: '45' }
        ]
    };
    
    const resources = [
        { name: 'Khan Academy', url: 'https://www.khanacademy.org' },
        { name: 'Coursera', url: 'https://www.coursera.org' },
        { name: 'NPTEL', url: 'https://nptel.ac.in/' },
        { name: 'KL University Library', url: 'https://library.kluniversity.in/' },
    ];

    const tools = [
        { icon: <FaClock/>, title: "Focus Timer", desc: "Pomodoro technique for deep work.", action: handleStartTimer, actionLabel: "Start Session" },
        { icon: <FaBook/>, title: "Library Hub", desc: "Access academic resources & papers.", action: () => setShowResourcesModal(true), actionLabel: "Browse" },
        { icon: <FaStickyNote/>, title: "Holo Notes", desc: "Quick digital sticky notes.", action: () => setShowNotesModal(true), actionLabel: "Open Pad" },
        { icon: <FaUniversity/>, title: "Academic Calendar", desc: "Exam dates & holidays.", link: "https://www.kluniversity.in/site/pdfs/Academic-calendars//College-of-Engineering/2025-26//COLLEGE%20OF%20ENGINEERING/II%20III%20IV%20Year%20B.TECH.pdf", external: true, actionLabel: "Check Schedule" },
        { icon: <FaFileAlt />, title: "Quick Calc", desc: "Instant Subject % Calculator.", link: "/calc3", actionLabel: "Launch" },
        { 
            icon: <FaCloudSunRain />, title: "Campus Weather",
            content: (
                 <div className="text-center mt-3 p-2 bg-surface rounded-lg border border-white/5">
                {isLoadingWeather ? (
                    <div className="flex items-center justify-center gap-2 text-text-muted">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent"></div>
                        <span className="text-xs">Scanning...</span>
                    </div>
                ) : currentWeather ? (
                    <>
                        <div className="flex items-center justify-center gap-3 mb-1">
                            <span className="text-3xl drop-shadow-md">{currentWeather.condition}</span>
                            <span className="text-2xl font-bold text-text-main">{currentWeather.temp}°C</span>
                        </div>
                        <p className="text-text-muted text-xs capitalize">{currentWeather.description}</p>
                        {currentWeather.rainChance > 0 && <p className="text-secondary text-xs mt-1">Precipitation: {currentWeather.rainChance}%</p>}
                    </>
                ) : null}
                 </div>
            )
        },
    ];

    const timerInitialTime = timerMode === 'work' ? 25 * 60 : 5 * 60;
    const timerProgress = 100 - (timerTime / timerInitialTime) * 100;

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
             <AnimatePresence>
             {showRainWarning && (
                <motion.div
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xl bg-gradient-to-r from-accent-light to-accent border-l-4 border-secondary text-text-main p-4 rounded-r-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-4 backdrop-blur-md"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                >
                    <span className="text-2xl animate-pulse">☔</span>
                    <div className="flex-grow">
                        <h4 className="font-bold text-secondary">Weather Alert</h4>
                        <p className="text-sm text-text-muted">Rain detected near campus. Carry an umbrella!</p>
                    </div>
                    <button className="text-xl hover:text-primary transition-colors" onClick={() => setShowRainWarning(false)}>
                        &times;
                    </button>
                </motion.div>
            )}
            </AnimatePresence>

            <motion.header variants={itemVariants} className="relative text-center p-10 rounded-3xl overflow-hidden border border-card-border bg-accent-light/30 backdrop-blur-sm">
                 {/* Decorative elements */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

                <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-secondary to-white animate-glow">Attendance Calculator</span>
                </h1>
                <p className="relative z-10 text-lg text-text-muted max-w-2xl mx-auto mb-8">
                    Optimize your academic trajectory with advanced analytics and projection tools designed for KLU students.
                </p>
                <div className="relative z-10 flex gap-4 justify-center flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/calbyltps" className="group relative inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_0_15px_rgba(255,15,91,0.4)] hover:bg-primary-dark transition-all overflow-hidden">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></span>
                            Launch LTPS Calc <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                         <Link to="/total" className="inline-flex items-center gap-2 px-8 py-3 bg-surface border border-white/10 text-secondary font-semibold rounded-xl hover:bg-surface-hover transition-all">
                            Predict Absences
                        </Link>
                    </motion.div>
                </div>
            </motion.header>

            <motion.section variants={itemVariants} className="p-6 bg-surface border border-card-border rounded-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-bold text-text-main flex items-center gap-2"><FaClipboardList className="text-secondary"/> Dashboard</h2>
                    <div className="flex bg-accent-light p-1 rounded-lg border border-white/5">
                        {(['daily', 'weekly', 'monthly'] as const).map(tab => (
                            <button key={tab} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab ? 'bg-secondary text-accent shadow-lg' : 'text-text-muted hover:text-white'}`} onClick={() => setActiveTab(tab)}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats[activeTab].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-accent/50 p-5 rounded-xl border border-white/5 hover:border-secondary/30 transition-colors group"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-bold text-white group-hover:text-secondary transition-colors">{stat.value}</h3>
                                {stat.trend && (
                                    <span className={`text-xs font-bold mb-1 ${stat.trendUp ? 'text-success' : 'text-primary'}`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-6 text-text-main pl-2 border-l-4 border-primary">Command Center</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div 
                            key={index} 
                            className="group bg-surface p-6 rounded-2xl border border-card-border hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all duration-300 flex flex-col"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-accent-light to-accent border border-white/5 text-2xl text-secondary group-hover:text-primary transition-colors">
                                    {tool.icon}
                                </div>
                                {tool.content && <div className="ml-auto">{tool.content}</div>}
                            </div>
                            
                            <h3 className="text-lg font-bold text-text-main mb-1">{tool.title}</h3>
                            {!tool.content && <p className="text-text-muted text-sm mb-6 line-clamp-2">{tool.desc}</p>}
                            
                             <div className="mt-auto w-full">
                                {tool.action ? (
                                    <button onClick={tool.action} className="w-full py-2 px-4 bg-white/5 border border-white/10 text-text-main text-sm font-semibold rounded-lg hover:bg-secondary hover:text-accent transition-all">
                                        {tool.actionLabel}
                                    </button>
                                ) : tool.link && (
                                    tool.external ? (
                                        <a href={tool.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 px-4 bg-white/5 border border-white/10 text-text-main text-sm font-semibold rounded-lg hover:bg-secondary hover:text-accent transition-all">
                                            {tool.actionLabel}
                                        </a>
                                    ) : (
                                        <Link to={tool.link} className="block w-full text-center py-2 px-4 bg-white/5 border border-white/10 text-text-main text-sm font-semibold rounded-lg hover:bg-secondary hover:text-accent transition-all">
                                            {tool.actionLabel}
                                        </Link>
                                    )
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <AnimatePresence>
                {/* Timer Modal */}
                {showTimerModal && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={handleStopTimer}>
                        <motion.div className="bg-accent-light border border-secondary/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.1)] w-full max-w-sm p-8 text-center relative overflow-hidden" initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} onClick={(e) => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"></div>
                            
                            <div className="flex justify-between items-center mb-8">
                               <h3 className={`text-xl font-bold uppercase tracking-widest ${timerMode === 'work' ? 'text-secondary' : 'text-success'}`}>{timerMode === 'work' ? 'Focus Mode' : 'Recharge'}</h3>
                               <button onClick={handleStopTimer} className="text-text-muted hover:text-primary transition-colors"><FaTimes/></button>
                            </div>
                            
                            <div className="mb-8 relative">
                                <div className="text-8xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {formatTime(timerTime)}
                                </div>
                                <p className="text-text-muted text-sm mt-2">{isTimerRunning ? 'Running...' : 'Paused'}</p>
                            </div>
                            
                            <div className="w-full bg-surface h-2 rounded-full mb-8 overflow-hidden border border-white/5">
                                <motion.div 
                                    className={`h-full ${timerMode === 'work' ? 'bg-secondary' : 'bg-success'} shadow-[0_0_10px_currentColor]`} 
                                    style={{ width: `${timerProgress}%` }}
                                    layoutId="timerBar"
                                />
                            </div>
                            
                            <div className="flex justify-center gap-4">
                                <button onClick={toggleTimer} className={`px-6 py-3 ${timerMode === 'work' ? 'bg-secondary text-accent' : 'bg-success text-accent'} font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all`}>
                                    {isTimerRunning ? <><FaPause/> Pause</> : <><FaPlay/> Resume</>}
                                </button>
                                <button onClick={handleSkipTimer} className="px-6 py-3 bg-surface text-text-main font-bold rounded-lg flex items-center gap-2 hover:bg-surface-hover transition-all border border-white/10">
                                    <FaForward/> Skip
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Notes Modal */}
                {showNotesModal && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={() => setShowNotesModal(false)}>
                        <motion.div className="bg-accent-light border border-primary/30 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col h-[500px]" initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 20, opacity: 0}} onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                               <h3 className="text-2xl font-bold text-text-main flex items-center gap-2"><FaStickyNote className="text-primary"/> Quick Notes</h3>
                               <button onClick={() => setShowNotesModal(false)} className="text-text-muted hover:text-white"><FaTimes/></button>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4">
                                {notes.length > 0 ? notes.map(note => (
                                    <motion.div key={note.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-3 rounded-lg border-l-4 border-secondary flex justify-between items-start group">
                                        <div>
                                            <p className="text-text-main text-sm whitespace-pre-wrap">{note.text}</p>
                                            <p className="text-[10px] text-text-muted mt-1">{note.date}</p>
                                        </div>
                                        <button onClick={() => deleteNote(note.id)} className="text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1"><FaTrash size={12}/></button>
                                    </motion.div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
                                        <FaStickyNote size={40} className="mb-2"/>
                                        <p>No notes yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/10">
                                <textarea 
                                    value={noteText} 
                                    onChange={(e) => setNoteText(e.target.value)} 
                                    placeholder="Type something..." 
                                    className="w-full p-3 bg-accent border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm h-20 resize-none text-white"
                                />
                                <button onClick={saveNote} disabled={!noteText.trim()} className="w-full py-2 bg-primary text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors">
                                    Save Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                 {/* Resources Modal */}
                 {showResourcesModal && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={() => setShowResourcesModal(false)}>
                        <motion.div className="bg-accent-light border border-secondary/20 rounded-2xl shadow-2xl w-full max-w-md p-6" initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
                               <h3 className="text-xl font-bold text-text-main">External Resources</h3>
                               <button onClick={() => setShowResourcesModal(false)} className="text-text-muted hover:text-white"><FaTimes/></button>
                            </div>
                            <ul className="space-y-3">
                                {resources.map(resource => (
                                    <li key={resource.name}>
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-surface rounded-lg text-text-main font-medium hover:bg-secondary/10 hover:border-secondary/50 border border-transparent transition-all group">
                                            {resource.name}
                                            <FaArrowRight className="text-text-muted group-hover:text-secondary group-hover:-rotate-45 transition-all" size={14} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Home;
