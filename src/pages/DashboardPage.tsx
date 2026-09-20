import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { LogOut, User as UserIcon, Mail, ShieldCheck, ShoppingBag, LayoutDashboard, Calendar, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, loading, signOut } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!loading && !user) {
      onNavigate('/login');
    }
  }, [user, loading, onNavigate]);

  // Attempt to fetch profile info if available (to satisfy store_id / profile prep guideline)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      try {
        // Prepare query to fetch profile for future schema expansion (fails gracefully if table doesn't exist yet)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfileData(data);
        }
      } catch (err) {
        console.log('Profile query ignored, table may not exist yet:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50" id="dashboard-loading">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting via useEffect
  }

  // Get name from metadata
  const metadata = user.user_metadata || {};
  const firstName = metadata.first_name || '';
  const lastName = metadata.last_name || '';
  const fullName = metadata.full_name || user.email?.split('@')[0] || 'Commerçant';

  return (
    <div className="min-h-[85vh] bg-neutral-50/50 py-16 px-4 sm:px-6 lg:px-8" id="dashboard-page">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-qash-green-50 text-qash-green-600 border border-qash-green-600/20 rounded-full text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Espace connecté avec succès
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Bienvenue sur QASH, {fullName}
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                Votre session est sécurisée avec Supabase Auth.
              </p>
            </div>
            
            <button
              id="logout-btn"
              onClick={handleSignOut}
              className="px-4 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 rounded-xl text-sm font-medium flex items-center gap-2 transition-all cursor-pointer border border-neutral-200/50 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Card */}
            <div className="md:col-span-2 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-4">
                <UserIcon className="w-5 h-5 text-neutral-400" />
                Informations de votre compte QASH
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    ID Utilisateur
                  </span>
                  <span className="text-sm font-mono text-neutral-800 bg-neutral-50 px-2 py-1 rounded border border-neutral-150 select-all block truncate">
                    {user.id}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Adresse e-mail
                  </span>
                  <span className="text-sm text-neutral-800 flex items-center gap-1.5 font-medium">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    {user.email}
                  </span>
                </div>

                {firstName || lastName ? (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Identité
                    </span>
                    <span className="text-sm text-neutral-800 font-medium">
                      {firstName} {lastName}
                    </span>
                  </div>
                ) : null}

                {user.phone && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Téléphone
                    </span>
                    <span className="text-sm text-neutral-800 flex items-center gap-1.5 font-medium">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {user.phone}
                    </span>
                  </div>
                )}

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Création du compte
                  </span>
                  <span className="text-sm text-neutral-800 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {profileData && (
                <div className="pt-4 border-t border-neutral-100">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Boutique associée (Profil)
                  </span>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        {profileData.store_name || 'Boutique active'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        ID Boutique: {profileData.store_id || 'Aucune'}
                      </p>
                    </div>
                    {profileData.role && (
                      <span className="px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {profileData.role}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* App Promotion Card */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-base">
                  Application Mobile QASH
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  L'authentification sur ce site utilise la même base de données que votre application Android QASH.
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Tous vos produits, transactions et analyses de paniers se synchronisent en temps réel.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Statut de l'infrastructure
                </div>
                <div className="mt-2 flex items-center gap-2 text-qash-green-600 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-qash-green-500 animate-pulse"></span>
                  Supabase Live & Connected
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
