// 自定义认证类型（已从 NextAuth 迁移至 Cookie Session）
declare module "@/components/auth/SessionProvider" {
  export function useSession(): {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      image?: string | null;
    } | null;
    loading: boolean;
    login: (
      email: string,
      password: string
    ) => Promise<{ error?: string }>;
    register: (
      name: string,
      email: string,
      password: string
    ) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
  };

  export function SessionProvider(props: {
    children: React.ReactNode;
  }): JSX.Element;
}
