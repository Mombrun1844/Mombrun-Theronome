
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import type { NotificationType } from '../types';

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    switch (type) {
        case 'info': return <Info className="text-blue-400" />;
        case 'warning': return <AlertTriangle className="text-orange-400" />;
        case 'error': return <XCircle className="text-red-500" />;
        case 'success': return <CheckCircle className="text-green-400" />;
        default: return <Info />;
    }
};

const notificationStyles = {
    info: 'border-l-4 border-blue-400',
    warning: 'border-l-4 border-orange-400',
    error: 'border-l-4 border-red-500',
    success: 'border-l-4 border-green-400'
};

const Notifications: React.FC = () => {
    const { notifications } = useContext(AppContext);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Historique des Notifications</h1>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-lg bg-slate-800/60 flex items-start gap-4 ${notificationStyles[notif.type]}`}>
                        <div className="flex-shrink-0 pt-1">
                            <NotificationIcon type={notif.type} />
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString('fr-FR')}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Aucune notification pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
