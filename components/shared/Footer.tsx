'use client';

import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">

            <Logo />

            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Empowering educational institutions with modern student management solutions.
              Streamline your administrative processes and focus on what matters most - education.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors duration-200 group">
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <a href="mailto:support@studenttracker.edu" className="hover:underline">
                  support@studenttracker.edu
                </a>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors duration-200 group">
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <a href="tel:+15551234567" className="hover:underline">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground group">
                <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>123 Education Lane, Learning City</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Support & Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Student Tracker. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>for educational excellence</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;