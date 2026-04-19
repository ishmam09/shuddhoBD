import React, { useState } from 'react';
import { useNews } from '../hooks/useNews';
import NewsCard from '../components/NewsCard';

const ARTICLES_PER_PAGE = 12;

const News: React.FC = () => {
  const { articles, loading, error } = useNews();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const paginated = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-2">Anti-Corruption News</h1>
        <p className="text-slate-400 text-sm mb-8">
          Latest news on corruption and accountability in Bangladesh
        </p>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-shuddho-card rounded-xl h-64 animate-pulse border border-shuddho-border" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-shuddho-red text-center mt-20">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((article, index) => (
                <NewsCard key={index} {...article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm rounded-lg bg-shuddho-card text-white border border-shuddho-border hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-lg bg-shuddho-card text-white border border-shuddho-border hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default News;
