import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Hexagon, ArrowRight, ChevronRight, CheckCircle2,
  BrainCircuit, Users, LayoutDashboard, Trophy, Star,
  Briefcase, Sparkles, Code, Zap, Search, Shield
} from 'lucide-react';
import './LandingPage.css';

/* ── Reusable fade-up wrapper ── */
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ═══════ DATA ═══════ */
const FEATURES = [
  { icon: Users,           color: '',       title: 'Smart Matchmaking',     desc: 'AI-powered teammate discovery based on skills, timezone, and work style. Find your perfect hackathon squad in seconds.', featured: true },
  { icon: BrainCircuit,    color: 'pink',   title: 'AI Project Mentor',     desc: 'Get real-time debugging help, architecture advice, and code reviews from your personal AI mentor.' },
  { icon: LayoutDashboard, color: 'violet', title: 'Live Workspace',        desc: 'Whiteboard, code editor, and task board — all in one collaborative space.' },
  { icon: Trophy,          color: 'amber',  title: 'Hackathon Hub',         desc: 'Discover hackathons, form teams, and track submissions from a single dashboard.' },
  { icon: Star,            color: 'green',  title: 'Collab Score',          desc: 'Your reputation, quantified. Track contributions, teamwork, and coding streaks in one metric.', featured: true },
  { icon: Briefcase,       color: 'pink',   title: 'Recruiter Hub',         desc: 'Recruiters browse verified developer profiles, Collab Scores, and portfolios — no résumés needed.' },
];

const STEPS = [
  { num: '1', title: 'Sign Up Instantly', desc: 'One-click Google sign-in. Set your skills and preferences in 60 seconds.' },
  { num: '2', title: 'Get Matched',       desc: 'Our AI finds teammates that complement your stack, schedule, and goals.' },
  { num: '3', title: 'Ship Together',     desc: 'Collaborate in real-time, track progress, and build your Collab Score.' },
];

const PRICING = [
  {
    name: 'Free', price: '$0', period: '',
    desc: 'Perfect for getting started.',
    features: ['3 active projects', 'Basic matchmaking', 'Collab Score tracking', 'Public portfolio', 'Community support'],
    cta: 'Get Started', popular: false,
  },
  {
    name: 'Pro', price: '$9', period: '/mo',
    desc: 'For serious builders and hackers.',
    features: ['Unlimited projects', 'Priority matchmaking', 'AI Mentor (unlimited)', 'Custom portfolio URL', 'Analytics dashboard', 'Priority support'],
    cta: 'Upgrade to Pro', popular: true,
  },
  {
    name: 'Team', price: '$19', period: '/seat/mo',
    desc: 'For teams shipping together.',
    features: ['Everything in Pro', 'Team rooms & chat', 'Async video standups', 'Admin dashboard', 'API access', 'Dedicated support'],
    cta: 'Start Team Plan', popular: false,
  },
];

const RECRUITER_FEATURES = [
  'Search & filter developers by skill, location, and score',
  'View verified Collab Scores — not just self-reported résumés',
  'See real code contributions and project history',
  'Direct message top talent',
];

