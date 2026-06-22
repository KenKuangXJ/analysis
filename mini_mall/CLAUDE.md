# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Mini Mall 是一个学习型微型电商平台，用于实践全栈 Web 开发。功能涵盖：商品浏览（列表/详情/搜索/分类筛选）、用户注册登录、购物车、下单（模拟支付）、后台管理（商品 CRUD、订单管理、分类管理）。

**核心原则：架构清晰、代码简洁、不过度设计。**

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| Next.js | 16 (App Router) | 全栈框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| SQLite | - | 数据库（零配置） |
| Tailwind CSS | 4.x | 样式（CSS-first theme） |
| NextAuth | 4.x | 认证 |
| bcryptjs | 3.x | 密码哈希 |

## 常用命令

```sh
npm run dev          # 启动开发服务器（默认 http://localhost:3000）
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 推送 Schema 到数据库（无需 migration）
npm run db:migrate   # 创建 migration 文件
npm run db:seed      # 运行种子数据
npm run db:studio    # 打开 Prisma 数据库管理界面
npm run db:reset     # 重置数据库
```

## 目录结构

```
mini_mall/
├── prisma/
│   ├── schema.prisma              # 数据库 Schema（含 NextAuth 适配器）
│   └── seed.ts                    # 种子数据（管理员、测试用户、商品）
├── public/images/                 # 静态资源
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind v4 @theme 配置 + 全局样式
│   │   ├── layout.tsx             # 根布局（html > body，暂时不含 SessionProvider）
│   │   ├── (shop)/                # 商城路由组（共享 Header/Footer 布局）
│   │   │   ├── page.tsx           # 首页（精选商品 + 分类展示）
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # 商品列表（分页 + 搜索 + 分类筛选，URL searchParams 驱动）
│   │   │   │   └── [id]/page.tsx  # 商品详情
│   │   │   ├── cart/page.tsx      # 购物车（Client Component，交互密集型）
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx       # 订单列表
│   │   │   │   └── [id]/page.tsx  # 订单详情
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       └── register/page.tsx
│   │   ├── admin/                 # 后台管理（需 ADMIN 角色）
│   │   │   ├── page.tsx           # 仪表盘
│   │   │   ├── products/          # 商品 CRUD（列表/新建/编辑）
│   │   │   ├── orders/            # 订单管理（列表/详情/状态更新）
│   │   │   └── categories/        # 分类管理
│   │   └── api/                   # RESTful API 路由
│   │       ├── auth/[...nextauth]/route.ts  # NextAuth 处理器
│   │       ├── register/route.ts
│   │       ├── products/          # 公开：列表/搜索/详情；Admin：创建/修改/删除
│   │       ├── categories/        # 公开：列表；Admin：创建/修改/删除
│   │       ├── cart/              # 需登录：CRUD 购物车
│   │       └── orders/            # 需登录：创建/查询；Admin：状态更新
│   ├── components/
│   │   ├── ui/                    # 基础 UI 组件（Button, Input, Table, Pagination 等）
│   │   ├── layout/                # 布局组件（Header, Footer, Sidebar）
│   │   ├── product/               # 商品相关（ProductCard, ProductGrid, ProductFilters）
│   │   ├── cart/                  # 购物车相关（CartItem, CartSummary, CartBadge）
│   │   ├── order/                 # 订单相关（OrderCard, OrderDetail, OrderStatusBadge）
│   │   ├── category/              # 分类相关（CategoryCard, CategoryForm）
│   │   └── auth/                  # 认证相关（LoginForm, RegisterForm）
│   ├── lib/
│   │   ├── prisma.ts              # Prisma 单例（开发环境下防止热重载多实例）
│   │   ├── auth.ts                # NextAuth 配置（Credentials Provider + JWT）
│   │   └── utils.ts               # cn(), formatPrice(), formatDate(), generateOrderNumber()
│   ├── actions/                   # Server Actions（购物车/下单/商品/分类变更）
│   ├── types/
│   │   ├── index.ts               # 共享类型（OrderStatus 枚举及标签/颜色映射）
│   │   └── next-auth.d.ts         # NextAuth Session/JWT 类型扩展（添加 role, id）
│   └── middleware.ts              # 路由保护（/cart, /orders 需登录；/admin 需管理员）
├── .env                           # DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
├── next.config.ts                 # 开启 serverActions
├── postcss.config.mjs             # Tailwind CSS v4 PostCSS 插件
└── tsconfig.json                  # strict, path alias @/*
```

