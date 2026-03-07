import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  ShieldCheck, 
  Database,
  ExternalLink
} from 'lucide-react';
import { useI18n } from '../context/I18nProvider';

export default function Faq() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqData = t('faq.questions', { returnObjects: true }) || [];

  const filteredFaqs = faqData.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div 
      className="p-8 space-y-8 min-h-full transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Dynamic Background Element */}
      <div 
        className="fixed top-20 right-20 w-80 h-80 opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      {/* Header & Search */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary bg-primary bg-opacity-5 mb-4"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Support Center</span>
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-2">
          {t('faq.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
          Everything you need to know about the HarveLogixAI engine, Amazon Bedrock integration, and our autonomous agent mesh.
        </p>

        <div className="relative mt-10 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-secondary group-focus-within:text-primary transition-colors" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <input
            type="text"
            placeholder={t('faq.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border transition-all text-lg shadow-sm focus:shadow-xl focus:scale-[1.01]"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto relative z-10 space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className="rounded-2xl border transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: expandedIndex === index ? 'var(--color-primary)' : 'var(--border-primary)',
                boxShadow: expandedIndex === index ? '0 10px 30px -10px var(--card-shadow)' : 'none'
              }}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedIndex === index ? 'bg-primary text-white' : 'bg-secondary'}`}
                    style={{ 
                      backgroundColor: expandedIndex === index ? 'var(--color-primary)' : 'var(--bg-secondary)',
                      color: expandedIndex === index ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    <span className="text-xs font-bold">Q{index + 1}</span>
                  </div>
                  <h3 className={`font-bold transition-colors ${expandedIndex === index ? 'text-primary' : 'text-primary'}`}
                    style={{ color: expandedIndex === index ? 'var(--color-primary)' : 'var(--text-primary)' }}
                  >
                    {faq.q}
                  </h3>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp size={20} className="text-primary" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <ChevronDown size={20} className="text-secondary group-hover:text-primary transition-colors" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>
              
              {expandedIndex === index && (
                <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-px w-full mb-6 opacity-10 bg-primary" style={{ backgroundColor: 'var(--color-primary)' }} />
                  <p className="leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    {faq.a}
                  </p>
                  
                  <div className="mt-6 flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border hover:bg-opacity-10 transition-all"
                      style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <Zap size={12} className="text-warning" /> Helpful
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border hover:bg-opacity-10 transition-all"
                      style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-12 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-secondary font-medium" style={{ color: 'var(--text-secondary)' }}>
              No matching questions found for "{searchQuery}". Try a different term.
            </p>
          </div>
        )}
      </div>

      {/* Help Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-12">
        <div className="p-6 rounded-2xl border flex items-start gap-4 group hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}
        >
          <div className="p-3 rounded-xl bg-info bg-opacity-10 text-info group-hover:scale-110 transition-transform" style={{ color: 'var(--color-info)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold mb-1">Technical Documentation</h4>
            <p className="text-xs text-secondary mb-4" style={{ color: 'var(--text-secondary)' }}>Deep dive into our architecture, API specs, and agent mesh protocols.</p>
            <a href="#" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-info hover:underline" style={{ color: 'var(--color-info)' }}>
              Read Docs <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="p-6 rounded-2xl border flex items-start gap-4 group hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}
        >
          <div className="p-3 rounded-xl bg-success bg-opacity-10 text-success group-hover:scale-110 transition-transform" style={{ color: 'var(--color-success)' }}>
            <Database size={24} />
          </div>
          <div>
            <h4 className="font-bold mb-1">Knowledge Base</h4>
            <p className="text-xs text-secondary mb-4" style={{ color: 'var(--text-secondary)' }}>Learn how to optimize your RAG ingestion and fine-tune agent personality.</p>
            <a href="#" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-success hover:underline" style={{ color: 'var(--color-success)' }}>
              Browse KB <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
