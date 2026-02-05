import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc } from "drizzle-orm";

/**
 * Storage interface
 * (interface CHỈ khai báo hàm, KHÔNG có body)
 */
export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  /**
   * Seed database nếu còn trống
   * Không throw error để tránh làm sập app trên Render
   */
  async seedData(): Promise<void> {
    try {
      const existing = await db.select().from(profile).limit(1);
      if (existing.length > 0) return;
    } catch {
      console.warn("⚠️ Tables not ready, skip seeding");
      return;
    }

    console.log("⚙️ Seeding database...");

    await db.insert(profile).values({
      name: "Hà Văn Huấn",
      bio: "Full Stack Developer | Creative Thinker | Game Enthusiast",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      skills: [
        "React",
        "Node.js",
        "TypeScript",
        "UI/UX Design",
        "Game Dev",
        "Cloud Architecture",
      ],
    });

    const insertedCategories = await db
      .insert(categories)
      .values([
        { title: "Personal Projects", icon: "FolderGit2", order: 1 },
        { title: "Social Media", icon: "Share2", order: 2 },
        { title: "My Tools", icon: "Wrench", order: 3 },
        { title: "Favorite Games", icon: "Gamepad2", order: 4 },
        { title: "Contact Me", icon: "Mail", order: 5 },
      ])
      .returning();

    const linkData: {
      categoryId: number;
      title: string;
      url: string;
      icon: string;
      order: number;
    }[] = [];

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
    console.log("✅ Seed done");
  }

  async getBioData(): Promise<BioData> {
    await this.seedData();

    const [userProfile] = await db.select().from(profile).limit(1);

    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.order));

    const allLinks = await db
      .select()
      .from(links)
      .orderBy(asc(links.order));

    return {
      profile: userProfile || {
        id: 0,
        name: "",
        bio: "",
        avatarUrl: "",
        skills: [],
      },
      categories: allCategories.map((cat) => ({
        ...cat,
        links: allLinks.filter((l) => l.categoryId === cat.id),
      })),
    };
  }
}

export const storage = new DatabaseStorage();w DatabaseStorage();
