'use client';

import { Clock, UserCheck, BookOpen, Shield, TrendingUp, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track attendance in real-time with instant updates and notifications.',
      color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
    },
    {
      icon: UserCheck,
      title: 'Easy Check-in',
      description: 'Simple and fast check-in process for both teachers and students.',
      color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
    },
    {
      icon: BookOpen,
      title: 'Class Management',
      description: 'Organize students by classes and subjects with comprehensive oversight.',
      color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Advanced security measures to protect student data and privacy.',
      color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reports',
      description: 'Detailed analytics and reports to track attendance patterns.',
      color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Automated alerts for absences and attendance irregularities.',
      color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Attendance Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to manage
            attendance efficiently and effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
            >
              <CardContent className="p-6">
                <div className={`rounded-lg p-3 w-fit mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;