## 数据库 Schema

### 模型关系图

```
User (1) ── (1) Cart (1) ── (N) CartItem (N) ── (1) Product (N) ── (1) Category
  │                                                    │
  └── (N) Order (1) ── (N) OrderItem ── (1) ───────────┘
```

### 模型速查

| 模型 | 关键字段 | 说明 |
|---|---|---|
| **User** | id, email(unique), passwordHash, role(CUSTOMER\|ADMIN) | 含 NextAuth 适配器模型（Account, Session, VerificationToken） |
| **Category** | id, name(unique), slug(unique), description | slug 用于 URL 参数 |
| **Product** | id, name, slug(unique), price(Float), comparePrice?, images(JSON string), stock, isFeatured, isPublished, categoryId | images 存 JSON 字符串（`["/path/img.png"]`） |
| **Cart** | id, userId(unique) | 与 User 1:1 |
| **CartItem** | id, quantity, cartId, productId | @@unique([cartId, productId])，重复商品增量更新不新增行 |
| **Order** | id, orderNumber(unique, MM-YYMMDD-XXXX), status, totalAmount, userId | status: PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED |
| **OrderItem** | id, quantity, price, productId, orderId | price 是下单时快照 |

### 种子数据

执行 `npm run db:seed` 后生成：
- **管理员**：`admin@minimall.com` / `admin123`
- **测试用户**：`customer@test.com` / `customer123`
- **5 个分类**：电子产品、服装鞋帽、家居生活、图书音像、运动户外
- **12 件商品**：覆盖所有分类

## 架构模式

### Server vs Client 组件划分

**核心原则：`"use client"` 尽可能往下推，只在需要交互的地方使用。**

| 页面类型 | 渲染模式 | 数据获取方式 |
|---|---|---|
| 商品列表、首页、详情 | Server Component | 直接 `prisma.product.findMany()` |
| 订单列表、详情 | Server Component | 直接 Prisma 查询 |
| 购物车 | Client Component | `fetch("/api/cart")` |
| 登录/注册表单 | Client Component | `fetch` API 或 NextAuth `signIn()` |
| 后台管理列表 | Server Component | 直接 Prisma 查询 |
| 后台管理表单 | Client Component | `useState` 控制表单状态 |

**判断何时用 Client Component：** 需要 `useState` / `useEffect` / `useSession` / 事件处理器（onClick, onChange）时。

### 数据流三模式

- **展示页面**：Server Component 直接从 Prisma 查询 → 渲染 HTML，无 JS 开销
- **交互页面**：Client Component → `fetch(url)` → API Route → Prisma → 响应
- **数据变更**：Server Actions（`"use server"`）→ 校验 → Prisma 事务 → `revalidatePath()`

### URL 驱动的筛选/分页

商品列表的筛选全部通过 URL searchParams 实现：

```
/products?category=electronics              ← 按分类筛选
/products?q=headphones                      ← 搜索
/products?category=electronics&q=headphones  ← 组合筛选
/products?page=2                             ← 分页
```

Server Component 直接从 `searchParams` 读取，无需客户端状态。可分享、可书签。

## 认证体系

### 方案：NextAuth v4 + Credentials + JWT

- Session 存储在 JWT（策略 `"jwt"`）
- JWT callback 将 `role` 和 `id` 写入 token
- Session callback 暴露 `session.user.role` 和 `session.user.id`
- 注册走独立 API `/api/register`（bcrypt 哈希，cost=12），不走 NextAuth 自动创建

### 路由保护（middleware.ts）

| 路径 | 规则 |
|---|---|
| `/admin/*` | 需 ADMIN 角色，否则重定向到登录页 |
| `/cart`, `/orders` | 需登录，否则重定向到登录页（保留 callbackUrl） |
| `/auth/*` | 已登录自动跳转首页 |

### 类型扩展

```typescript
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT { role?: string; id?: string; }
}
```

## API 端点速查

