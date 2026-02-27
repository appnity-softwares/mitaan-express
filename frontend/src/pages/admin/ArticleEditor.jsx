import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Type, Globe, Tag, Zap, TrendingUp, Eye, Calendar, Image as ImageIcon, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCategories, useArticle } from '../../hooks/useQueries';
import { useCreateArticle, useUpdateArticle } from '../../hooks/useMutations';
import { useCreateMedia } from '../../hooks/useMedia';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import TransliteratedInput from '../../components/admin/TransliteratedInput';
import toast from 'react-hot-toast';

const ArticleEditor = () => {
    const { t, adminLang } = useAdminTranslation();
    // Use adminLang from context for fallback logic if needed, but t() handles translation.
    // However, the original code used `t` as an object. We need to adapt.
    // If `t` from hook is a function `t(key)`, we need to check how it's used.
    // Original: t.title
    // Hook: t('title')
    // I need to update all usages of `t.key` to `t('key')` as well.
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const defaultCategoryId = queryParams.get('categoryId');

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('content'); // content, seo, settings
    const [isHindiTypingEnabled, setIsHindiTypingEnabled] = useState(false);

    // Ref for file input
    const quillRef = useRef(null);
    const fileInputRef = useRef(null); // For editor content images
    const featuredImageInputRef = useRef(null); // For featured image

    // TanStack Query Hooks
    const { data: categories = [] } = useCategories();
    const { data: article, isLoading: articleLoading } = useArticle(id);
    const createMediaMutation = useCreateMedia();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image: '',
        videoUrl: '',
        categoryId: '',
        status: 'DRAFT',
        language: 'en', // Default language
        isBreaking: false,
        isTrending: false,
        isFeatured: false,
        tags: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        scheduledAt: '',
        priority: 'NORMAL', // HIGH, NORMAL, LOW
    });

    const currentCategory = categories.find(c => c.id === parseInt(formData.categoryId));
    const [articleId, setArticleId] = useState(null); // Store actual database ID

    useEffect(() => {
        if (article) {
            setArticleId(article.id);
            setFormData({
                title: article.title || '',
                slug: article.slug || '',
                content: article.content || '',
                excerpt: article.shortDescription || article.excerpt || '',
                image: article.image || '',
                videoUrl: article.videoUrl || '',
                categoryId: article.categoryId?.toString() || '',
                status: article.status || 'DRAFT',
                language: article.language || 'en',
                isBreaking: article.isBreaking || false,
                isTrending: article.isTrending || false,
                isFeatured: article.isFeatured || false,
                tags: article.tags?.map(t => t.name).join(', ') || '',
                metaTitle: article.metaTitle || '',
                metaDescription: article.metaDescription || '',
                metaKeywords: article.metaKeywords || '',
                scheduledAt: article.scheduledAt || '',
                priority: article.priority || 'NORMAL',
            });
        } else if (defaultCategoryId && !id) {
            setFormData(prev => ({ ...prev, categoryId: defaultCategoryId }));
        }
    }, [article, defaultCategoryId, id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-generate slug from title
        if (name === 'title' && !id) {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\u0900-\u097F\s-]/g, '') // Allow Hindi
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleAutoGenerateSeo = () => {
        // Strip HTML from content for description if excerpt is empty
        let description = formData.excerpt;
        if (!description && formData.content) {
            const tmp = document.createElement("DIV");
            tmp.innerHTML = formData.content;
            description = tmp.textContent || tmp.innerText || "";
            description = description.substring(0, 157) + "...";
        }

        setFormData(prev => ({
            ...prev,
            metaTitle: prev.title.substring(0, 60),
            metaDescription: description ? description.substring(0, 160) : prev.metaDescription,
            metaKeywords: prev.tags // Use tags as keywords
        }));
        alert('SEO metadata generated from content!');
    };

    // Mutation hooks for cache invalidation
    const createArticleMutation = useCreateArticle();
    const updateArticleMutation = useUpdateArticle();

    const handleSubmit = async (e, statusOverride) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                shortDescription: formData.excerpt,
                videoUrl: formData.videoUrl,
                status: statusOverride || formData.status,
                language: formData.language,
                categoryId: parseInt(formData.categoryId),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                priority: formData.priority,
                scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null,
                metadata: {} // Clear metadata usage for these fields
            };

            if (articleId) {
                // Use mutation hook for update with cache invalidation
                await updateArticleMutation.mutateAsync({ id: articleId, formData: submitData });
                toast.success('Article updated successfully!');
            } else {
                // Use mutation hook for create with cache invalidation
                await createArticleMutation.mutateAsync(submitData);
                toast.success('Article created successfully!');
            }
            navigate('/admin/articles');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save article: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Custom Image Handler for Quill
    const imageHandler = useCallback(() => {
        console.log('Image handler triggered');
        if (fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            console.error('File input ref is null');
        }
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Read file as base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result;

                // Upload using useCreateMedia
                const response = await createMediaMutation.mutateAsync({
                    type: 'IMAGE',
                    title: file.name,
                    url: base64Image,
                    category: 'SYSTEM',
                    size: `${(file.size / 1024).toFixed(0)} KB`
                });

                // Insert image into editor
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);

                quill.insertEmbed(range.index, 'image', response.url || base64Image);
                quill.setSelection(range.index + 1);
            };
        } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            // Reset input
            e.target.value = '';
        }
    };

    const handleFeaturedImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Read file as base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result;

                // Upload using useCreateMedia
                const response = await createMediaMutation.mutateAsync({
                    type: 'IMAGE',
                    title: file.name,
                    url: base64Image,
                    category: 'SYSTEM',
                    size: `${(file.size / 1024).toFixed(0)} KB`
                });

                // Update form data with the image URL
                setFormData(prev => ({
                    ...prev,
                    image: response.url || base64Image
                }));
            };
        } catch (error) {
            console.error('Featured image upload failed:', error);
            toast.error('Failed to upload featured image. Please try again.');
        } finally {
            // Reset input
            e.target.value = '';
        }
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), [imageHandler]);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Hidden File Input for Quill Image Upload */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/articles')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {id ? 'Edit Article' : (currentCategory ? `New ${currentCategory.name} Article` : 'Create New Article')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {id ? 'Update your article' : (currentCategory ? `Adding content to ${currentCategory.name} section` : 'Write and publish your news article')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setIsHindiTypingEnabled(!isHindiTypingEnabled)}
                        className={`px-4 py-2 rounded-lg font-bold border transition-all flex items-center gap-2 ${isHindiTypingEnabled
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <Type size={18} />
                        {t('enable_hindi_typing') || 'Hindi Typing'} {' '}
                        {isHindiTypingEnabled ? '(ON)' : '(OFF)'}
                    </button>
                    <button
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                        {t('save_draft') || 'Save Draft'}
                    </button>
                    <button
                        onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {id ? t('edit') : t('publish')}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
                {[
                    { id: 'content', label: t('article_content'), icon: <Type size={16} /> },
                    { id: 'seo', label: 'SEO', icon: <Globe size={16} /> },
                    { id: 'settings', label: t('settings'), icon: <Tag size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('title')} *
                            </label>
                            <TransliteratedInput
                                value={formData.title}
                                name="title"
                                onChange={handleChange}
                                enabled={isHindiTypingEnabled}
                                placeholder="Enter article headline..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white text-lg font-bold"
                            />
                        </div>

                        {/* Excerpt (now labeled Title) */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('summary')}
                            </label>
                            <TransliteratedInput
                                value={formData.excerpt}
                                name="excerpt"
                                onChange={handleChange}
                                enabled={isHindiTypingEnabled}
                                isTextArea={true}
                                rows={3}
                                placeholder="Short article title for preview..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Language Selector */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('language')}
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.language === 'en' ? 'border-red-600 bg-red-50 dark:bg-red-900/10 text-red-600' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="language"
                                        value="en"
                                        checked={formData.language === 'en'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="font-bold">English (EN)</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.language === 'hi' ? 'border-red-600 bg-red-50 dark:bg-red-900/10 text-red-600' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="language"
                                        value="hi"
                                        checked={formData.language === 'hi'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="font-bold">Hindi (हिंदी)</span>
                                </label>
                            </div>
                        </div>

                        {/* Slug */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                URL Slug *
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                placeholder="article-url-slug"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Preview: /article/{formData.slug || 'your-slug'}
                            </p>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <ImageIcon size={16} />
                                {t('featured_image')}
                            </label>

                            {/* Hidden File Input for Featured Image */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={featuredImageInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFeaturedImageUpload}
                            />

                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => featuredImageInputRef.current?.click()}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center min-w-[3rem]"
                                    title="Upload Image"
                                >
                                    <Upload size={20} className="text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            {formData.image && (
                                <div className="mt-4 relative group w-full max-w-md">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, image: '' }))}
                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        title="Remove Image"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Video URL */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Upload size={16} />
                                {t('video_url')}
                            </label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                                {t('article_content')} *
                            </label>

                            {isHindiTypingEnabled && (
                                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20 rounded-xl flex items-center gap-2">
                                    <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                                        ⚠️ Hindi Mode: Rich text formatting disabled. Type in English for Hindi transliteration.
                                    </span>
                                </div>
                            )}

                            <div className="prose-editor">
                                {isHindiTypingEnabled ? (
                                    <TransliteratedInput
                                        value={formData.content}
                                        name="content"
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        enabled={true}
                                        isTextArea={true}
                                        rows={15}
                                        placeholder="Type in English for Hindi transliteration... (e.g., 'namaste' → 'नमस्ते')"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white resize-none font-medium leading-relaxed"
                                    />
                                ) : (
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        className="bg-white dark:bg-slate-900 rounded-xl"
                                        style={{ minHeight: '400px' }}
                                    />
                                )}
                            </div>
                        </div>


                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="text-red-600" size={20} />
                                    SEO Optimization
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerateSeo}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Zap size={12} />
                                    Auto-Fill from Content
                                </button>
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleChange}
                                        placeholder="SEO title (60 characters max)"
                                        maxLength="60"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="SEO description (160 characters max)"
                                        maxLength="160"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        name="metaKeywords"
                                        value={formData.metaKeywords}
                                        onChange={handleChange}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* SEO Preview */}
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-2">Google Search Preview:</p>
                                <div className="space-y-1">
                                    <div className="text-blue-600 text-lg">{formData.metaTitle || formData.title || 'Your Article Title'}</div>
                                    <div className="text-green-700 text-sm">/article/{formData.slug || 'your-slug'}</div>
                                    <div className="text-slate-600 text-sm">{formData.metaDescription || formData.excerpt || 'Your article description will appear here...'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Category & Tags */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4">Category & Tags</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                        disabled={!!defaultCategoryId && !id} // Lock category if creating from valid context
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white ${defaultCategoryId && !id ? 'opacity-75 cursor-not-allowed font-bold' : ''}`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.filter(c => !c.parentId).map(parent => (
                                            <optgroup key={parent.id} label={`${parent.nameHi} / ${parent.name}`}>
                                                <option value={parent.id}>
                                                    Main: {parent.nameHi} / {parent.name}
                                                </option>
                                                {categories.filter(c => c.parentId === parent.id).map(child => (
                                                    <option key={child.id} value={child.id}>
                                                        └─ {child.nameHi} / {child.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {defaultCategoryId && !id && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">🔒 Locked to current category</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <Tag size={16} />
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        onBlur={(e) => setFormData(p => ({ ...p, tags: p.tags.split(',').map(t => t.trim()).filter(Boolean).join(', ') }))}
                                        placeholder="politics, economy, breaking"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Article Flags */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4">Article Flags</h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isBreaking"
                                        checked={formData.isBreaking}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-2 ring-red-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Zap size={16} className="text-red-600" />
                                            Breaking News
                                        </div>
                                        <div className="text-xs text-slate-500">Mark as breaking news (appears in banner)</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isTrending"
                                        checked={formData.isTrending}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-2 ring-red-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <TrendingUp size={16} className="text-orange-600" />
                                            Trending
                                        </div>
                                        <div className="text-xs text-slate-500">Show in trending section</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-2 ring-red-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Eye size={16} className="text-blue-600" />
                                            Featured Article
                                        </div>
                                        <div className="text-xs text-slate-500">Highlight on homepage</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Schedule Publishing */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar className="text-red-600" size={20} />
                                Schedule Publishing
                            </h3>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Publish Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="scheduledAt"
                                    value={formData.scheduledAt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                                />
                                <p className="text-xs text-slate-500 mt-2">Leave empty to publish immediately</p>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4">Article Priority</h3>

                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                            >
                                <option value="HIGH">High Priority</option>
                                <option value="NORMAL">Normal Priority</option>
                                <option value="LOW">Low Priority</option>
                            </select>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ArticleEditor;
