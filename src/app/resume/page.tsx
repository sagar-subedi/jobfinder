'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, Loader2, CheckCircle, Download, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Template {
    _id: string;
    name: string;
    createdAt: string;
}

function ManualCustomizationForm({ templates }: { templates: Template[] }) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCustomize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate || !jobDescription) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('action', 'customize');
        formData.append('templateId', selectedTemplate);
        formData.append('jobDescription', jobDescription);

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
        a.download = `customized_resume.tex`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <form onSubmit={handleCustomize} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Template Selection */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        Select Template
                    </label>
                    {templates.length === 0 ? (
                        <div className="p-4 border border-dashed border-white/20 rounded-lg text-muted text-sm">
                            No templates found. Please upload one above.
                        </div>
                    ) : (
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            required
                        >
                            <option value="">-- Choose a template --</option>
                            {templates.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Job Description */}
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-medium flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        Job Description
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !selectedTemplate || !jobDescription}
                className={clsx(
                    "btn btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-blue-900/20",
                    (loading || !selectedTemplate || !jobDescription) && "opacity-50 cursor-not-allowed"
                )}
            >
                {loading ? 'Generating...' : 'Generate Customized Resume'}
            </button>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-200 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-8 animate-fade-in">
                    <div className="card border-green-900/50 bg-green-900/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                <CheckCircle size={24} />
                                Resume Ready!
                            </h3>
                            <button type="button" onClick={downloadResume} className="btn btn-secondary flex items-center gap-2">
                                <Download size={16} />
                                Download .tex
                            </button>
                        </div>
                        <div className="bg-black/50 p-4 rounded border border-white/5 font-mono text-xs text-muted overflow-auto max-h-64">
                            <pre>{result}</pre>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default function ResumePage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [templateName, setTemplateName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/resume');
            const data = await res.json();
            if (data.templates) setTemplates(data.templates);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !templateName) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('action', 'upload');
        formData.append('resume', file);
        formData.append('name', templateName);

        try {
            const res = await fetch('/api/resume', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                setFile(null);
                setTemplateName('');
                setIsUploading(false);
                fetchTemplates();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await fetch(`/api/resume?id=${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-full flex flex-col">
            <main className="container py-12 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Resume Templates</h1>
                    <p className="text-muted text-lg">
                        Manage your LaTeX resume templates. Use these to quickly generate customized resumes for any job.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Upload New Card */}
                    <div
                        onClick={() => setIsUploading(true)}
                        className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group min-h-[200px]"
                    >
                        <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-primary" />
                        </div>
                        <span className="font-medium text-muted group-hover:text-white">Upload New Template</span>
                    </div>

                    {/* Existing Templates */}
                    {templates.map(template => (
                        <div key={template._id} className="card bg-secondary/20 border-white/5 hover:border-primary/30 transition-all group relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(template._id); }}
                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="p-3 bg-blue-500/10 w-fit rounded-lg mb-4">
                                        <FileText size={24} className="text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                                    <p className="text-sm text-muted">Added on {new Date(template.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Manual Customization Section */}
                <div className="card bg-black/20 backdrop-blur-sm border-white/10 mb-12">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Quick Customization</h2>
                        <p className="text-muted">
                            Paste a job description below and select a template to generate a tailored resume instantly.
                        </p>
                    </div>

                    <ManualCustomizationForm templates={templates} />
                </div>

                {/* Upload Modal */}
                {isUploading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                            <h2 className="text-2xl font-bold mb-6">Upload Template</h2>
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        placeholder="e.g., Frontend Developer"
                                        className="w-full bg-secondary/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">LaTeX File (.tex)</label>
                                    <div className="border border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept=".tex"
                                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        {file ? (
                                            <span className="text-green-400 font-medium">{file.name}</span>
                                        ) : (
                                            <span className="text-muted text-sm">Click to select file</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploading(false)}
                                        className="flex-1 py-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 btn btn-primary flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
