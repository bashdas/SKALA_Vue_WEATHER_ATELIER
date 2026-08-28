# Weather Atelier 프로젝트 설계

## 1. 목표와 완료 기준

PDF의 단원별 산출물을 별도 데모로 흩어 놓지 않고 하나의 완성된 날씨 앱으로 통합한다. 최종 앱에서 Vue 기본 문법, Composition API, 컴포넌트 통신, Router, Pinia, Axios, 외부 UI 라이브러리, 실제 API, 품질 검사와 정적 배포 준비가 모두 코드로 확인되어야 한다.

완료의 기준은 다음과 같다.

1. 핵심 사용자 흐름(도시 검색 → 카드 선택 → 상세/예보 확인 → 즐겨찾기 → 단위 전환)이 끊기지 않는다.
2. 로딩, 빈 결과, API 오류, 잘못된 URL도 각각 명시적인 화면을 가진다.
3. 마우스, 키보드, 모바일에서 주요 기능을 사용할 수 있다.
4. `npm run lint`와 `npm run build`가 오류 없이 끝난다.
5. 아래 최종 검수 체크리스트의 코드 항목과 수동 검증 항목이 모두 통과한다.

## 2. 기능 범위

### 메인 대시보드 `/`

- 기본 한국 도시 목록을 `v-for`와 `:key="city.id"`로 렌더링한다.
- `:value`와 `@input`으로 한글 검색 조합 중에도 안정적으로 검색어를 갱신한다.
- `computed`로 도시명 포함 검색을 수행하고 원본/결과/빈 결과 상태를 나눈다.
- 섭씨 25도 기준으로 더움/선선함 라벨을 `v-if/v-else`로 표시한다.
- 카드 선택 시 상태 바에 `“{도시}이(가) 선택되었습니다.”`를 표시한다.
- 카드 내부 버튼에는 `.stop`을 사용하여 카드 선택 이벤트와 분리한다.
- 상세보기는 최종 요구에 맞춰 `router.push({ name: 'weather-detail', params: { cityId } })`로 이동한다.
- 검색어는 `watchEffect`, 선택 도시는 `watch`로 추적해 개발 콘솔에서 확인 가능하게 한다.

### 상세 날씨 `/weather/:cityId`

- 동적 `cityId`로 도시를 조회하고 현재 날씨, 체감 온도, 습도, 풍속, 강수 정보와 5일 예보를 보여준다.
- 유효하지 않은 도시 ID는 안내 후 홈으로 이동할 수 있게 한다.
- 단위 전환 결과를 메인과 상세에 동일하게 적용한다.
- API 재시도와 홈 복귀 동작을 제공한다.

### 소개 `/about`

- 앱의 목적, 데이터 출처, 기술 스택, 개인 커스터마이징을 설명한다.
- 메인 대시보드로 돌아가는 링크를 제공한다.

### 즐겨찾기 `/favorites` (개인 추가 View)

- 즐겨찾기 도시를 모아 보고 비어 있을 때 안내한다.
- Pinia 상태를 사용하므로 새로고침 후에도 `localStorage`에서 복원한다.

### Not Found

- `/:pathMatch(.*)*` catch-all route로 처리한다.
- 요청 경로를 보여 주고 홈 이동 버튼을 제공한다.

## 3. 개인 커스터마이징

### 카드 빠른 작업 메뉴와 키보드

날씨 카드의 `contextmenu` 이벤트를 `@contextmenu.prevent`로 처리해 PrimeVue `ContextMenu`를 연다. 메뉴에는 상세보기, 즐겨찾기 추가/해제, 단위 전환을 둔다. 브라우저 기본 우클릭을 페이지 전체에서 차단하지 않고 카드에서만 차단한다.

키보드 동등 동작을 반드시 제공한다.

| 입력 | 동작 | 적용 범위 |
|---|---|---|
| 마우스 오른쪽 버튼 | 카드 빠른 작업 메뉴 열기 | 포커스/포인터 대상 카드 |
| `Shift + F10` 또는 메뉴 키 | 같은 빠른 작업 메뉴 열기 | 포커스된 카드 |
| `/` | 도시 검색창 포커스 | 입력 필드 밖에서만 |
| `F` | 선택 도시 즐겨찾기 토글 | 입력 필드 밖에서만 |
| `Esc` | 열린 메뉴/대화상자 닫기 | 전역 |
| `Enter` / `Space` | 카드 선택 또는 포커스된 버튼 실행 | 카드/버튼 |

