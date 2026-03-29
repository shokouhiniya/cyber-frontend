---
inclusion: auto
---

# قوانین پروژه فرانت‌اند (minimal-starter)

## ساختار کلی

این پروژه بر پایه **Minimal UI Kit v7** با **Next.js 15 App Router** ساخته شده.
به ساختار اصلی فریمورک (layouts, components, theme, auth, locales, routes) دست نزن.
فقط sections و view ها و api layer قابل تغییرن.

## قوانین حیاتی

### صفحات (`src/app/*`)
- فایل‌های page.jsx فقط metadata و import از sections/view دارن
- هیچ لاجیک، استایل، یا کامپوننتی مستقیم توی page نباشه
- هر صفحه داشبورد مسیر جدا داره: `/dashboard`, `/dashboard/posts`, `/dashboard/analytics`, ...

### View ها (`src/sections/cyberspace/view/`)
- هر view توی فولدر جدا: `view/overview/`, `view/posts/`, `view/analytics/`, ...
- view فایل اولین المان JSX اش `<DashboardContent>` از `src/layouts/dashboard` باشه
- view مسئول data fetching با react-query هست
- view از section کامپوننت‌ها import می‌گیره

### Section کامپوننت‌ها (`src/sections/cyberspace/`)
- هر صفحه فولدر جدا داره: `overview/`, `posts/`, `analytics/`, `recommendations/`, `reports/`, `profile/`
- کامپوننت‌های مربوط به هر صفحه توی فولدر همون صفحه باشن
- کامپوننت‌ها باید خرد و تمیز باشن، نه یه فایل بزرگ با همه چیز توش
- اگه کامپوننتی خیلی عمومیه → `src/components/` منتقلش کن

### API Layer (`src/api/dashboard.js`)
- همه درخواست‌ها با **react-query** (`useQuery`, `useMutation`) باشن
- axios instance از `src/lib/axios` استفاده بشه
- endpoints توی `src/lib/axios.js` تعریف بشن

### Axios (`src/lib/axios.js`)
- بک‌اند response رو توی `{ meta, data }` wrap می‌کنه (ResponseInterceptor)
- interceptor فرانت `response.data.data` رو extract می‌کنه
- error message از `error.response.data.error.message` میاد

### Layout
- به `DashboardLayout` دست نزن
- Bottom navigation توی `src/layouts/dashboard/bottom-nav.jsx` هست
- هدر همیشه sticky هست با backdrop blur (disableOffset + disableElevation)
- nav config توی `src/layouts/nav-config-dashboard.jsx`

### Auth
- `auth.skip = false` → لاگین فعاله
- JWT auth با `src/auth/context/jwt/`
- یوزر پیش‌فرض: `admin@cyberspace.ir` / `Admin@123`
- صفحات لاگین و ثبت‌نام فارسی هستن

### فیلد‌های Entity (camelCase)
وقتی دیتا از بک‌اند میاد فیلدها camelCase هستن:
- `screenName` (نه `screen_name`)
- `likeCount` (نه `like_count`)
- `viewCount`, `retweetCount`, `publishedAt`, `userFollowers`, `emotion`
- هرگز از `post.Emotion?.label` یا `post['user.followers']` استفاده نکن

### زبان
- UI فارسی هست
- validation message ها فارسی
- metadata صفحات فارسی

### استایل
- از MUI sx prop استفاده کن
- از `alpha()` برای رنگ‌های شفاف
- از `Iconify` برای آیکون‌ها (solar icon set)
- تم dark/light ساپورت بشه
