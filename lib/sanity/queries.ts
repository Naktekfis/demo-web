import { defineQuery } from 'next-sanity'

export const competitionsQuery = defineQuery(`
  *[_type == "competition" && isActive == true] | order(regOpen asc) {
    _id,
    title,
    slug,
    description,
    category,
    teamMin,
    teamMax,
    regOpen,
    regClose,
    requirements,
    "guideBookUrl": guideBook.asset->url
  }
`)

export const competitionBySlugQuery = defineQuery(`
  *[_type == "competition" && slug.current == $slug && isActive == true][0] {
    _id,
    title,
    slug,
    description,
    category,
    teamMin,
    teamMax,
    regOpen,
    regClose,
    requirements,
    timeline,
    "guideBookUrl": guideBook.asset->url
  }
`)

export const articlesQuery = defineQuery(`
  *[_type == "article"] | order(publishedAt desc)[0..9] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    "coverImageUrl": coverImage.asset->url
  }
`)
