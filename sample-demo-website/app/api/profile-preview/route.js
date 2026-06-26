import { NextResponse } from "next/server";
import { sampleUsers } from "../../../lib/user-database";
import {
  calculateProfileCompletion,
  createAvatarProfile,
  createContactPreferences,
  createProfileReviewItem,
  createProfileVersion,
  createRetentionPolicy,
  createIdentityStatus,
  createPrivacyControlState,
  mapImportedProfile
} from "../../../lib/user-profile";

export function GET() {
  const user = sampleUsers[0];

  return NextResponse.json({
    ok: true,
    profile: {
      userId: user.uid,
      completion: calculateProfileCompletion(user),
      avatar: createAvatarProfile({ userId: user.uid, displayName: user.displayName }),
      contactPreferences: createContactPreferences({ userId: user.uid }),
      identity: createIdentityStatus({ userId: user.uid, emailVerified: true }),
      privacy: createPrivacyControlState({ userId: user.uid }),
      version: createProfileVersion({ userId: user.uid, snapshot: user }),
      review: createProfileReviewItem({ userId: user.uid, field: "phone", proposedValue: "(555) 010-0000" }),
      retention: createRetentionPolicy({ profileType: user.role }),
      imported: mapImportedProfile({ name: user.displayName, email: user.email })
    }
  });
}
