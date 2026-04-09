import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    if (typeof document === 'undefined') {
                        return undefined
                    }
                    const cookies = document.cookie.split(';')
                    for (const cookie of cookies) {
                        const [key, value] = cookie.trim().split('=')
                        if (key === name) return decodeURIComponent(value)
                    }
                    return undefined
                },
                set(name: string, value: string, options: any) {
                    if (typeof document === 'undefined') {
                        return
                    }
                    let cookieString = `${name}=${encodeURIComponent(value)}`
                    if (options?.maxAge) {
                        cookieString += `; Max-Age=${options.maxAge}`
                    }
                    if (options?.expires) {
                        cookieString += `; expires=${options.expires.toUTCString()}`
                    }
                    if (options?.path) {
                        cookieString += `; path=${options.path}`
                    }
                    document.cookie = cookieString
                },
                remove(name: string, options: any) {
                    if (typeof document === 'undefined') {
                        return
                    }
                    let cookieString = `${name}=; Max-Age=0`
                    if (options?.path) {
                        cookieString += `; path=${options.path}`
                    }
                    document.cookie = cookieString
                },
            },
        }
    )
}
