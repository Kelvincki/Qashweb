import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { PageRoute } from '../types';
import { LegalLayout, LegalList, LegalSection } from '../components/ui/LegalLayout';
import { Button, ExternalButton } from '../components/ui/Button';
import { CONTACT_EMAIL, mailtoLink } from '../config/site';

interface DeleteAccountPageProps {
  onNavigate?: (route: PageRoute) => void;
}

const inputCls =
  'mt-2 w-full rounded-2xl bg-field px-4 py-3.5 text-lg text-ink placeholder:text-muted focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ink';

export const DeleteAccountPage: React.FC<DeleteAccountPageProps> = () => {
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [reason, setReason] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // La demande part par e-mail depuis la messagerie de l'utilisateur : rien n'est enregistré par le site.
  const generateMailto = () =>
    mailtoLink(
      'Demande de suppression de compte QASH',
      `Bonjour l'équipe QASH,\n\nJe demande la suppression définitive de mon compte et de l'ensemble de mes données associées.\n\n- Adresse email du compte : ${email.trim()}\n- Boutique / Code : ${storeName.trim() || 'Non précisé'}\n- Motif / Précisions : ${reason.trim() || 'Aucun'}\n\nMerci de confirmer la prise en compte de ma demande.`
    ) ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const href = generateMailto();
    if (!href) return;
    // Ouvrir le client mail direct
    window.location.href = href;
    setEmailSent(true);
  };

  return (
    <LegalLayout
      current="/suppression-compte"
      title="Supprimer mon compte"
      updated="Procédure officielle d'effacement de vos données QASH conformément aux règles de confidentialité de Google Play et aux lois sur la protection des données."
      notice={
        <>
          <strong>Avertissement :</strong> Cette page constitue un modèle indicatif de formulaire et d&apos;information pour
          satisfaire aux exigences de suppression de compte imposées par Google Play. Il convient de faire valider cette
          procédure par votre délégué à la protection des données ou conseiller juridique.
        </>
      }
    >
      <LegalSection title="1. Suppression directe depuis l'application Android QASH">
        <p>Si vous avez encore accès à votre terminal, vous pouvez initier la suppression immédiate de votre compte :</p>
        <ol className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-brand-red">
          <li>Ouvrez l&apos;application <strong>QASH</strong> sur votre smartphone Android.</li>
          <li>Accédez à l&apos;onglet <strong>Plus</strong> ou <strong>Paramètres</strong>.</li>
          <li>Sélectionnez <strong>Gestion du compte</strong> puis <strong>Supprimer mon compte</strong>.</li>
          <li>Confirmez l&apos;opération en saisissant votre mot de passe gérant.</li>
        </ol>
      </LegalSection>

      <LegalSection title="2. Demande de suppression en ligne (sans l'application)">
        <p>
          Si vous avez désinstallé l&apos;application ou ne pouvez plus y accéder, vous pouvez soumettre une demande formelle
          via ce formulaire web ou par email direct.
        </p>

        {emailSent ? (
          <div className="space-y-4 rounded-3xl bg-warning-soft p-6">
            <h3 className="flex items-center gap-2 text-xl font-black">
              <Mail className="h-5 w-5" aria-hidden="true" />
              Client de messagerie ouvert
            </h3>
            <p>Votre application de messagerie a été ouverte avec l&apos;email pré-rempli.</p>
            <p>
              <strong>Important :</strong> La demande n&apos;est transmise et enregistrée auprès de nos services qu&apos;une
              fois cet email effectivement <strong>envoyé</strong> depuis votre boîte email (destinataire :{' '}
              <span className="break-all font-semibold">{CONTACT_EMAIL}</span>).
            </p>
            <p>
              Si votre client de messagerie ne s&apos;est pas ouvert automatiquement, vous pouvez cliquer sur le bouton
              ci-dessous pour rouvrir l&apos;email ou écrire directement depuis votre boîte de messagerie.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ExternalButton href={generateMailto()}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Rouvrir mon client email
              </ExternalButton>
              <Button variant="quiet" onClick={() => setEmailSent(false)}>
                Modifier les informations
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white">
            <div>
              <label htmlFor="del-email" className="block text-lg font-bold">
                Adresse email associée à votre compte QASH (obligatoire)
              </label>
              <input
                id="del-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gerant@exemple.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="del-store" className="block text-lg font-bold">
                Nom de la boutique ou code d&apos;invitation (facultatif)
              </label>
              <input
                id="del-store"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex : Boutique Moderne ou #QASH123"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="del-reason" className="block text-lg font-bold">
                Motif ou précision (facultatif)
              </label>
              <textarea
                id="del-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Précisez tout élément utile pour le traitement de votre demande…"
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" size="lg">
                <Send className="h-4 w-4" aria-hidden="true" />
                Préparer l&apos;email de suppression
              </Button>
              <ExternalButton href={generateMailto()} variant="quiet" size="lg">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Ouvrir directement mon email
              </ExternalButton>
            </div>
          </form>
        )}
      </LegalSection>

      <LegalSection title="Quelles données sont supprimées ?">
        <p>
          Lors du traitement effectif de votre demande de suppression, les données suivantes sont irréversiblement effacées
          de nos bases de données actives :
        </p>
        <LegalList>
          <li><strong>Compte d&apos;authentification :</strong> identifiant unique, adresse email, mot de passe haché et profil utilisateur.</li>
          <li><strong>Données de boutique :</strong> nom du commerce, code d&apos;invitation, paramètres de caisse.</li>
          <li><strong>Comptes associés :</strong> identifiants et accès des employés rattachés à votre boutique.</li>
          <li><strong>Catalogue et stocks :</strong> liste intégrale des produits, catégories, prix de vente et historiques d&apos;inventaire.</li>
          <li><strong>Historique d&apos;encaissement :</strong> sessions de caisse et tickets de vente enregistrés.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Données conservées pour obligations légales">
        <p>
          Conformément à la réglementation fiscale et commerciale en vigueur, certaines pièces justificatives relatives aux
          transactions d&apos;abonnement (factures acquittées, justificatifs de paiement SenePay) doivent obligatoirement être
          conservées pendant la durée légale d&apos;archivage comptable avant destruction finale.
        </p>
      </LegalSection>

      <LegalSection title="Délai d'exécution">
        <p>
          Toute demande de suppression validée est traitée dans un délai maximal de <strong>30 jours</strong>. Une fois la
          suppression achevée, aucune restauration de vos stocks ou données de vente ne sera techniquement possible.
        </p>
      </LegalSection>
    </LegalLayout>
  );
};
