import { type BioData } from "@shared/schema";

/**
 * Storage interface
 */
export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

/**
 * ✅ Fallback data (không cần DB)
 * - Web chạy ổn trên Render Free
 * - Không cần migrate / drizzle push
 */
const FALLBACK_DATA: BioData = {
  profile: {
    id: 1,
    name: "Hà Văn Huấn",
    bio: "Full Stack Developer | Creative Thinker | Game Enthusiast",
    avatarUrl: "https://sf-static.upanhlaylink.com/img/image_202602059ab3ff86cc2fd62107afdb02cb6d7c9d.jpg",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "UI/UX Design",
      "Game Dev",
      "Cloud Architecture",
    ],
  },
  categories: [
    {
      id: 1,
      title: "Hack Free Fire",
      icon: "FolderGit2",
      order: 1,
      links: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        categoryId: 1,
        title: `Personal Projects Item ${i + 1}`,
        url: "https://example.com",
        icon: "Link",
        order: i + 1,
      })),
    },
    {
      id: 2,
      title: "Hack Liên Quân",
      icon: "Share2",
      order: 2,
      links: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 101,
        categoryId: 2,
        title: `Social Media Item ${i + 1}`,
        url: "https://example.com",
        icon: "Link",
        order: i + 1,
      })),
    },
    {
      id: 3,
      title: "Hack Pubg",
      icon: "Wrench",
      order: 3,
      links: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 201,
        categoryId: 3,
        title: `My Tools Item ${i + 1}`,
        url: "https://example.com",
        icon: "Link",
        order: i + 1,
      })),
    },
    {
      id: 4,
      title: "Hack Fc Mobile",
      icon: "Gamepad2",
      order: 4,
      links: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 301,
        categoryId: 4,
        title: `Favorite Games Item ${i + 1}`,
        url: "https://example.com",
        icon: "Link",
        order: i + 1,
      })),
    },
    {
      id: 5,
      title: "Contact Me",
      icon: "Mail",
      order: 5,
      links: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 401,
        categoryId: 5,
        title: `Contact Me Item ${i + 1}`,
        url: "https://example.com",
        icon: "Link",
        order: i + 1,
      })),
    },
  ],
};

/**
 * ✅ Memory storage
 */
export class MemoryStorage implements IStorage {
  private data: BioData = FALLBACK_DATA;

  async seedData(): Promise<void> {
    // Memory storage: data luôn có sẵn
    return;
  }

  async getBioData(): Promise<BioData> {
    return this.data;
  }
}

/**
 * Export storage dùng chung cho routes
 */
export const storage: IStorage = new MemoryStorage();
