
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import Card from './shared/Card';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useContext(AppContext);
    const [email, setEmail] = useState(settings.notificationEmail);

    useEffect(() => {
        setEmail(settings.notificationEmail);
    }, [settings.notificationEmail]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ notificationEmail: email });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold">Configuration Email</h2>
                    <p className="text-gray-400 text-sm">
                        Saisissez l'adresse email où les notifications importantes (stock faible, rupture de stock) seront envoyées.
                        Ceci est une simulation et n'enverra pas de vrais emails.
                    </p>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Adresse Email de Notification</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="exemple@domaine.com"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="py-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">
                            Sauvegarder
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
