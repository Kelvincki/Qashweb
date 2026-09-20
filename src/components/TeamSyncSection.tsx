import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  Database, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const TeamSyncSection: React.FC = () => {
  // Sync animation phase: 
  // 0: Idle / Cart ready on Employee phone
  // 1: Click validation on Employee phone
  // 2: Data flying / Syncing in transit
  // 3: Dashboard updated on Manager phone (CA increases, new sale appears)
  const [syncPhase, setSyncPhase] = useState<number>(0);
  const [caAmount, setCaAmount] = useState<number>(145000);
  const [salesCount, setSalesCount] = useState<number>(18);
  const [offlineState, setOfflineState] = useState<'offline' | 'saved' | 'syncing' | 'online'>('offline');

  // Loop for the phone synchronization animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncPhase((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          // Reset dashboard numbers
          setCaAmount(145000);
          setSalesCount(18);
        } else if (next === 3) {
          // Incremented dashboard numbers on successful sync
          setCaAmount(150500);
          setSalesCount(19);
        }
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Loop for offline state illustration
  useEffect(() => {
    const timer = setInterval(() => {
      setOfflineState((prev) => {
        switch (prev) {
          case 'offline': return 'saved';
          case 'saved': return 'syncing';
          case 'syncing': return 'online';
          default: return 'offline';
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  };

  return (
    <section id="sync-equipe" className="py-24 bg-neutral-50 border-b border-neutral-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-qash-red-50 border border-qash-red-100 text-qash-red-600 text-xs font-bold mb-3">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-qash-red-500" />
            <span>Synchronisation Temps Réel</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-4 leading-tight">
            Votre équipe synchronisée, <br className="hidden sm:inline" />
            <span className="text-qash-red-500">même sur plusieurs téléphones.</span>
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Le Gérant garde une vision complète de la boutique pendant que chaque Employé peut vendre depuis son propre téléphone. QASH synchronise automatiquement les données.
          </p>
        </div>

        {/* Visual Composition: Two Phones & Sync Stream */}
        <div className="relative max-w-5xl mx-auto bg-white rounded-3xl border border-neutral-200/80 p-8 md:p-12 shadow-xs mb-16">
          
          {/* Background grid accents */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 z-10">
            
            {/* 1. EMPLOYEE PHONE (Source of Sales) */}
            <div className="flex flex-col items-center">
              <span className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Téléphone : <strong className="text-qash-gold-600">Employé</strong></span>
              </span>

              {/* Phone Frame */}
              <div className="relative w-[280px] h-[520px] bg-neutral-950 rounded-[2.5rem] p-3 shadow-xl border-4 border-neutral-800 flex flex-col justify-between overflow-hidden">
                {/* Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-950 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-neutral-800 rounded-full" />
                </div>

                {/* Phone screen content */}
                <div className="flex-1 bg-white rounded-[1.8rem] p-3.5 pt-6 flex flex-col justify-between overflow-hidden text-neutral-800">
                  
                  {/* App Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-qash-gold-500 flex items-center justify-center text-white text-[10px] font-black">
                          Q
                        </div>
                        <span className="text-xs font-black tracking-tight">QASH Caisse</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">
                        Vendeur #1
                      </span>
                    </div>

                    {/* Simple Product Grid */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Produits</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50/60 flex flex-col justify-between text-left">
                          <span className="text-[10px] font-bold text-neutral-800 truncate">Sardines Cap</span>
                          <span className="text-[9px] font-semibold text-neutral-500">650 F</span>
                        </div>
                        <div className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50/60 flex flex-col justify-between text-left">
                          <span className="text-[10px] font-bold text-neutral-800 truncate">Spaghetti 500g</span>
                          <span className="text-[9px] font-semibold text-neutral-500">450 F</span>
                        </div>
                        <div className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50/60 flex flex-col justify-between text-left">
                          <span className="text-[10px] font-bold text-neutral-800 truncate">Lait Bonnet R.</span>
                          <span className="text-[9px] font-semibold text-neutral-500">800 F</span>
                        </div>
                        <div className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50/60 flex flex-col justify-between text-left">
                          <span className="text-[10px] font-bold text-neutral-800 truncate">Sucre en Poudre</span>
                          <span className="text-[9px] font-semibold text-neutral-500">1 200 F</span>
                        </div>
                      </div>
                    </div>

                    {/* Cart View */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-left">
                      <div className="flex items-center justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        <span>Panier Actif</span>
                        <ShoppingCart className="w-3 h-3 text-neutral-400" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-neutral-700">
                          <span>Sardines Cap × 5</span>
                          <span>3 250 F</span>
                        </div>
                        <div className="flex justify-between font-semibold text-neutral-700">
                          <span>Lait Bonnet R. × 1</span>
                          <span>800 F</span>
                        </div>
                        <div className="flex justify-between font-semibold text-neutral-700 border-t border-neutral-200/60 pt-1 mt-1 text-neutral-800 font-bold">
                          <span>Sucre en Poudre × 1</span>
                          <span>1 200 F</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validate Sale Button */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-100 p-2 rounded-xl mb-2">
                      <span className="text-neutral-500">Total panier</span>
                      <span className="text-sm font-black text-neutral-900">5 250 FCFA</span>
                    </div>

                    {/* Validate CTA */}
                    <div className="relative">
                      <div className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        syncPhase === 1 
                          ? 'bg-qash-green-600 text-white scale-98' 
                          : syncPhase === 2
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-qash-gold-500 text-white hover:bg-qash-gold-600'
                      }`}>
                        {syncPhase === 1 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                            <span>Vente Validée !</span>
                          </>
                        ) : syncPhase === 2 ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Enregistrer la vente</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </div>

                      {/* Ripple pulse on click trigger */}
                      {syncPhase === 0 && (
                        <div className="absolute inset-0 bg-qash-gold-500/20 rounded-xl animate-ping pointer-events-none" />
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 2. SYNC ROUTER (Middle Pipeline indicator) */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-[140px] px-2 text-center lg:py-8">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 mb-2">
                Flux de données
              </span>
              <div className="text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200/80 px-3 py-1 rounded-full mb-4 inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-qash-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-qash-green-500"></span>
                </span>
                <span>Synchronisation QASH</span>
              </div>

              {/* Visual flow stream */}
              <div className="relative w-full h-12 flex items-center justify-center">
                {/* Dotted bridge line */}
                <div className="absolute left-0 right-0 h-0.5 border-t-2 border-dashed border-neutral-300" />
                
                {/* Traveling packet */}
                <AnimatePresence mode="wait">
                  {syncPhase === 2 && (
                    <motion.div
                      initial={{ x: -80, opacity: 0 }}
                      animate={{ x: 80, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute w-10 h-10 rounded-full bg-qash-green-500 border-2 border-white text-white flex items-center justify-center shadow-md"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* static indicators */}
                {syncPhase !== 2 && (
                  <div className="absolute w-3 h-3 rounded-full bg-neutral-300 border-2 border-white" />
                )}
              </div>

              <div className="mt-4 text-xs font-semibold text-neutral-500 max-w-[180px] leading-relaxed">
                {syncPhase === 0 && "Étape 1 : Saisie de la vente par l'employé"}
                {syncPhase === 1 && "Étape 2 : Validation de l'encaissement"}
                {syncPhase === 2 && "Étape 3 : Transfert instantané et sécurisé"}
                {syncPhase === 3 && "Étape 4 : Mise à jour du tableau de bord Gérant"}
              </div>
            </div>

            {/* 3. MANAGER PHONE (Dashboard supervision) */}
            <div className="flex flex-col items-center">
              <span className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Téléphone : <strong className="text-qash-red-500">Gérant</strong></span>
              </span>

              {/* Phone Frame */}
              <div className="relative w-[280px] h-[520px] bg-neutral-950 rounded-[2.5rem] p-3 shadow-xl border-4 border-neutral-800 flex flex-col justify-between overflow-hidden">
                {/* Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-950 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-neutral-800 rounded-full" />
                </div>

                {/* Phone screen content */}
                <div className="flex-1 bg-neutral-50 rounded-[1.8rem] p-3.5 pt-6 flex flex-col justify-between overflow-hidden text-neutral-800">
                  
                  {/* App Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-qash-red-500 flex items-center justify-center text-white text-[10px] font-black">
                          Q
                        </div>
                        <span className="text-xs font-black tracking-tight">QASH Gérant</span>
                      </div>
                      <span className="text-[9px] bg-qash-red-50 text-qash-red-600 font-bold px-2 py-0.5 rounded-full border border-qash-red-100">
                        Admin
                      </span>
                    </div>

                    {/* KPI Widget */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white p-2.5 rounded-xl border border-neutral-200/70 text-left">
                        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5 text-qash-green-500" /> Chiffre d&apos;Affaires
                        </div>
                        <div className="text-xs font-black text-neutral-900 mt-1 transition-all duration-300">
                          {formatPrice(caAmount)}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-neutral-200/70 text-left">
                        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-2.5 h-2.5 text-qash-red-500" /> Ventes Totales
                        </div>
                        <div className="text-xs font-black text-neutral-900 mt-1">
                          {salesCount} ventes
                        </div>
                      </div>
                    </div>

                    {/* Recent Employee Activity */}
                    <div className="bg-white p-3 rounded-xl border border-neutral-200/70 mb-3 text-left">
                      <div className="flex items-center justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        <span>Activité des employés</span>
                        <span className="text-[8px] text-neutral-500 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded">Aujourd&apos;hui</span>
                      </div>
                      <div className="space-y-1.5">
                        {/* Static sales */}
                        <div className="flex items-center justify-between text-[10px] border-b border-neutral-50 pb-1">
                          <span className="font-semibold text-neutral-700">Vente Kouamé</span>
                          <span className="font-bold text-qash-green-600">+12 500 F</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] border-b border-neutral-50 pb-1">
                          <span className="font-semibold text-neutral-700">Vente Aminata</span>
                          <span className="font-bold text-qash-green-600">+4 000 F</span>
                        </div>

                        {/* Animated live incoming sale from sync */}
                        <AnimatePresence>
                          {syncPhase === 3 ? (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between text-[10px] bg-qash-green-50/50 p-1 rounded border border-qash-green-100/30"
                            >
                              <span className="font-bold text-neutral-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-qash-green-500 animate-ping" />
                                Vente Vendeur #1
                              </span>
                              <span className="font-black text-qash-green-600">+5 250 F</span>
                            </motion.div>
                          ) : (
                            <div className="h-4 flex items-center justify-center text-[9px] text-neutral-400 italic">
                              En attente de ventes live...
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Stock Alert View */}
                    <div className="bg-white p-2.5 rounded-xl border border-neutral-200/70 text-left">
                      <div className="flex items-center justify-between text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        <span>Alerte Produits & Stock</span>
                        <Package className="w-3 h-3 text-neutral-400" />
                      </div>
                      <div className="text-[10px] space-y-1 text-neutral-600">
                        <div className="flex justify-between items-center bg-amber-50/40 p-1 rounded border border-amber-100/50">
                          <span className="font-semibold text-neutral-800">Boissons Soda</span>
                          <span className="text-amber-700 font-bold">12 restants</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Manager Footer / Quick summary */}
                  <div className="bg-neutral-900 text-white p-2.5 rounded-xl text-left">
                    <div className="text-[8px] uppercase tracking-widest text-qash-gold-400 font-black mb-1">
                      Statut Boutique
                    </div>
                    <div className="text-[9px] text-neutral-300 leading-normal flex items-center justify-between">
                      <span>Totalement synchronisé</span>
                      <div className="w-2 h-2 rounded-full bg-qash-green-500 animate-pulse" />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Live Sequence Flow Indicator */}
        <div className="flex items-center justify-center gap-2 mb-20 flex-wrap text-sm font-semibold text-neutral-600">
          <span>Employé enregistre</span>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
          <span className="px-3 py-1 rounded-full bg-qash-gold-500/10 text-qash-gold-700 border border-qash-gold-200">Nouvelle Vente</span>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
          <span className="text-qash-green-600">Synchronisation Automatique</span>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
          <span className="px-3 py-1 rounded-full bg-qash-red-50 text-qash-red-600 border border-qash-red-100">Gérant Notifié</span>
        </div>

        {/* 3 Core Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Benefit 1 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-qash-red-50 text-qash-red-600 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Le Gérant garde le contrôle
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Consultez les ventes réalisées par votre équipe et suivez l&apos;activité globale de votre boutique depuis votre propre téléphone en temps réel.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-qash-gold-500/10 text-qash-gold-700 flex items-center justify-center mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Chaque Employé travaille de façon autonome
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Les vendeurs enregistrent les encaissements rapidement au comptoir depuis leur téléphone sans avoir besoin d&apos;interrompre ou d&apos;utiliser le vôtre.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-qash-green-50 text-qash-green-600 flex items-center justify-center mb-6">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Synchronisation automatique
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Aucune action manuelle requise. Toutes les ventes enregistrées par vos collaborateurs sont instantanément unifiées sur votre tableau de bord.
            </p>
          </div>

        </div>

        {/* Offline-First Special Highlight Card */}
        <div className="max-w-4xl mx-auto bg-neutral-900 text-white rounded-3xl p-8 sm:p-10 border border-neutral-800 shadow-xl relative overflow-hidden text-left">
          {/* subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-qash-gold-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-qash-gold-500/10 border border-qash-gold-400/20 text-qash-gold-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-qash-gold-400" />
                <span>Même sans connexion.</span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Le réseau s&apos;interrompt ? <br className="hidden sm:inline" />
                Vos ventes ne s&apos;arrêtent jamais.
              </h4>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                QASH continue d&apos;enregistrer toutes vos ventes hors connexion. Les transactions sont conservées localement en toute sécurité, puis synchronisées automatiquement dès que la connexion internet est rétablie.
              </p>
            </div>

            {/* Simulated Live Offline-to-Online Widget */}
            <div className="w-full md:w-auto shrink-0 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 min-w-[240px] flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                Simulateur de secours
              </div>

              {/* Status Row */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <span className="text-xs font-semibold text-neutral-300">Réseau internet :</span>
                {offlineState === 'offline' || offlineState === 'saved' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 text-[10px] font-bold">
                    <WifiOff className="w-3 h-3" /> Coupé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-qash-green-950/40 text-qash-green-400 border border-qash-green-900/40 text-[10px] font-bold">
                    <Wifi className="w-3 h-3" /> Rétabli
                  </span>
                )}
              </div>

              {/* Progress Flow Graphic */}
              <div className="space-y-2.5">
                {/* Step 1: Record Offline */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    offlineState !== 'offline' ? 'bg-qash-green-600 text-white' : 'bg-qash-gold-500 text-white animate-pulse'
                  }`}>
                    1
                  </div>
                  <span className={offlineState === 'offline' ? 'text-white font-bold' : 'text-neutral-500'}>
                    Vente validée hors-ligne
                  </span>
                </div>

                {/* Step 2: Saved locally */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    offlineState === 'syncing' || offlineState === 'online' ? 'bg-qash-green-600 text-white' : offlineState === 'saved' ? 'bg-qash-gold-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-600'
                  }`}>
                    2
                  </div>
                  <span className={offlineState === 'saved' ? 'text-white font-bold' : 'text-neutral-500'}>
                    Données sauvegardées localement
                  </span>
                </div>

                {/* Step 3: Synced when online */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    offlineState === 'online' ? 'bg-qash-green-600 text-white' : offlineState === 'syncing' ? 'bg-qash-gold-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-600'
                  }`}>
                    3
                  </div>
                  <span className={offlineState === 'syncing' || offlineState === 'online' ? 'text-white font-bold' : 'text-neutral-500'}>
                    {offlineState === 'syncing' ? 'Synchronisation live...' : 'Données cloud à jour ✓'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
