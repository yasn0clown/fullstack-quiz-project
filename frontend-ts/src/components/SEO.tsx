import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  jsonLd?: object;
}

export default function SEO({ title, description, type = 'website', jsonLd }: SEOProps) {
  const siteTitle = "Платформа Тестов";
  const fullTitle = `${title} | ${siteTitle}`;
  const canonLink = window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || "Создавайте и проходите тесты с помощью ИИ"} />
      <link rel="canonical" href={canonLink} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonLink} />
    </Helmet>
  );
}