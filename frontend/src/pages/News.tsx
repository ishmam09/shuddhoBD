import React from 'react';

const MOCK_NEWS = [
    {
        id: 1,
        title: "Minister Investigated for Mega Project Corruption",
        source: "Dhaka Tribune",
        time: "3 hours ago",
        sentiment: "Negative",
        sentimentColor: "bg-shuddho-red text-white",
        imgUrl: "https://images.unsplash.com/photo-1590424686483-e02fb4890fb6?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        title: "Bridge Project Audit Reveals Budget Irregularities",
        source: "The Daily Star",
        time: "5 hours ago",
        sentiment: "Negative",
        sentimentColor: "bg-shuddho-red text-white",
        imgUrl: "https://images.unsplash.com/photo-1621252179027-9c60e30325fa?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        title: "Anti-Corruption Commission Files Case Against Locals",
        source: "Prothom Alo",
        time: "2 hours ago",
        sentiment: "Negative",
        sentimentColor: "bg-shuddho-red text-white",
        imgUrl: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Digital Procurement System Introduced to Reduce Corruption",
        source: "Dhaka Tribune",
        time: "1 day ago",
        sentiment: "Positive",
        sentimentColor: "bg-shuddho-neon text-black",
        imgUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        title: "Illegal Sand Mining Network Discovered in Sylhet",
        source: "New Age",
        time: "8 hours ago",
        sentiment: "Negative",
        sentimentColor: "bg-shuddho-red text-white",
        imgUrl: "https://images.unsplash.com/photo-1533596644080-6058d867c268?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        title: "Transparency Report Shows Improved Budget Oversight",
        source: "BD News 24",
        time: "4 days ago",
        sentiment: "Positive",
        sentimentColor: "bg-shuddho-neon text-black",
        imgUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop"
    }
];

export default function News() {
    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-12">
            {/* Header section */}
            <div className="text-center mb-10 w-full">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Emerging & Ongoing Incidents</h1>
                <p className="text-slate-400 text-sm">Latest news related to corruption and governance in Bangladesh</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center w-full gap-4 mb-8">
                <input 
                    type="text" 
                    placeholder="Search keyword for sentiment analysis..." 
                    className="flex-1 bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 w-full"
                />
                
                <button className="bg-shuddho-card border border-shuddho-border text-white font-semibold rounded-xl px-12 py-3 w-full md:w-auto text-sm hover:bg-slate-800 transition-all flex items-center justify-center">
                    Latest News
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {MOCK_NEWS.map((news) => (
                    <div key={news.id} className="bg-shuddho-card border border-shuddho-border rounded-2xl p-4 flex gap-6 hover:border-slate-600 transition-colors">
                        {/* Image */}
                        <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 bg-slate-800 rounded-xl overflow-hidden relative">
                            {/* Adding a stylised gradient overlay for aesthetic depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-shuddho-bg/50 to-transparent z-10 w-full h-full"></div>
                            <img 
                                src={news.imgUrl} 
                                alt={news.title}
                                className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                            />
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col justify-between py-1 flex-1">
                            <h3 className="text-lg font-bold text-white leading-snug line-clamp-3">{news.title}</h3>
                            
                            <div className="mt-auto space-y-3">
                                <div className="text-sm text-slate-400 font-medium">
                                    {news.source} 
                                    <span className="mx-2">•</span> 
                                    {news.time}
                                </div>
                                
                                <div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${news.sentimentColor}`}>
                                        {news.sentiment}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
