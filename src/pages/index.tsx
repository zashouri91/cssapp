import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { ArrowRightIcon, ChartBarIcon, EnvelopeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <Head>
        <title>FeedbackFlow - Smart Email Signature Feedback Collection</title>
        <meta
          name="description"
          content="Transform your email signatures into powerful feedback collection tools. Get real-time insights from customer interactions."
        />
      </Head>

      <div className="bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-indigo-600">FeedbackFlow</span>
              </div>
              <div className="flex items-center gap-4">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="text-gray-600 hover:text-gray-900 font-medium">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Get Started
                      </button>
                    </SignUpButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative isolate pt-24">
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Transform Your Email Signatures Into
                  <span className="text-indigo-600"> Customer Insights</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Collect valuable customer feedback through interactive email signatures. 
                  Get real-time insights, customizable surveys, and comprehensive analytics 
                  all in one platform.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      Start Free Trial
                    </button>
                  </SignUpButton>
                  <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 sm:py-32 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Powerful Features
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to collect and analyze feedback
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Simple Integration
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Start collecting feedback in minutes
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 lg:gap-x-8">
                {steps.map((step, index) => (
                  <div key={step.name} className="relative pl-16">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <span className="text-white font-semibold">{index + 1}</span>
                    </div>
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      {step.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {step.description}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your customer feedback?
                <br />
                Start your free trial today.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
                Join thousands of organizations that use FeedbackFlow to collect and analyze customer feedback.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Get started
                  </button>
                </SignUpButton>
                <Link href="#features" className="text-sm font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const features = [
  {
    name: 'Interactive Email Signatures',
    description: 'Generate beautiful, mobile-responsive email signatures with embedded feedback collection capabilities.',
    icon: EnvelopeIcon,
  },
  {
    name: 'Team Management',
    description: 'Organize your team with role-based access control and group management features.',
    icon: UserGroupIcon,
  },
  {
    name: 'Advanced Analytics',
    description: 'Get real-time insights with powerful analytics and customizable reporting features.',
    icon: ChartBarIcon,
  },
];

const steps = [
  {
    name: 'Create Your Account',
    description: 'Sign up and configure your organization settings with our easy-to-use dashboard.',
  },
  {
    name: 'Customize Your Surveys',
    description: 'Design feedback surveys that match your brand and capture the insights you need.',
  },
  {
    name: 'Deploy & Collect',
    description: 'Generate email signatures for your team and start collecting valuable customer feedback.',
  },
];
