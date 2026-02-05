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
  async seedData(): Promise<void> {
    // 1) Kiểm tra bảng có tồn tại/migrate chưa
    let existingProfile: { id: number }[] = [];
    try {
      existingProfile = await db.select({ id: profile.id }).from(profile).limit(1);
    } catch (err) {
      console.error(
        "❌ seedData(): Cannot read table 'profile'. Bạn cần chạy migrate/drizzle push và cấu hình DATABASE_URL đúng.",
        err,
      );
      throw err;
    }

    // Nếu đã có profile => coi như DB đã seed rồi
    if (existingProfile.length > 0) {
      console.log("✅ seedData(): skipped (already seeded)");
      return;
    }

    console.log("🌱 seedData(): seeding profile/categories/links...");

    // 2) Seed profile (1 record)
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

    // 3) Seed categories
    const categoryData: NewCategory[] = [
      { title: "Personal Projects", icon: "FolderGit2", order: 1 },
      { title: "Social Media", icon: "Share2", order: 2 },
      { title: "My Tools", icon: "Wrench", order: 3 },
      { title: "Favorite Games", icon: "Gamepad2", order: 4 },
      { title: "Contact Me", icon: "Mail", order: 5 },
    ];

    // Insert categories và lấy lại id
    const insertedCategories = await db
      .insert(categories)
      .values(categoryData)
      .returning({ id: categories.id, title: categories.title });

    // 4) Seed links
    const linkData: NewLink[] = [];
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

    if (linkData.length > 0) {
      await db.insert(links).values(linkData);
    }

    console.log("✅ seedData(): completed");
  }

  /**
   * Lấy BioData để hiển thị ngoài web
   * - KHÔNG seed ở đây (đúng kiến trúc + tránh race-condition)
   */
  async getBioData(): Promise<BioData> {
    const [userProfile] = await db.select().from(profile).limit(1);

    // Nếu bạn muốn fail rõ ràng thay vì trả rỗng
    if (!userProfile) {
      // gợi ý: hãy gọi seedData() khi server start
      return {
        profile: { id: 0, name: "", bio: "", avatarUrl: "", skills: [] },
        categories: [],
      };
    }

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
      profile: userProfile,
      categories: categoriesWithLinks,
    };
  }
}

export const storage = new DatabaseStorage();
