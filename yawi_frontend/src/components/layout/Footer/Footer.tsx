import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { NAV_ITEMS } from '../Navbar';

const yawiLogo = '/images/yawi-logo.svg';

// Custom Social SVG icons matching Lucide outline style
const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const Footer: React.FC = () => {
  const { t: tFooter } = useTranslation('footer');
  const { t: tNav } = useTranslation('nav');
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
    { icon: XTwitterIcon, href: 'https://x.com', label: 'X (Twitter)' },
    { icon: TikTokIcon, href: 'https://tiktok.com', label: 'TikTok' },
  ];

  return (
    <footer className="bg-primary-navy text-white pt-16 pb-12 border-t border-primary-indigo/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={yawiLogo} alt="Yawi" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-soft-lavender/80 leading-relaxed">{tFooter('tagline')}</p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-peach-accent">
              {tFooter('quick_links')}
            </h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.labelKey}>
                  <a
                    href={item.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {tNav(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-peach-accent">
              {tFooter('contact')}
            </h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-indigo shrink-0" />
                <a
                  href={`mailto:${tFooter('contact_email')}`}
                  className="hover:text-white transition-colors"
                >
                  {tFooter('contact_email')}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-indigo shrink-0" />
                <span>{tFooter('contact_phone')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-indigo shrink-0 mt-0.5" />
                <span>{tFooter('contact_location')}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Social media */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-peach-accent">
              {tFooter('social_media')}
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary-indigo text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-soft-lavender/60">
          <p>{tFooter('copyright', { year: currentYear })}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              {tFooter('privacy_policy')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {tFooter('terms_of_service')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
