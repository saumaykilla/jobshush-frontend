import { ProfileType } from "@/lib/schemas/ProfileSchema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileStore {
  profileID:string;
  setProfileID:(profileID:string)=>void;
  profile: ProfileType;
  setProfile: (profile: ProfileType) => void;
  optimizationLimit: number;
  setOptimizationLimit: (optimizationLimit: number) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profileID:"",
      setProfileID:(profileID:string)=>set({profileID}),
      profile: {} as ProfileType,
      setProfile: (profile: ProfileType) => set({ profile }),
      optimizationLimit: 0,
      setOptimizationLimit: (optimizationLimit: number) =>
        set({ optimizationLimit }),
    }),
    { name: "profile-storage" }
  )
);