/* ═══════ COMPONENT ═══════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const goApp = () => navigate('/');

  return (
    <div className="landing-page">

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <Hexagon size={28} className="text-gradient" />
          <span>Collab<span className="text-gradient">Hive</span></span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
          <button className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }} onClick={goApp}>
            Open App <ArrowRight size={15} style={{ marginLeft: 4 }} />
          </button>
        </div>
      </nav>

      {/* ══════════ 1. HERO ══════════ */}
      <section className="hero-section">
        <div className="hero-bg-gradient" />
        <div className="hero-visual-dots" />
        <div className="hero-content">
          <FadeUp>
            <span className="hero-badge"><Sparkles size={16} /> Now in Beta</span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1>Build With the Best.<br /><span className="text-gradient">Ship What Matters.</span></h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="hero-subtitle">
              CollabHive connects developers, forms dream teams, and tracks real collaboration — so you can stop networking and start building.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="hero-cta-group">
              <button className="btn-primary flex-center" onClick={goApp}>
                Get Started Free <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
              <button className="btn-secondary flex-center" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                See Features <ChevronRight size={18} />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════ 2. SOCIAL PROOF ══════════ */}
      <section className="social-proof-section">
        <div className="social-proof-grid">
          {[
            { value: '500+', label: 'Developers Joined' },
            { value: '120+', label: 'Teams Formed' },
            { value: '50+',  label: 'Hackathons Tracked' },
            { value: '4.9★', label: 'Avg. Satisfaction' },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className="proof-stat">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ 3. FEATURES BENTO ══════════ */}
      <section className="features-section" id="features">
        <FadeUp><p className="section-eyebrow">Features</p></FadeUp>
        <FadeUp delay={0.05}><h2 className="section-title">Everything your team needs</h2></FadeUp>
        <FadeUp delay={0.1}><p className="section-desc">From finding teammates to shipping products — CollabHive is the all-in-one platform for developer collaboration.</p></FadeUp>

        <div className="bento-grid">
          {FEATURES.map((f, i) => (
            <FadeUp key={i} delay={i * 0.07} className={f.featured ? 'bento-card featured' : 'bento-card'}>
              <div className={`bento-icon ${f.color}`}><f.icon size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ 4. HOW IT WORKS ══════════ */}
      <section className="how-section" id="how">
        <FadeUp><p className="section-eyebrow">How It Works</p></FadeUp>
        <FadeUp delay={0.05}><h2 className="section-title">From sign-up to shipped in 3 steps</h2></FadeUp>
        <FadeUp delay={0.1}><p className="section-desc" style={{ margin: '0 auto 3rem' }}>No lengthy onboarding. No setup guides. Just start building.</p></FadeUp>

        <div className="steps-row">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <FadeUp delay={i * 0.15}>
                <div className="step-card">
                  <div className="step-number">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </FadeUp>
              {i < STEPS.length - 1 && (
                <div className="step-arrow"><ArrowRight size={28} /></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══════════ 5. RECRUITER ══════════ */}
      <section className="recruiter-section">
        <FadeUp>
          <div className="recruiter-card">
            <div className="recruiter-text">
              <p className="section-eyebrow">For Recruiters</p>
              <h2>Find Verified Developers,<br />Not Résumés</h2>
              <p>Browse talent backed by real Collab Scores, code contributions, and team feedback — not self-reported bullet points.</p>
              <div className="recruiter-features">
                {RECRUITER_FEATURES.map((feat, i) => (
                  <div key={i} className="recruiter-feature-item">
                    <CheckCircle2 size={18} /> <span>{feat}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary flex-center" style={{ width: 'fit-content' }} onClick={goApp}>
                Explore Recruiter Hub <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            </div>
            <div className="recruiter-visual">
              <Search size={80} strokeWidth={1} style={{ color: 'rgba(99,102,241,0.3)' }} />
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ══════════ 6. PRICING ══════════ */}
      <section className="pricing-section" id="pricing">
        <FadeUp><p className="section-eyebrow">Pricing</p></FadeUp>
        <FadeUp delay={0.05}><h2 className="section-title">Simple, transparent pricing</h2></FadeUp>
        <FadeUp delay={0.1}><p className="section-desc" style={{ margin: '0 auto 3rem' }}>Start free. Upgrade when you're ready to go pro.</p></FadeUp>

        <div className="pricing-grid">
          {PRICING.map((plan, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <div className="pricing-price">{plan.price}<span>{plan.period}</span></div>
                <p className="pricing-desc">{plan.desc}</p>
                <ul className="pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j}><CheckCircle2 size={16} /> {f}</li>
                  ))}
                </ul>
                <button className={plan.popular ? 'btn-primary' : 'btn-secondary'} onClick={goApp}>
                  {plan.cta}
                </button>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ 7. CTA + FOOTER ══════════ */}
      <section className="final-cta-section">
        <FadeUp>
          <div className="final-cta-content">
            <h2>Ready to <span className="text-gradient">join the Hive</span>?</h2>
            <p>Start building with the right teammates today — it's free.</p>
            <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: 12 }} onClick={goApp}>
              Get Started Free <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
          </div>
        </FadeUp>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <Hexagon size={20} className="text-gradient" />
          <span>Collab<span className="text-gradient">Hive</span></span>
        </div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2026 CollabHive. Built by Harshit Singh.</p>
      </footer>
    </div>
  );
}
