import "server-only";

import { currentUser } from "@clerk/nextjs/server";

export async function assertSiteOwner() {
  const user = await currentUser();
  if (!user?.publicMetadata.siteOwner) {
    throw new Error("Admin permission required");
  }

  return user;
}
