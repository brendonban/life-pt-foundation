import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book club · 被讨厌的勇气',
  description: '《被讨厌的勇气》体验式读书会：在关系地图中重新校準人际距离。An experiential book club on Adlerian psychology at LIFE+.',
};

const PROGRAMME: [string, string, string, boolean?][] = [
  ['11.00am', '开场', 'Opening'],
  ['11.15am', '心理光谱', 'Psychological spectrum', true],
  ['11.50am', '读书会 1', 'Reading circle 1', true],
  ['12.30pm', '中场休息', 'Break'],
  ['12.40pm', '相似圈', 'Circle of similarity', true],
  ['1.15pm', '读书会 2', 'Reading circle 2', true],
  ['1.40pm', '总结', 'Reflection & wrap-up'],
  ['1.55pm', '结束 + 大合照', 'Closing & group photo'],
];

const HOSTS = [
  { zh: '吴其栋', en: 'Dino', img: '/bookclub/dino.jpg', roles: [['马来亚大学专业辅导硕士生', 'UM Master of Professional Counseling Student'], ['电台 DJ 主持人', 'Radio DJ Announcer']] },
  { zh: '叶立恒', en: 'Likken', img: '/bookclub/likken.jpg', roles: [['马来亚大学专业辅导硕士生', 'UM Master of Professional Counseling Student'], ['读书会策展人', 'Bookclub Curator']] },
];

export default function BookClub() {
  return (
    <>
      <div className="wrap page-head bc-head">
        <div>
          <div className="eyebrow">Book club · 体验式读书会</div>
          <h1 className="bc-title" lang="zh-Hans">在「不讨好」中<br />靠近彼此。</h1>
          <p className="bc-en">Please, stop people-pleasing.</p>
          <p className="lede" lang="zh-Hans">《被讨厌的勇气》体验式读书会：在关系地图中重新校準人际距离。</p>
          <div className="bc-actions">
            <Link href="/register" className="btn btn-rasp">立即报名 Sign up →</Link>
            <span className="muted">11am – 2pm · Free · Open to all</span>
          </div>
        </div>
        <img className="bc-cover" src="/bookclub/book.jpg" alt="《被讨厌的勇气》书封，岸见一郎、古贺史健 著" />
      </div>

      <section style={{ paddingTop: 20 }}><div className="wrap">
        <div className="card bc-about">
          <span className="tag">About the session · 关于读书会</span>
          <p className="bc-lead" lang="zh-Hans">一场结合心理治疗工具的沉浸式读书工作坊，从阿德勒心理学出发，在互动中看见真实的我与我们。</p>
          <p className="muted" style={{ margin: 0 }}>An immersive reading workshop that brings therapeutic tools into a book club. Starting from Adlerian psychology, we explore, through play and conversation, who we really are and how we relate to each other. No need to have read the book.</p>
        </div>
      </div></section>

      <section><div className="wrap grid g2" style={{ alignItems: 'start' }}>
        <div>
          <span className="tag">Programme · 流程</span>
          <ol className="bc-list">
            {PROGRAMME.map(([t, zh, en, key]) => (
              <li key={t} className={key ? 'key' : undefined}>
                <span className="bc-t">{t}</span>
                <span><b lang="zh-Hans">{zh}</b><small>{en}</small></span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <span className="tag">Facilitators · 带领人</span>
          <div className="bc-hosts">
            {HOSTS.map((h) => (
              <article className="bc-host" key={h.en}>
                <img src={h.img} alt={`${h.zh} ${h.en}`} />
                <div>
                  <h3><span lang="zh-Hans">{h.zh}</span> <span className="muted">{h.en}</span></h3>
                  <ul>{h.roles.map(([zh, en]) => <li key={en}><span lang="zh-Hans">{zh}</span><small>{en}</small></li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div></section>

      <section className="band-dark"><div className="wrap bc-cta">
        <h2 lang="zh-Hans">准备好不再讨好了吗？</h2>
        <p className="lede">名额有限，欢迎所有人参与。Spaces are limited and everyone is welcome.</p>
        <Link href="/register" className="btn btn-rasp">立即报名 Sign up →</Link>
      </div></section>
    </>
  );
}