단축키 핸들러는 `onMounted`에서 등록하고 `onUnmounted`에서 제거한다. `input`, `textarea`, `select`, 콘텐츠 편집 영역에서는 `/`와 `F`를 가로채지 않는다. 동작 결과는 토스트와 `aria-live` 상태 바로 알린다.

### 추가 반응형 기능

- `selectedCityId`, `favoriteCityIds`, `recentCityIds`를 추가 상태로 둔다.
- 즐겨찾기 수와 최근 조회 목록을 getter/computed로 제공한다.
- 즐겨찾기 변경을 `watch`하여 로컬 저장소에 보존한다.

## 4. 기술 설계

### 데이터 흐름

```text
SearchBar --update-query--> HomeView --store action--> weatherStore
                                      |                    |
                                      |                 Axios/API
                                      v                    |
WeatherCard <--props/computed-- filtered cities <----------+
     | select-card / click-detail / toggle-favorite
     +-----------------------------> HomeView / Router / Store

configStore(unit) ---> useTemperature composable ---> Home + Detail
```

### Store

`configStore`:

- state: `unit: 'celsius' | 'fahrenheit'`
- getter: `unitSymbol`
- action: `toggleUnit`, `setUnit`

`weatherStore` (개인 추가 Store):

- state: 도시 목록, 선택 도시 ID, 즐겨찾기 ID, 최근 조회 ID, 요청 상태, 오류
- getters: 선택 도시, 즐겨찾기 도시, 즐겨찾기 수
- actions: 현재 날씨/예보 요청, 선택, 즐겨찾기 토글, 최근 조회 기록, 재시도

### API 계층

- `services/http.js`: Axios 인스턴스, timeout, 공통 오류 정규화
- `services/openWeatherApi.js`: OpenWeatherMap Current Weather와 5 Day / 3 Hour Forecast
- `services/geocodingApi.js`: Open-Meteo Geocoding으로 한글/영문 도시 후보 조회
- `mappers/weatherMapper.js`: 외부 응답을 앱 내부 `CityWeather` 형태로 변환

API 키는 `import.meta.env.VITE_OPENWEATHER_API_KEY`에서만 읽는다. `.env.local`은 `.gitignore`에 포함하고 `.env.example`에는 빈 예시만 둔다. 키가 없으면 설정 안내 화면을 보여 주며 앱 자체가 흰 화면으로 끝나지 않게 한다.

### UI 라이브러리 원칙

UI 프레임워크는 PrimeVue 하나만 사용한다. 적용 후보는 `Button`, `InputText`, `Skeleton`, `Toast`, `ContextMenu`, `Message`, `SelectButton`이다. 기존 카드 레이아웃과 반응형 그리드는 프로젝트 CSS로 유지하여 라이브러리 활용과 개인 디자인을 모두 확인할 수 있게 한다. 아이콘은 연동 패키지 `primeicons`만 사용한다.

### 라우트

| 이름 | 경로 | View | 로딩 |
|---|---|---|---|
| home | `/` | `WeatherHomeView.vue` | lazy |
| detail | `/weather/:cityId` | `WeatherDetailView.vue` | lazy |
| favorites | `/favorites` | `WeatherFavoritesView.vue` | lazy |
| about | `/about` | `WeatherAboutView.vue` | lazy |
| not-found | `/:pathMatch(.*)*` | `NotFoundView.vue` | lazy |

모든 View는 동적 import를 사용한다. App에는 `RouterLink`, `RouterView`, 내비게이션 옆 `UnitToggler`를 둔다.

### 컴포넌트 구조

```text
src/
├── components/
│   ├── common/BaseDashboardCard.vue
│   ├── layout/AppNavigation.vue
│   └── weather/
│       ├── DashboardHeader.vue
│       ├── SearchBar.vue
│       ├── UnitToggler.vue
│       ├── WeatherCard.vue
│       ├── WeatherCardContextMenu.vue
│       ├── WeatherForecast.vue
│       └── WeatherGrid.vue
├── composables/
│   ├── useKeyboardShortcuts.js
│   └── useTemperature.js
├── data/cities.js
├── mappers/weatherMapper.js
├── router/index.js
├── services/
│   ├── geocodingApi.js
│   ├── http.js
│   └── openWeatherApi.js
├── stores/
│   ├── configStore.js
│   └── weatherStore.js
└── views/
    ├── WeatherHomeView.vue
    ├── WeatherDetailView.vue
    ├── WeatherFavoritesView.vue
    ├── WeatherAboutView.vue
    └── NotFoundView.vue
```

