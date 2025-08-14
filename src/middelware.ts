import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // 관리자 권한이 필요한 페이지 체크
    if (req.nextUrl.pathname.startsWith('/posts/create') || 
        req.nextUrl.pathname.startsWith('/posts/edit')) {
      if (!req.nextauth.token?.isAdmin) {
        return Response.redirect(new URL('/auth/signin', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 인증이 필요한 페이지들
        if (req.nextUrl.pathname.startsWith('/posts/create') || 
            req.nextUrl.pathname.startsWith('/posts/edit')) {
          return !!token && token.isAdmin === true;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/posts/create/:path*', '/posts/edit/:path*']
};


