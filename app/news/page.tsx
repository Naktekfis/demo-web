import { sanityClient } from '@/lib/sanity/client'
import { hasSanityConfig } from '@/lib/sanity'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'

// Render static page at build time, revalidate every 60s
export const revalidate = 60

const articlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[0..9] {
    _id, title, slug, excerpt, publishedAt,
    "coverImageUrl": coverImage.asset->url
  }
`

export default async function NewsPage() {
  const articles = hasSanityConfig()
    ? await sanityClient.fetch(articlesQuery).catch(() => [])
    : []

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Berita Acara</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Berita & Artikel</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Ikuti update terbaru, pengumuman kompetisi, dan artikel inspiratif seputar ITB Insight.</p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Belum ada berita</h3>
            <p className="text-slate-500 mt-2">Artikel akan segera diperbarui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any) => (
              <article
                key={article._id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-50">
                      <span className="text-indigo-300 font-medium">ITB Insight</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-slate-700">{article.author || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
