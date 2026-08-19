import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users, Edit3, Cpu, ShieldCheck, Sparkles, MessageSquare, Zap, Globe, ArrowRight, BookOpen, Layers
} from 'lucide-react';

const About = () => {
  const { userCount, blogCount, writerCount } = useAuth();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const techRef = useRef(null);
  const visionRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const techInView = useInView(techRef, { once: true, amount: 0.3 });
  const visionInView = useInView(visionRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5e6c8] overflow-hidden selection:bg-[#c9a84c] selection:text-black">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#c9a84c]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#c9a84c]/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative py-28 px-6 text-center border-b border-[#24221c] bg-gradient-to-b from-[#0f0f12] via-[#0a0a0c] to-[#0a0a0c]"
      >
        <div className="max-w-5xl mx-auto relative z-10">
          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181c] border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-extrabold uppercase tracking-widest mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Collaborative Publishing Platform</span>
          </motion.div> */}

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-[#f5e6c8]">
            Empowering Thinkers, Co-Authors &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f]">
              Global Storytellers
            </span>
          </h1>

          <p className="text-lg sm:text-2xl font-normal max-w-3xl mx-auto leading-relaxed text-[#9c9486] mb-10">
            BlogSphere merges real-time collaborative document editing, intelligent semantic AI search, and instant author communication into a single unified publishing ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/writeblog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-sm rounded-full shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 transition-all no-underline"
            >
              <span>Start Writing Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/allblog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#141416] border border-[#24221c] hover:border-[#c9a84c]/50 text-[#f5e6c8] font-bold text-sm rounded-full transition-all no-underline"
            >
              <BookOpen className="w-4 h-4 text-[#c9a84c]" />
              <span>Explore Publications</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Core Architectural Pillars Section */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-24 px-6 relative bg-[#0a0a0c]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#f5e6c8] mb-4">
              Architected for Innovation
            </h2>
            <p className="text-base sm:text-lg text-[#9c9486]">
              Built with industry-leading modern web technology to deliver instant syncing, discovery, and seamless co-author workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Edit3 className="w-6 h-6 text-[#c9a84c]" />,
                title: "Live Collaborative Editing",
                description: "Simultaneous multi-user CRDT document syncing powered by Yjs & TipTap with real-time cursor awareness."
              },
              {
                icon: <Cpu className="w-6 h-6 text-[#c9a84c]" />,
                title: "Semantic AI Search Engine",
                description: "High-dimensional vector embeddings for deep contextual content discovery beyond keyword matching."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-[#c9a84c]" />,
                title: "Granular Co-Author Controls",
                description: "Original authors retain full control while delegating secure edit access to designated collaborators."
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-[#c9a84c]" />,
                title: "Real-Time Community Chat",
                description: "Built-in Socket.io messaging allowing authors and co-authors to brainstorm and exchange feedback."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariant}
                className="bg-[#121214] p-8 rounded-3xl border border-[#24221c] hover:border-[#c9a84c]/40 transition-all group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1c1a16] border border-[#c9a84c]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#f5e6c8] mb-3 group-hover:text-[#c9a84c] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[#9c9486] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Live Platform Analytics */}
      <motion.section
        ref={visionRef}
        initial="hidden"
        animate={visionInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-20 px-6 bg-[#111113] border-y border-[#24221c] relative"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: `${writerCount || 0}+`, label: "Registered Authors", icon: <Users className="w-5 h-5 text-[#c9a84c] mx-auto mb-2" /> },
              { number: `${blogCount || 0}+`, label: "Published Stories", icon: <BookOpen className="w-5 h-5 text-[#c9a84c] mx-auto mb-2" /> },
              { number: `${userCount || 0}+`, label: "Active Community Members", icon: <Globe className="w-5 h-5 text-[#c9a84c] mx-auto mb-2" /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#141416] p-8 rounded-3xl border border-[#24221c] shadow-lg">
                {stat.icon}
                <div className="text-4xl sm:text-5xl font-extrabold text-[#c9a84c] mb-2 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-xs uppercase tracking-wider text-[#9c9486] font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Modern Technology Stack Badge Grid */}
      <motion.section
        ref={techRef}
        initial="hidden"
        animate={techInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-20 px-6 bg-[#0a0a0c]"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs uppercase tracking-widest text-[#c9a84c] font-bold">
            <Layers className="w-4 h-4" />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-3xl font-bold text-[#f5e6c8] mb-8">
            Powered by modern distributed architecture
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "React 19", "Vite", "TipTap Rich Text", "Yjs CRDT Engine", "y-websocket",
              "Socket.io", "Node.js", "Express.js", "MongoDB Mongoose", "Tailwind CSS v4"
            ].map((tech, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-[#121214] border border-[#24221c] rounded-full text-xs font-semibold text-[#f5e6c8] hover:border-[#c9a84c]/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final Call To Action */}
      <motion.section
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-24 px-6 text-center bg-gradient-to-b from-[#0a0a0c] via-[#111113] to-[#0a0a0c] border-t border-[#24221c]"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#f5e6c8]">
            Ready to shape the future of collaborative writing?
          </h2>
          <p className="text-base sm:text-lg text-[#9c9486]">
            Join BlogSphere today to draft, collaborate in real-time, and publish your ideas to a global audience.
          </p>
          <div className="pt-4">
            <Link
              to="/writeblog"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-base rounded-full shadow-xl shadow-[#c9a84c]/20 hover:brightness-110 transition-all no-underline"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;