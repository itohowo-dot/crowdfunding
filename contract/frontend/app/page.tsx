import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';

// Mock data - will be replaced with real data from API
const featuredCampaigns = [
  {
    campaignId: 1,
    title: "Revolutionary DeFi Protocol on Stacks",
    description: "Building the next generation of decentralized finance tools with enhanced security and user experience.",
    imageUrl: "https://via.placeholder.com/400x300?text=DeFi+Protocol",
    category: "Technology",
    goal: 50000,
    raised: 37500,
    deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
    status: 1,
    backerCount: 156,
    creator: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  },
  {
    campaignId: 2,
    title: "NFT Marketplace for Digital Artists",
    description: "Empowering artists to showcase and sell their digital creations with zero platform fees.",
    imageUrl: "https://via.placeholder.com/400x300?text=NFT+Marketplace",
    category: "Art",
    goal: 25000,
    raised: 28000,
    deadline: Date.now() + 5 * 24 * 60 * 60 * 1000,
    status: 1,
    backerCount: 89,
    creator: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
  },
  {
    campaignId: 3,
    title: "Blockchain-Based Gaming Platform",
    description: "Create, play, and earn in a decentralized gaming ecosystem with true asset ownership.",
    imageUrl: "https://via.placeholder.com/400x300?text=Gaming+Platform",
    category: "Games",
    goal: 100000,
    raised: 45000,
    deadline: Date.now() + 25 * 24 * 60 * 60 * 1000,
    status: 1,
    backerCount: 234,
    creator: "SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23EGH1KNK60",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5 py-20">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Fund the Future on the
                <span className="text-primary"> Blockchain</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transparent, milestone-based crowdfunding with democratic governance. 
                Built on Stacks for ultimate security and transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/campaigns" className="btn-primary">
                  Browse Campaigns
                </Link>
                <Link href="/create" className="btn-secondary">
                  Start Your Campaign
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">$2.5M+</div>
                <div className="text-gray-600 mt-2">Total Raised</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">500+</div>
                <div className="text-gray-600 mt-2">Funded Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">10K+</div>
                <div className="text-gray-600 mt-2">Active Backers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Campaigns */}
        <section className="py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Trending Campaigns
              </h2>
              <Link href="/campaigns" className="text-primary hover:text-primary-dark font-semibold">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.campaignId} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose CrowdStack?
              </h2>
              <p className="text-lg text-gray-600">
                Built on blockchain for transparency, security, and trust
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-gray-600 text-sm">
                  Smart contracts ensure funds are protected and released only when conditions are met
                </p>
              </div>

              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Democratic</h3>
                <p className="text-gray-600 text-sm">
                  Backers vote on milestone releases with voting power based on contribution
                </p>
              </div>

              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Transparent</h3>
                <p className="text-gray-600 text-sm">
                  All transactions on blockchain - complete visibility and accountability
                </p>
              </div>

              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Milestone-Based</h3>
                <p className="text-gray-600 text-sm">
                  Funds released progressively as creators achieve and prove milestones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple, transparent, and secure fundraising process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Create Campaign</h3>
                <p className="text-gray-600">
                  Set your funding goal, timeline, and milestones. Add rewards for backers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Get Funded</h3>
                <p className="text-gray-600">
                  Share your campaign and receive STX contributions from supporters worldwide.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Deliver & Release</h3>
                <p className="text-gray-600">
                  Complete milestones, get backer approval, and receive funds progressively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Bring Your Project to Life?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of creators who have successfully funded their dreams
            </p>
            <Link href="/create" className="btn-secondary inline-block">
              Start Your Campaign Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
