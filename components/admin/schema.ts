// Describes the editable sections of the admin console.
export interface Field {
  key: string; label: string; type?: 'text' | 'textarea' | 'checkbox' | 'select' | 'url' | 'image';
  options?: string[]; wide?: boolean; logo?: boolean; default?: unknown;
}
export interface Section {
  label: string; kind: 'object' | 'list'; path: string; title?: string; fields: Field[];
  addLabel?: string; sub?: { key: string; label: string; title: string; fields: Field[] };
}
const F = (key: string, label: string, type: Field['type'] = 'text', opts: Partial<Field> = {}): Field => ({ key, label, type, ...opts });

export const SECTIONS: Record<string, Section> = {
  event: { label: 'Event & Home', kind: 'object', path: 'event', fields: [
    F('fullTitle', 'Event title'), F('tagline', 'Tagline'), F('intro', 'Intro paragraph', 'textarea', { wide: true }),
    F('date', 'Date (e.g. Saturday, 12 December 2026)'), F('time', 'Time'), F('venue', 'Venue'), F('venueNote', 'Venue note'),
    F('places', 'Number of places'), F('rsvpNote', 'RSVP note'), F('organisers', 'Organisers line'),
    F('credit', 'Credit line (wrap names in **double stars** for bold)', 'text', { wide: true }),
    F('quotes', 'Typed quotes at top of home page (one per line)', 'textarea', { wide: true }),
    F('regOpen', 'Sign-up form is open', 'checkbox'),
    F('regClosedMessage', 'Message when sign-up is closed', 'textarea', { wide: true }),
    F('privacyNote', 'Privacy note on sign-up form', 'textarea', { wide: true }),
    F('contact', 'Footer “Contact” details (one item per line, blank line between people)', 'textarea', { wide: true }),
  ] },
  nav: { label: 'Navigation bar', kind: 'object', path: 'nav', fields: [
    F('about', 'About', 'checkbox', { default: true }), F('speakers', 'Speakers', 'checkbox', { default: true }),
    F('sponsors', 'Sponsors', 'checkbox', { default: true }), F('schedule', 'Schedule', 'checkbox', { default: true }),
    F('directory', 'Directory', 'checkbox', { default: true }), F('gettingHere', 'Getting Here', 'checkbox', { default: true }),
    F('signup', 'Sign Up button', 'checkbox', { default: true }),
  ] },
  line: { label: 'Home: line of support', kind: 'object', path: 'line', fields: [
    F('aboveWords', 'Words above the line (comma separated)', 'text', { wide: true }),
    F('belowWords', 'Words below the line (comma separated)', 'text', { wide: true }),
    F('label', 'Line label'),
    F('aboveText', 'Caption when above (use **bold**)', 'textarea', { wide: true }),
    F('belowText', 'Caption when below (use **bold**)', 'textarea', { wide: true }),
  ] },
  helplines: { label: 'Need to talk now?', kind: 'list', path: 'helplines', title: 'name', addLabel: 'helpline',
    fields: [F('name', 'Service'), F('number', 'Phone number'), F('hours', 'Hours / note', 'text', { wide: true })] },
  pillars: { label: 'LIFE+ pillars', kind: 'list', path: 'pillars', title: 'word',
    fields: [F('letter', 'Letter'), F('word', 'Word'), F('text', 'Description', 'textarea', { wide: true })] },
  stats: { label: 'Research stats', kind: 'list', path: 'stats', title: 'figure',
    fields: [F('figure', 'Figure'), F('source', 'Source'), F('text', 'Text', 'textarea', { wide: true })] },
  stations: { label: 'Wellbeing stations', kind: 'list', path: 'stations', title: 'name', addLabel: 'station',
    fields: [F('name', 'Name'), F('kind', 'Type', 'select', { options: ['Check in', 'Have fun'] }), F('text', 'Description', 'textarea', { wide: true })] },
  objectives: { label: 'About: objectives', kind: 'list', path: 'objectives', title: 'title',
    fields: [F('title', 'Title'), F('text', 'Description', 'textarea', { wide: true })] },
  audiences: { label: 'About: who takes part', kind: 'list', path: 'audiences', title: 'title',
    fields: [F('number', 'Number'), F('title', 'Group'), F('text', 'Description', 'textarea', { wide: true })] },
  team: { label: 'Our Team', kind: 'list', path: 'team', title: 'name', addLabel: 'person', fields: [
    F('photo', 'Photo', 'image', { wide: true }), F('name', 'Name'), F('role', 'Role (e.g. Trainee Counselor)'),
    F('group', 'Section', 'select', { options: ['Organising team', 'Trainee counselors', 'Supervisor', 'Volunteers', 'Health professionals'] }),
    F('interests', 'Interests (comma separated)'), F('affiliation', 'Affiliation (one per line)', 'textarea'),
    F('bio', 'About (shown in the pop-up)', 'textarea', { wide: true }), F('email', 'Email'),
    F('whatsapp', 'WhatsApp (number or @username)'), F('linkedin', 'LinkedIn link (optional)', 'url'),
  ] },
  speakers: { label: 'Speakers', kind: 'list', path: 'speakers', title: 'name', addLabel: 'speaker',
    fields: [F('name', 'Name'), F('title', 'Title / role'), F('org', 'Organisation'), F('session', 'Session'), F('bio', 'Short bio', 'textarea', { wide: true })] },
  sponsors: { label: 'Sponsors & partners', kind: 'list', path: 'sponsors', title: 'name', addLabel: 'partner', fields: [
    F('logo', 'Logo', 'image', { wide: true, logo: true }), F('name', 'Name'),
    F('tier', 'Category', 'select', { options: ['Organiser', 'Co-organiser', 'Sponsor', 'Supporting partner', 'Community partner'], default: 'Supporting partner' }),
    F('url', 'Website (https://…)', 'url'), F('showOnHome', 'Show in the home page carousel', 'checkbox', { default: true }),
    F('text', 'Description', 'textarea', { wide: true }),
  ] },
  schedule: { label: 'Schedule', kind: 'list', path: 'schedule', title: 'title', addLabel: 'session', fields: [
    F('period', 'Part of day', 'select', { options: ['Morning', 'Afternoon', 'Evening'] }), F('time', 'Time'),
    F('title', 'Session title', 'text', { wide: true }), F('detail', 'Details', 'textarea', { wide: true }), F('highlight', 'Highlight as hands-on', 'checkbox'),
  ] },
  directory: { label: 'Directory', kind: 'list', path: 'directory', title: 'name', addLabel: 'service', fields: [
    F('name', 'Name'), F('category', 'Category'), F('phone', 'Phone'), F('email', 'Email'), F('url', 'Website', 'url'),
    F('address', 'Area / address'), F('text', 'Description', 'textarea', { wide: true }),
  ] },
  gettingHere: { label: 'Getting Here', kind: 'object', path: 'gettingHere', fields: [
    F('address', 'Venue address', 'textarea', { wide: true }),
    F('mapQuery', 'Google Maps search text (e.g. place name or address)', 'text', { wide: true }),
    F('notes', 'Help note', 'textarea', { wide: true }),
  ], sub: { key: 'ways', label: 'Ways to get here', title: 'mode', fields: [F('icon', 'Emoji icon'), F('mode', 'Heading'), F('text', 'Details', 'textarea', { wide: true })] } },
};

export const blankItem = (fields: Field[]) =>
  Object.fromEntries(fields.map((f) => [f.key, f.default !== undefined ? f.default : f.type === 'checkbox' ? false : f.options ? f.options[0] : '']));
