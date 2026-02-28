import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { Save, Upload, Plus, Trash2, Eye } from 'lucide-react';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import AboutPage from '../AboutPage';
import toast from 'react-hot-toast';

const AdminAbout = () => {
    const { t } = useAdminTranslation();
    const { data: initialSettings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [settings, setSettings] = useState({});
    const [previewLang, setPreviewLang] = useState('en');
    const [previewMode, setPreviewMode] = useState(false);

    // Default arrays
    const [stats, setStats] = useState([]);
    const [team, setTeam] = useState([]);
    const [values, setValues] = useState([]);

    useEffect(() => {
        if (initialSettings) {
            setSettings({
                about_hero_image: initialSettings.about_hero_image || '',
                about_hero_title_en: initialSettings.about_hero_title_en || '',
                about_hero_title_hi: initialSettings.about_hero_title_hi || '',
                about_hero_subtitle_en: initialSettings.about_hero_subtitle_en || '',
                about_hero_subtitle_hi: initialSettings.about_hero_subtitle_hi || '',
                about_mission_title_en: initialSettings.about_mission_title_en || '',
                about_mission_title_hi: initialSettings.about_mission_title_hi || '',
                about_mission_desc_en: initialSettings.about_mission_desc_en || '',
                about_mission_desc_hi: initialSettings.about_mission_desc_hi || '',
                about_mission_image: initialSettings.about_mission_image || '',
                about_cta_title_en: initialSettings.about_cta_title_en || '',
                about_cta_title_hi: initialSettings.about_cta_title_hi || '',
                about_cta_desc_en: initialSettings.about_cta_desc_en || '',
                about_cta_desc_hi: initialSettings.about_cta_desc_hi || '',
            });

            if (initialSettings.about_stats_json) {
                try { setStats(JSON.parse(initialSettings.about_stats_json)); } catch (e) { }
            } else {
                setStats([
                    { label: 'Years of Excellence', value: '15+', icon: 'Award' },
                    { label: 'Monthly Readers', value: '2M+', icon: 'Users' }
                ]);
            }

            if (initialSettings.about_team_json) {
                try { setTeam(JSON.parse(initialSettings.about_team_json)); } catch (e) { }
            } else {
                setTeam([
                    { name: 'Vikram Mehta', role: 'Editor in Chief', img: '', bio: '20+ years' }
                ]);
            }

            if (initialSettings.about_values_json) {
                try { setValues(JSON.parse(initialSettings.about_values_json)); } catch (e) { }
            } else {
                setValues([
                    { icon: 'Shield', title: 'Trust & Integrity', desc: 'We prioritize our readers...' }
                ]);
            }
        }
    }, [initialSettings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    // Safe getter to prevent uncontrolled-to-controlled warning
    const v = (key) => settings[key] ?? '';

    const handleFileUpload = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                setSettings(prev => ({ ...prev, [key]: re.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const finalSettings = {
                ...settings,
                about_stats_json: JSON.stringify(stats),
                about_team_json: JSON.stringify(team),
                about_values_json: JSON.stringify(values),
            };
            await updateMutation.mutateAsync(finalSettings);
            toast.success('About page updated successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading About configurations...</div>;

    const liveSettings = {
        ...settings,
        about_stats_json: JSON.stringify(stats),
        about_team_json: JSON.stringify(team),
        about_values_json: JSON.stringify(values),
    };

    if (previewMode) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-900 absolute inset-0 z-50">
                <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center z-10 shadow-md">
                    <div className="flex gap-4 items-center">
                        <h2 className="font-bold text-lg dark:text-white">Live Preview Mode</h2>
                        <select
                            value={previewLang}
                            onChange={e => setPreviewLang(e.target.value)}
                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold dark:text-white outline-none"
                        >
                            <option value="en">English View (EN)</option>
                            <option value="hi">Hindi View (HI)</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setPreviewMode(false)}
                        className="bg-red-600 px-6 py-2 rounded-xl text-white font-bold text-sm tracking-widest hover:bg-red-700 transition"
                    >
                        Exit Preview Mode
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto w-full relative">
                    <div className="pointer-events-none w-full max-w-[1440px] mx-auto bg-white dark:bg-black shadow-2xl">
                        <AboutPage language={previewLang} previewSettings={liveSettings} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">About Page Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage all text, images, team, and stats for the about page</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setPreviewMode(true)}
                        className="px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform flex gap-2 items-center"
                    >
                        <Eye size={16} /> Live Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform flex gap-2 items-center"
                    >
                        <Save size={16} /> {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Text Settings */}
                <div className="space-y-8">

                    {/* Hero Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Hero Section </h3>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input type="text" name="about_hero_image" value={v('about_hero_image')} onChange={handleChange} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Hero Image URL" />
                                <label className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer">
                                    <Upload size={20} className="dark:text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'about_hero_image')} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Title (EN)</label>
                                    <input type="text" name="about_hero_title_en" value={v('about_hero_title_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" placeholder="The Voice of <br/> Truth" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Title (HI)</label>
                                    <input type="text" name="about_hero_title_hi" value={v('about_hero_title_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" placeholder="सच्चाई की <br/> आवाज़" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Subtitle (EN)</label>
                                    <textarea name="about_hero_subtitle_en" value={v('about_hero_subtitle_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-24 resize-none" placeholder="Empowering society..."></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Subtitle (HI)</label>
                                    <textarea name="about_hero_subtitle_hi" value={v('about_hero_subtitle_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-24 resize-none" placeholder="निष्पक्ष पत्रकारिता..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Mission Section </h3>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input type="text" name="about_mission_image" value={v('about_mission_image')} onChange={handleChange} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Mission Side Image URL" />
                                <label className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer">
                                    <Upload size={20} className="dark:text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'about_mission_image')} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Mission Title (EN)</label>
                                    <input type="text" name="about_mission_title_en" value={v('about_mission_title_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Mission Title (HI)</label>
                                    <input type="text" name="about_mission_title_hi" value={v('about_mission_title_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Mission Text (EN)</label>
                                    <textarea name="about_mission_desc_en" value={v('about_mission_desc_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-32 resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Mission Text (HI)</label>
                                    <textarea name="about_mission_desc_hi" value={v('about_mission_desc_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-32 resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Final CTA Banner </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">CTA Title (EN)</label>
                                <input type="text" name="about_cta_title_en" value={v('about_cta_title_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Join Us in <br/> Standing with Truth" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">CTA Title (HI)</label>
                                <input type="text" name="about_cta_title_hi" value={v('about_cta_title_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">CTA Subtext (EN)</label>
                                <textarea name="about_cta_desc_en" value={v('about_cta_desc_en')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-24 resize-none"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">CTA Subtext (HI)</label>
                                <textarea name="about_cta_desc_hi" value={v('about_cta_desc_hi')} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none text-sm dark:text-white border border-slate-200 dark:border-slate-700 h-24 resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrays section */}
                <div className="space-y-8">

                    {/* Stats */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Achievements / Milestones </h3>
                            <button onClick={() => setStats([...stats, { label: 'New Stat', value: '100+', icon: 'Award' }])} className="text-red-500 hover:text-red-600 p-1 flex items-center gap-1 text-xs font-bold"> <Plus size={14} /> Add </button>
                        </div>

                        {stats.map((stat, i) => (
                            <div key={i} className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                                <input type="text" value={stat.label} onChange={(e) => { const n = [...stats]; n[i].label = e.target.value; setStats(n); }} placeholder="Label (e.g. Years)" className="w-1/3 p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white" />
                                <input type="text" value={stat.value} onChange={(e) => { const n = [...stats]; n[i].value = e.target.value; setStats(n); }} placeholder="Value (e.g. 15+)" className="w-1/3 p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white font-black" />
                                <select value={stat.icon} onChange={(e) => { const n = [...stats]; n[i].icon = e.target.value; setStats(n); }} className="w-1/3 p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white">
                                    <option value="Award">Award</option>
                                    <option value="Users">Users</option>
                                    <option value="Globe">Globe</option>
                                    <option value="Trophy">Trophy</option>
                                </select>
                                <button onClick={() => setStats(stats.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-200"> <Trash2 size={12} /> </button>
                            </div>
                        ))}
                    </div>

                    {/* Team */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Editorial Board / Team </h3>
                            <button onClick={() => setTeam([...team, { name: '', role: '', bio: '', img: '' }])} className="text-red-500 hover:text-red-600 p-1 flex items-center gap-1 text-xs font-bold"> <Plus size={14} /> Add Member </button>
                        </div>

                        {team.map((mbr, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                                <input type="text" value={mbr.name} onChange={(e) => { const t = [...team]; t[i].name = e.target.value; setTeam(t); }} placeholder="Full Name" className="p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white font-bold" />
                                <input type="text" value={mbr.role} onChange={(e) => { const t = [...team]; t[i].role = e.target.value; setTeam(t); }} placeholder="Role (e.g. Editor in Chief)" className="p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white font-medium" />
                                <input type="text" value={mbr.bio} onChange={(e) => { const t = [...team]; t[i].bio = e.target.value; setTeam(t); }} placeholder="Short Bio Line" className="p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white" />
                                <input type="text" value={mbr.img} onChange={(e) => { const t = [...team]; t[i].img = e.target.value; setTeam(t); }} placeholder="Avatar Image URL" className="p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white" />
                                <button onClick={() => setTeam(team.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-200"> <Trash2 size={12} /> </button>
                            </div>
                        ))}
                    </div>

                    {/* Values */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest"> Core Values </h3>
                            <button onClick={() => setValues([...values, { title: '', desc: '', icon: 'Shield' }])} className="text-red-500 hover:text-red-600 p-1 flex items-center gap-1 text-xs font-bold"> <Plus size={14} /> Add Value </button>
                        </div>

                        {values.map((val, i) => (
                            <div key={i} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                                <div className="flex gap-2">
                                    <input type="text" value={val.title} onChange={(e) => { const v = [...values]; v[i].title = e.target.value; setValues(v); }} placeholder="Value Name/Title" className="flex-1 p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white font-bold" />
                                    <select value={val.icon} onChange={(e) => { const v = [...values]; v[i].icon = e.target.value; setValues(v); }} className="w-24 p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white">
                                        <option value="Shield">Shield</option>
                                        <option value="Target">Target</option>
                                        <option value="Users">Users</option>
                                        <option value="Award">Award</option>
                                    </select>
                                </div>
                                <textarea value={val.desc} onChange={(e) => { const v = [...values]; v[i].desc = e.target.value; setValues(v); }} placeholder="Description of this value" className="w-full p-2 text-xs rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white h-16 resize-none" />
                                <button onClick={() => setValues(values.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-200"> <Trash2 size={12} /> </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className="pb-16"></div>
        </div>
    );
};

export default AdminAbout;
