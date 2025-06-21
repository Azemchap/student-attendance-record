import { GraduationCap } from "lucide-react";
import Link from "next/link";

import React from 'react'

export default function Logo() {
    return (
        <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary dark:bg-primary rounded-lg p-2 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                <span className="hidden sm:flex">Student Attendance Tracker</span> <span className="sm:hidden">STAT</span>
            </span>
        </Link>
    )
}
