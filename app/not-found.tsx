'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NotFound = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        console.error('404 Error: User attempted to access non-existent route:', pathname);
    }, [pathname]);

    // Auto redirect countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    router.push('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* Illustration */}
                <div className="relative mb-8">
                    <div className="mx-auto w-48 h-48 bg-muted/30 rounded-full flex items-center justify-center mb-6 group">
                        <div className="relative">
                            <AlertTriangle className="h-16 w-16 text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-500" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-xs text-primary-foreground font-bold">!</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute top-0 left-1/4 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-primary/20 rounded-full animate-pulse delay-500"></div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-4 animate-pulse">
                        404
                    </h1>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-md text-muted-foreground mb-2 max-w-md mx-auto">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
                    </p>
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <span>Requested: <code className="text-primary font-mono">{pathname}</code></span>
                    </div> */}
                </div>

                {/* Quick Actions */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="group">
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                                Go to Homepage
                            </Link>
                        </Button>
                    </div>

                    {/* Auto redirect notice */}
                    <div className="text-sm text-muted-foreground">
                        Automatically redirecting to Homepage in {countdown} seconds...
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-sm text-muted-foreground">
                    <p>
                        If you believe this is an error, please{' '}
                        <Link
                            href="/contact"
                            className="text-primary hover:underline font-medium"
                        >
                            contact support
                        </Link>
                        {' '}or try searching for what you need.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;