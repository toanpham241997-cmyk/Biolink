import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc } from "drizzle-orm";

export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

/**
 * Postgres error code:
 * 42P01 = undefined_table (bảng chưa tồn tại)
 */
function isMissingTableError(err: any): boolean {
  const code = err?.code;
  const msg = String(err?.message ?? "");
  return code === "42P01" || msg.includes("does not exist") || msg.includes("undefined_table");
}

const EMPTY_PROFILE: BioData["profile"] = {
  id: 0,
  name: "",
  bio: "",
  avatarUrl: "",
  skills: [],
};

export class DatabaseStorage implements IStorage {
  async getBioData(): Promise<BioData> {
    try {
      const [userProfile] = await db.select().from(profile);
      const allCategories = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.order));

      const allLinks = await db.select().from(links).orderBy(asc(links.order));

      // Combine categories and links
      const categoriesWithLinks = allCategories.map((cat) => ({
        ...cat,
        links: allLinks.filter((link) => link.categoryId === cat.id),
      }));

      // Return default empty profile if none exists
      return {
        profile: userProfile || EMPTY_PROFILE,
        categories: categoriesWithLinks,
      };
    } catch (err) {
      // Nếu DB chưa migrate (chưa có bảng), đừng để app crash
      if (isMissingTableError(err)) {
        return {
          profile: EMPTY_PROFILE,
          categories: [],
        };
      }
      throw err;
    }
  }

  async seedData(): Promise<void> {
    // Nếu DB chưa migrate, query vào bảng sẽ crash → bắt lỗi và bỏ qua
    try {
      const existingProfile = await db.select().from(profile).limit(1);
      if (existingProfile.length > 0) return;
    } catch (err) {
      if (isMissingTableError(err)) {
        // Bảng chưa tồn tại → đợi migrate xong rồi seed sau
        return;
      }
      throw err;
    }

    // Seed Profile
    await db.insert(profile).values({
      name: "Hà Văn Huấn",
      bio: "Full Stack Developer | Creative Thinker | Game Enthusiast",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      skills: ["React", "Node.js", "TypeScript", "UI/UX Design", "Game Dev", "Cloud Architecture"],
    });

    // Seed Categories (5 frames)
    const categoryData = [
      { title: "Personal Projects", icon: "FolderGit2", order: 1 },
      { title: "Social Media", icon: "Share2", order: 2 },
      { title: "My Tools", icon: "Wrench", order: 3 },
      { title: "Favorite Games", icon: "Gamepad2", order: 4 },
      { title: "Contact Me", icon: "Mail", order: 5 },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();

    // Seed Links (6 per category)
    const linkData: Array<{
      categoryId: number;
      title: string;
      url: string;
      icon: string;
      order: number;
    }> = [];

    for (const cat of insertedCategories) {
      for (let i = 1; i <= 6; i++) {
        linkData.push({
          categoryId: cat.id,
          title: `${cat.title} Item ${i}`,
          url: "https://example.com",
          icon: "Link",
          order: i,
        });
      }
    }

    await db.insert(links).values(linkData);
  }
}

export const storage = new DatabaseStorage();
