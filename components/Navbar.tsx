
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope, FaUser, FaBars, FaTimes, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const pages = [
  { label: 'Home', path: '/' },
  { label: 'Attendance by L-T-P-S', path: '/calbyltps' },
  { label: 'Attendance When Absent', path: '/total' },
  { label: 'Subject Attendance', path: '/calc3' }
];

const socialLinks = [
  { icon: <FaGithub />, name: 'GitHub', url: 'https://github.com/kushichowdary' },
  { icon: <FaLinkedin />, name: 'LinkedIn', url: 'https://www.linkedin.com/in/kushichowdary' },
  { icon: <FaEnvelope />, name: 'Contact', url: 'mailto:gearhead6699@gmail.com' },
  { icon: <FaUser />, name: 'About Me', url: 'https://portfolio-website-bay-six.vercel.app/' }
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses = "relative px-3 py-2 text-sm font-medium text-light-text rounded-md transition-colors duration-300 hover:text-white hover:bg-white/10";
  const activeNavLinkClasses = "bg-primary/20 text-white";

  return (
    <nav className="sticky top-0 z-50 bg-accent-dark/80 backdrop-blur-lg border-b border-card-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <FaGraduationCap className="h-8 w-8 text-primary group-hover:animate-pulse" />
              <span className="text-white text-xl font-bold tracking-wider group-hover:text-alt-text transition-colors">
                KLU-Cal
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {pages.map((page) => (
                <NavLink key={page.path} to={page.path} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                  {page.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {socialLinks.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name} className="p-2 text-muted-text hover:text-white transition-colors">
                {link.icon}
              </a>
            ))}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-text hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-accent-dark focus:ring-white"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {pages.map((page) => (
                <NavLink
                  key={page.path}
                  to={page.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${isActive ? 'bg-primary text-white' : 'text-muted-text hover:bg-white/10 hover:text-white'}`}
                >
                  {page.label}
                </NavLink>
              ))}
              <div className="pt-4 mt-4 border-t border-card-border flex justify-center space-x-4">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-text hover:text-white transition-colors">
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
