import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link2, Check, Share2 } from 'lucide-react';

const FloatingShareButtons = ({ title, url, shortDescription }) => {
    const [copied, setCopied] = useState(false);

    // Always calculate URLs correctly using browser globals only inside functions
    const getReadableUrl = () => {
        try {
            return decodeURI(url || window.location.href);
        } catch {
            return window.location.href;
        }
    };

    const handleShare = async (platform) => {
        const readableUrl = getReadableUrl();
        const text = title || 'Check this out';

        if (platform === 'copy') {
            await navigator.clipboard.writeText(readableUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        if (platform === 'native') {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: shortDescription || text,
                        url: readableUrl,
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                handleShare('copy');
            }
            return;
        }

        const shareUrls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' - ' + readableUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(readableUrl)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(readableUrl)}&text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(readableUrl)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[90] hidden xl:flex flex-col gap-3">
            <button
                onClick={() => handleShare('whatsapp')}
                className="p-3 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Share on WhatsApp"
            >
                <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
            </button>
            <button
                onClick={() => handleShare('facebook')}
                className="p-3 bg-[#1877F2] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Share on Facebook"
            >
                <Facebook size={20} fill="currentColor" strokeWidth={0} />
            </button>
            <button
                onClick={() => handleShare('twitter')}
                className="p-3 bg-[#1DA1F2] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Share on Twitter"
            >
                <Twitter size={20} fill="currentColor" strokeWidth={0} />
            </button>
            <button
                onClick={() => handleShare('linkedin')}
                className="p-3 bg-[#0A66C2] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Share on LinkedIn"
            >
                <Linkedin size={20} fill="currentColor" strokeWidth={0} />
            </button>

            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-auto my-1"></div>

            <button
                onClick={() => handleShare('copy')}
                className="p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Copy Link"
            >
                {copied ? <Check size={20} className="text-green-400" /> : <Link2 size={20} />}
            </button>
            <button
                onClick={() => handleShare('native')}
                className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform xl:hidden"
                title="Share"
            >
                <Share2 size={20} />
            </button>
        </div>
    );
};

export default FloatingShareButtons;
