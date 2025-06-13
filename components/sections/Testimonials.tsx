'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  institution?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Principal',
    institution: 'Lincoln High School',
    content: 'This attendance system has revolutionized how we manage our students. The real-time tracking and automated reports save us hours every week.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Mathematics Teacher',
    institution: 'Roosevelt Elementary',
    content: 'As a teacher, I love how easy it is to take attendance. The interface is intuitive and the notifications keep me informed about student patterns.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Vice Principal',
    institution: 'Oak Valley Academy',
    content: 'The analytics features provide incredible insights into attendance patterns. We can now identify and address issues before they become problems.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face'
  }
];

const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = defaultTestimonials,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || testimonials.length <= 1) return;

    const interval = setInterval(nextTestimonial, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, nextTestimonial, autoPlayInterval, testimonials.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevTestimonial();
      } else if (event.key === 'ArrowRight') {
        nextTestimonial();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextTestimonial, prevTestimonial]);

  const currentTestimonial = testimonials[currentIndex];

  if (!currentTestimonial) {
    return null;
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            What Educators Are Saying
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Hear from the teachers and administrators who are already using our platform
            to transform their attendance management experience.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Card className="border-0 bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center">
                {/* Quote Icon */}
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Quote className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>

                {/* Rating */}
                <div className="mb-6 flex justify-center" role="img" aria-label={`${currentTestimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < currentTestimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                        }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="mb-8 text-xl leading-relaxed text-gray-700 dark:text-gray-200 sm:text-2xl">
                  "{currentTestimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={currentTestimonial.avatar}
                      alt={`Portrait of ${currentTestimonial.name}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      priority={currentIndex === 0}
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentTestimonial.role}
                      {currentTestimonial.institution && (
                        <span className="block text-sm">{currentTestimonial.institution}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>

              {/* Indicators */}
              <div className="flex space-x-2" role="tablist" aria-label="Testimonial navigation">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`h-3 w-3 rounded-full transition-all duration-200 ${index === currentIndex
                        ? 'bg-blue-600 dark:bg-blue-400 scale-110'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                    role="tab"
                    aria-selected={index === currentIndex}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {/* Progress indicator for auto-play */}
          {autoPlay && testimonials.length > 1 && (
            <div className="mt-4 flex justify-center">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-100 ease-linear"
                  style={{
                    width: isPaused ? '0%' : '100%',
                    transitionDuration: isPaused ? '0ms' : `${autoPlayInterval}ms`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;