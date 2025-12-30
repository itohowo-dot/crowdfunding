import Image from 'next/image';
import Link from 'next/link';

interface Campaign {
  campaignId: number;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  goal: number;
  raised: number;
  deadline: number;
  status: number;
  backerCount: number;
  creator: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = (campaign.raised / campaign.goal) * 100;
  const daysLeft = Math.max(0, Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24)));
  const isActive = campaign.status === 1;
  const isSuccessful = campaign.status === 2;
  const isFailed = campaign.status === 3;

  const statusBadge = () => {
    if (isSuccessful) return <span className="badge badge-success">Successful</span>;
    if (isFailed) return <span className="badge badge-failed">Failed</span>;
    if (!isActive) return <span className="badge badge-cancelled">Cancelled</span>;
    if (daysLeft === 0) return <span className="badge badge-failed">Ended</span>;
    if (daysLeft <= 3) return <span className="badge bg-warning text-white">Ending Soon</span>;
    return <span className="badge badge-active">Active</span>;
  };

  return (
    <Link href={`/campaigns/${campaign.campaignId}`}>
      <div className="card overflow-hidden group cursor-pointer h-full">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl text-primary/30">📊</span>
            </div>
          )}
          
          {/* Category badge */}
          {campaign.category && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-white/90 text-gray-900 backdrop-blur-sm">
                {campaign.category}
              </span>
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {statusBadge()}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {campaign.description}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-900">
                {campaign.raised.toLocaleString()} STX
              </span>
              <span className="text-gray-500">
                {Math.min(progress, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{campaign.backerCount}</span>
              <span className="text-gray-500 ml-1">backers</span>
            </div>
            <div className="text-sm">
              {isActive && daysLeft > 0 ? (
                <>
                  <span className="font-semibold text-gray-900">{daysLeft}</span>
                  <span className="text-gray-500 ml-1">days left</span>
                </>
              ) : (
                <span className="text-gray-500">Ended</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