| 方法 | 端点 | 权限 | 说明 |
|---|---|---|---|
| `POST` | `/api/auth/[...nextauth]` | 公开 | NextAuth 登录处理 |
| `POST` | `/api/register` | 公开 | 用户注册 |
| `GET` | `/api/products` | 公开 | 商品列表（分页+筛选+搜索） |
| `GET/POST/PUT/DELETE` | `/api/products/[id]` | 公开/Admin | 商品 CRUD |
| `GET` | `/api/products/search?q=` | 公开 | 模糊搜索 |
| `GET/POST` | `/api/categories` | 公开/Admin | 分类列表/创建 |
| `GET/PUT/DELETE` | `/api/categories/[id]` | 公开/Admin | 分类 CRUD |
| `GET/POST` | `/api/cart` | 用户 | 获取/添加购物车 |
| `PUT/DELETE` | `/api/cart/items/[id]` | 用户 | 修改数量/删除 |
| `GET/POST` | `/api/orders` | 用户 | 订单列表/创建 |
| `GET/PUT` | `/api/orders/[id]` | 用户/Admin | 订单详情/状态更新 |

### 下单流程（Server Action）

```
placeOrder(shippingAddress) →
  1. auth() 校验登录
  2. 查询购物车（含商品详情）
  3. 校验库存 → 不足则抛出错误
  4. Prisma 事务:
     - 创建 Order + OrderItems（price 为下单快照）
     - Product.stock 扣减
     - 清空 CartItem
  5. revalidatePath("/orders")
  6. redirect("/orders/" + orderId)
```

## 关键技术决策

1. **价格用 Float 而非 Decimal**：学习项目不需要 Decimal 精度，Prisma + SQLite 的 Decimal 会转字符串，增加序列化复杂度
2. **购物车需登录，无访客购物车**：避免 localStorage 同步/合并逻辑，保持数据模型简洁
3. **API Routes + Server Actions 混用**：
   - 管理端 CRUD → API Routes（RESTful，便于外部调用）
   - 购物车/下单 → Server Actions（减少样板代码，自动 revalidate）
4. **Tailwind v4 无 tailwind.config.ts**：用 CSS `@theme` 指令配置，全局样式在 `globals.css`
5. **不引入 Zustand/React Query**：Auth 用 NextAuth 内置 `useSession`，购物车按需查数据库
6. **JSON String 存储 images**：SQLite 不支持 JSON 列，存文本序列化后在 service 层解析

## 实现进度

| 阶段 | 状态 | 关键交付 |
|---|---|---|
| 1. 项目脚手架 | ✅ 已完成 | 目录结构、Prisma Schema、种子数据、配置文件 |
| 2. 认证系统 | ⏳ 待开始 | NextAuth 配置、middleware、登录/注册页面 |
| 3. 商品浏览 | ⏳ 待开始 | 列表/详情页、搜索、分类筛选 |
| 4. 购物车 | ⏳ 待开始 | Server Actions、Cart 页面、数量控制 |
| 5. 下单流程 | ⏳ 待开始 | 下单 Action、订单页面、库存扣减 |
| 6. 后台管理 | ⏳ 待开始 | Admin 布局、Dashboard、商品/订单/分类 CRUD |
| 7. 打磨 | ⏳ 待开始 | 错误边界、loading、404、空状态、SEO |

## 代码规范

### 组件编写

```typescript
// Server Component —— 直接用 Prisma
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page } = await searchParams;
  const products = await prisma.product.findMany({ /* ... */ });
  return (/* JSX */);
}

// Client Component —— 需加 "use client"
"use client";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  // ... fetch + 交互逻辑
}
```

### 数据库访问

```typescript
// 任何地方需要数据库都从这里导入，不要直接 new PrismaClient()
import { prisma } from "@/lib/prisma";
```

### 样式处理

```typescript
import { cn } from "@/lib/utils";

// 使用 cn() 合并类名
<div className={cn("base-class", isActive && "active-class")} />
```

### 文件命名

- 页面：`page.tsx`（全小写，Next.js 约定）
- 组件：`PascalCase.tsx`
- 工具函数：`camelCase.ts`
- 类型定义：`kebab-case.d.ts`（如 `next-auth.d.ts`）

## 验证流程

每次完成一个阶段后执行：

```sh
npm run dev          # 确认无报错启动
npx prisma studio    # 确认数据库数据正确
npm run build        # 确认 TypeScript 编译通过
```

- 保护路由未登录 → 自动跳转 `/auth/login?callbackUrl=原路径`
- 非 Admin 访问 `/admin/*` → 跳转登录页
- Cart/Order 变更后列表页数据刷新一致

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
