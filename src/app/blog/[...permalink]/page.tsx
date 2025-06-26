import { notFound, permanentRedirect } from 'next/navigation';
import { getPostByPermalink, getPostPermalink } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{
    permalink: string[];
  }>;
}

// This route handles redirects from /blog/permalink to /permalink
export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { permalink } = await params;
  const permalinkPath = permalink.join('/');

  // Check if this is a valid blog post
  const postMeta = getPostByPermalink(permalinkPath);

  if (postMeta) {
    // 301/308 permanent redirect to modern slug-based URL
    permanentRedirect(`/${getPostPermalink(postMeta)}`);
  }

  notFound();
}
