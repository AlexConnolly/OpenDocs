import { MetadataRoute } from 'next';
import { getAllDocsSlugs } from '@/lib/docs';

export default function sitemap(): MetadataRoute.Sitemap {
    const slugs = getAllDocsSlugs();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '__SITE_URL__';

    return slugs.map((slug) => {
        const urlPath = slug.length > 0 ? `/${slug.join('/')}` : '';
        return {
            url: `${baseUrl}${urlPath}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: slug.length === 0 ? 1 : 0.8,
        };
    });
}
