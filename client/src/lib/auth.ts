export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "member";
  balance: number; // VND
  status: "active";
};

type StoredUser = {
  user: User;
  password: string; // demo only
};

const KEY_USERS = "SHOP_USERS_V1";
const KEY_SESSION = "SHOP_SESSION_V1";

function uid() {
  return "u_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(list: StoredUser[]) {
  localStorage.setItem(KEY_USERS, JSON.stringify(list));
}

export function getSession(): User | null {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(KEY_SESSION);
}

export function register(params: {
  name: string;
  email: string;
  password: string;
}): { ok: true; user: User } | { ok: false; message: string } {
  const email = params.email.trim().toLowerCase();
  const name = params.name.trim();
  const password = params.password;

  if (!email || !name || !password) {
    return { ok: false, message: "Vui lòng nhập đủ thông tin." };
  }

  const users = readUsers();
  const exists = users.find((u) => u.user.email === email);
  if (exists) return { ok: false, message: "Email đã tồn tại." };

  const user: User = {
    id: uid(),
    name,
    email,
    role: "member",
    balance: 0,
    status: "active",
    avatar: "", // có thể tự sinh chữ cái đầu nếu muốn
  };

  users.push({ user, password });
  writeUsers(users);

  localStorage.setItem(KEY_SESSION, JSON.stringify(user));
  return { ok: true, user };
}

export function login(params: {
  email: string;
  password: string;
}): { ok: true; user: User } | { ok: false; message: string } {
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  const users = readUsers();
  const found = users.find((u) => u.user.email === email);

  if (!found) return { ok: false, message: "Email chưa đăng ký." };
  if (found.password !== password) return { ok: false, message: "Sai mật khẩu." };

  localStorage.setItem(KEY_SESSION, JSON.stringify(found.user));
  return { ok: true, user: found.user };
}
