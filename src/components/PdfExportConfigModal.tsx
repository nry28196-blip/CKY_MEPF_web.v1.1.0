import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Square,
  Download,
  X,
  Sliders,
  ShieldCheck,
  Building2,
  Activity,
  Wind,
  CheckCircle2,
  BookOpen,
  Info,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportElementToPdf } from '../lib/exportPdf';

export interface PdfSectionOption {
  key: string;
  label: string;
  description: string;
  category: 'results' | 'inputs' | 'verification' | 'documentation';
  defaultEnabled: boolean;
  icon: React.ElementType;
}

export const PDF_EXPORT_SECTIONS: PdfSectionOption[] = [
  // Results
  {
    key: 'results-hero',
    label: 'Primary Results (Voz, Vbz, Ez, Eρ)',
    description: 'Main airflow sizing summary and authoritative production value',
    category: 'results',
    defaultEnabled: true,
    icon: CheckCircle2
  },
  {
    key: 'result-summary',
    label: 'Result Summary Breakdown',
    description: 'People (Vbp), Area (Vba), Breathing Zone (Vbz), and Total Intake (Vot)',
    category: 'results',
    defaultEnabled: true,
    icon: Wind
  },
  {
    key: 'performance-dashboard',
    label: 'Mechanical Performance Dashboard',
    description: 'Dynamic load distribution, fan ESP curves, and psychrometric performance charts',
    category: 'results',
    defaultEnabled: true,
    icon: Activity
  },

  // Inputs
  {
    key: 'input-summary',
    label: 'Input Summary',
    description: 'Selected space type, floor area Az, and design occupancy Pz',
    category: 'inputs',
    defaultEnabled: true,
    icon: Building2
  },
  {
    key: 'zone-info',
    label: 'Zone & Space Information Cards',
    description: 'Space category geometry, air classification, and occupancy values',
    category: 'inputs',
    defaultEnabled: true,
    icon: Building2
  },
  {
    key: 'vent-params',
    label: 'Ventilation Parameters (Rp, Ra, Ez)',
    description: 'ASHRAE Table 6-1 default rates and air distribution effectiveness',
    category: 'inputs',
    defaultEnabled: true,
    icon: Sliders
  },
  {
    key: 'advanced-params',
    label: 'Advanced System Topology',
    description: 'Stratified / displacement ventilation and density correction parameters',
    category: 'inputs',
    defaultEnabled: true,
    icon: Sliders
  },

  // Verification & Audit
  {
    key: 'validation-status',
    label: 'Validation Status Checklist',
    description: 'Code rule pass/fail status and prerequisite parameter checks',
    category: 'verification',
    defaultEnabled: true,
    icon: ShieldCheck
  },
  {
    key: 'calculation-details',
    label: 'Calculation Details & Math Step Trace',
    description: 'Step-by-step mathematical trace for Eq 6-1, Ez distribution, and Eρ',
    category: 'verification',
    defaultEnabled: true,
    icon: Activity
  },
  {
    key: 'audit-info',
    label: 'Audit Information & Code Basis',
    description: 'Standard edition (62.1-2022), Addendum j, calculation engine traceability',
    category: 'verification',
    defaultEnabled: true,
    icon: ShieldCheck
  },

  // Documentation
  {
    key: 'formulas',
    label: 'Formula Reference Cards',
    description: 'Mathematical equations, definitions, and code citations',
    category: 'documentation',
    defaultEnabled: false,
    icon: BookOpen
  },
  {
    key: 'disclaimer',
    label: 'Engineering QA Notice & Disclaimer',
    description: 'Professional engineer certification & AHJ compliance notice',
    category: 'documentation',
    defaultEnabled: true,
    icon: Info
  }
];

interface PdfExportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
  defaultFilename?: string;
  systemName?: string;
}

