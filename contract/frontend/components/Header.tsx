import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">CS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CrowdStack</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/campaigns" className="text-gray-700 hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/create" className="text-gray-700 hover:text-primary transition-colors">
              Start Campaign
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn-secondary py-2 px-4 text-sm">
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
