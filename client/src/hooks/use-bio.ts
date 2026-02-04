import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Define strict types matching the backend response structure
export interface Link {
  id: number;
  categoryId: number;
  title: string;
  url: string;
  icon: string;
  order: number;
}

export interface Category {
  id: number;
  title: string;
  icon: string;
  order: number;
  links: Link[];
}

export interface Profile {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
}

export interface BioData {
  profile: Profile;
  categories: Category[];
}

export function useBio() {
  return useQuery<BioData>({
    queryKey: [api.bio.get.path],
    queryFn: async () => {
      const res = await fetch(api.bio.get.path);
      if (!res.ok) throw new Error("Failed to fetch bio data");
      return await res.json();
    },
  });
}
