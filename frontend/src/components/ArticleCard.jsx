import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Share2, Bookmark } from 'lucide-react';

const ArticleCard = ({ article, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
          {article.category || 'Clinical Research'}
        </span>
        <div className="flex items-center space-x-2 text-slate-400">
            <button className="hover:text-primary-600 transition-colors"><Share2 className="h-4 w-4" /></button>
            <button className="hover:text-primary-600 transition-colors"><Bookmark className="h-4 w-4" /></button>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3 font-serif">
        {article.title}
      </h3>
      
      <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
        {article.abstract}
      </p>
      
      <div className="pt-4 border-t border-slate-50 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-white shadow-sm">
              <User className="h-5 w-5 text-primary-700" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{article.author}</p>
                <p className="text-[10px] text-slate-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ x: 5 }}
            className="text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
