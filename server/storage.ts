import { db } from "./db";
import { profile, categories, links, type BioData } from "@shared/schema";
import { asc } from "drizzle-orm";

export interface IStorage {
  getBioData(): Promise<BioData>;
  seedData(): Promise<void>;
}

function isMissingTableError(err: any) {
  const msg = String(err?.message || "");
  // postgres missing relation
  return msg.includes("does not exist") || msg.includes("relation");
}

export class DatabaseStorage implements IStorage {
  async seedData(): Promise<void> {
    // 1) Check bảng profile có đọc được không
    try {
      const existing = await db.select().from(profile).limit(1);
      if (existing.length > 0) {
        return; // đã có data
      }
    } catch (err) {
      // Nếu bảng chưa tồn tại => không seed được, trả về để server vẫn chạy
      if (isMissingTableError(err)) {
        console.warn(
          "⚠️ Tables not ready (profile missing). Run `drizzle-kit push` with correct DATABASE_URL.",
        );
        return;
      }
      // lỗi khác: throw để biết thật sự hỏng
      console.error("❌ seedData failed (unexpected):", err);
      throw err;
    }

    console.log("⚙️ Seeding database (profile/categories/links) ...");

    // 2) Insert profile
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

    // 3) Insert categories
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

    // 4) Insert links
    const linkRows: {
      categoryId: number;
      title: string;
      url: string;
      icon: string;
      order: number;
    }[] = [];

    for (const cat of insertedCategories) {
      for (let i = 1; i <= 6; i++) {
        linkRows.push({
          categoryId: cat.id,
          title: `${cat.title} Item ${i}`,
          url: "https://example.com",
          icon: "Link",
          order: i,
        });
      }
    }

    await db.insert(links).values(linkRows);

    console.log("✅ Seed completed");
  }

  async getBioData(): Promise<BioData> {
    // Seed không được crash server
    await this.seedData();

    // Nếu bảng chưa có => trả fallback để FE vẫn render
    try {
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
        profile: userProfile ?? {
          id: 0,
          name: "No profile yet",
          bio: "Run migrations first",
          avatarUrl: "",
          skills: [],
        },
        categories: categoriesWithLinks,
      };
    } catch (err) {
      if (isMissingTableError(err)) {
        return {
          profile: {
            id: 0,
            name: "DB not migrated",
            bio: "Please set DATABASE_URL and run drizzle push",
            avatarUrl: "",
            skills: [],
          },
          categories: [],
        };
      }
      throw err;
    }
  }
}

export const storage = new DatabaseStorage();
