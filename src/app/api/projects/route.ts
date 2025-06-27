import { NextRequest, NextResponse } from 'next/server';

// Mock data for projects - in real app this would be database
let projects = [
  {
    id: 1,
    name: 'Sage at Franklin Construction',
    address: '123 Franklin St, Portland, OR',
    client_name: 'Franklin Development LLC',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Central Park Renovation',
    address: '456 Park Ave, Portland, OR', 
    client_name: 'City Parks Department',
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, client_name } = body;

    if (!name || !address || !client_name) {
      return NextResponse.json(
        { error: 'Name, address, and client name are required' },
        { status: 400 }
      );
    }

    const newProject = {
      id: projects.length + 1,
      name,
      address,
      client_name,
      created_at: new Date().toISOString()
    };

    projects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}