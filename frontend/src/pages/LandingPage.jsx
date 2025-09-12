import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiLayers,
  FiLogIn,
} from "react-icons/fi";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-indigo-600">Task Manager</h1>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
        >
          <FiLogIn /> Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Organize. Track. Achieve.
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          A simple yet powerful Task Manager to streamline your team’s work,
          assign tasks, track progress, and boost productivity.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition-all"
        >
          Get Started → Login
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
          <FiUsers className="text-indigo-600 text-3xl mb-4" />
          <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
          <p className="text-gray-600 text-sm">
            Assign tasks to team members, set priorities, and ensure everyone
            knows what to do.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
          <FiClock className="text-indigo-600 text-3xl mb-4" />
          <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
          <p className="text-gray-600 text-sm">
            Stay updated with real-time task statuses: pending, in-progress,
            completed, or overdue.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
          <FiBarChart2 className="text-indigo-600 text-3xl mb-4" />
          <h3 className="font-semibold text-lg mb-2">Analytics & Insights</h3>
          <p className="text-gray-600 text-sm">
            Gain visibility into workloads and performance through dashboard
            summaries.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            Why Choose Our Task Manager?
          </h3>
          <ul className="space-y-4 text-left md:text-center">
            <li className="flex items-center gap-2 text-gray-700 justify-center">
              <FiCheckCircle className="text-green-600" /> Simplifies team
              coordination
            </li>
            <li className="flex items-center gap-2 text-gray-700 justify-center">
              <FiCheckCircle className="text-green-600" /> Improves
              accountability and transparency
            </li>
            <li className="flex items-center gap-2 text-gray-700 justify-center">
              <FiCheckCircle className="text-green-600" /> Reduces delays and
              missed deadlines
            </li>
            <li className="flex items-center gap-2 text-gray-700 justify-center">
              <FiCheckCircle className="text-green-600" /> Helps managers
              prioritize tasks effectively
            </li>
            <li className="flex items-center gap-2 text-gray-700 justify-center">
              <FiCheckCircle className="text-green-600" /> Scales with your team
              size and projects
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-indigo-600 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Start Managing Smarter Today</h3>
        <p className="mb-8">
          Join hundreds of teams who trust Task Manager to get things done.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
        >
          Login & Get Started →
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 bg-white">
        © {new Date().getFullYear()} Task Manager. All rights reserved.
      </footer>
    </div>
  );
}

