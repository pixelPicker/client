import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Header from '../components/Header'

export const Route = createFileRoute('/login')({
    component: Login,
})

import { useLogin } from '../hooks/useAuth'

// ... existing imports

function Login() {
    const { mutate: login, isPending: isLoading, error } = useLogin()
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        login({ email, password })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Header />
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-4xl font-bold text-gray-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Please sign in to your account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {(error as any).message || 'An error occurred'}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>


                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Link to="/signup" className="font-medium text-cyan-600 hover:text-cyan-500">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
