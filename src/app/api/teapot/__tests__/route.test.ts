// Mock NextResponse before importing the route
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: {
          'content-type': 'application/json',
          ...init?.headers
        }
      });
      return response;
    })
  }
}));

import { GET } from '../route';

describe('/api/teapot Route', () => {
  describe('GET Method', () => {
    it("returns 418 I'm a teapot status", async () => {
      const response = await GET();

      expect(response.status).toBe(418);
    });

    it('returns correct teapot message', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.message).toBe("I'm a teapot 🫖");
      expect(data.status).toBe(418);
      expect(data.tip).toBe("Don't brew coffee with me.");
    });

    it('returns JSON content type', async () => {
      const response = await GET();

      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
    });

    it('is consistent across multiple calls', async () => {
      const response1 = await GET();
      const response2 = await GET();

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1).toEqual(data2);
      expect(response1.status).toBe(response2.status);
    });
  });

  describe('RFC 2324 Compliance', () => {
    it('implements the Hyper Text Coffee Pot Control Protocol', async () => {
      // This is a fun easter egg endpoint that implements RFC 2324
      const response = await GET();

      expect(response.status).toBe(418);

      const data = await response.json();
      expect(data.message).toContain('teapot');
      expect(data.tip).toContain('coffee');
    });
  });
});
