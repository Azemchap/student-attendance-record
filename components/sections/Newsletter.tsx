'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface NewsletterProps {
  onSubscribe?: (email: string) => Promise<void>;
}

const Newsletter: React.FC<NewsletterProps> = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      }

      setIsSubscribed(true);
      setEmail('');

      // Reset success state after 4 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 4000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-blue-800 dark:via-blue-900 dark:to-purple-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon Container */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm dark:bg-white/10 sm:h-20 sm:w-20">
            <Mail className="h-8 w-8 text-white sm:h-10 sm:w-10" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stay Updated with Latest Features
          </h2>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100 sm:text-xl lg:mb-10">
            Get notified about new features, updates, and best practices for
            attendance management in educational institutions.
          </p>

          {/* Form Container */}
          <div className="mx-auto max-w-md">
            {isSubscribed ? (
              <div
                role="alert"
                className="flex items-center justify-center space-x-2 rounded-lg bg-green-600 px-6 py-4 text-white shadow-lg dark:bg-green-700"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium">Successfully subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-12 border-0 bg-white/95 text-gray-900 placeholder-gray-500 shadow-lg backdrop-blur-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-white/50 dark:bg-gray-800/95 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:ring-white/30"
                      required
                      aria-describedby={error ? "email-error" : undefined}
                    />
                    {error && (
                      <p id="email-error" className="mt-2 text-sm text-red-200 dark:text-red-300">
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="h-12 bg-white px-6 font-semibold text-blue-700 shadow-lg transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-white/50 disabled:opacity-50 dark:bg-gray-200 dark:text-blue-800 dark:hover:bg-gray-100 sm:px-8"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Privacy Notice */}
            <p className="mt-4 text-sm text-blue-100 dark:text-blue-200">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;