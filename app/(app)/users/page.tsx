import { notFound } from "next/navigation";
import { listUsers } from "@/services/user.service";
import { UsersView } from "@/components/users/users-view";

export default async function UsersPage() {
  const users = await listUsers();

  // A non-admin gets the same response as a route that doesn't exist, rather
  // than a "forbidden" page confirming the feature is here.
  if (!users) notFound();

  return <UsersView users={users} />;
}
