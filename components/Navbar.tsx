
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope, FaUser, FaBars, FaTimes, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const pages = [
  { label: 'Dashboard', path: '/' },
  { label: 'L-T-P-S Calc', path: '/calbyltps' },
  { label: 'Absence Projector', path: '/total' },
  { label: 'Subject Calc', path: '/calc3' }
];

const socialLinks = [
  { icon: <FaGithub />, name: 'GitHub', url: 'https://github.com/kushichowdary' },
  { icon: <FaLinkedin />, name: 'LinkedIn', url: 'https://www.linkedin.com/in/kushichowdary' },
  { icon: <FaEnvelope />, name: 'Contact', url: 'mailto:gearhead6699@gmail.com' },
  { icon: <FaUser />, name: 'About Me', url: 'https://portfolio-website-bay-six.vercel.app/' }
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses = "relative px-4 py-2 text-sm font-medium text-text-muted rounded-lg transition-all duration-300 hover:text-secondary hover:bg-surface-hover";
  const activeNavLinkClasses = "text-secondary bg-secondary/10 shadow-[0_0_10px_rgba(0,229,255,0.2)] border border-secondary/20";

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-8 lg:mx-12 rounded-2xl glass-panel shadow-lg border-card-border">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                 <FaGraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-text-main text-xl font-bold tracking-wider group-hover:text-secondary transition-colors">
                KLU<span className="text-primary">.Calc</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {pages.map((page) => (
                <NavLink key={page.path} to={page.path} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                  {page.label}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="hidden md:flex items-center space-x-1">
            {socialLinks.map((link) => (
              <motion.a 
                whileHover={{ scale: 1.1, color: '#00E5FF' }}
                key={link.name} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={link.name} 
                className="p-2 text-text-muted transition-colors"
              >
                {link.icon}
              </motion.a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-white hover:bg-surface-hover focus:outline-none"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-card-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {pages.map((page) => (
                <NavLink
                  key={page.path}
                  to={page.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${isActive ? 'bg-primary/20 text-primary' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}
                >
                  {page.label}
                </NavLink>
              ))}
              <div className="pt-4 mt-4 border-t border-card-border flex justify-center space-x-6">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-secondary text-xl transition-colors">
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
