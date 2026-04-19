import React from 'react';

interface Props {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
}

const NewsCard: React.FC<Props> = ({ title, description, url, urlToImage, publishedAt, source }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-shuddho-card rounded-xl shadow border border-shuddho-border hover:border-slate-600 transition overflow-hidden"
    >
      {urlToImage && (
        <img
          src={urlToImage}
          alt={title}
          className="w-full h-40 object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <div className="p-4">
        <p className="text-xs text-shuddho-neon font-semibold mb-1">{source}</p>
        <h3 className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2">{title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
        <p className="text-xs text-slate-500 mt-3">
          {new Date(publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>
    </a>
  );
};

export default NewsCard;
