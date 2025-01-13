import { useUser } from "@clerk/nextjs";

export function ProfileComponent() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Hello, {user?.firstName}!</h1>
    </div>
  );
}
