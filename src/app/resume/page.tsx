'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Upload, FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !jobDescription) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('resume', file);
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
            console.error(err);
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
        a.download = `customized_${file?.name || 'resume.tex'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="container py-12 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">AI Resume Customizer</h1>
                    <p className="text-muted text-lg">
                        Upload your LaTeX resume and a job description. We'll tailor your resume to match the job.
                    </p>
                </div>

                <div className="card bg-black/20 backdrop-blur-sm border-white/10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                        {/* File Upload */}
                        <div className="flex flex-col gap-2">
                            <label className="font-medium flex items-center gap-2">
                                <Upload size={18} className="text-blue-500" />
                                Upload LaTeX Resume (.tex)
                            </label>
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors relative">
                                <input
                                    type="file"
                                    accept=".tex"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex items-center justify-center gap-2 text-green-400">
                                        <CheckCircle size={20} />
                                        <span className="font-medium">{file.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <p>Drag & drop or click to upload</p>
                                        <p className="text-xs mt-1">Only .tex files supported</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="flex flex-col gap-2">
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

                        {/* Action */}
                        <button
                            type="submit"
                            disabled={loading || !file || !jobDescription}
                            className={clsx(
                                "btn btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-blue-900/20",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? 'Customizing Resume...' : 'Customize Resume'}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-200 flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Result */}
                {result && (
                    <div className="mt-8 animate-fade-in">
                        <div className="card border-green-900/50 bg-green-900/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                    <CheckCircle size={24} />
                                    Resume Ready!
                                </h3>
                                <button onClick={downloadResume} className="btn btn-secondary flex items-center gap-2">
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
            </main>
        </div>
    );
}
