import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'PawfectFind - Your Pet Product Discovery Platform',
  description = 'Discover personalized pet products tailored to your dog\'s unique needs. Browse high-quality food, toys, accessories and more.',
  image = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  url = 'https://pawfectfind.com',
  type = 'website'
}) => {
  const siteTitle = title.includes('PawfectFind') ? title : `${title} | PawfectFind`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PawfectFind" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="application-name" content="PawfectFind" />
      <meta name="apple-mobile-web-app-title" content="PawfectFind" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "PawfectFind",
          "url": "https://pawfectfind.com",
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pawfectfind.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;