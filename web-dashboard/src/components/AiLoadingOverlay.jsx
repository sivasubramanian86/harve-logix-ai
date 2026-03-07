import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, Shield, Zap } from 'lucide-react';

export default function AiLoadingOverlay({ isVisible }) {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { icon: Terminal, text: "Initializing Amazon Bedrock Nova Pro..." },
    { icon: Cpu, text: "Retrieving Farmer Welfare Data via MCP..." },
    { icon: Zap, text: "Synthesizing Strands Analysis Agent..." },
    { icon: Shield, text: "Generating Actionable Recommendations..." }
  ];

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500" />
      
      {/* Container */}
      <div className="relative bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl backdrop-blur-xl max-w-md w-full mx-4 overflow-hidden group">
        {/* Animated Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-success-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative z-10 text-center space-y-8">
          {/* Main Visual */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg animate-bounce duration-[2000ms]">
              <Cpu size={48} className="text-white animate-pulse" />
            </div>
            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full animate-spin duration-[4000ms]" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-success-500 rounded-full animate-ping" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Agents in Action</h2>
            <p className="text-white/60 text-sm">HarveLogix Intelligence Engine is processing live data</p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 text-left">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-x-2' : isPast ? 'opacity-40' : 'opacity-20'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/10 text-white'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary-400' : 'text-white'}`}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-200" />
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
