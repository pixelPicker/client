import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-6 px-8 flex items-center justify-between bg-white text-gray-900 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-light tracking-wide text-gray-900 hover:text-gray-600 transition-colors">
          My App
        </Link>
      </div>

      <nav className="flex items-center gap-4">
        <Link
          to="/login"
          className="text-gray-600 hover:text-black font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Sign Up
        </Link>
      </nav>
    </header>
  )
}
