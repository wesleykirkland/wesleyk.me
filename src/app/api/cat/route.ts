import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Cache for cat images to avoid filesystem reads on every request
let catImagesCache: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCatImages(): string[] {
  const now = Date.now();

  // Return cached results if still valid
  if (catImagesCache && now - cacheTimestamp < CACHE_DURATION) {
    return catImagesCache;
  }

  try {
    const catsDirectory = path.join(process.cwd(), 'public', 'cats');

    // Check if cats directory exists
    if (!fs.existsSync(catsDirectory)) {
      console.warn('Cats directory not found at:', catsDirectory);
      return [];
    }

    // Read all files in the cats directory
    const files = fs.readdirSync(catsDirectory);

    // Filter for supported image formats
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_FORMATS.includes(ext);
    });

    // Update cache
    catImagesCache = imageFiles;
    cacheTimestamp = now;

    console.log(`Found ${imageFiles.length} cat images in ${catsDirectory}`);
    return imageFiles;
  } catch (error) {
    console.error('Error reading cats directory:', error);
    return [];
  }
}

function getRandomCatImage(): string | null {
  const catImages = getCatImages();

  if (catImages.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * catImages.length);
  return catImages[randomIndex];
}

export async function GET(request: NextRequest) {
  try {
    const randomCat = getRandomCatImage();

    if (!randomCat) {
      return NextResponse.json(
        {
          success: false,
          error: 'No cat images found',
          message: 'Please add cat images to the /public/cats directory'
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const info = searchParams.get('info');

    // Base cat data
    const catData = {
      success: true,
      image: `/cats/${randomCat}`,
      filename: randomCat,
      url: `${request.nextUrl.origin}/cats/${randomCat}`,
      timestamp: new Date().toISOString()
    };

    // Add additional info if requested
    if (info === 'true') {
      const catImages = getCatImages();
      const catPath = path.join(process.cwd(), 'public', 'cats', randomCat);

      try {
        const stats = fs.statSync(catPath);
        Object.assign(catData, {
          fileSize: stats.size,
          lastModified: stats.mtime.toISOString(),
          totalCats: catImages.length,
          supportedFormats: SUPPORTED_FORMATS
        });
      } catch (error) {
        console.error('Error getting file stats:', error);
      }
    }

    // Return different formats based on query parameter
    switch (format) {
      case 'redirect': {
        // Redirect directly to the image
        const redirectResponse = NextResponse.redirect(
          new URL(`/cats/${randomCat}`, request.url)
        );
        redirectResponse.headers.set(
          'X-Cat-Count',
          getCatImages().length.toString()
        );
        return redirectResponse;
      }

      case 'image':
        // Return the image file directly
        try {
          const imagePath = path.join(
            process.cwd(),
            'public',
            'cats',
            randomCat
          );
          const imageBuffer = fs.readFileSync(imagePath);
          const ext = path.extname(randomCat).toLowerCase();

          // Determine content type
          let contentType = 'image/jpeg'; // default
          switch (ext) {
            case '.jpg':
            case '.jpeg':
              contentType = 'image/jpeg';
              break;
            case '.png':
              contentType = 'image/png';
              break;
            case '.gif':
              contentType = 'image/gif';
              break;
            case '.webp':
              contentType = 'image/webp';
              break;
          }

          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
              'X-Cat-Filename': randomCat
            }
          });
        } catch (error) {
          console.error('Error serving image:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to serve image' },
            { status: 500 }
          );
        }

      case 'json':
      default:
        // Return JSON response (default)
        return NextResponse.json(catData, {
          headers: {
            'Cache-Control': 'no-cache', // Don't cache JSON responses
            'X-Cat-Count': getCatImages().length.toString()
          }
        });
    }
  } catch (error) {
    console.error('Cat API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch random cat image'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch a random cat.' },
    { status: 405 }
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
