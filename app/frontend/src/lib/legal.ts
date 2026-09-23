
/**
 * Sakan legal content (German/EU compliance).
 *
 * Full documents are provided in German (legal jurisdiction: Germany) and
 * English as lingua franca; other interface languages fall back to English
 * on legal pages while navigation labels remain translated.
 * Owner data is the official imprint data supplied by the platform owner.
 */

export interface LegalSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
}

export type LegalDocKind = 'datenschutz' | 'agb' | 'impressum' | 'hinweise';

export const OWNER = {
  platform: 'Sakan Platform',
  website: 'www.sakanapp.net',
  websiteUrl: 'https://www.sakanapp.net',
  owner: 'Akhmed Ismail Said',
  addressLine1: 'Ehndorfer Str. 130',
  addressLine2: '24537 Neumünster, Deutschland',
  emailPrimary: 'info@sakanapp.net',
  emailService: 'service@sakanapp.net',
} as const;

export const CONTACT = OWNER;

/* ------------------------------------------------------------------ */
/* Impressum                                                           */
/* ------------------------------------------------------------------ */

const impressumDe: LegalDoc = {
  title: 'Impressum',
  subtitle: 'Angaben gemäß § 5 DDG',
  updated: 'Stand: September 2026',
  sections: [
    {
      heading: 'Anbieter',
      body: [
        OWNER.owner,
        OWNER.addressLine1,
        OWNER.addressLine2,
        `E-Mail: ${OWNER.emailPrimary}`,
      ],
    },
    {
      heading: 'Kontakt',
      body: [
        `Allgemeine Anfragen: ${OWNER.emailPrimary}`,
        `Service und Support: ${OWNER.emailService}`,
      ],
    },
    {
      heading: 'Verantwortlich für den Inhalt',
      body: [
        `${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}`,
      ],
    },
    {
      heading: 'Haftung für Inhalte',
      body: [
        'Als Diensteanbieter sind wir gemäß den allgemeinen Gesetzen für eigene Inhalte auf diesen Seiten verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.',
      ],
    },
    {
      heading: 'Haftung für Links',
      body: [
        'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.',
      ],
    },
    {
      heading: 'Urheberrecht',
      body: [
        'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
      ],
    },
  ],
};

