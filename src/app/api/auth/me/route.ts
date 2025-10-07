import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/api';

// Mock user data - in a real app, this would come from a database
const mockUsers: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  'creator@example.com': {
    id: '2',
    email: 'creator@example.com',
    name: 'Creator User',
    role: 'CREATOR',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  'akashthanda14@gmail.com': {
    id: '6a21dbd9-2fa5-4429-a571-c8f68dc7cc47',
    email: 'akashthanda14@gmail.com',
    name: 'Learner User',
    role: 'LEARNER',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify the JWT token
      interface JwtPayload { email?: string; [key: string]: unknown }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;

      // Find user by email from the token
      const user = decoded?.email ? mockUsers[decoded.email] : undefined;

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user
      });
    } catch (err) {
      // jwt.verify may throw; treat as invalid token
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
