import '@/styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          organizationSwitcherTrigger: "py-2 px-4"
        }
      }}
      organization={{
        createOrganization: {
          enabled: true
        }
      }}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
