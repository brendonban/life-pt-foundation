export interface EventInfo {
  name: string; fullTitle: string; tagline: string; intro: string;
  date: string; time: string; venue: string; venueNote: string;
  places: string; rsvpNote: string; regOpen: boolean; regClosedMessage: string;
  organisers: string; contact: string; credit: string; quotes: string; privacyNote: string;
}
export interface NavSettings { about: boolean; speakers: boolean; sponsors: boolean; schedule: boolean; directory: boolean; gettingHere: boolean; signup: boolean }
export interface LineOfSupport { aboveWords: string; belowWords: string; label: string; belowText: string; aboveText: string }
export interface EmailTemplate { name: string; subject: string; body: string }
export interface EmailSettings { autoConfirm: boolean; confirmSubject: string; confirmBody: string; templates: EmailTemplate[] }
export interface Helpline { name: string; number: string; hours: string }
export interface Pillar { letter: string; word: string; text: string }
export interface Stat { figure: string; text: string; source: string }
export interface Objective { title: string; text: string }
export interface Audience { number: string; title: string; text: string }
export interface Station { name: string; kind: string; text: string }
export interface TeamMember {
  name: string; role: string; group: string; photo: string; interests: string;
  affiliation: string; bio: string; email: string; whatsapp: string; linkedin: string;
}
export interface Speaker { name: string; title: string; org: string; session: string; bio: string; photo?: string; category?: string }
export interface Sponsor { name: string; tier: string; text: string; url: string; logo: string; showOnHome: boolean }
export interface ScheduleItem { period: string; time: string; title: string; detail: string; highlight: boolean }
export interface DirectoryItem { name: string; category: string; text: string; phone: string; email: string; url: string; address: string }
export interface SponsorshipInfo { intro: string; formOpen: boolean; thankYou: string }
export interface SponsorAsk { emoji: string; title: string; text: string }
export interface SponsorPerk { emoji: string; text: string }
export interface SponsorEnquiry {
  id: string; createdAt: string; name: string; organisation?: string; email: string; phone?: string;
  offers: string[]; details: string; credit?: string; website?: string; status: string;
}
export interface Way { icon: string; mode: string; text: string }
export interface GettingHere { address: string; mapQuery: string; ways: Way[]; notes: string }

export interface Content {
  event: EventInfo; nav: NavSettings; line: LineOfSupport; emails: EmailSettings; helplines: Helpline[];
  pillars: Pillar[]; stats: Stat[]; objectives: Objective[]; audiences: Audience[]; stations: Station[];
  team: TeamMember[]; speakers: Speaker[]; sponsors: Sponsor[];
  sponsorship: SponsorshipInfo; sponsorAsks: SponsorAsk[]; sponsorPerks: SponsorPerk[]; schedule: ScheduleItem[];
  directory: DirectoryItem[]; gettingHere: GettingHere;
}

export interface Signup {
  id: string; createdAt: string;
  name: string; preferredName?: string; email: string; phone: string; ageGroup?: string;
  attendAs: string; organisation?: string; companions?: number; companion?: string;
  language?: string; access?: string[]; diet?: string; emergencyName?: string; emergencyPhone?: string;
  photoConsent: string; heardFrom?: string; notes?: string; consent: boolean; status: string;
}

export interface MailRecord {
  id: string; createdAt: string; to: string; subject: string; kind: string;
  state: 'SENT' | 'FAILED' | 'PREVIEW'; error?: string; sentBy?: string;
}