`BaseDashboardCard`는 slot으로 검색/날씨 내용을 받는다. `SearchBar`는 `modelValue` prop과 `update:modelValue`(요구 문서 용어와 연결되는 별칭 `update-query`도 명시적으로 emit 가능)를 사용한다. `WeatherCard`는 도시 객체를 prop으로 받고 `select-card`, `click-detail`, `toggle-favorite`, `open-context-menu`를 emit한다. 컴포넌트별 디자인은 각 SFC의 `<style scoped>`에 두고 전역 토큰/리셋만 `src/style.css`에 둔다.

## 5. 상태별 UX와 접근성

- 최초/재요청 로딩: Skeleton 카드
- 검색 결과 없음: 검색어를 포함한 빈 상태와 초기화 버튼
- API 오류: 이해하기 쉬운 메시지, 재시도 버튼, 개발용 상세 로그
- 오프라인/키 없음: 설정 안내와 Mock fallback 여부를 명확히 표시
- 모든 버튼에 텍스트 또는 `aria-label` 제공
- 상태 변경은 `aria-live="polite"`, 오류는 `role="alert"`
- 카드에는 명확한 focus ring을 제공하고 색상만으로 선택/고온 상태를 구분하지 않음
- 모바일에서는 우클릭 대신 카드 내 `더보기` 버튼으로 같은 메뉴에 접근

## 6. 구현 순서

1. 의존성(Vue Router, Pinia, Axios, PrimeVue, ESLint)과 환경 변수/공통 스타일 기반을 설정한다.
2. Mock 데이터를 별도 모듈로 옮기고 Router/View 구조로 전환한다.
3. `configStore`, `weatherStore`, 온도 변환 composable을 구현한다.
4. 기존 컴포넌트를 재배치하며 props/emits/slot 및 이벤트 수식어 요구를 보존한다.
5. Axios 서비스, OpenWeatherMap 현재 날씨/예보, Open-Meteo 도시 검색을 연결한다.
6. 상세/즐겨찾기/소개/404 View를 완성한다.
7. PrimeVue 컴포넌트, 우클릭 메뉴, 단축키, 모바일 대체 UI와 접근성을 적용한다.
8. README에 실제 구현된 커스터마이징과 라이브러리/API 사용 범위를 갱신한다.
9. lint/build와 브라우저 수동 시나리오를 검증한 뒤 정적 호스팅 설정을 확인한다.

## 7. 최종 검수 체크리스트

검수일: 2026-08-27. `[x]`는 로컬 코드/브라우저 검증 완료, `[ ]`는 외부 API 활성화 또는 실제 배포가 필요한 항목이다.

### 제출과 문서

- [ ] GitHub Public 저장소를 시크릿 창에서 로그인 없이 볼 수 있다.
- [ ] 배포 URL이 있으며 직접 URL 접근/새로고침도 정상이다.
- [x] README에 개인 커스터마이징 내역이 기록되어 있다.
- [x] README에 우클릭 이벤트와 모든 키보드 단축키가 강조되어 있다.
- [x] README에 PrimeVue/PrimeIcons 및 다른 외부 라이브러리의 용도가 정확히 적혀 있다.
- [x] README에 사용 API, 환경 변수 설정, 실행/빌드 방법이 적혀 있다.

### Vue 기본 문법과 Composition API

- [x] `weatherList`, `searchQuery`, `selectedCityInfo`가 반응형 상태다.
- [x] `v-for`로 날씨 카드를 반복하며 `:key`에 고유 `id`를 바인딩한다.
- [x] `v-if/v-else`로 온도 조건 라벨을 표시한다.
- [x] 한글 입력은 `:value`와 `@input`으로 부모 상태에 반영되고 입력값을 화면에 출력한다.
- [x] 카드 클릭 시 선택 상태 바가 갱신된다.
- [x] 내부 동작 버튼은 `.stop`으로 카드 클릭 버블링을 막는다.
- [x] 검색은 `computed(filteredWeatherList)`로 처리한다.
- [x] 빈 검색어/일치 결과/불일치 결과의 세 상태가 모두 올바르다.
- [x] `watch(selectedCityInfo)`와 `watchEffect(searchQuery)`를 확인할 수 있다.
- [x] 개인 추가 state/computed/watcher(즐겨찾기·최근 도시)가 실제 UI에서 쓰인다.

