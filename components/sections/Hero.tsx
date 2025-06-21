'use client';

import { CheckCircle, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900 dark:via-gray-800 dark:to-indigo-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Modern Student Attendance
            <span className="text-primary block">Tracking System</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline your school&apos;s students attendance tracking with our intuitive,
            digital solution designed for modern secondary schools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href={'/attendance'}>
              <Button size="lg" className="px-8 py-3 text-lg">Get Started</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</h3>
              <p className="text-gray-600 dark:text-gray-400">Accuracy Rate</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">500+</h3>
              <p className="text-gray-600 dark:text-gray-400">Students Managed</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">50%</h3>
              <p className="text-gray-600 dark:text-gray-400">Time Saved</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">24/7</h3>
              <p className="text-gray-600 dark:text-gray-400">Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse dark:bg-blue-700"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000 dark:bg-purple-700"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000 dark:bg-green-700"></div>
      </div>
    </section>
  );
};

export default Hero;