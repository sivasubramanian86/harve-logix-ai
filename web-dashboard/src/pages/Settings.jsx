import React from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Moon, 
  Sun, 
  Database, 
  User, 
  ShieldCheck,
  Languages
} from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import { useTheme } from '../context/ThemeProvider';
import { useDataMode } from '../context/DataModeProvider';

export default function Settings() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { isDemoMode, toggleDataMode } = useDataMode();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
  ];

  return (
    <div 
      className="p-8 space-y-8 min-h-full transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary bg-opacity-10" style={{ color: 'var(--color-primary)' }}>
            <SettingsIcon size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm max-w-2xl">
          Configure your HarveLogixAI experience, manage your regional preferences, and toggle between real-time AWS data and simulation modes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: General & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance & Language Card */}
          <section 
            className="p-6 rounded-2xl border backdrop-blur-md transition-all hover:shadow-xl"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--border-primary)',
              boxShadow: '0 8px 32px -4px var(--card-shadow)'
            }}
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Languages size={20} className="text-info" style={{ color: 'var(--color-info)' }} />
              {t('settings.general')}
            </h2>

            <div className="space-y-8">
              {/* Language Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm mb-1">{t('settings.language')}</h3>
                  <p className="text-xs opacity-70">{t('settings.languageDescription')}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLocale(lang.code)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        locale === lang.code 
                          ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                          : 'bg-secondary border-primary opacity-60 hover:opacity-100 hover:border-info'
                      }`}
                      style={{ 
                        backgroundColor: locale === lang.code ? 'var(--color-primary)' : 'var(--bg-secondary)',
                        borderColor: locale === lang.code ? 'var(--color-primary)' : 'var(--border-primary)'
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" style={{ backgroundColor: 'var(--border-primary)', opacity: 0.3 }} />

              {/* Theme Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm mb-1">{t('settings.theme')}</h3>
                  <p className="text-xs opacity-70">{t('settings.themeDescription')}</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={18} className="text-warning" style={{ color: 'var(--color-warning)' }} />
                      <span className="text-sm font-medium">{t('common.light')}</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} className="text-info" style={{ color: 'var(--color-info)' }} />
                      <span className="text-sm font-medium">{t('common.dark')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" style={{ backgroundColor: 'var(--border-primary)', opacity: 0.3 }} />

              {/* Data Mode Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm mb-1">{t('settings.dataMode')}</h3>
                  <p className="text-xs opacity-70">{t('settings.dataModeDescription')}</p>
                </div>
                <button
                  onClick={toggleDataMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: isDemoMode ? 'rgba(var(--color-warning-rgb), 0.1)' : 'rgba(var(--color-success-rgb), 0.1)', 
                    borderColor: isDemoMode ? 'var(--color-warning)' : 'var(--color-success)',
                    color: isDemoMode ? 'var(--color-warning)' : 'var(--color-success)'
                  }}
                >
                  <Database size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {isDemoMode ? t('common.demoData') : t('common.liveData')}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Security & Access Card */}
          <section 
            className="p-6 rounded-2xl border backdrop-blur-md transition-all hover:shadow-xl"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--border-primary)',
              boxShadow: '0 8px 32px -4px var(--card-shadow)'
            }}
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-success" style={{ color: 'var(--color-success)' }} />
              API & Cloud Connectivity
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success bg-opacity-10 flex items-center justify-center" style={{ color: 'var(--color-success)' }}>
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">AWS Bedrock Integration</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Status: Active</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-success text-white" style={{ backgroundColor: 'var(--color-success)' }}>VERIFIED</span>
              </div>

              <div className="p-4 rounded-xl border border-dashed flex items-center justify-between opacity-50" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-info bg-opacity-10 flex items-center justify-center" style={{ color: 'var(--color-info)' }}>
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">PostgreSQL Vector Extension</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Status: Read-Only</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-secondary border border-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>INTERNAL</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Profile & Info */}
        <div className="space-y-6">
          <section 
            className="p-6 rounded-2xl border text-center relative overflow-hidden group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--border-primary)',
              boxShadow: '0 8px 32px -4px var(--card-shadow)'
            }}
          >
            {/* Gloss Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-info to-primary" style={{ background: 'linear-gradient(90deg, var(--color-success), var(--color-info), var(--color-primary))' }} />
            
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-info mx-auto mb-4 flex items-center justify-center p-1 group-hover:scale-110 transition-transform duration-500"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))' }}
              >
                <div className="w-full h-full rounded-full bg-card-bg flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <User size={48} className="text-primary opacity-50" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>

              <h2 className="text-xl font-black mb-1">HarveLogix Admin</h2>
              <p className="text-xs text-secondary mb-6 font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>System Controller • Region 01</p>

              <div className="space-y-3 text-left">
                <div className="p-3 rounded-lg bg-secondary bg-opacity-50 border border-primary text-xs" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <p className="opacity-50 mb-1">Primary Region</p>
                  <p className="font-bold">Punjab / Maharashtra Cluster</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary bg-opacity-50 border border-primary text-xs" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <p className="opacity-50 mb-1">Access Tier</p>
                  <p className="font-bold">Full Analytical Orchestration</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3 rounded-xl font-bold text-sm bg-primary text-white shadow-lg transition-all hover:shadow-primary hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 20px -5px var(--color-primary)' }}
              >
                Edit Dashboard Profile
              </button>
            </div>
          </section>

          <footer className="p-6 rounded-2xl border text-center opacity-70" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Build Version</p>
            <p className="text-xs font-mono">v1.0.0-PRO-NOVA-LITE</p>
            <div className="mt-4 flex justify-center gap-4">
              <a href="#" className="text-[10px] font-bold hover:text-primary underline" style={{ color: 'var(--color-info)' }}>Privacy Policy</a>
              <a href="#" className="text-[10px] font-bold hover:text-primary underline" style={{ color: 'var(--color-info)' }}>Terms of Service</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
