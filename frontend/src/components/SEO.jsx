import React from 'react';
import { Helmet } from 'react-helmet-async';

const ensureAbsoluteUrl = (url, fallback = 'https://mitaanexpress.com/logo.png') => {
    if (!url || url === 'undefined' || url === 'null' || url === '') return fallback;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Relative path - prepend domain
    const DOMAIN = typeof window !== 'undefined' ? window.location.origin : 'https://mitaanexpress.com';
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${DOMAIN}${cleanPath}`;
};

const SEO = ({
    title = 'Mitaan Express - Premium News & Magazine',
    description = 'Unbiased news, deep insights, and real-time updates from Mitaan Express.',
    image,
    url = typeof window !== 'undefined' ? window.location.href : 'https://mitaanexpress.com',
    type = 'website',
    author = 'Mitaan Express',
    keywords = 'news, magazine, india news, latest news',
    schemaData = null
}) => {
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="designer" content="Appnity Softwares Private Limited" />
            <meta name="developer" content="Appnity Softwares Private Limited" />
            <meta name="contact" content="www.appnity.co.in" />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ensureAbsoluteUrl(image)} />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content="Mitaan Express" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ensureAbsoluteUrl(image)} />
            <meta name="twitter:image:alt" content={title} />

            {/* Structured Data */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}

            {/* Theme & Icons */}
            <meta name="theme-color" content="#dc2626" />
        </Helmet>
    );
};

export default SEO;
