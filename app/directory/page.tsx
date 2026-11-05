import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import DirectoryList from '@/components/DirectoryList';

export const metadata: Metadata = { title: 'Support directory' };

export default async function Directory() {
  const c = await getContent();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Support directory</div>
        <h1>Know your support</h1>
        <p className="lede">Organisations, clinics and services that can help with health, wellbeing and everyday life. This is the same list you&apos;ll explore on the Support Passport trail.</p>
      </div>
      <section style={{ paddingTop: 12 }}><div className="wrap"><DirectoryList items={c.directory} /></div></section>
    </>
  );
}
