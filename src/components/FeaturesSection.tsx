import React from 'react';
import {
  CreditCard,
  Package,
  ScanLine,
  Camera,
  Users,
  LineChart,
  WifiOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-neutral-50 border-b border-qash-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-2 block">
            Fonctionnalités essentielles
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Une gestion plus simple, au quotidien.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Chaque outil a été pensé pour répondre aux contraintes réelles du commerce de détail et accélérer vos opérations.
          </p>
        </motion.div>

        {/* Feature 1: Caisse & Ventes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-qash-border shadow-xs mb-8 hover:shadow-md transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-qash-red-50 text-qash-red-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500">
                01 · Encaissement rapide
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Caisse & ventes
              </h3>
              <p className="text-neutral-600 text-base leading-relaxed">
                Enregistrez vos ventes rapidement et gardez une vision claire de votre activité.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-neutral-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enregistrement immédiat de chaque vente</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calcul exact du montant des ventes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Historique exhaustif et traçabilité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Suivi précis des transactions de la journée</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 bg-neutral-50 rounded-2xl p-6 border border-qash-border">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Exemple de journal de caisse
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Vente #1024 · Espèces</div>
                    <div className="text-neutral-500 text-[11px]">3 articles · 14:22</div>
                  </div>
                  <div className="text-right font-bold text-qash-green-600 text-sm">
                    + 4 800 FCFA
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Vente #1023 · Mobile Money</div>
                    <div className="text-neutral-500 text-[11px]">1 article · 14:05</div>
                  </div>
                  <div className="text-right font-bold text-qash-green-600 text-sm">
                    + 2 500 FCFA
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Vente #1022 · Espèces</div>
                    <div className="text-neutral-500 text-[11px]">5 articles · 13:48</div>
                  </div>
                  <div className="text-right font-bold text-qash-green-600 text-sm">
                    + 9 200 FCFA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 2: Produits & Stock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-qash-border shadow-xs mb-8 hover:shadow-md transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 bg-neutral-50 rounded-2xl p-6 border border-qash-border">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Exemple de catalogue de stock
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Farine de blé 1kg</div>
                    <div className="text-neutral-500 text-[11px]">Catégorie : Épicerie</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-qash-green-50 text-qash-green-600 font-semibold text-[11px]">
                    En stock (48 unités)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Lait concentré sucré</div>
                    <div className="text-neutral-500 text-[11px]">Catégorie : Boissons</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-qash-gold-400/10 text-qash-gold-600 font-semibold text-[11px]">
                    Seuil bas (4 unités)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-qash-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Riz Parfumé 5kg</div>
                    <div className="text-neutral-500 text-[11px]">Catégorie : Céréales</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-qash-green-50 text-qash-green-600 font-semibold text-[11px]">
                    En stock (22 unités)
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-qash-gold-400/10 text-qash-gold-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-qash-gold-600">
                02 · Inventaire en temps réel
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Produits & stock
              </h3>
              <p className="text-neutral-600 text-base leading-relaxed">
                Gérez vos produits et gardez un œil sur vos niveaux de stock.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-neutral-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Catalogue clair et personnalisable</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mise à jour automatique des quantités vendues</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Visibilité instantanée de la disponibilité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Anticipation des réapprovisionnements</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Feature 3 & 4: IA Pair (Scan Factures & Scan Panier) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Scan de factures IA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-qash-border shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-qash-red-50 text-qash-red-600 flex items-center justify-center">
                <ScanLine className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-qash-red-50 border border-qash-red-100/80 text-qash-red-600 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-qash-gold-500" />
                <span>Outil IA</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Transformez vos factures en stock.
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                QASH utilise l&apos;intelligence artificielle pour analyser vos factures et faciliter l&apos;ajout de vos produits.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-qash-border">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Flux de traitement
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-neutral-800">
                <span className="px-2.5 py-1 rounded-md bg-neutral-100">Facture</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-100">Scan</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-qash-gold-400/20 text-qash-gold-600">Analyse IA</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-100">Produits</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-qash-green-50 text-qash-green-600">Stock</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-3">
                L&apos;IA accélère la saisie en préremplissant les informations détectées, avec validation par le commerçant.
              </p>
            </div>
          </motion.div>

          {/* Scan du panier IA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-qash-border shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-qash-gold-400/10 text-qash-gold-600 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-qash-gold-400/20 text-qash-gold-600 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-qash-gold-600" />
                <span>Outil IA</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Un panier. Un scan. Une vente.
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Accélérez l&apos;encaissement en utilisant le scan intelligent du panier pour identifier les articles sans recherche manuelle.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-qash-border">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Processus d&apos;encaissement
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-neutral-800">
                <span className="px-2.5 py-1 rounded-md bg-neutral-100">Articles</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-qash-gold-400/20 text-qash-gold-600">Scan Panier IA</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-100">Total calculé</span>
                <span className="text-neutral-400">→</span>
                <span className="px-2.5 py-1 rounded-md bg-qash-red-50 text-qash-red-600">Vente finalisée</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-3">
                Diminue les files d&apos;attente en caisse et évite les erreurs d&apos;attribution de prix.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature 5, 6, 7 in a responsive 3-column row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Gestion des employés */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
            }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-7 border border-qash-border shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                Travaillez en équipe, simplement.
              </h3>
              <p className="text-neutral-600 text-xs leading-relaxed">
                Organisez vos vendeurs et attribuez les accès selon les responsabilités.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-neutral-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Espace gérant & comptes employés</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Gestion des permissions d&apos;accès</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Suivi individuel des encaissements</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Bilan & performances */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
            }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-7 border border-qash-border shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                Comprenez ce qui se passe dans votre boutique.
              </h3>
              <p className="text-neutral-600 text-xs leading-relaxed">
                Des indicateurs clairs pour piloter vos décisions de réassort et suivre vos résultats.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-neutral-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Chiffre d&apos;affaires quotidien et mensuel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Évolution des ventes et marge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-qash-green-600 shrink-0" />
                  <span>Identification des produits stars</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Offline-first */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
            }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-7 border border-qash-border shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                Même sans connexion.
              </h3>
              <p className="text-neutral-600 text-xs leading-relaxed">
                Votre activité ne devrait pas s&apos;arrêter simplement parce qu&apos;Internet est indisponible.
              </p>
              <div className="pt-2 text-xs text-neutral-700 space-y-1.5">
                <div className="p-2 rounded-lg bg-neutral-50 border border-qash-border flex items-center gap-2">
                  <span className="font-semibold text-qash-red-500">1.</span>
                  <span>Vente effectuée</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 border border-qash-border flex items-center gap-2">
                  <span className="font-semibold text-qash-red-500">2.</span>
                  <span>Enregistrement local sur l&apos;appareil</span>
                </div>
                <div className="p-2 rounded-lg bg-qash-green-50 border border-qash-green-600/20 flex items-center gap-2 text-qash-green-600">
                  <span className="font-semibold">3.</span>
                  <span>Synchronisation au retour du réseau</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
