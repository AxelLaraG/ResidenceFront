import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Función para decodificar el token JWT
function decodeToken(token: string) {
  try {
    const decoded = jwt.decode(token) as { id: string; role: string; email: string; institution?: string; exp: number } | null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if ((request.nextUrl.pathname.startsWith('/MainView') || 
       request.nextUrl.pathname.startsWith('/EsquemasConf')) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/EsquemasConf') && token) {
    const decodedToken = decodeToken(token);
    
    if (!decodedToken || decodedToken.role !== 'admin') {
      return NextResponse.redirect(new URL('/MainView', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/MainView','/EsquemasConf'],
};
