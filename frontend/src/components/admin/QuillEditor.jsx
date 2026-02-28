import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = forwardRef(({ value, onChange, placeholder, modules }, ref) => {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useImperativeHandle(ref, () => ({
        getEditor: () => quillInstance.current
    }));

    useEffect(() => {
        if (!quillInstance.current && editorRef.current) {
            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: placeholder || 'Write something amazing...',
                modules: modules || {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image', 'video'],
                        ['clean']
                    ]
                }
            });

            quillInstance.current.on('text-change', () => {
                const html = editorRef.current.children[0].innerHTML;
                onChange(html === '<p><br></p>' ? '' : html);
            });
        }
    }, [onChange, placeholder, modules]);

    useEffect(() => {
        if (quillInstance.current) {
            const currentContent = editorRef.current.children[0].innerHTML;
            if (value !== currentContent && value !== undefined) {
                if (!currentContent || currentContent === '<p><br></p>') {
                    quillInstance.current.clipboard.dangerouslyPasteHTML(value);
                }
            }
        }
    }, [value]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
            <div ref={editorRef} style={{ minHeight: '400px' }} />
        </div>
    );
});

export default QuillEditor;
