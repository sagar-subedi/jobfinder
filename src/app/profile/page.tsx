'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Briefcase, Code, FolderGit2 } from 'lucide-react';
import clsx from 'clsx';

interface Project {
    title: string;
    description: string;
    techStack: string[];
}

interface Experience {
    company: string;
    role: string;
    duration: string;
    description: string;
}

export default function ProfilePage() {
    const [skills, setSkills] = useState<string[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    // New Item States
    const [newProject, setNewProject] = useState<Project>({ title: '', description: '', techStack: [] });
    const [newExperience, setNewExperience] = useState<Experience>({ company: '', role: '', duration: '', description: '' });
    const [projectTech, setProjectTech] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.profile) {
                setSkills(data.profile.skills || []);
                setProjects(data.profile.projects || []);
                setExperiences(data.profile.experiences || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills, projects, experiences }),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const addProject = () => {
        if (newProject.title && newProject.description) {
            setProjects([...projects, newProject]);
            setNewProject({ title: '', description: '', techStack: [] });
        }
    };

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const addProjectTech = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && projectTech) {
            e.preventDefault();
            setNewProject({ ...newProject, techStack: [...newProject.techStack, projectTech] });
            setProjectTech('');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-full flex flex-col">
            <main className="container py-12 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted text-lg">Manage your master list of skills and projects for AI generation.</p>
                    </div>
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="btn btn-primary flex items-center gap-2 px-6 py-3"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

                <div className="space-y-12">
                    {/* Skills Section */}
                    <section className="card bg-black/20 border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Code className="text-blue-400" size={24} />
                            <h2 className="text-2xl font-bold">Skills</h2>
                        </div>

                        <form onSubmit={addSkill} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill (e.g., React, Python)..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                            />
                            <button type="submit" className="btn btn-secondary"><Plus size={20} /></button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <div key={skill} className="bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-blue-500/20">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-white"><XIcon /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects Section */}
                    <section className="card bg-black/20 border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <FolderGit2 className="text-green-400" size={24} />
                            <h2 className="text-2xl font-bold">Projects</h2>
                        </div>

                        <div className="grid gap-6 mb-8">
                            {projects.map((project, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5 relative group">
                                    <button
                                        onClick={() => removeProject(i)}
                                        className="absolute top-4 right-4 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                                    <div className="flex gap-2 mb-2">
                                        {project.techStack.map(t => (
                                            <span key={t} className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted">{t}</span>
                                        ))}
                                    </div>
                                    <p className="text-muted text-sm">{project.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-black/40 p-6 rounded-lg border border-white/10">
                            <h3 className="font-bold mb-4 text-muted">Add New Project</h3>
                            <div className="space-y-4">
                                <input
                                    placeholder="Project Title"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 h-24 resize-none"
                                />
                                <div>
                                    <input
                                        placeholder="Tech Stack (Press Enter to add)"
                                        value={projectTech}
                                        onChange={e => setProjectTech(e.target.value)}
                                        onKeyDown={addProjectTech}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        {newProject.techStack.map(t => (
                                            <span key={t} className="text-xs bg-white/10 px-2 py-1 rounded">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={addProject} className="btn btn-secondary w-full">Add Project</button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
    )
}
