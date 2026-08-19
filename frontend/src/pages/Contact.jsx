'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [activeFaq, setActiveFaq] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 90
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.92, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 16,
        stiffness: 110
      }
    }
  };

  // Refs for scroll animations
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  const contactInfoRef = useRef(null);
  const contactInfoInView = useInView(contactInfoRef, { once: true, amount: 0.2 });

  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, amount: 0.2 });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message. Please try again later.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How quickly can I expect a response?",
      answer: "We aim to reply to all inquiries within 2 to 4 hours during business days."
    },
    {
      question: "Can I collaborate or guest post on BlogSphere?",
      answer: "Absolutely! Drop us a message with your topic idea and our editorial team will get back to you."
    },
    {
      question: "Where is BlogSphere headquarters located?",
      answer: "Our core team is based out of IIT Kharagpur, West Bengal, India."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080a] text-[#f5e6c8] selection:bg-[#c9a84c]/30 selection:text-[#f5e6c8]">
      
      {/* Background Lighting & Grid Texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#c9a84c]/15 via-[#dfc067]/5 to-transparent rounded-full filter blur-[120px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#c9a84c]/10 rounded-full filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-10 -left-40 w-96 h-96 bg-[#dfc067]/10 rounded-full filter blur-[100px] animate-pulse [animation-delay:3s]"></div>
        
        {/* Subtle SVG Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2026_1px,transparent_1px),linear-gradient(to_bottom,#1f2026_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16171b] border border-[#2d2b24] mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-ping"></span>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#c9a84c]">
              Support & Inquiries
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6"
          >
            Let's Start a <span className="bg-gradient-to-r from-[#f5e6c8] via-[#dfc067] to-[#b8943f] bg-clip-text text-transparent">Conversation</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl text-[#9c9486] max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Have a question, feedback, or a partnership proposal? We'd love to hear from you. Fill out the form below or reach us directly.
          </motion.p>
        </motion.div>

        {/* Main Grid Section */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Cards & Info (5 cols) */}
          <motion.div
            ref={contactInfoRef}
            initial="hidden"
            animate={contactInfoInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className="lg:col-span-5 space-y-6 order-2 lg:order-1"
          >
            {/* Status Card */}
            <motion.div
              variants={cardVariants}
              className="p-6 rounded-2xl bg-gradient-to-r from-[#14151a] to-[#1a1b22] border border-[#2b2923] flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Average Response Time</h4>
                  <p className="text-xs text-[#9c9486]">Under 2 hours during working hours</p>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            </motion.div>

            {/* Visit Us Card */}
            <motion.div
              variants={cardVariants}
              className="group relative p-7 bg-[#111216]/90 backdrop-blur-xl rounded-3xl border border-[#23221e] hover:border-[#c9a84c]/50 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-start space-x-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#c9a84c]/15">
                  <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Our Location</h3>
                  <p className="text-sm text-[#9c9486] mb-3">Drop by for a coffee and chat</p>
                  <p className="text-sm text-[#f5e6c8] font-medium leading-relaxed">
                    IIT Kharagpur, Kharagpur,<br />
                    West Bengal - 721302, India
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Direct Channels (Email & Phone Grid) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                variants={cardVariants}
                className="group p-6 bg-[#111216]/90 backdrop-blur-xl rounded-2xl border border-[#23221e] hover:border-[#c9a84c]/50 transition-all duration-300 shadow-lg"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Email Us</h4>
                <a href="mailto:blogspherehelpdesk@gmail.com" className="text-xs text-[#9c9486] hover:text-[#c9a84c] transition-colors break-all">
                  blogspherehelpdesk@gmail.com
                </a>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="group p-6 bg-[#111216]/90 backdrop-blur-xl rounded-2xl border border-[#23221e] hover:border-[#c9a84c]/50 transition-all duration-300 shadow-lg"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Phone Line</h4>
                <a href="tel:+919837716501" className="text-xs text-[#9c9486] hover:text-[#c9a84c] transition-colors">
                  +91 98377 16501
                </a>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div
              variants={cardVariants}
              className="p-6 bg-[#111216]/90 backdrop-blur-xl rounded-2xl border border-[#23221e] flex items-center justify-between shadow-lg"
            >
              <span className="text-xs font-semibold text-[#9c9486] uppercase tracking-wider">Connect Online</span>
              <div className="flex items-center space-x-3">
                {[
                  { name: 'LinkedIn', icon: './Linkedin.svg', link: 'https://www.linkedin.com/in/arka-ghosh-2729b529a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' },
                  { name: 'Instagram', icon: './Insta.svg', link: 'https://www.instagram.com/arkaghosh10007?igsh=cnhvOGd2N2Vpazln' },
                  { name: 'Facebook', icon: './Facebook.svg', link: 'https://www.facebook.com/share/1DvvUmbNCh/' }
                ].map((social, index) => (
                  <a
                    key={index}
                    target="_blank"
                    rel="noreferrer"
                    href={social.link}
                    title={social.name}
                    className="w-10 h-10 bg-[#191b22] border border-[#2d2c25] hover:border-[#c9a84c] rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md group"
                  >
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-5 h-5 text-[#c9a84c] filter brightness-0 invert group-hover:brightness-100 transition-all"
                    />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Contact Form (7 cols) */}
          <motion.div
            ref={formRef}
            initial="hidden"
            animate={formInView ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <div className="relative p-8 sm:p-10 bg-[#111216]/95 backdrop-blur-2xl rounded-3xl border border-[#26241e] shadow-2xl shadow-black/80">
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Send a Direct Message
                </h3>
                <p className="text-sm text-[#9c9486]">
                  Fill out your details below and we will get back to you promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#b8ab96] uppercase tracking-wider mb-2">
                      Your Name <span className="text-[#c9a84c]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-[#090a0d] border border-[#282620] rounded-xl text-[#f5e6c8] placeholder-[#5c564c] text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-200"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#b8ab96] uppercase tracking-wider mb-2">
                      Your Email <span className="text-[#c9a84c]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-[#090a0d] border border-[#282620] rounded-xl text-[#f5e6c8] placeholder-[#5c564c] text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#b8ab96] uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="General Inquiry / Feedback / Collaboration"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-[#090a0d] border border-[#282620] rounded-xl text-[#f5e6c8] placeholder-[#5c564c] text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-200"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#b8ab96] uppercase tracking-wider mb-2">
                    Message <span className="text-[#c9a84c]">*</span>
                  </label>
                  <textarea
                    name="message"
                    placeholder="Write your detailed message here..."
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-[#090a0d] border border-[#282620] rounded-xl text-[#f5e6c8] placeholder-[#5c564c] text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] hover:from-[#f3e5ab] hover:to-[#c9a84c] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <span>Sending Message...</span>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Quick FAQ Section */}
        <div className="mt-24 pt-16 border-t border-[#1f2026] max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-sm text-[#9c9486]">Quick answers to common inquiries</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#111216] border border-[#21201a] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-[#f5e6c8] hover:text-[#c9a84c] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="text-lg text-[#c9a84c] leading-none">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs text-[#9c9486] leading-relaxed border-t border-[#1a1b20] pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;