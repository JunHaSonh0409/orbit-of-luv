# 🚀 Linktree Orbit 배포 및 Supabase 연동 가이드

Linktree Orbit은 **Next.js (App Router)**, **Supabase (인증 & PostgreSQL & RLS)**, **Vercel** 배포에 완벽히 최적화되어 있습니다.

---

## 1. Supabase 프로젝트 설정 (5분 소요)

1. [Supabase](https://supabase.com)에 로그인 후 새 프로젝트(`New Project`)를 생성합니다.
2. 프로젝트 대시보드 좌측 메뉴의 **SQL Editor**로 이동합니다.
3. 프로젝트의 `supabase/schema.sql` 파일 내용을 전체 복사하여 SQL Editor에 붙여넣고 **Run** 버튼을 클릭합니다.
   - `profiles`, `links`, `analytics_pageviews`, `analytics_clicks` 테이블 생성
   - Row Level Security (RLS) 보안 정책 자동 활성화
   - 신규 가입 시 프로필 자동 생성 트리거(`handle_new_user`) 등록
   - 클릭수 집계 RPC(`track_link_click`) 생성
4. 프로젝트 대시보드의 **Project Settings > API**로 이동하여 다음 2가지 키를 복사합니다:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Authentication > URL Configuration**에서:
   - Site URL: `https://your-vercel-domain.vercel.app` (로컬 테스트 시 `http://localhost:3000`)
   - Redirect URLs에 추가:
     - `https://your-vercel-domain.vercel.app/api/auth/callback`
     - `http://localhost:3000/api/auth/callback`

---

## 2. Vercel 배포 (1분 소요)

1. 코드를 GitHub / GitLab 저장소에 푸시합니다.
2. [Vercel](https://vercel.com) 대시보드에서 **Add New... > Project**를 선택하고 저장소를 임포트합니다.
3. **Environment Variables** 섹션에 아래 변수들을 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL` : 위에서 복사한 Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : 위에서 복사한 Supabase anon key
   - `NEXT_PUBLIC_APP_URL` : 생성될 Vercel 도메인 (예: `https://my-linktree.vercel.app`)
   - `ADMIN_PASSCODE` : `/admin` 진입용 마스터 패스코드 (**필수** — 기본값이 없어 설정 전에는 관리자 로그인이 비활성화됩니다)
   - `ADMIN_SESSION_SECRET` : (선택) 관리자 세션 쿠키 서명 키. 없으면 `ADMIN_PASSCODE`로 서명합니다
4. **Deploy** 버튼을 누르면 즉시 빌드 및 글로벌 배포가 완료됩니다!

---

## 3. 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# .env.local 파일에 Supabase URL 및 ANON KEY 입력 후:
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속!
