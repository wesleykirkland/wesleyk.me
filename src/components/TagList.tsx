import Link from 'next/link';
import { getTagSlug } from '@/lib/blog';

interface TagListProps {
  tags: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showCount?: boolean;
  currentTag?: string;
}

export default function TagList({
  tags,
  className = '',
  size = 'md',
  variant = 'default',
  showCount = false,
  currentTag
}: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const variantClasses = {
    default:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
    outline:
      'border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    solid: 'bg-blue-600 text-white hover:bg-blue-700'
  };

  const getCurrentTagClasses = (tag: string) => {
    if (currentTag && tag === currentTag) {
      return 'bg-blue-600 text-white';
    }
    return variantClasses[variant];
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tag/${getTagSlug(tag)}`}
          className={`inline-flex items-center rounded-full font-medium transition-colors duration-200 ${sizeClasses[size]} ${getCurrentTagClasses(tag)}`}
          title={`View all posts tagged with "${tag}"`}
        >
          {tag}
          {showCount && (
            <span className="ml-1 text-xs opacity-75">
              {/* Count would need to be passed as prop or calculated */}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
