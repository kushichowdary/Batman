
import React, { useState, useEffect, useCallback, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaCalendarAlt, FaClipboardList, FaFileAlt, FaClock, FaBook, FaCloudSunRain, FaStickyNote, FaUniversity, FaTrash, FaPlay, FaPause, FaForward, FaTimes } from 'react-icons/fa';

type Stat = {
  label: string;
  value: string;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
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
        // Define primary and fallback locations
        const locations = ['Vaddeswaram,Guntur,IN', 'Guntur,IN'];
        let weatherData = null;

        // Attempt to fetch weather from the list of locations
        for (const location of locations) {
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`);
                if (res.ok) {
                    const data = await res.json();
                    // OpenWeatherMap returns cod: 200 on success
                    if (data.cod === 200) {
                        weatherData = data;
                        break; // Success, exit the loop
                    }
                }
            } catch (error) {
                console.warn(`Could not fetch weather for ${location}:`, error);
                // Continue to the next location
            }
        }

        if (weatherData) {
            // Process the successful weather data
            const weather = weatherData.weather?.[0];
            const clouds = weatherData.clouds?.all ?? 0;
            const rainChance = weatherData.rain ? 100 : clouds;

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
                temp: Math.round(weatherData.main.temp),
                description: weather?.description || '',
                rainChance: rainChance
            };
            setCurrentWeather(current);
            if (current.rainChance > 50) {
                setShowRainWarning(true);
                setTimeout(() => setShowRainWarning(false), 10000);
            }
        } else {
            // Handle failure for all locations
            console.error('Failed to fetch weather for all provided locations.');
            setCurrentWeather({ condition: '❓', temp: '--', description: 'Weather unavailable', rainChance: 0 });
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
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
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
        // FIX: Use ReturnType<typeof setTimeout> for browser environments instead of NodeJS.Timeout.
        let interval: ReturnType<typeof setTimeout> | null = null;
        if (isTimerRunning && timerTime > 0) {
            interval = setInterval(() => {
                setTimerTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isTimerRunning && timerTime <= 0) {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: `${timerMode === 'work' ? 'Work' : 'Break'} session finished!`,
                });
            }
            handleSkipTimer();
        }
        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTimerRunning, timerTime]);

    // --- Initial Data Loading ---
    useEffect(() => {
        getKLUWeather();
        try {
            const savedNotes = localStorage.getItem('klu_quickNotes');
            if (savedNotes) setNotes(JSON.parse(savedNotes));
        } catch (e) {
            console.error("Failed to load notes from localStorage", e);
        }
    }, [getKLUWeather]);

    const stats: Record<'daily' | 'weekly' | 'monthly', Stat[]> = {
        daily: [{ label: 'Average Attendance', value: '85%' }, { label: 'Classes Today', value: '6' }, { label: 'Present Today', value: '5' }],
        weekly: [{ label: 'Week Progress', value: '90%' }, { label: 'Total Classes', value: '25' }, { label: 'Attendance Rate', value: '88%' }],
        monthly: [{ label: 'Monthly Target', value: '95%' }, { label: 'Current Status', value: '87%' }, { label: 'Classes Left', value: '45' }]
    };
    
    const resources = [
        { name: 'Khan Academy', url: 'https://www.khanacademy.org' },
        { name: 'Coursera', url: 'https://www.coursera.org' },
        { name: 'YouTube Education', url: 'https://www.youtube.com/education' },
        { name: 'KL University Library', url: 'https://library.kluniversity.in/' },
    ];

    const tools = [
        { icon: <FaClock/>, title: "Study Timer", desc: "Pomodoro technique timer for focused study sessions.", action: handleStartTimer, actionLabel: "Start Timer" },
        { icon: <FaBook/>, title: "Study Resources", desc: "Quick access to academic resources, libraries, and materials.", action: () => setShowResourcesModal(true), actionLabel: "View Resources" },
        { icon: <FaStickyNote/>, title: "Quick Notes", desc: "Jot down important reminders, to-dos, or study notes.", action: () => setShowNotesModal(true), actionLabel: "Add Note" },
        { icon: <FaUniversity/>, title: "Academic Calendar", desc: "View important dates, holidays, and exam schedules.", link: "https://www.kluniversity.in/site/pdfs/Academic-calendars//College-of-Engineering/2025-26//COLLEGE%20OF%20ENGINEERING/II%20III%20IV%20Year%20B.TECH.pdf", external: true, actionLabel: "View Calendar" },
        { icon: <FaFileAlt />, title: "Quick Calculate", desc: "Instantly calculate your attendance percentage for any subject.", link: "/calc3", actionLabel: "Open Tool" },
        { 
            icon: <FaCloudSunRain />, title: "KLU Campus Weather",
            content: (
                 <div className="text-center mt-2">
                {isLoadingWeather ? (
                    <div className="flex items-center justify-center gap-2 text-muted-text">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span>Loading...</span>
                    </div>
                ) : currentWeather ? (
                    <>
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <span className="text-4xl">{currentWeather.condition}</span>
                            <span className="text-3xl font-bold text-light-text">{currentWeather.temp}°C</span>
                        </div>
                        <p className="text-muted-text text-sm capitalize">{currentWeather.description}</p>
                        <p className="text-muted-text text-sm">Rain chance: {currentWeather.rainChance}%</p>
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
            className="space-y-8 md:space-y-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
             {showRainWarning && (
                <motion.div
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl bg-gradient-to-r from-primary to-primary-dark text-white p-4 rounded-lg shadow-2xl flex items-center gap-4"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                >
                    <span className="text-3xl">🌧️</span>
                    <span className="font-semibold flex-grow">
                        Rain expected at KL University! Don't forget your umbrella! ☔
                    </span>
                    <button className="text-2xl hover:scale-110 transition-transform" onClick={() => setShowRainWarning(false)}>
                        &times;
                    </button>
                </motion.div>
            )}

            <motion.header variants={itemVariants} className="text-center p-8 bg-card-bg/50 rounded-2xl border border-card-border shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 to-primary/20 opacity-30"></div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-gradientShift bg-gradient-to-r from-alt-text via-primary to-alt-text bg-clip-text text-transparent bg-[200%_auto]">
                    KLU Attendance Calculator
                </h1>
                <p className="text-lg md:text-xl text-muted-text max-w-3xl mx-auto">
                    Your futuristic hub for tracking attendance, managing schedules, and maximizing your academic performance.
                </p>
                <div className="mt-8 flex gap-4 justify-center flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/calbyltps" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300">
                            Calculate Now <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                         <Link to="/total" className="inline-flex items-center gap-2 px-8 py-3 bg-card-bg text-light-text font-semibold rounded-lg shadow-lg hover:bg-card-border transition-all duration-300">
                            View Statistics 📊
                        </Link>
                    </motion.div>
                </div>
            </motion.header>

            <motion.section variants={itemVariants} className="p-6 bg-card-bg rounded-2xl border border-card-border shadow-xl">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-light-text">Attendance Overview</h2>
                    <div className="flex bg-surface p-1 rounded-full">
                        {(['daily', 'weekly', 'monthly'] as const).map(tab => (
                            <button key={tab} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-text hover:bg-card-border'}`} onClick={() => setActiveTab(tab)}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats[activeTab].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-surface p-5 rounded-xl text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                            <p className="text-muted-text text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section variants={itemVariants}>
                <h2 className="text-2xl font-bold text-center mb-6 text-light-text">Student Tools & Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div key={index} className="bg-card-bg p-6 rounded-2xl border border-card-border shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="text-4xl text-primary mb-4">{tool.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-light-text">{tool.title}</h3>
                            {tool.desc && <p className="text-muted-text mb-4 flex-grow">{tool.desc}</p>}
                            {tool.content}
                             <div className="mt-auto pt-4 w-full">
                                {tool.action ? (
                                    <button onClick={tool.action} className="w-full text-center py-2 px-4 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 transition-colors">
                                        {tool.actionLabel}
                                    </button>
                                ) : tool.link && (
                                    tool.external ? (
                                        <a href={tool.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 px-4 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 transition-colors">
                                            {tool.actionLabel}
                                        </a>
                                    ) : (
                                        <Link to={tool.link} className="block w-full text-center py-2 px-4 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 transition-colors">
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
                    // FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations.
                    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" variants={modalOverlayVariants} initial="hidden" animate="visible" exit="exit" onClick={handleStopTimer}>
                        {/* FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations. */}
                        <motion.div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" variants={modalContentVariants} initial="hidden" animate="visible" exit="exit" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                               <h3 className={`text-2xl font-bold ${timerMode === 'work' ? 'text-primary' : 'text-success'}`}>{timerMode === 'work' ? 'Focus Session' : 'Break Time'}</h3>
                               <button onClick={handleStopTimer} className="text-muted-text hover:text-white"><FaTimes/></button>
                            </div>
                            <div className="my-8">
                                <p className="text-7xl font-mono font-bold text-light-text tracking-widest">{formatTime(timerTime)}</p>
                            </div>
                            <div className="w-full bg-surface h-2 rounded-full mb-6">
                                <motion.div className={`h-2 rounded-full ${timerMode === 'work' ? 'bg-primary' : 'bg-success'}`} style={{ width: `${timerProgress}%` }}></motion.div>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={toggleTimer} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg flex items-center gap-2">{isTimerRunning ? <><FaPause/> Pause</> : <><FaPlay/> Resume</>}</button>
                                <button onClick={handleSkipTimer} className="px-6 py-2 bg-surface text-light-text font-semibold rounded-lg flex items-center gap-2"><FaForward/> Skip</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Notes Modal */}
                {showNotesModal && (
                    // FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations.
                    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" variants={modalOverlayVariants} initial="hidden" animate="visible" exit="exit" onClick={() => setShowNotesModal(false)}>
                        {/* FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations. */}
                        <motion.div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col" variants={modalContentVariants} initial="hidden" animate="visible" exit="exit" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-card-border">
                               <h3 className="text-2xl font-bold text-light-text">Quick Notes</h3>
                               <button onClick={() => setShowNotesModal(false)} className="text-muted-text hover:text-white"><FaTimes/></button>
                            </div>
                            <div className="flex flex-col gap-4 mb-4">
                                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Jot down a quick note..." className="w-full p-3 bg-surface border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none h-28 resize-none"/>
                                <button onClick={saveNote} disabled={!noteText.trim()} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Save Note</button>
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-3 max-h-64 pr-2">
                                {notes.length > 0 ? notes.map(note => (
                                    <motion.div key={note.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface p-3 rounded-lg flex justify-between items-start gap-2">
                                        <div>
                                            <p className="text-light-text">{note.text}</p>
                                            <p className="text-xs text-muted-text">{note.date}</p>
                                        </div>
                                        <button onClick={() => deleteNote(note.id)} className="text-muted-text hover:text-primary p-1"><FaTrash/></button>
                                    </motion.div>
                                )) : <p className="text-muted-text text-center py-8">No notes yet.</p>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                 {/* Resources Modal */}
                 {showResourcesModal && (
                    // FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations.
                    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" variants={modalOverlayVariants} initial="hidden" animate="visible" exit="exit" onClick={() => setShowResourcesModal(false)}>
                        {/* FIX: Replaced spread operator with variants, initial, animate, and exit props to correctly apply framer-motion animations. */}
                        <motion.div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-6" variants={modalContentVariants} initial="hidden" animate="visible" exit="exit" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-card-border">
                               <h3 className="text-2xl font-bold text-light-text">Study Resources</h3>
                               <button onClick={() => setShowResourcesModal(false)} className="text-muted-text hover:text-white"><FaTimes/></button>
                            </div>
                            <ul className="space-y-3">
                                {resources.map(resource => (
                                    <li key={resource.name}>
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-surface rounded-lg text-light-text font-semibold hover:bg-primary/20 hover:text-primary transition-colors">
                                            {resource.name}
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
