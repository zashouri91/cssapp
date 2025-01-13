import type { User, Organization } from '@clerk/nextjs/server';

declare module '@clerk/nextjs/server' {
  interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
  }

  interface Organization {
    id: string;
    name: string;
    slug: string | null;
    members: Array<{ userId: string; role: string }>;
  }
}
