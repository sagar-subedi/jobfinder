'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { IJob } from '@/models/Job';

interface JobDetailModalProps {
    job: IJob;
    isOpen: boolean;
    onClose: () => void;
}

interface Template {
    _id: string;
    name: string;
}

export default function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && isCustomizing) {
            fetchTemplates();
        }
    }, [isOpen, isCustomizing]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/resume');
            const data = await res.json();
            if (data.templates) {
                setTemplates(data.templates);
                if (data.templates.length > 0) {
                    setSelectedTemplate(data.templates[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch templates', err);
        }
    };

    const handleCustomize = async () => {
        if (!selectedTemplate) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('action', 'customize');
        formData.append('templateId', selectedTemplate);
        formData.append('jobDescription', job.description);

        try {
            const res = await fetch('/api/resume', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to customize resume');

            const data = await res.json();
            setResult(data.customizedContent);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadResume = () => {
        if (!result) return;
        const blob = new Blob([result], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customized_${job.company}_${job.title}.tex`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in relative">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                        <div className="flex items-center gap-2 text-muted">
                            <span className="font-medium text-primary">{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{new Date(job.datePosted).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X size={24} className="text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isCustomizing ? (
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">Customize Resume</h3>
                                <p className="text-muted">Select a template to tailor for this job.</p>
                            </div>

                            {templates.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-white/10 rounded-lg">
                                    <p className="text-muted mb-4">No templates found.</p>
                                    <a href="/resume" className="text-primary hover:underline">Upload a template first</a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-2">Select Template</label>
                                        <select
                                            value={selectedTemplate}
                                            onChange={(e) => setSelectedTemplate(e.target.value)}
                                            className="w-full bg-secondary/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                        >
                                            {templates.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleCustomize}
                                        disabled={loading || !selectedTemplate}
                                        className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
                                        {loading ? 'Generating...' : 'Generate Customized Resume'}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-200 flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {result && (
                                <div className="p-6 bg-green-900/10 border border-green-900/50 rounded-lg animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                                            <CheckCircle size={20} />
                                            Ready!
                                        </h3>
                                        <button onClick={downloadResume} className="btn btn-secondary text-sm flex items-center gap-2">
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted">Your resume has been customized for this job description.</p>
                                </div>
                            )}

                            <button onClick={() => setIsCustomizing(false)} className="w-full text-muted hover:text-white text-sm">
                                Back to Job Details
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <div className="flex gap-2 mb-6">
                                {job.skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-white/5 rounded text-xs text-muted border border-white/5">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isCustomizing && (
                    <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/40">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            Apply on {job.source}
                            <ExternalLink size={16} />
                        </a>
                        <button
                            onClick={() => setIsCustomizing(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Customize Resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
