import { SITE } from '@/config/site';

const abs = (path: string) => new URL(path, SITE.url).toString();

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: SITE.name,
    url: SITE.url,
    description: SITE.shortDescription,
    inLanguage: 'en',
    publisher: { '@id': abs('/#organization') },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs('/learn?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: SITE.name,
    url: SITE.url,
    description: SITE.shortDescription,
    logo: abs('/og/default.svg'),
    sameAs: [SITE.github],
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.url),
    mainEntityOfPage: abs(opts.url),
    image: abs(opts.image ?? SITE.defaultOgImage),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    keywords: opts.keywords?.join(', '),
    inLanguage: 'en',
    author: { '@type': 'Organization', name: SITE.author },
    publisher: { '@id': abs('/#organization') },
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: abs(opts.url),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': abs('/#organization') },
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}
