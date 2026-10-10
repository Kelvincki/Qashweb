import React, { useState } from 'react';
import { Trash2, ArrowLeft, AlertTriangle, CheckCircle2, ShieldCheck, Mail, Send } from 'lucide-react';
import { PageRoute } from '../types';

interface DeleteAccountPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const DeleteAccountPage: React.FC<DeleteAccountPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const generateMailto = () => {
    const subject = encodeURIComponent('Demande de suppression de compte QASH');
    const body = encodeURIComponent(
      `Bonjour l'équipe QASH,\n\nJe demande la suppression définitive de mon compte et de l'ensemble de mes données associées.\n\n- Adresse email du compte : ${email.trim()}\n- Boutique / Code : ${storeName.trim() || 'Non précisé'}\n- Motif / Précisions : ${reason.trim() || 'Aucun'}\n\nMerci de confirmer la prise en compte de ma demande.`
    );
    return `mailto:contact@qashapp.com?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Ouvrir le client mail direct
    window.location.href = generateMailto();
    setEmailSent(true);
  };

  return (
    <div className="py-12 sm:py-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </button>

        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-100">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Exigences Google Play · Données utilisateur</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Suppression du compte et des données personnelles
          </h1>
          <p className="text-sm text-neutral-500">
            Procédure officielle d&apos;effacement de vos données QASH conformément aux règles de confidentialité de Google Play et aux lois sur la protection des données.
          </p>
        </div>

        {/* Note modèle juridique */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-normal mb-8">
          <strong>Avertissement :</strong> Cette page constitue un modèle indicatif de formulaire et d&apos;information pour satisfaire aux exigences de suppression de compte imposées par Google Play. Il convient de faire valider cette procédure par votre délégué à la protection des données ou conseiller juridique.
        </div>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm sm:text-base">
          {/* Method 1: Inside the app */}
          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-mono">1</span>
              Suppression directe depuis l&apos;application Android QASH
            </h2>
            <p className="text-sm text-neutral-600 mb-3">
              Si vous avez encore accès à votre terminal, vous pouvez initier la suppression immédiate de votre compte :
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-neutral-700">
              <li>Ouvrez l&apos;application <strong>QASH</strong> sur votre smartphone Android.</li>
              <li>Accédez à l&apos;onglet <strong>Plus</strong> ou <strong>Paramètres</strong>.</li>
              <li>Sélectionnez <strong>Gestion du compte</strong> puis <strong>Supprimer mon compte</strong>.</li>
              <li>Confirmez l&apos;opération en saisissant votre mot de passe gérant.</li>
            </ol>
          </div>

          {/* Method 2: Web request form */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
            <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">2</span>
              Demande de suppression en ligne (sans l&apos;application)
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Si vous avez désinstallé l&apos;application ou ne pouvez plus y accéder, vous pouvez soumettre une demande formelle via ce formulaire web ou par email direct.
            </p>

            {emailSent ? (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">Client de messagerie ouvert</h3>
                    <p className="text-xs text-amber-800">
                      Votre application de messagerie a été ouverte avec l&apos;email pré-rempli.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-lg border border-amber-200/80 text-xs text-neutral-700 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>Important :</strong> La demande n&apos;est transmise et enregistrée auprès de nos services qu&apos;une fois cet email effectivement <strong>envoyé</strong> depuis votre boîte email (destinataire : <code>contact@qashapp.com</code>).
                  </p>
                  <p>
                    Si votre client de messagerie ne s&apos;est pas ouvert automatiquement, vous pouvez cliquer sur le bouton ci-dessous pour rouvrir l&apos;email ou écrire directement depuis votre boîte de messagerie.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={generateMailto()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors text-center inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Rouvrir mon client email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setEmailSent(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Modifier les informations
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Adresse email associée à votre compte QASH *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gerant@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Nom de la boutique ou code d&apos;invitation (facultatif)
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Boutique Moderne ou #QASH123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Motif ou précision (facultatif)
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Précisez tout élément utile pour le traitement de votre demande..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-sm resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Préparer l&apos;email de suppression</span>
                  </button>

                  <a
                    href={generateMailto()}
                    className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors text-center inline-flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Ouvrir directement mon email</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Details of deleted data */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Quelles données sont supprimées ?
            </h2>
            <p>
              Lors du traitement effectif de votre demande de suppression, les données suivantes sont irréversiblement effacées de nos bases de données actives :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-700">
              <li><strong>Compte d&apos;authentification :</strong> identifiant unique, adresse email, mot de passe haché et profil utilisateur.</li>
              <li><strong>Données de boutique :</strong> nom du commerce, code d&apos;invitation, paramètres de caisse.</li>
              <li><strong>Comptes associés :</strong> identifiants et accès des employés rattachés à votre boutique.</li>
              <li><strong>Catalogue et stocks :</strong> liste intégrale des produits, catégories, prix de vente et historiques d&apos;inventaire.</li>
              <li><strong>Historique d&apos;encaissement :</strong> sessions de caisse et tickets de vente enregistrés.</li>
            </ul>
          </div>

          {/* Data retention exceptions */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-sm text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Données conservées pour obligations légales</span>
            </div>
            <p className="leading-relaxed">
              Conformément à la réglementation fiscale et commerciale en vigueur, certaines pièces justificatives relatives aux transactions d&apos;abonnement (factures acquittées, justificatifs de paiement SenePay) doivent obligatoirement être conservées pendant la durée légale d&apos;archivage comptable avant destruction finale.
            </p>
          </div>

          {/* Retention period */}
          <div className="space-y-2">
            <h3 className="font-bold text-neutral-900 text-base">Délai d&apos;exécution</h3>
            <p className="text-sm text-neutral-600">
              Toute demande de suppression validée est traitée dans un délai maximal de <strong>30 jours</strong>. Une fois la suppression achevée, aucune restauration de vos stocks ou données de vente ne sera techniquement possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
