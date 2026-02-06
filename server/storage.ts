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
    avatarUrl:
      "https://sf-static.upanhlaylink.com/img/image_202602059ab3ff86cc2fd62107afdb02cb6d7c9d.jpg",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "UI/UX Design",
      "Game Dev",
      "Cloud Architecture",
      "Html / Js / Css",
      "Hack Game ",
      "C# / C++",
      "Android / Ios App",
    ],
  },

  categories: [
    {
      id: 1,
      title: "Free Fire Hack",
      icon: "https://sf-static.upanhlaylink.com/img/image_2026020536259477749eaded81bff5aa4c17c271.jpg",
      order: 1,
      links: [
        {
          id: 1,
          categoryId: 1,
          title: "Link 1",
          url: "https://your-portfolio.com",
          icon: "Link",
          order: 1,
        },
        {
          id: 2,
          categoryId: 1,
          title: "Link 2",
          url: "https://github.com/yourname",
          icon: "Link",
          order: 2,
        },
        {
          id: 3,
          categoryId: 1,
          title: "Link 3",
          url: "https://drive.google.com/",
          icon: "Link",
          order: 3,
        },
        {
          id: 4,
          categoryId: 1,
          title: "Link 4",
          url: "https://medium.com/@yourname",
          icon: "Link",
          order: 4,
        },
        {
          id: 5,
          categoryId: 1,
          title: "Link 5",
          url: "https://notion.so/",
          icon: "Link",
          order: 5,
        },
        {
          id: 6,
          categoryId: 1,
          title: "Link 6",
          url: "https://yourapp.onrender.com",
          icon: "Link",
          order: 6,
        },
      ],
    },

    {
      id: 2,
      title: "Liên Quân Hack",
      icon: "https://sf-static.upanhlaylink.com/img/image_20260205b62651422685f3ee68f5e7be6587979a.jpg",
      order: 2,
      links: [
        {
          id: 101,
          categoryId: 2,
          title: "Link 1",
          url: "https://facebook.com/yourname",
          icon: "Link",
          order: 1,
        },
        {
          id: 102,
          categoryId: 2,
          title: "Link 2",
          url: "https://instagram.com/yourname",
          icon: "Link",
          order: 2,
        },
        {
          id: 103,
          categoryId: 2,
          title: "Link 3",
          url: "https://tiktok.com/@yourname",
          icon: "Link",
          order: 3,
        },
        {
          id: 104,
          categoryId: 2,
          title: "Link 4",
          url: "https://youtube.com/@yourname",
          icon: "Link",
          order: 4,
        },
        {
          id: 105,
          categoryId: 2,
          title: "Link5",
          url: "https://x.com/yourname",
          icon: "Link",
          order: 5,
        },
        {
          id: 106,
          categoryId: 2,
          title: "Link 6",
          url: "https://linkedin.com/in/yourname",
          icon: "Link",
          order: 6,
        },
      ],
    },

    {
      id: 3,
      title: "Pubg Hack Game",
      icon: "https://sf-static.upanhlaylink.com/img/image_20260205b62651422685f3ee68f5e7be6587979a.jpg",
      order: 3,
      links: [
        {
          id: 201,
          categoryId: 3,
          title: "Link 1",
          url: "https://code.visualstudio.com",
          icon: "Link",
          order: 1,
        },
        {
          id: 202,
          categoryId: 3,
          title: "Link 2",
          url: "https://nodejs.org",
          icon: "Link",
          order: 2,
        },
        {
          id: 203,
          categoryId: 3,
          title: "Link 3",
          url: "https://react.dev",
          icon: "Link",
          order: 3,
        },
        {
          id: 204,
          categoryId: 3,
          title: "Link 4",
          url: "https://render.com",
          icon: "Link",
          order: 4,
        },
        {
          id: 205,
          categoryId: 3,
          title: "Link 5",
          url: "https://www.postgresql.org",
          icon: "Link",
          order: 5,
        },
        {
          id: 206,
          categoryId: 3,
          title: "Ljnk 6",
          url: "https://orm.drizzle.team",
          icon: "Link",
          order: 6,
        },
      ],
    },

    {
      id: 4,
      title: "Chứng Chỉ Iod",
      icon: "https://sf-static.upanhlaylink.com/img/image_20260205b62651422685f3ee68f5e7be6587979a.jpg",
      order: 4,
      links: [
        {
          id: 301,
          categoryId: 4,
          title: "Link 1",
          url: "https://store.steampowered.com",
          icon: "Link",
          order: 1,
        },
        {
          id: 302,
          categoryId: 4,
          title: "Link 2",
          url: "https://store.epicgames.com",
          icon: "Link",
          order: 2,
        },
        {
          id: 303,
          categoryId: 4,
          title: "Link 4",
          url: "https://www.playstation.com",
          icon: "Link",
          order: 3,
        },
        {
          id: 304,
          categoryId: 4,
          title: "Link 5",
          url: "https://www.xbox.com",
          icon: "Link",
          order: 4,
        },
        {
          id: 305,
          categoryId: 4,
          title: "Link 6",
          url: "https://www.nintendo.com",
          icon: "Link",
          order: 5,
        },
        {
          id: 306,
          categoryId: 4,
          title: "Link 7",
          url: "https://youtube.com/@yourname",
          icon: "Link",
          order: 6,
        },
      ],
    },

    {
      id: 5,
      title: "Hack Fc Vn",
      icon: "https://sf-static.upanhlaylink.com/img/image_20260205b62651422685f3ee68f5e7be6587979a.jpg",
      order: 5,
      links: [
        {
          id: 401,
          categoryId: 5,
          title: "Link 1",
          url: "mailto:yourmail@gmail.com",
          icon: "Link",
          order: 1,
        },
        {
          id: 402,
          categoryId: 5,
          title: "Link 2",
          url: "https://zalo.me/yourid",
          icon: "Link",
          order: 2,
        },
        {
          id: 403,
          categoryId: 5,
          title: "Link 3",
          url: "https://t.me/yourname",
          icon: "Link",
          order: 3,
        },
        {
          id: 404,
          categoryId: 5,
          title: "Ljnk 4",
          url: "https://wa.me/your-number",
          icon: "Link",
          order: 4,
        },
        {
          id: 405,
          categoryId: 5,
          title: "Link 5",
          url: "https://m.me/yourname",
          icon: "Link",
          order: 5,
        },
        {
          id: 406,
          categoryId: 5,
          title: "Link 6",
          url: "https://cal.com/yourname",
          icon: "Link",
          order: 6,
        },
      ],
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
