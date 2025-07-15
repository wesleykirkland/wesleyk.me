import { NextRequest, NextResponse } from 'next/server';
import {
  searchPosts,
  getSearchSuggestions,
  getAllTags,
  type SearchOptions
} from '@/lib/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const includeContent = searchParams.get('content') === 'true';
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;
    const type = searchParams.get('type') || 'search';

    // Handle different request types
    if (type === 'suggestions') {
      const suggestions = getSearchSuggestions(query, limit || 5);
      return NextResponse.json({
        success: true,
        suggestions
      });
    }

    if (type === 'tags') {
      const allTags = getAllTags();
      return NextResponse.json({
        success: true,
        tags: allTags
      });
    }

    // Default search
    const searchOptions: SearchOptions = {
      query,
      tags: tags.length > 0 ? tags : undefined,
      includeContent,
      limit
    };

    const results = await searchPosts(searchOptions);

    return NextResponse.json({
      success: true,
      results,
      query,
      tags,
      includeContent,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during search'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to search posts.' },
    { status: 405 }
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