### 컴포넌트

- [x] 부모 View가 주요 반응형 데이터와 오케스트레이션을 담당한다.
- [x] `BaseDashboardCard`가 slot으로 검색/카드 콘텐츠를 받는다.
- [x] `SearchBar`가 props와 update 이벤트로 부모와 통신한다.
- [x] `WeatherCard`가 도시 props와 선택/상세 emits로 부모와 통신한다.
- [x] 컴포넌트별 스타일이 `<style scoped>`로 분리되어 있다.
- [x] 추가 컴포넌트(UnitToggler, ContextMenu, Forecast 등)가 의미 있게 분리되어 있다.

### Router

- [x] 모든 View route가 lazy loading을 사용한다.
- [x] App에 RouterLink 내비게이션과 RouterView가 있다.
- [x] 상세 버튼이 alert가 아니라 programmatic navigation을 사용한다.
- [x] `/weather/:cityId`가 route param으로 올바른 도시를 표시한다.
- [x] About View와 홈 복귀 링크가 있다.
- [x] 개인 추가 Favorites View가 라우팅된다.
- [x] catch-all route와 NotFound View가 동작한다.

### Pinia

- [x] `configStore`에 `unit`, `unitSymbol`, `toggleUnit`이 있다.
- [x] UnitToggler가 내비게이션 옆에 있다.
- [x] 섭씨/화씨 변경이 메인과 상세 화면에 동시에 적용된다.
- [x] 개인 추가 weatherStore의 state/getter/action이 실제 기능에 쓰인다.
- [x] 즐겨찾기/단위가 새로고침 후 복원된다.

### Axios와 외부 API

- [x] Axios가 설치되고 공통 인스턴스를 사용한다.
- [ ] OpenWeatherMap 실제 현재 날씨가 화면에 표시된다. (현재 제공 키가 API에서 401 응답)
- [ ] OpenWeatherMap 추가 API인 5일 예보가 상세 화면에 표시된다. (현재 제공 키가 API에서 401 응답)
- [x] Open-Meteo Geocoding 외부 API가 도시 검색 확장에 쓰인다.
- [x] 로딩/빈 결과/오류/재시도 상태가 모두 구현되어 있다.
- [x] API 응답을 mapper에서 내부 데이터 형태로 정규화한다.
- [x] API 키는 환경 변수이며 Git 추적 대상이 아니다.

### UI, 이벤트와 접근성

- [x] PrimeVue 컴포넌트가 단순 설치가 아니라 실제 UI에 적용되어 있다.
- [x] 날씨 카드 우클릭 시 빠른 작업 메뉴가 열리고 기본 메뉴는 카드에서만 방지된다.
- [x] `Shift + F10`/메뉴 키로 동일 메뉴를 열 수 있다.
- [x] `/`, `F`, `Esc`, `Enter`/`Space` 단축키가 README 설명대로 동작한다.
- [x] 입력 중 단축키가 한글/영문 입력을 가로채지 않는다.
- [x] 모바일 더보기 버튼으로 우클릭 메뉴와 같은 기능을 쓸 수 있다.
- [x] focus 표시, aria label/live, 색상 외 구분 수단이 있다.
- [x] 데스크톱/태블릿/모바일 레이아웃에 잘림이나 가로 스크롤이 없다.

### 코드 품질과 배포

- [x] 사용하지 않는 기본 Vite 파일/컴포넌트를 정리했다.
- [x] 콘솔에 의도하지 않은 오류/경고가 없다.
- [x] `npm run lint`가 오류 없이 통과한다.
- [x] `npm run build`가 오류 없이 통과한다.
- [x] `.env.example`은 제공하고 실제 `.env.local`은 제외한다.
- [ ] 배포 환경에도 API 키가 안전하게 설정되어 있다.
- [ ] 배포본에서 홈, 상세 직접 접근, 404, API 요청, 단축키를 재검증했다.
