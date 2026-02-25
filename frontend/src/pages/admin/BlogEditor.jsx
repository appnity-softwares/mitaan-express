import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCategories, useBlog } from '../../hooks/useQueries';
import { createBlog, updateBlog } from '../../services/api';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("BlogEditor Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) return <div className="p-8 text-center text-red-500">Something went wrong in the editor. Please refresh.</div>;
        return this.props.children;
    }
}

const BlogEditorContent = () => {
    const { t, adminLang: adminLanguage } = useAdminTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [articleId, setArticleId] = useState(null);

    // TanStack Query Hooks
    const { data: categories = [] } = useCategories();
    const { data: article, isLoading: articleLoading } = useBlog(id);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        image: '',
        categoryId: '',
        status: 'DRAFT',
        language: adminLanguage || 'en',
        tags: '',
        excerpt: '',
    });

    useEffect(() => {
        if (article) {
            console.log("Blog data loaded from cache/API:", article.title);
            setArticleId(article.id);
            setFormData({
                title: article.title || '',
                slug: article.slug || '',
                content: article.content || '',
                image: article.image || '',
                categoryId: article.categoryId?.toString() || '',
                status: article.status || 'DRAFT',
                language: article.language || 'en',
                tags: article.tags?.map(t => t.name).join(', ') || '',
                excerpt: article.shortDescription || '',
            });
        }
    }, [article]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !id) {
            const slug = value.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e, statusOverride) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                status: statusOverride || formData.status,
                shortDescription: formData.excerpt || formData.content.substring(0, 150),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                categoryId: parseInt(formData.categoryId) || null,
                priority: 'NORMAL',
                isBreaking: false,
                isTrending: false,
                isFeatured: false,
                metadata: { type: 'personal-blog' }
            };

            console.log("Submitting Data:", submitData);

            if (articleId) {
                await updateBlog(token, articleId, submitData);
                alert('Blog updated successfully!');
            } else {
                await createBlog(token, submitData);
                alert('Blog published successfully!');
            }
            navigate('/admin/my-blogs');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save blog: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };



    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/my-blogs')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {id ? (t('editBlog') || 'Edit Blog') : (t('createBlog') || 'Write New Blog')}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        disabled={loading}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                        {t('saveDraft') || 'Save Draft'}
                    </button>
                    <button
                        onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                        disabled={loading}
                        className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-black hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        {id ? (t('update') || 'Update') : (t('publish') || 'Publish')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('title') || "Title"}
                        className="w-full text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                    />

                    <div className="prose-editor-simple">
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            modules={modules}
                            placeholder="Tell your story..."
                            className="bg-transparent text-lg"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">{t('settings') || 'Settings'}</h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('featuredImage') || 'Featured Image'}</label>
                            <div className="relative group">
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="Image URL..."
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-sm"
                                />
                                {formData.image && (
                                    <img src={formData.image} alt="" className="mt-2 rounded-lg w-full h-32 object-cover" />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('categories') || 'Category'}</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('tags') || 'Tags'}</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="story, life"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('summary') || 'Excerpt'}</label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .prose-editor-simple .ql-editor {
                    min-height: 400px;
                    font-size: 1.125rem;
                    line-height: 1.75;
                    border: none;
                }
                .prose-editor-simple .ql-container {
                    border: none !important;
                }
                .prose-editor-simple .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    margin-bottom: 1rem;
                }
                .dark .prose-editor-simple .ql-toolbar {
                    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                }
                .dark .ql-stroke { stroke: #94a3b8 !important; }
                .dark .ql-fill { fill: #94a3b8 !important; }
            `}</style>
        </div>
    );
};

const BlogEditor = (props) => (
    <ErrorBoundary>
        <BlogEditorContent {...props} />
    </ErrorBoundary>
);

export default BlogEditor;
