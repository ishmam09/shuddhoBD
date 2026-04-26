import { useState, useEffect, useRef } from 'react';
import { Bell, Check, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'high_severity' | 'new_report' | 'report_verified' | 'system';
    link: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                console.log(`[NOTIF] Received ${data.length} notifications:`, data.map((n: any) => n.title));
                setNotifications(data);
            } else {
                console.error(`Failed to fetch notifications: ${res.status} ${res.statusText}`);
            }
        } catch (err) {
            console.error('Network error fetching notifications', err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (res.ok) {
                setNotifications(notifications.map(n => 
                    n._id === id ? { ...n, isRead: true } : n
                ));
            }
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications/read-all`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            console.log('[NOTIF] Polling for new notifications...');
            fetchNotifications();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'high_severity': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            case 'new_report': return <FileText className="w-5 h-5 text-shuddho-neon" />;
            case 'report_verified': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            default: return <Bell className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-shuddho-neon transition-colors group"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-shuddho-neon animate-pulse' : 'text-slate-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white border-2 border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-shuddho-card border border-shuddho-border rounded-2xl shadow-2xl z-[60] overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b border-shuddho-border flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && <span className="text-xs font-normal text-shuddho-neon">({unreadCount} new)</span>}
                        </h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-slate-400 hover:text-shuddho-neon flex items-center gap-1 transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-shuddho-border">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif._id}
                                        className={`p-4 flex gap-3 hover:bg-slate-800/50 transition-colors relative group ${!notif.isRead ? 'bg-shuddho-neon/5' : ''}`}
                                    >
                                        <div className="flex-shrink-0 pt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-semibold truncate pr-4 ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                                                {notif.message}
                                            </p>
                                            {notif.link && (
                                                <Link 
                                                    to={notif.link}
                                                    onClick={() => {
                                                        markAsRead(notif._id);
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-[11px] font-bold text-shuddho-neon hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                        {!notif.isRead && (
                                            <button 
                                                onClick={() => markAsRead(notif._id)}
                                                className="absolute top-4 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 transition-all"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
