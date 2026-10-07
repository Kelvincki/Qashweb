import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  ShoppingBag, 
  LayoutDashboard, 
  Calendar, 
  Phone, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Store, 
  Receipt, 
  Clock, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  onNavigate: (route: PageRoute) => void;
}

interface ProductItem {
  id: number;
  store_code: string;
  local_id: number;
  nom: string;
  code_barres: string | null;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  seuil_alerte: number;
  vendu_par_poids: boolean;
}

interface SaleItem {
  id: string;
  store_id: string | null;
  store_code: string;
  employee_id: string | null;
  amount: number;
  created_at: string;
}

interface StoreData {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading, signOut } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    }
  }, [user, authLoading, onNavigate]);

  // 1. Fetch User Profile (public.profiles where id = user.id)
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    setProfileError(null);

    try {
      // Diagnostic logging requested by user
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('--- DIAGNOSTIC SUPABASE AUTH & PROFILES ---');
      console.log('1. user.id:', user.id);
      console.log('2. user.email:', user.email);
      console.log('3. session présente:', !!sessionData.session);

      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, role, store_id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('4. HTTP status requête profiles:', status);
      console.log('5. Résultat exact profiles data:', data);
      console.log('6. Erreur Supabase éventuelle:', error);

      if (error) {
        console.error('Erreur Supabase lors du chargement du profil:', error);
        setProfileError(`Erreur base de données (${error.code || status}): ${error.message}`);
        setProfileData(null);
      } else if (!data) {
        console.warn('Aucun enregistrement profil trouvé dans public.profiles pour user.id =', user.id);
        setProfileError('Aucun profil associé à cet utilisateur dans Supabase. Veuillez vous assurer d\'avoir créé votre boutique sur l\'application Android QASH.');
        setProfileData(null);
      } else {
        setProfileData(data);
      }
    } catch (err: any) {
      console.error('Erreur inattendue profil:', err);
      setProfileError('Impossible de charger les informations de profil.');
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  // 2. Fetch Store and Store Stats once Profile is loaded
  const fetchStoreAndStats = useCallback(async () => {
    if (!profileData?.store_id || profileData.role !== 'GERANT') return;

    setStoreLoading(true);
    setStatsLoading(true);
    setStoreError(null);
    setStatsError(null);

    try {
      // a) Get store from public.stores where id = profileData.store_id
      const { data: storeRow, error: storeErr } = await supabase
        .from('stores')
        .select('*')
        .eq('id', profileData.store_id)
        .single();

      if (storeErr || !storeRow) {
        console.error('Erreur chargement boutique:', storeErr);
        setStoreError('Boutique introuvable pour ce compte gérant.');
        setStoreLoading(false);
        setStatsLoading(false);
        return;
      }

      setStoreData(storeRow as StoreData);
      setStoreLoading(false);

      const storeCode = storeRow.invite_code;

      // b) Fetch Products from public.products where store_code = storeRow.invite_code
      const { data: productsData, error: productsErr } = await supabase
        .from('products')
        .select('*')
        .eq('store_code', storeCode);

      if (productsErr) {
        console.error('Erreur chargement produits:', productsErr);
      } else {
        setProducts(productsData || []);
      }

      // c) Fetch Sales from public.sales where store_code = storeRow.invite_code
      const { data: salesData, error: salesErr } = await supabase
        .from('sales')
        .select('*')
        .eq('store_code', storeCode)
        .order('created_at', { ascending: false });

      if (salesErr) {
        console.error('Erreur chargement ventes:', salesErr);
      } else {
        setSales(salesData || []);
      }
    } catch (err: any) {
      console.error('Erreur chargement données boutique:', err);
      setStatsError('Erreur lors du chargement des statistiques de la boutique.');
    } finally {
      setStoreLoading(false);
      setStatsLoading(false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData && profileData.role === 'GERANT') {
      fetchStoreAndStats();
    }
  }, [profileData, fetchStoreAndStats]);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/login');
  };

  const handleRefreshAll = () => {
    if (user) {
      fetchUserProfile();
    }
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-neutral-50" id="dashboard-loading">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-qash-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-500 font-medium">Chargement de votre espace QASH...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled via useEffect
  }

  // Derived calculations
  const metadata = user.user_metadata || {};
  const firstName = metadata.first_name || '';
  const lastName = metadata.last_name || '';
  const fullName = metadata.full_name || user.email?.split('@')[0] || 'Commerçant';

  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const salesCount = sales.length;
  const totalProducts = products.length;
  const lowStockProducts = products
    .filter((p) => Number(p.stock_actuel) <= Number(p.seuil_alerte))
    .sort((a, b) => Number(a.stock_actuel) - Number(b.stock_actuel));

  return (
    <div className="min-h-[85vh] bg-neutral-50/60 py-12 px-4 sm:px-6 lg:px-8" id="dashboard-page">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Error State */}
        {profileError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-qash-red-200 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-qash-red-50 text-qash-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-900 text-base">Profil utilisateur introuvable</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{profileError}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <button
                onClick={handleRefreshAll}
                className="px-4 py-2 bg-qash-red-500 text-white rounded-xl text-xs font-semibold hover:bg-qash-red-600 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réessayer
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </button>
            </div>
          </motion.div>
        )}

        {/* EMPLOYEE Specific Role View */}
        {profileData && profileData.role === 'EMPLOYE' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-qash-gold-400/10 text-qash-gold-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-1">
                    Compte EMPLOYE
                  </div>
                  <h1 className="text-xl font-bold text-neutral-900">Espace Employé QASH</h1>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-200/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </button>
            </div>

            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <p className="text-sm text-neutral-800 font-semibold">
                Bienvenue, {fullName} ({user.email})
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Votre compte est configuré avec le rôle <strong className="text-amber-700">EMPLOYE</strong>. L&apos;interface Web de supervision est réservée aux comptes GÉRANT.
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pour enregistrer des ventes, scanner des produits ou gérer votre caisse au quotidien, veuillez ouvrir l&apos;application mobile <strong className="text-neutral-900">Android QASH</strong> sur votre smartphone.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              Code boutique associé : <span className="font-bold text-neutral-800">{profileData.store_id || 'Non assigné'}</span>
            </div>
          </motion.div>
        )}

        {/* GERANT Supervision Dashboard */}
        {profileData && profileData.role === 'GERANT' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header / Store Header */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supervision Gérant Live
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  <Store className="w-7 h-7 text-qash-red-500 shrink-0" />
                  {storeData?.name || 'Boutique QASH'}
                </h1>
                <p className="text-neutral-500 text-xs sm:text-sm mt-1 flex items-center gap-2">
                  <span>Gérant : <strong>{fullName}</strong></span>
                  <span>•</span>
                  <span>Code Invitation : <strong className="font-mono text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">{storeData?.invite_code || '...'}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleRefreshAll}
                  disabled={statsLoading}
                  className="px-3.5 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-qash-red-500' : ''}`} />
                  Actualiser
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-neutral-200/50 active:scale-[0.98]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>

            {/* Error or Loading indicators */}
            {storeError && (
              <div className="p-4 bg-qash-red-50 border border-qash-red-100 rounded-xl text-qash-red-600 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{storeError}</span>
              </div>
            )}

            {/* 4 Core KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Revenue */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Chiffre d&apos;Affaires</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${totalRevenue.toLocaleString('fr-FR')} FCFA`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Total des encaissements
                </div>
              </div>

              {/* Card 2: Sales Count */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ventes enregistrées</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${salesCount} transactions`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Nombre total de reçus
                </div>
              </div>

              {/* Card 3: Products */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Catalogue Produits</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${totalProducts} articles`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Produits référencés
                </div>
              </div>

              {/* Card 4: Low Stock Alert */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Stock Faible</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${lowStockProducts.length} alertes`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  {lowStockProducts.length > 0 ? (
                    <span className="text-amber-700 font-semibold">Réapprovisionnement nécessaire</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Stock optimal ✓</span>
                  )}
                </div>
              </div>

            </div>

            {/* Main Content Grid: Stock Alerts + Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Low Stock Detail View */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Produits en Stock Faible
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {lowStockProducts.length} alerte{lowStockProducts.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {statsLoading ? (
                    <div className="py-8 text-center text-xs text-neutral-400">Analyse du stock...</div>
                  ) : lowStockProducts.length === 0 ? (
                    <div className="py-10 text-center text-neutral-400 text-xs font-medium space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        ✓
                      </div>
                      <p>Tous les produits ont un niveau de stock suffisant.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 text-xs">
                          <div>
                            <p className="font-bold text-neutral-900">{p.nom}</p>
                            <p className="text-[10px] text-neutral-500">Prix : {Number(p.prix_vente).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                              {p.stock_actuel} restant{Number(p.stock_actuel) > 1 ? 's' : ''}
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Seuil : {p.seuil_alerte}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                  Calculé à partir des seuils d&apos;alerte configurés sur l&apos;application mobile.
                </div>
              </div>

              {/* Recent Sales View */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-qash-red-500" />
                      Dernières Ventes Enregistrées
                    </h2>
                    <span className="text-xs font-medium text-neutral-500">
                      {sales.length} total
                    </span>
                  </div>

                  {statsLoading ? (
                    <div className="py-8 text-center text-xs text-neutral-400">Chargement des transactions...</div>
                  ) : sales.length === 0 ? (
                    <div className="py-10 text-center text-neutral-400 text-xs font-medium space-y-2">
                      <p>Aucune vente enregistrée pour cette boutique.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {sales.slice(0, 8).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 text-xs">
                          <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">
                              N° {String(s.id).substring(0, 8)}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {new Date(s.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 text-sm">
                              +{Number(s.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                  Mises à jour en direct depuis l&apos;application Android et Supabase Realtime.
                </div>
              </div>

            </div>

            {/* Bottom Info Banner */}
            <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-qash-gold-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Synchronisation QASH Android & Web
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  Toutes les ventes réalisées par votre équipe depuis leurs téléphones Android apparaissent instantanément sur cette console. L&apos;authentification et la base de données sont 100% unifiées.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Base Live & Connectée
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};
