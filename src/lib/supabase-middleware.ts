import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    try {
        // Refresh session if needed (this will handle expired tokens)
        const { data: { user } } = await supabase.auth.getUser()

        // unprotected routes
        const isAuthPage = request.nextUrl.pathname.startsWith('/login')
        const isApiRoute = request.nextUrl.pathname.startsWith('/api')
        const isStaticAsset = /\.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$/i.test(request.nextUrl.pathname)

        // Skip auth checks for API routes, static assets, and _next files
        if (isApiRoute || isStaticAsset || request.nextUrl.pathname.startsWith('/_next')) {
            return response
        }

        // DEVELOPMENT BYPASS CHECK
        const isDevAuth = request.cookies.get('dev-auth')?.value === 'true'
        if (isDevAuth) {
            if (isAuthPage) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
            return response
        }

        if (!user && !isAuthPage) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    } catch (error) {
        // If there's an error checking auth, let it through
        // The client-side will handle redirects
        console.error('Auth middleware error:', error)
    }

    return response
}

