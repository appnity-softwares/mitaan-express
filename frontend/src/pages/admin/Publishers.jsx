import React, { useState } from 'react';
import { usePublishers } from '../../hooks/useQueries';
import { useCreatePublisher, useUpdatePublisher, useDeletePublisher } from '../../hooks/useMutations';
import { useCreateMedia } from '../../hooks/useMedia';
import { 
    Plus, Edit, Trash2, Users, X, Upload, 
    Activity, Newspaper, Info, UserPen
} from 'lucide-react';
import toast from 'react-hot-toast';

const Publishers = () => {
    // TanStack Query Hooks
    const { data: publishers = [], isLoading: loading } = usePublishers();
    const createPublisherMutation = useCreatePublisher();
    const updatePublisherMutation = useUpdatePublisher();
    const deletePublisherMutation = useDeletePublisher();
    const createMediaMutation = useCreateMedia();

    // Local State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nameHi: '',
        image: '',
        designation: '',
        description: ''
    });

    const handleOpenModal = (publisher = null) => {
        if (publisher) {
            setEditingPublisher(publisher);
            setFormData({
                name: publisher.name || '',
                nameHi: publisher.nameHi || '',
                image: publisher.image || '',
                designation: publisher.designation || '',
                description: publisher.description || ''
            });
        } else {
            setEditingPublisher(null);
            setFormData({
                name: '',
                nameHi: '',
                image: '',
                designation: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            if (editingPublisher) {
                await updatePublisherMutation.mutateAsync({ 
                    id: editingPublisher.id, 
                    formData 
                });
                toast.success('Author updated!');
            } else {
                await createPublisherMutation.mutateAsync(formData);
                toast.success('Author created!');
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err.message || 'Failed to save author');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will fail if articles or blogs are linked to this author.')) return;

        try {
            await deletePublisherMutation.mutateAsync(id);
            toast.success('Author deleted successfully');
        } catch (e) {
            toast.error(e.message || 'Error deleting author');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64Image = reader.result;
            // Upload to R2
            createMediaMutation.mutate({
                payload: {
                    type: 'IMAGE',
                    title: `author-${file.name}`,
                    url: base64Image,
                    category: 'PUBLISHERS'
                }
            }, {
                onSuccess: (data) => {
                    setFormData(prev => ({ ...prev, image: data.url }));
                    toast.success('Image uploaded!');
                },
                onError: (err) => toast.error('Upload failed: ' + err.message)
            });
        };
    };

    return (
        <div className="p-4 lg:p-10 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Authors</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Manage authors and agencies</p>
                </div>
                <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95">
                    <Plus size={18} />
                    Add Author
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 flex justify-center"><Activity className="animate-spin text-red-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishers.map(pub => (
                        <div key={pub.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="relative h-32 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                {pub.image ? (
                                    <img src={pub.image} alt={pub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Users size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <div className="font-black uppercase tracking-tighter text-lg leading-tight">{pub.name}</div>
                                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{pub.designation || 'Author'}</div>
                                </div>
                            </div>
                            
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Newspaper size={12} />
                                        <span>{pub._count?.articles || 0} Articles</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserPen size={12} />
                                        <span>{pub._count?.blogs || 0} Blogs</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(pub)} className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(pub.id)} className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] p-4 shadow-2xl overflow-hidden border border-white/20">
                        <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-white/5">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {editingPublisher ? 'Edit Author' : 'Add New Author'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto publishers-scroll">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-900 overflow-hidden border-2 border-slate-200 dark:border-white/10 flex items-center justify-center">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-red-600 text-white rounded-xl cursor-pointer hover:bg-red-700 shadow-lg transition-transform active:scale-95">
                                        <Upload size={14} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Author Photo</div>
                                    <div className="text-[9px] text-slate-500">Recommended: Square image</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Author Name (EN)</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                        placeholder="e.g. PTI"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Author Name (HI)</label>
                                    <input
                                        value={formData.nameHi}
                                        onChange={e => setFormData({ ...formData, nameHi: e.target.value })}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                        placeholder="e.g. समाचार"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Designation / Role</label>
                                    <input
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                        placeholder="e.g. Senior Reporter"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">About / Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all resize-none"
                                        placeholder="Short bio or agency details..."
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" disabled={createPublisherMutation.isLoading || updatePublisherMutation.isLoading} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50">Save Author</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .publishers-scroll::-webkit-scrollbar { width: 4px; }
                .publishers-scroll::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
                .dark .publishers-scroll::-webkit-scrollbar-thumb { background: #334155; }
            ` }} />
        </div>
    );
};

export default Publishers;
