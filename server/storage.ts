import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc } from "drizzle-orm";

export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  /**
   * Seed nếu DB đang rỗng.
   * - Tránh tình trạng web chạy nhưng thiếu chức năng vì categories/links = []
   */
  async seedData(): Promise<void> {
    // Nếu bảng chưa tồn tại / query lỗi => throw để Render log ra rõ
    let existing: any[] = [];
    try {
      existing = await db.select().from(profile).limit(1);
    } catch (err) {
      console.error(
        "❌ seedData() cannot read table profile. Check drizzle push + DATABASE_URL.",
        err,
      );
      throw err;
    }

    if (existing.length > 0) return;

    console.log("⚙️ Seeding database (profile/categories/links) ...");

    // Seed profile
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

    // Seed categories
    const categoryData = [
      { title: "Personal Projects", icon: "FolderGit2", order: 1 },
      { title: "Social Media", icon: "Share2", order: 2 },
      { title: "My Tools", icon: "Wrench", order: 3 },
      { title: "Favorite Games", icon: "Gamepad2", order: 4 },
      { title: "Contact Me", icon: "Mail", order: 5 },
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoryData)
      .returning();

    // Seed links (6 link / category)
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

    console.log("✅ Seed completed");
  }

  async getBioData(): Promise<BioData> {
    // Nếu DB rỗng thì tự seed (tránh web thiếu dữ liệu)
    await this.seedData();

    const [userProfile] = await db.select().from(profile).limit(1);

    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.order));

    const allLinks = await db.select().from(links).orderBy(asc(links.order));

    const categoriesWithLinks = allCategories.map((cat) => ({
      ...cat,
      links: allLinks.filter((l) => l.categoryId === cat.id),
    }));

    return {
      profile: userProfile!, // sau seed chắc chắn có
      categories: categoriesWithLinks,
    };
  }
}

export const storage = new DatabaseStorage();
