// server/storage.ts
import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc, eq } from "drizzle-orm";

export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

type NewCategory = {
  title: string;
  icon: string;
  order: number;
};

type NewLink = {
  categoryId: number;
  title: string;
  url: string;
  icon: string;
  order: number;
};

export class DatabaseStorage implements IStorage {
  /**
   * Seed an toàn:
   * - Chỉ seed khi profile chưa có dữ liệu
   * - Upsert-ish (tránh trùng)
   * - Không phụ thuộc thứ tự restart của Render
   */
import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc } from "drizzle-orm";

export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async seedData(): Promise<void> {
    // Nếu bảng chưa tồn tại (chưa drizzle push) thì bỏ qua seed để không làm sập app
    try {
      const existing = await db.select().from(profile).limit(1);
      if (existing.length > 0) return;
    } catch (err: any) {
      console.warn(
        "⚠️ seedData(): tables not ready (run drizzle-kit push / check DATABASE_URL). Skipping seed.",
      );
      return;
    }

    console.log("⚙️ Seeding database (profile/categories/links) ...");

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
    // Tự seed nếu DB rỗng (nhưng seedData đã an toàn, không làm sập app)
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
      profile: userProfile || {
        id: 0,
        name: "",
        bio: "",
        avatarUrl: "",
        skills: [],
      },
      categories: categoriesWithLinks,
    };
  }
}

export const storage = new DatabaseStorage();w DatabaseStorage();