const impressumEn: LegalDoc = {
  title: 'Legal Notice (Impressum)',
  subtitle: 'Information according to § 5 DDG',
  updated: 'Last updated: September 2026',
  sections: [
    {
      heading: 'Provider',
      body: [
        OWNER.owner,
        OWNER.addressLine1,
        OWNER.addressLine2,
        `E-mail: ${OWNER.emailPrimary}`,
      ],
    },
    {
      heading: 'Contact',
      body: [
        `General enquiries: ${OWNER.emailPrimary}`,
        `Service and support: ${OWNER.emailService}`,
      ],
    },
    {
      heading: 'Responsible for content',
      body: [
        `${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}`,
      ],
    },
    {
      heading: 'Liability for content',
      body: [
        'As a service provider we are responsible for our own content on these pages in accordance with general laws. However, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general laws remain unaffected.',
      ],
    },
    {
      heading: 'Liability for links',
      body: [
        'Our offer contains links to external third-party websites over whose content we have no influence. The respective provider or operator of the linked pages is always responsible for their content. Illegal content was not recognizable at the time of linking.',
      ],
    },
    {
      heading: 'Copyright',
      body: [
        'The content and works created by the site operator on these pages are subject to German copyright law. Duplication, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Datenschutz (DSGVO)                                                 */
/* ------------------------------------------------------------------ */

const datenschutzDe: LegalDoc = {
  title: 'Datenschutzerklärung',
  subtitle: 'Informationen zur Verarbeitung personenbezogener Daten (DSGVO)',
  updated: 'Stand: September 2026',
  sections: [
    {
      heading: '1. Verantwortlicher',
      body: [
        `Verantwortlich für die Datenverarbeitung auf dieser Website ist ${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}, E-Mail: ${OWNER.emailPrimary}.`,
      ],
    },
    {
      heading: '2. Welche Daten wir verarbeiten',
      bullets: [
        'Kontodaten: E-Mail-Adresse, Anmeldedaten, Benutzerkennung.',
        'Profildaten: Name (Anzeigename), Alter/Geburtsdatum, Geschlecht, Land, Stadt, Biografie, Ähnliches.',
        'Fotos: hochgelade Profilbilder im Objektspeicher der Plattform.',
        'Suchpräferenzen: gewünschte Eigenschaften für die Partnersuche.',
        'Kommunikation: Nachrichten und Konversationen zwischen Mitgliedern.',
        'Nutzungsdaten: Anwesenheitsstatus (online), Profilbesuche, Favoriten.',
        'Zahlungsdaten: Abrechnung über Stripe; wir speichern keine vollständigen Kartendaten.',
      ],
    },
    {
      heading: '3. Zwecke und Rechtsgrundlagen',
      bullets: [
        'Durchführung des Matching- und Nachrichtendienstes — Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).',
        'Premium-Mitgliedschaft und Zahlungsabwicklung — Art. 6 Abs. 1 lit. b DSGVO.',
        'Sicherheit, Missbrauchsprävention und Moderation — Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).',
        'Einwilligungsbasierte Funktionen (z. B. Fotos veröffentlichen) — Art. 6 Abs. 1 lit. a DSGVO.',
      ],
    },
    {
      heading: '4. Empfänger und Auftragsverarbeiter',
      bullets: [
        'Hosting- und Infrastrukturanbieter (Plattform-Betrieb).',
        'Stripe Payments Europe, Ltd. für Zahlungsabwicklung (eigene Datenschutzhinweise von Stripe gelten ergänzend).',
        'Objektspeicher-Dienste für hochgeladene Medien.',
      ],
    },
    {
      heading: '5. Speicherdauer',
      body: [
        'Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Bei Löschung des Profils werden Profilinhalte und Fotos entfernt; gesetzlich aufbewahrungspflichtige Zahlungsdaten werden vorschriftsgemäß aufbewahrt.',
      ],
    },
    {
      heading: '6. Ihre Rechte',
      bullets: [
        'Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17).',
        'Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20).',
        'Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21).',
        'Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3).',
        'Beschwerde bei einer Datenschutzaufsichtsbehörde (Art. 77), z. B. dem Unabhängigen Landeszentrum für Datenschutz Schleswig-Holstein (ULD).',
      ],
      body: ['Anfragen richten Sie an ' + OWNER.emailPrimary + '.'],
    },
    {
      heading: '7. Cookies und lokale Speicherung',
      body: [
        'Die Website verwendet technisch notwendige Sitzungsspeicherung (Login) sowie den lokalen Browserspeicher ausschließlich für die gespeicherte Spracheinstellung. Tracking-Cookies setzen wir nicht ein.',
      ],
    },
    {
      heading: '8. Datensicherheit',
      body: [
        'Wir treffen technische und organisatorische Sicherheitsmaßnahmen, u. a. TLS-Verschlüsselung beim Transport, Zugriffsbeschränkungen und geschützte Speicherung von Medien. Die Übertragung von Zugangsdaten erfolgt über gesicherte Authentifizierungsdienste.',
      ],
    },
    {
      heading: '9. Änderungen dieser Erklärung',
      body: [
        'Wir passen diese Datenschutzerklärung an, wenn sich Rechtslage oder Verarbeitung ändern. Die aktuelle Fassung ist stets auf dieser Seite abrufbar.',
      ],
    },
  ],
};

const datenschutzEn: LegalDoc = {
  title: 'Privacy Policy (Datenschutz)',
  subtitle: 'Information on the processing of personal data (GDPR)',
  updated: 'Last updated: September 2026',
  sections: [
    {
      heading: '1. Controller',
      body: [
        `The controller for data processing on this website is ${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}, e-mail: ${OWNER.emailPrimary}.`,
      ],
    },
    {
      heading: '2. Data we process',
      bullets: [
        'Account data: e-mail address, login credentials, user identifier.',
        'Profile data: display name, age/date of birth, gender, country, city, bio and similar.',
        'Photos: uploaded profile pictures stored in the platform object storage.',
        'Matching preferences: desired partner criteria.',
        'Communication: messages and conversations between members.',
        'Usage data: presence status (online), profile visits, favorites.',
        'Payment data: billing via Stripe; we do not store full card numbers.',
      ],
    },
    {
      heading: '3. Purposes and legal bases',
      bullets: [
        'Providing the matching and messaging service — Art. 6 (1)(b) GDPR (contract performance).',
        'Premium membership and payment processing — Art. 6 (1)(b) GDPR.',
        'Security, abuse prevention and moderation — Art. 6 (1)(f) GDPR (legitimate interest).',
        'Consent-based features (e.g. publishing photos) — Art. 6 (1)(a) GDPR.',
      ],
    },
    {
      heading: '4. Recipients and processors',
      bullets: [
        'Hosting and infrastructure providers (platform operation).',
        'Stripe Payments Europe, Ltd. for payment processing (Stripe’s own privacy notices apply additionally).',
        'Object storage services for uploaded media.',
      ],
    },
    {
      heading: '5. Storage duration',
      body: [
        'We store personal data only as long as necessary for the stated purposes or as required by statutory retention obligations. When a profile is deleted, profile content and photos are removed; payment data subject to retention duties is stored in compliance with those duties.',
      ],
    },
    {
      heading: '6. Your rights',
      bullets: [
        'Access (Art. 15), rectification (Art. 16), erasure (Art. 17).',
        'Restriction of processing (Art. 18), data portability (Art. 20).',
        'Objection to processing based on legitimate interests (Art. 21).',
        'Withdrawal of consent with effect for the future (Art. 7 (3)).',
        'Complaint to a supervisory authority (Art. 77), e.g. the Unabhängiges Landeszentrum für Datenschutz Schleswig-Holstein (ULD).',
      ],
      body: ['Please direct requests to ' + OWNER.emailPrimary + '.'],
    },
    {
      heading: '7. Cookies and local storage',
      body: [
        'The website uses technically necessary session storage (login) and the browser’s local storage solely for the saved language preference. We do not use tracking cookies.',
      ],
    },
    {
      heading: '8. Data security',
      body: [
        'We apply technical and organizational security measures including TLS encryption in transit, access restrictions and protected media storage. Login data is transmitted via secured authentication services.',
      ],
    },
    {
      heading: '9. Changes to this policy',
      body: [
        'We adapt this privacy policy when the legal situation or processing activities change. The current version is always available on this page.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* AGB / Nutzungsbedingungen                                           */
/* ------------------------------------------------------------------ */

const agbDe: LegalDoc = {
  title: 'Nutzungsbedingungen (AGB)',
  subtitle: 'Vertragsbedingungen für die Nutzung der Sakan Platform',
  updated: 'Stand: September 2026',
  sections: [
    {
      heading: '1. Geltungsbereich und Vertragspartner',
      body: [
        `Diese Bedingungen regeln die Nutzung der Sakan Platform (${OWNER.website}), betrieben von ${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}. Mit der Registrierung erklärt sich das Mitglied mit diesen AGB einverstanden.`,
      ],
    },
    {
      heading: '2. Mitgliedschaft und Voraussetzungen',
      bullets: [
        'Die Nutzung ist ausschließlich volljährigen Personen (18 Jahre oder älter) gestattet.',
        'Ein Mitgliedskonto ist personengebunden; die Weitergabe an Dritte ist unzulässig.',
        'Angaben im Profil müssen wahr und korrekt sein.',
      ],
    },
    {
      heading: '3. Pflichten der Mitglieder',
      bullets: [
        'Keine rechts- oder sittenwidrigen, beleidigenden, diskriminierenden oder sexuell anstößigen Inhalte.',
        'Keine Werbung, keine Kettenbriefe, kein Spam und keine gewerbliche Nutzung ohne Zustimmung.',
        'Keine Identitätsverschleierung, keine Falschprofile, keine Nutzung fremder Fotos.',
        'Respektvoller Umgang mit anderen Mitgliedern.',
      ],
    },
    {
      heading: '4. Premium-Mitgliedschaft, Zahlungen und 99-Cent-Aktion',
      bullets: [
        'Zahlungen werden über den Zahlungsdienstleister Stripe abgewickelt. Premium-Rechte werden erst nach bestätigter Zahlung freigeschaltet.',
        'Die 99-Cent-Aktion hebt ein Profilfoto für 7 Tage hervor; sie verlängert sich nicht automatisch und begründet kein Abo.',
        'Premium-Pläne sind Einzelpläne ohne automatische Verlängerung, sofern nicht ausdrücklich anders angegeben.',
        'Verbraucher haben im Fernabsatz ein gesetzliches Widerrufsrecht von 14 Tagen; digitale Leistungen, die sofort vollständig erbracht werden, können auf ausdrücklichen Wunsch vor Ablauf der Widerrufsfrist bereitgestellt werden, wobei das Widerrufsrecht erlischt.',
      ],
    },
    {
      heading: '5. Moderation, Sperrung und Kündigung',
      body: [
        'Wir sind berechtigt, Inhalte zu prüfen, zu entfernen und Konten vorübergehend oder dauerhaft zu sperren, wenn gegen diese AGB oder geltendes Recht verstoßen wird. Mitglieder können ihr Konto jederzeit löschen; die AGB gelten fort, bis das Konto gelöscht ist.',
      ],
    },
    {
      heading: '6. Haftung',
      body: [
        'Der Betreiber haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet der Betreiber nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, vertragstypischen Schaden. Eine Haftung für die Richtigkeit von Mitgliederinhalten besteht nicht.',
      ],
    },
    {
      heading: '7. Schlussbestimmungen',
      body: [
        'Es gilt deutsches Recht. Änderungen dieser AGB werden Mitgliedern in Textform mitgeteilt. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
      ],
    },
  ],
};

const agbEn: LegalDoc = {
  title: 'Terms of Service (AGB)',
  subtitle: 'Terms governing the use of the Sakan Platform',
  updated: 'Last updated: September 2026',
  sections: [
    {
      heading: '1. Scope and contracting parties',
      body: [
        `These terms govern the use of the Sakan Platform (${OWNER.website}), operated by ${OWNER.owner}, ${OWNER.addressLine1}, ${OWNER.addressLine2}. By registering, the member agrees to these terms.`,
      ],
    },
    {
      heading: '2. Membership and requirements',
      bullets: [
        'Use is permitted only for adults (18 years or older).',
        'A member account is personal; sharing it with third parties is not allowed.',
        'Profile information must be truthful and accurate.',
      ],
    },
    {
      heading: '3. Member obligations',
      bullets: [
        'No unlawful, abusive, discriminatory or sexually explicit content.',
        'No advertising, chain letters, spam or commercial use without consent.',
        'No identity concealment, fake profiles or use of other people’s photos.',
        'Respectful treatment of other members.',
      ],
    },
    {
      heading: '4. Premium membership, payments and 99-cent offer',
      bullets: [
        'Payments are processed by the payment provider Stripe. Premium rights are activated only after confirmed payment.',
        'The 99-cent offer features a profile photo for 7 days; it does not renew automatically and does not create a subscription.',
        'Premium plans are one-time plans without automatic renewal unless explicitly stated otherwise.',
        'Consumers have a statutory 14-day right of withdrawal for distance contracts; digital services delivered immediately in full at the consumer’s express request may be provided before the withdrawal period expires, whereby the right of withdrawal lapses.',
      ],
    },
    {
      heading: '5. Moderation, suspension and termination',
      body: [
        'We may review and remove content and temporarily or permanently suspend accounts if these terms or applicable law are violated. Members may delete their account at any time; these terms apply until the account is deleted.',
      ],
    },
    {
      heading: '6. Liability',
      body: [
        'The operator is liable without limitation for intent and gross negligence and for injury to life, body or health. In case of simple negligence, liability exists only for breach of material contractual obligations, limited to foreseeable damage typical for the contract. No liability is assumed for the accuracy of member content.',
      ],
    },
    {
      heading: '7. Final provisions',
      body: [
        'German law applies. Changes to these terms will be communicated to members in text form. Should individual provisions be invalid, the validity of the remaining provisions remains unaffected.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Online-Dating Hinweise & rechtliche Hinweise                        */
/* ------------------------------------------------------------------ */

const hinweiseDe: LegalDoc = {
  title: 'Hinweise für Online-Dating & rechtliche Disclaimers',
  subtitle: 'Sicherheit, Wahrheitsgemäßigkeit und Haftungsverteilung',
  updated: 'Stand: September 2026',
  sections: [
    {
      heading: '1. Inhaltliche Verantwortung der Mitglieder',
      body: [
        'Profile, Fotos und Nachrichten werden von Mitgliedern erstellt. Als Diensteanbieter im Sinne des § 7 DDG machen wir uns fremde Inhalte nicht zu eigen und können deren Richtigkeit nicht überprüfen. Für Inhalte der Mitglieder sind ausschließlich die jeweiligen Mitglieder verantwortlich.',
      ],
    },
    {
      heading: '2. Keine Erfolgs- oder Ehegarantie',
      body: [
        'Die Plattform vermittelt Kontaktmöglichkeiten zwischen Mitgliedern. Ein Erfolg (Kontakte, Beziehung, Ehe) kann nicht garantiert werden und ist kein Bestandteil der Leistung.',
      ],
    },
    {
      heading: '3. Identität und Betrugsprävention',
      bullets: [
        'Wir können die Identität der Mitglieder nicht vollständig überprüfen; auch verifizierte Profile bleiben Angaben der Mitglieder.',
        'Senden Sie niemals Geld, Geschenkkarten oder Zahlungsinformationen an andere Mitglieder.',
        'Seien Sie vorsichtig bei Kontakten, die schnell nach außen (z. B. Messenger) wechseln oder finanzielle Notlagen schildern.',
        'Verdächtige Profile können über die Plattform gemeldet und blockiert werden.',
      ],
    },
    {
      heading: '4. Jugendschutz',
      body: [
        'Die Plattform richtet sich ausschließlich an Erwachsene ab 18 Jahren. Accounts von Minderjährigen werden gesperrt und gelöscht.',
      ],
    },
    {
      heading: '5. Meldungen und Missbrauch',
      body: [
        'Funktionen zum Melden und Blockieren stehen auf Profilseiten zur Verfügung. Berechtigte Meldungen werden geprüft; rechtswidrige Inhalte werden entfernt. Bei Straftaten können Daten auf behördliche Anforderung herausgegeben werden.',
      ],
    },
    {
      heading: '6. Persönliche Sicherheit',
      bullets: [
        'Schützen Sie persönliche Daten (Adresse, Arbeitgeber, Finanzdaten).',
        'Treffen Sie sich erst mit Personen, die Sie online kennengelernt haben, in öffentlichen Orten.',
        'Informieren Sie Vertrauenspersonen über Treffen.',
      ],
    },
  ],
};

const hinweiseEn: LegalDoc = {
  title: 'Online Dating Notices & Legal Disclaimers',
  subtitle: 'Safety, truthfulness and allocation of liability',
  updated: 'Last updated: September 2026',
  sections: [
    {
      heading: '1. Content responsibility of members',
      body: [
        'Profiles, photos and messages are created by members. As a service provider within the meaning of § 7 DDG, we do not adopt third-party content as our own and cannot verify its accuracy. Members are solely responsible for their own content.',
      ],
    },
    {
      heading: '2. No guarantee of success or marriage',
      body: [
        'The platform facilitates contact opportunities between members. No guarantee of success (contacts, relationship, marriage) is given, and it is not part of the service.',
      ],
    },
    {
      heading: '3. Identity and fraud prevention',
      bullets: [
        'We cannot fully verify members’ identities; even verified profiles remain members’ own statements.',
        'Never send money, gift cards or payment information to other members.',
        'Be cautious with contacts who quickly move the conversation off-platform (e.g. to messengers) or describe financial hardship.',
        'Suspicious profiles can be reported and blocked via the platform.',
      ],
    },
    {
      heading: '4. Youth protection',
      body: [
        'The platform is intended exclusively for adults aged 18 and over. Accounts of minors are suspended and deleted.',
      ],
    },
    {
      heading: '5. Reports and abuse',
      body: [
        'Reporting and blocking functions are available on profile pages. Legitimate reports are reviewed; unlawful content is removed. Data may be disclosed to authorities upon lawful request.',
      ],
    },
    {
      heading: '6. Personal safety',
      bullets: [
        'Protect personal data (address, employer, financial details).',
        'Meet people first met online in public places.',
        'Inform trusted persons about meetings.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */

export const LEGAL_DOCS: Record<LegalDocKind, { de: LegalDoc; en: LegalDoc }> = {
  datenschutz: { de: datenschutzDe, en: datenschutzEn },
  agb: { de: agbDe, en: agbEn },
  impressum: { de: impressumDe, en: impressumEn },
  hinweise: { de: hinweiseDe, en: hinweiseEn },
};
