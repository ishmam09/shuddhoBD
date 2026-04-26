import React from 'react';
import { Newspaper } from 'lucide-react';

interface Props {
  title: string;
  link: string;
  image: string;
  pubDate: string;
  source: string;
  hideImage?: boolean;
}

const NewsCard: React.FC<Props> = ({ title, link, image, pubDate, source, hideImage }) => {
  
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "Recently";
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) return dateStr;
    const diffInSeconds = Math.floor((new Date().getTime() - parsedDate.getTime()) / 1000);
    
    if (diffInSeconds < 3600) return `${Math.max(1, Math.floor(diffInSeconds / 60))} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#0b1121] rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-colors group flex flex-col h-full"
    >
      {!hideImage && (
        image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-40 bg-slate-900 flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-slate-700" />
          </div>
        )
      )}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-shuddho-neon font-bold uppercase tracking-wider mb-2">{source}</p>
        <h3 className="text-sm font-bold text-white leading-snug mb-3 line-clamp-3 group-hover:text-slate-300 transition-colors">{title}</h3>
        <div className="mt-auto">
          <p className="text-xs text-slate-400">
            {timeAgo(pubDate)}
          </p>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
