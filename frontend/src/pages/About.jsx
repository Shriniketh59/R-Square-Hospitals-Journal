import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Globe, Users, Award, Microscope, Heart, Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-transparent min-h-screen">
      {/* Header Section */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
            >
                Our Mission & <span className="text-primary-400">Legacy</span>
            </motion.h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                Empowering the global medical community through rigorous research, 
                ethical standards, and open-access knowledge dissemination.
            </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-slate prose-lg max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                <div className="col-span-2">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center">
                        <div className="w-2 h-8 bg-primary-600 rounded-full mr-4"></div>
                        The Foundation of Excellence
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                        R Square Hospitals Journal (RSHJ) was founded in 2012 with a singular, ambitious goal: to bridge the gap between clinical practice and academic research. In an era where medical information is abundant but often fragmented, RSHJ serves as a curated, high-impact repository for the latest clinical breakthroughs and healthcare innovations.
                    </p>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        Based in the heart of New Delhi and affiliated with the prestigious R Square Hospitals Group, the journal has evolved from a regional publication into a globally recognized authority in medical research. Our commitment to the highest standards of peer-review ensures that every article we publish contributes meaningfully to the global body of medical knowledge.
                    </p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center items-center text-center">
                    <Award className="h-16 w-16 text-primary-600 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-2">Accredited</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ISO 9001:2015 Certified</p>
                </div>
            </div>

            <div className="space-y-16">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Our Core Philosophy</h2>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                        At R Square Hospitals Journal, we believe that access to high-quality medical research is a fundamental right, not a privilege. This philosophy drives our "Open Access" mandate, ensuring that clinicians, students, and researchers worldwide can access our entire archive without financial barriers. By removing these hurdles, we accelerate the translation of laboratory discoveries into bedside treatments.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-12">
                        <div className="p-8 bg-primary-50 rounded-3xl">
                            <h4 className="text-primary-700 font-black mb-3 text-lg">Integrity First</h4>
                            <p className="text-sm text-primary-600 font-medium">Our double-blind peer-review process is managed by international experts to ensure absolute objectivity and scientific merit.</p>
                        </div>
                        <div className="p-8 bg-teal-50 rounded-3xl">
                            <h4 className="text-teal-700 font-black mb-3 text-lg">Innovation Driven</h4>
                            <p className="text-sm text-teal-600 font-medium">We prioritize research that explores the boundaries of digital medicine, robotic surgery, and advanced genomics.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Rigorous Peer Review Process</h2>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                        The integrity of medical science rests on the quality of peer review. Every manuscript submitted to RSHJ undergoes a multi-stage evaluation process:
                    </p>
                    <ul className="list-none space-y-4 text-slate-600 font-medium">
                        <li className="flex items-center space-x-3">
                            <div className="p-1 bg-blue-100 rounded-full text-blue-600"><ShieldCheck className="h-4 w-4" /></div>
                            <span><strong>Initial Screening:</strong> Evaluation for scope, formatting, and plagiarism check.</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="p-1 bg-blue-100 rounded-full text-blue-600"><ShieldCheck className="h-4 w-4" /></div>
                            <span><strong>Expert Review:</strong> Double-blind evaluation by at least three independent domain specialists.</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <div className="p-1 bg-blue-100 rounded-full text-blue-600"><ShieldCheck className="h-4 w-4" /></div>
                            <span><strong>Editorial Decision:</strong> Final review by the Editor-in-Chief based on reviewer recommendations.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white">
                    <h2 className="text-3xl font-black mb-8 text-white">Global Reach & Impact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Today, R Square Hospitals Journal is indexed in major global databases, including PubMed Central, Scopus, EMBASE, and the Directory of Open Access Journals (DOAJ). With an impact factor of 4.8 and over 1.5 million annual downloads, we are proud to be a catalyst for medical progress in both developed and emerging healthcare systems.
                            </p>
                            <div className="flex items-center space-x-6">
                                <div>
                                    <p className="text-3xl font-black text-primary-400">200k+</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Readers</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-teal-400">85%</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Authorship</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                                <Globe className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                                <span className="text-xs font-bold text-slate-300">120+ Countries</span>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                                <Users className="h-8 w-8 text-teal-400 mx-auto mb-3" />
                                <span className="text-xs font-bold text-slate-300">5k+ Reviewers</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Looking to the Future</h2>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                        As we look toward the next decade, R Square Hospitals Journal remains committed to embracing the technological transformations in medicine. We are currently integrating AI-driven semantic search tools to help researchers find relevant data faster and implementing blockchain technology to ensure the absolute immutability of our peer-review records.
                    </p>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        We invite you to be part of this journey—whether as an author, a reviewer, or a reader. Together, we can continue to advance the frontiers of medical knowledge and improve patient outcomes across the globe.
                    </p>
                </div>
            </div>

            <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-primary-100 rounded-2xl text-primary-600">
                        <Microscope className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900">Dr. Emily Carter</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor-in-Chief</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-slate-900 text-white rounded-full font-black hover:bg-slate-800 transition-all shadow-xl">
                    Download Journal Profile (PDF)
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default About;
