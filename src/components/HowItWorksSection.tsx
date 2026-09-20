import React from 'react';
import { motion } from 'motion/react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Créez votre compte',
      desc: 'Inscrivez votre boutique en quelques clics et configurez votre profil de gérant.',
    },
    {
      num: '02',
      title: 'Configurez votre boutique',
      desc: 'Définissez le nom de votre point de vente et invitez vos employés si vous travaillez en équipe.',
    },
    {
      num: '03',
      title: 'Ajoutez vos produits et commencez à vendre',
      desc: 'Enregistrez vos articles manuellement ou utilisez le scan IA de facture pour aller plus vite.',
    },
    {
      num: '04',
      title: 'Suivez votre activité avec QASH',
      desc: 'Consultez vos ventes, encaissez les clients et gardez le contrôle complet sur vos stocks.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-2 block">
            Démarrage simplifié
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Comment ça marche
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Une mise en place pensée pour être opérationnelle immédiatement, sans formation complexe.
          </p>
        </motion.div>

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20 } },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="text-3xl font-black text-qash-red-500 tracking-tight mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2 leading-snug font-display">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
