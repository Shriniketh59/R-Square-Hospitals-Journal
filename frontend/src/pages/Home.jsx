import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import { TrendingUp, FileText, Award, Activity, Heart, ShieldCheck, Microscope, Database, Users, Star, Quote, BookOpen, Brain, Globe } from 'lucide-react';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles');
        if (response.data && response.data.length > 0) {
          setArticles(response.data);
        } else {
          setArticles(mockFallback);
        }
      } catch (err) {
        setArticles(mockFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const featuredArticles = [
    {
      id: 'f1',
      title: "Genomic Sequencing in Acute Myeloid Leukemia: A 10-Year Retrospective",
      source: "Nature Medicine",
      author: "Dr. Harold Varmus",
      impact: "45.2",
      abstract: "In this landmark study, Nobel laureate Dr. Harold Varmus presents a comprehensive genomic landscape of 1,500 patients. The research identifies key mutational signatures and pioneering targeted therapies that have since become the global standard for AML treatment.",
      details: "His work laid the foundation for the discovery of oncogenes, fundamentally changing our understanding of cancer at a molecular level."
    },
    {
      id: 'f2',
      title: "The Global Burden of Cardiovascular Disease: 2026 Comprehensive Update",
      source: "The Lancet",
      author: "Dr. Valentin Fuster",
      impact: "59.1",
      abstract: "Dr. Valentin Fuster, a global leader in cardiology, synthesizes data from 204 countries. This report projects critical trends in heart health, focusing on the socio-economic impacts of atherosclerosis and the urgent need for preventative global healthcare policies.",
      details: "As the Director of Mount Sinai Heart, his research into the 'polypill' and atherosclerosis has revolutionized cardiovascular prevention strategies."
    },
    {
      id: 'f3',
      title: "AI-Driven Diagnostics in Neurodegenerative Disorders",
      source: "Science Translational Medicine",
      author: "Dr. Eric Topol",
      impact: "38.5",
      abstract: "Dr. Eric Topol explores the convergence of deep learning and neurology. This study demonstrates how AI algorithms can predict Alzheimer's progression up to five years earlier than traditional clinical assessments.",
      details: "A pioneer in digital medicine, Dr. Topol's work continues to push the boundaries of how technology can personalize patient care."
    }
  ];

  const mockFallback = [
    {
      id: 1,
      title: "Impact of mRNA Vaccines on Post-Operative Recovery in Cancer Patients",
      abstract: "This randomized clinical trial investigates whether pre-operative administration of specific mRNA vaccines improves long-term outcomes...",
      author_name: "Dr. Emily Carter",
      category_name: "Clinical Trials",
      published_date: "2026-04-15"
    },
    {
      id: 2,
      title: "Neural Plasticity and Cognitive Recovery after Ischemic Stroke",
      abstract: "Stroke remains a leading cause of long-term disability. This study monitors 200 patients over 2 years to map neural reorganization...",
      author_name: "Dr. James Wilson",
      category_name: "Neurological Research",
      published_date: "2026-03-22"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <Hero />
      
      {/* Stats/Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Publications', value: '1.2k+', icon: FileText, color: 'blue' },
            { label: 'Impact Factor', value: '4.8', icon: Activity, color: 'teal' },
            { label: 'Citations', value: '15k+', icon: Database, color: 'indigo' },
            { label: 'Authors', value: '3.5k', icon: Users, color: 'purple' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-default group"
            >
              <div className={`bg-${stat.color}-50 p-4 rounded-2xl text-${stat.color}-600 mb-4 group-hover:rotate-12 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Articles Section (Famous Journals) */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-widest mb-6">
                <Star className="h-4 w-4 fill-primary-600" />
                <span>Global High-Impact Research</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tight leading-none">
              Featured Works by <br />
              <span className="text-primary-600">Medical Pioneers</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredArticles.map((art, idx) => (
                    <motion.div 
                        key={art.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative group flex flex-col h-full"
                    >
                        <Quote className="absolute top-8 right-8 h-10 w-10 text-slate-50 group-hover:text-primary-50 transition-colors" />
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="px-4 py-1.5 bg-primary-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                {art.source}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IF: {art.impact}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 leading-tight group-hover:text-primary-600 transition-colors">{art.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{art.abstract}</p>
                        
                        <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expert Context</p>
                            <p className="text-[11px] text-slate-500 italic leading-relaxed">{art.details}</p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-black text-primary-700 text-xs shadow-sm">
                                    {art.author.split(' ').pop().charAt(0)}
                                </div>
                                <div>
                                    <span className="text-sm font-black text-slate-800 block">{art.author}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Investigator</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* New Section: Expert Insights & Resources */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative order-2 lg:order-1">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6 pt-12">
                            <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white shadow-2xl">
                                <Brain className="h-10 w-10 mb-4" />
                                <h4 className="text-lg font-black mb-2">Neuroscience</h4>
                                <p className="text-xs text-primary-100">Exploring the depths of cognitive resilience and AI integration.</p>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                                <Globe className="h-10 w-10 mb-4 text-teal-400" />
                                <h4 className="text-lg font-black mb-2">Public Health</h4>
                                <p className="text-xs text-slate-400">Addressing systemic healthcare disparities through data.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-teal-500 p-8 rounded-[2.5rem] text-white shadow-2xl">
                                <Activity className="h-10 w-10 mb-4" />
                                <h4 className="text-lg font-black mb-2">Genomics</h4>
                                <p className="text-xs text-teal-100">Tailoring treatment through precise molecular understanding.</p>
                            </div>
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl">
                                <Heart className="h-10 w-10 mb-4" />
                                <h4 className="text-lg font-black mb-2">Cardiology</h4>
                                <p className="text-xs text-indigo-100">Pioneering preventative strategies for global heart health.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-widest mb-6">
                        <BookOpen className="h-4 w-4" />
                        <span>Expert Resources</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">World-Class <span className="text-primary-600">Medical Resources</span></h2>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                        R Square Hospitals Journal provides a curated repository of research from the world's most cited experts. 
                        We believe in the power of shared knowledge to transform clinical practice.
                    </p>
                    <ul className="space-y-6">
                        {[
                            'Access to 50,000+ peer-reviewed archives',
                            'Interactive data visualization for authors',
                            'Direct communication with lead investigators',
                            'Exclusive webinars with Nobel Laureates'
                        ].map((text, i) => (
                            <li key={i} className="flex items-center space-x-3 text-slate-800 font-bold">
                                <div className="p-1 bg-green-100 rounded-full text-green-600">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Latest Submissions Feed */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 rounded-[4rem] mb-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 px-8">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Recent Research <span className="text-primary-600">Archive</span>
            </h2>
            <p className="text-slate-400 mt-2 font-medium">Browse the latest contributions from our growing global community.</p>
          </div>
          <button className="px-10 py-4 rounded-full bg-slate-900 text-sm font-black text-white shadow-xl hover:bg-slate-800 transition-all">Explore Full Archive</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 rounded-[2.5rem] bg-white animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-8">
            <AnimatePresence>
              {articles.map((article, idx) => (
                <ArticleCard 
                    key={article.id} 
                    article={{
                        ...article,
                        author: article.author_name,
                        category: article.category_name,
                        date: article.published_date
                    }} 
                    index={idx} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
