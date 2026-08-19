import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { userCount, blogCount, writerCount } = useAuth();

  return (
    <footer className="bg-[#08080a] border-t border-[#24221c] text-[#9c9486] py-12 px-6 text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#dfc067] to-[#c9a84c] flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
                B
              </div>
              <span className="text-lg font-bold text-[#f5e6c8] tracking-tight">
                Blog<span className="text-[#c9a84c]">Sphere</span>
              </span>
            </div>
            <p className="text-xs text-[#9c9486] leading-relaxed mb-4">
              Next-generation publishing platform integrating AI vector search, content auto-enrichment, and personalized reader recommendations.
            </p>
            <Link
              to="/writeblog"
              className="inline-block px-4 py-2 rounded-full bg-[#141416] border border-[#24221c] text-[#f5e6c8] text-xs font-semibold hover:border-[#c9a84c]/50 transition-colors"
            >
              Publish a Story
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-[#f5e6c8] transition-colors">Home</Link></li>
              <li><Link to="/allblog" className="hover:text-[#f5e6c8] transition-colors">All Blogs</Link></li>
              <li><Link to="/writeblog" className="hover:text-[#f5e6c8] transition-colors">Write Blog</Link></li>
              <li><Link to="/myblogs" className="hover:text-[#f5e6c8] transition-colors">My Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-[#f5e6c8] transition-colors">About Project</Link></li>
              <li><Link to="/contact" className="hover:text-[#f5e6c8] transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Platform Metrics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c] mb-3">
              System Metrics
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between border-b border-[#1a1917] pb-1">
                <span>Active Writers</span>
                <strong className="text-[#f5e6c8] font-medium">{writerCount || 0}</strong>
              </li>
              <li className="flex justify-between border-b border-[#1a1917] pb-1">
                <span>Total Stories</span>
                <strong className="text-[#f5e6c8] font-medium">{blogCount || 0}</strong>
              </li>
              <li className="flex justify-between border-b border-[#1a1917] pb-1">
                <span>Total Readers</span>
                <strong className="text-[#f5e6c8] font-medium">{userCount || 0}</strong>
              </li>
              <li className="flex justify-between">
                <span>Vector Model</span>
                <strong className="text-[#c9a84c] font-mono text-[11px]">all-MiniLM-L6-v2</strong>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c] mb-3">
              Contact & Social
            </h4>
            <p className="text-xs text-[#9c9486] mb-3">
              Nehru Hall of Residence, IIT Kharagpur<br />
              Email: blogspherehelpdesk@gmail.com
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.linkedin.com/in/arka-ghosh-2729b529a"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-[#141416] border border-[#24221c] text-[#9c9486] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
                </svg>
              </a>
              <a
                href="https://github.com/ArkaKGP"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-[#141416] border border-[#24221c] text-[#9c9486] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#1a1917] text-center text-xs text-[#7c7569] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} BlogSphere Platform. All rights reserved.</span>
          <span>Architected with React, Vite, Node.js & Python FastAPI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;