import { redirect } from 'next/navigation'

interface GenreSlugPageProps {
  params: Promise<{ slug: string }>
}

export default async function GenreSlugPage({ params }: GenreSlugPageProps) {
  const { slug } = await params
  redirect(`/browse?genre=${slug}`)
}
