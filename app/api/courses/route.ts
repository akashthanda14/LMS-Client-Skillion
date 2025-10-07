import { NextRequest, NextResponse } from 'next/server';
import { mockCourses } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    let filteredCourses = [...mockCourses];

    // Filter by level
    if (level && level !== 'all') {
      filteredCourses = filteredCourses.filter(course => 
        course.level === level
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        (course.creator?.name?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredCourses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