export default function PdfExportConfigModal({
  isOpen,
  onClose,
  targetElementId = 'calculation-workspace',
  defaultFilename = 'CKY_MEPF_Calculation_Report.pdf',
  systemName = 'Ventilation System'
}: PdfExportConfigModalProps) {
  // Section toggle state (map of key -> boolean)
  const [sectionToggles, setSectionToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PDF_EXPORT_SECTIONS.forEach(s => {
      initial[s.key] = s.defaultEnabled;
    });
    return initial;
  });

  const [projectName, setProjectName] = useState<string>('Construction MEP Package');
  const [engineerName, setEngineerName] = useState<string>('MEP Design Engineer');
  const [printMode, setPrintMode] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Toggle individual section
  const handleToggle = (key: string) => {
    setSectionToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Presets
  const handleApplyPreset = (preset: 'all' | 'executive' | 'audit_focus') => {
    if (preset === 'all') {
      const next: Record<string, boolean> = {};
      PDF_EXPORT_SECTIONS.forEach(s => { next[s.key] = true; });
      setSectionToggles(next);
    } else if (preset === 'executive') {
      const next: Record<string, boolean> = {};
      PDF_EXPORT_SECTIONS.forEach(s => {
        next[s.key] = ['results-hero', 'result-summary', 'input-summary', 'validation-status', 'disclaimer'].includes(s.key);
      });
      setSectionToggles(next);
    } else if (preset === 'audit_focus') {
      const next: Record<string, boolean> = {};
      PDF_EXPORT_SECTIONS.forEach(s => {
        next[s.key] = ['results-hero', 'input-summary', 'validation-status', 'calculation-details', 'audit-info', 'disclaimer'].includes(s.key);
      });
      setSectionToggles(next);
    }
  };

  // Execute PDF generation
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Identify sections that user has toggled OFF
    const hiddenSections = Object.entries(sectionToggles)
      .filter(([_, enabled]) => !enabled)
      .map(([key]) => key);

    try {
      await exportElementToPdf(targetElementId, {
        filename: defaultFilename,
        hiddenSections,
        title: `${systemName} Calculation Report`,
        projectNumber: projectName,
        engineer: engineerName,
        printMode
      });

      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('PDF export failed:', err);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'results', label: '1. Primary Results & Sizing' },
    { id: 'inputs', label: '2. Input & Space Parameters' },
    { id: 'verification', label: '3. Engineering Verification & Audit' },
    { id: 'documentation', label: '4. Documentation & Legal' }
  ];

  const totalEnabled = Object.values(sectionToggles).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-2xl bg-[#090F22] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                PDF Export Configuration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle specific calculation and audit sections before generating your report.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Print Mode Toggle Card (Physical Printer Layout Optimization) */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                printMode
                  ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Print Mode (Physical Paper Output)
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border transition-colors ${
                    printMode
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    {printMode ? 'White Background • Ink Friendly' : 'Dark Screen Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Forces a clean, pure-white background with high-contrast typography, dark borders, and ink-friendly metrics for physical printer outputs.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPrintMode(!printMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-start sm:self-center ${
                printMode ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
              role="switch"
              aria-checked={printMode}
              title="Toggle Clean White Print Mode"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  printMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="font-semibold text-white">Preset Packages:</span>
              <span className="text-[11px] text-cyan-400 font-bold">({totalEnabled} of {PDF_EXPORT_SECTIONS.length} selected)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('executive')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                Executive Summary
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('audit_focus')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                Standard Audit Trail
              </button>
            </div>
          </div>

          {/* Section Selection Groups */}
          <div className="space-y-5">
            {categories.map(cat => {
              const items = PDF_EXPORT_SECTIONS.filter(s => s.category === cat.id);
              if (items.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-1">
                    {cat.label}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map(item => {
                      const isChecked = !!sectionToggles[item.key];
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.key}
                          onClick={() => handleToggle(item.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                            isChecked
                              ? 'bg-slate-900/90 border-cyan-500/50 shadow-sm shadow-cyan-950/20 text-white'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-cyan-400 shrink-0"
                            aria-label={`Toggle ${item.label}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 fill-cyan-950/60" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-cyan-400' : 'text-slate-500'}`} />
                              <span className={`text-xs font-bold leading-snug truncate ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                                {item.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Report Submittal Details (Optional) */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Submittal Details (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Project Name / Ref
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-1.5 text-xs border border-slate-800 focus:border-cyan-500 outline-none"
                  placeholder="e.g. Building A - Level 3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Prepared By (Engineer)
                </label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-1.5 text-xs border border-slate-800 focus:border-cyan-500 outline-none"
                  placeholder="e.g. Lead MEP Engineer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-slate-400">
            Target: <span className="text-cyan-400 font-bold">{defaultFilename}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting || totalEnabled === 0}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                exportSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                  : isExporting
                    ? 'bg-cyan-800 text-white cursor-wait opacity-80'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 cursor-pointer'
              }`}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PDF Downloaded!</span>
                </>
              ) : isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating {printMode ? 'Print' : 'PDF'}...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF ({totalEnabled} Sections{printMode ? ' • Clean Print' : ''})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
