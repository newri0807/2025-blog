## 1. 프로젝트 구조

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── comments/
│   │   │   └── route.ts
│   │   └── likes/
│   │       └── route.ts
│   ├── posts/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── edit/
│   │       └── [id]/page.tsx
├── components/
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── post-card.tsx
│   ├── post-form.tsx
│   ├── comment-section.tsx
│   └── like-button.tsx
├── lib/
│   ├── db.ts
│   ├── schema.ts
│   └── utils.ts
```

### Neon = 데이터베이스 (텍스트 데이터)

### Vercel Blob = 파일 스토리지 (이미지 파일)
