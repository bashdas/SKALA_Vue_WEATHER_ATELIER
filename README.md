# Weather Atelier

Vue 3로 만드는 지역별 실시간 날씨 대시보드입니다. 도시 검색, 현재 날씨와 예보, 즐겨찾기, 온도 단위 전환, 상세 페이지를 한 앱에서 제공합니다.

> [!IMPORTANT]
> **특별 이벤트 기능:** 날씨 카드를 **마우스 오른쪽 버튼으로 클릭**하거나 카드에 포커스를 둔 뒤 **`Shift + F10` / 메뉴 키**를 누르면 빠른 작업 메뉴가 열립니다. `/`는 검색창 포커스, `F`는 선택 도시 즐겨찾기, `Esc`는 열린 메뉴/대화상자 닫기입니다. 브라우저 기본 메뉴는 날씨 카드 영역에서만 막습니다.

> [!NOTE]
> **UI 라이브러리:** 이 프로젝트는 **PrimeVue 한 종류만** 사용합니다. `primeicons`는 PrimeVue용 아이콘 패키지이며 별도 UI 프레임워크로 혼용하지 않습니다. 구체적인 적용 컴포넌트와 선택 이유는 [프로젝트 설계](docs/PROJECT_DESIGN.md)를 참고하세요.

## 기술 스택

- Vue 3 + Vite
- Vue Router (지연 로딩, 동적 경로, catch-all)
- Pinia (온도 단위, 즐겨찾기/최근 도시)
- Axios (API 인스턴스와 오류 처리)
- PrimeVue 4 + PrimeIcons
- OpenWeatherMap Current Weather / 5 Day Forecast
- Open-Meteo Geocoding API
- ESLint

## 구현하면서 고민한 점

### 1. 단원별 실습을 별도 화면으로 둘 것인가, 하나의 앱으로 합칠 것인가

과제 문서에는 Vue 기본 문법, Composition API, 컴포넌트, Router, Pinia, Axios가 단원별로 나뉘어 있습니다. 각 단원의 예제를 그대로 복사하면 요구사항 확인은 쉽지만, 같은 날씨 화면과 상태가 여러 파일에 중복되고 최종 결과물이 하나의 앱처럼 보이지 않는 문제가 있었습니다.

그래서 최종 구조는 하나의 사용자 흐름으로 통합했습니다.

```text
도시 검색 → 카드 선택 → 상세 페이지 → 5일 예보
                    └→ 즐겨찾기 → 단위 전환
```

- 기본 문법과 Composition API는 메인 대시보드에서 확인할 수 있게 했습니다.
- Router 요구는 상세·즐겨찾기·소개·404 페이지로 연결했습니다.
- 메인과 상세에서 공유하는 단위와 도시 데이터는 Pinia로 이동했습니다.
- API 호출과 응답 변환은 View에서 분리해 `services`, `mappers` 계층으로 구성했습니다.

기능을 추가할 때마다 화면 컴포넌트가 API 응답 구조에 직접 의존하지 않도록 하는 것을 가장 중요하게 생각했습니다.

### 2. 한글 검색에 `v-model` 대신 `:value`와 `@input`을 사용한 이유

과제에서 한글 입력 처리 과정을 직접 확인할 수 있도록 `:value`와 `@input` 사용을 요구했습니다. 따라서 단순히 `v-model`만 붙이지 않고 `SearchBar`에서 입력값을 받아 부모에게 명시적으로 전달했습니다.

```vue
<InputText
  :value="modelValue"
  @input="update($event.target.value)"
/>
```

`SearchBar`는 `update:modelValue`와 과제에서 요구한 의미가 드러나는 `update-query` 이벤트를 함께 발생시킵니다. 검색 필터링은 부모의 `computed(filteredWeatherList)`가 담당합니다. 덕분에 입력 컴포넌트, 검색 규칙, 데이터 상태의 역할이 분리되고 한글 조합 입력 결과도 부모 화면에 즉시 표시됩니다.

### 3. 카드 클릭과 내부 버튼의 이벤트 버블링

날씨 카드를 누르면 도시가 선택되어야 하지만, 카드 안의 즐겨찾기·상세보기 버튼을 눌렀을 때까지 카드 선택 이벤트가 같이 발생하는 문제가 있었습니다. DOM 이벤트가 자식 버튼에서 카드로 버블링하기 때문입니다.

버튼에는 Vue 이벤트 수식어인 `.stop`을 적용했습니다.

```vue
<Button @click.stop="emit('toggle-favorite', city.id)" />
<Button @click.stop="emit('click-detail', city)" />
```

카드 선택과 버튼 동작을 분리하면서 과제의 이벤트 수식어 요구도 코드에서 명확히 확인할 수 있게 했습니다.

### 4. `window.alert` 요구와 Router 상세 페이지 요구가 충돌한 문제

초기 단원에서는 상세보기 버튼으로 `window.alert()`를 띄우도록 되어 있지만, Router 단원에서는 alert를 제거하고 `/weather/:cityId`로 이동하도록 요구합니다. 두 동작을 동시에 남기면 최종 앱에서 상세 버튼의 의미가 불분명해집니다.

최종 결과물은 뒤 단원의 요구가 앞 단원을 확장한다고 판단해 programmatic navigation을 선택했습니다.

```js
router.push({
  name: 'weather-detail',
  params: { cityId: city.id },
})
```

동적 경로로 이동한 뒤 `cityId`로 도시를 다시 찾고 예보 API를 요청합니다. 초기 alert 실습의 목적이었던 “자식 버튼 이벤트를 부모로 전달하기”는 `click-detail` emit으로 그대로 보존했습니다.

### 5. 우클릭 기능만 만들면 키보드와 모바일 사용자는 쓸 수 없는 문제

개인 커스터마이징으로 카드 우클릭 빠른 메뉴를 추가했지만, `contextmenu` 이벤트만 구현하면 마우스를 쓰지 않는 사용자는 기능에 접근할 수 없습니다. 모바일에서는 우클릭 자체가 명확하지 않다는 문제도 있었습니다.

그래서 같은 작업 메뉴로 들어가는 경로를 세 가지로 만들었습니다.

- 데스크톱: 카드 `@contextmenu.prevent`
- 키보드: 카드에 포커스 후 `Shift + F10` 또는 메뉴 키
- 모바일: 카드의 더보기 버튼

브라우저 기본 우클릭은 페이지 전체가 아니라 날씨 카드에서만 방지했습니다. `/`와 `F` 단축키는 사용자가 input에서 한글이나 영문을 입력할 때 가로채지 않도록 입력 요소 여부를 먼저 검사합니다. 전역 이벤트는 `onMounted`에서 등록하고 `onUnmounted`에서 반드시 해제해 화면 이동 후 핸들러가 중복되는 문제도 방지했습니다.

### 6. OpenWeatherMap 요청 실패가 전체 화면 실패로 이어진 문제

API 키가 없거나 아직 활성화되지 않은 경우 OpenWeatherMap이 `401`을 반환합니다. `Promise.all()`만 사용하면 도시 하나의 요청 실패가 전체 요청 실패로 이어져 카드가 모두 사라질 수 있었습니다.

기본 한국 도시 요청에는 `Promise.allSettled()`를 사용했습니다.

- 성공한 도시는 실제 API 응답으로 교체합니다.
- 실패한 도시는 기존 Mock 데이터를 유지합니다.
- 전부 실패해도 흰 화면 대신 Mock 카드와 원인을 안내합니다.
- 일부만 실패하면 성공 데이터와 fallback 데이터를 함께 표시합니다.

Axios 오류는 `readableApiError()`에서 timeout, 네트워크, 401, 404로 나누어 사용자 메시지로 변환했습니다. 현재 제공된 키는 OpenWeatherMap에서 `401`을 반환하고 있어 이 fallback 경로까지 실제 브라우저에서 검증했습니다. 키가 활성화되면 같은 코드에서 자동으로 실시간 모드로 전환됩니다.

### 7. 외부 도시 검색과 날씨 API를 한 요청처럼 묶지 않은 이유

Open-Meteo Geocoding은 API 키 없이 도시 좌표를 찾을 수 있지만, OpenWeatherMap 날씨 요청은 별도 인증이 필요합니다. 처음에는 두 요청 중 하나라도 실패하면 검색 결과를 추가하지 않았습니다. 이 구조에서는 위치 검색이 성공해도 날씨 키 문제 때문에 사용자에게 아무 결과도 보이지 않았습니다.

두 단계를 분리해 다음과 같이 처리했습니다.

1. Open-Meteo에서 도시명과 좌표를 찾습니다.
2. 위치 검색이 성공하면 도시를 목록에 추가할 준비를 합니다.
3. OpenWeatherMap 요청이 성공하면 실시간 날씨를 합칩니다.
4. 날씨 요청만 실패하면 위치는 유지하고 `날씨 연결 대기` 상태를 표시합니다.

실제로 `Tokyo`를 검색해 한글 도시명 `도쿄`와 좌표가 추가되는 것까지 검증했습니다.

### 8. 외부 API 응답을 컴포넌트에서 바로 사용하지 않은 이유

OpenWeatherMap의 원본 응답에는 `main.temp`, `weather[0].description`, `wind.speed`처럼 중첩된 필드가 많습니다. 컴포넌트가 이 구조를 직접 사용하면 Mock 데이터와 API 데이터의 형태가 달라지고, API 변경 시 여러 Vue 파일을 수정해야 합니다.

`weatherMapper.js`에서 API 응답을 앱 내부 도시 모델로 변환했습니다.

```text
OpenWeatherMap response
        ↓ mapper
{ id, name, temp, feelsLike, status, humidity, rain, wind }
        ↓
WeatherCard / DetailView
```

5일/3시간 예보는 하루에 여러 데이터가 내려오기 때문에 날짜별로 정오에 가장 가까운 항목을 선택해 최대 5일만 표시하도록 가공했습니다.

### 9. 섭씨/화씨 변환 코드가 메인과 상세에서 중복될 가능성

단위 설정은 `configStore`의 `unit`, `unitSymbol`, `toggleUnit`으로 관리합니다. 실제 온도 변환은 `useTemperature` composable로 분리해 메인 카드와 상세 대표 온도가 같은 공식을 사용하도록 했습니다.

상세 화면의 체감 온도와 예보 온도도 단위 변경에 반응하도록 별도로 확인했습니다. 원본 데이터는 항상 섭씨로 유지하고 표시할 때만 변환하므로, 버튼을 여러 번 눌러도 변환 오차가 누적되지 않습니다.

### 10. Pinia 상태를 새로고침 후에도 유지하는 방법

Pinia 상태만 사용하면 새로고침 시 온도 단위와 즐겨찾기가 초기화됩니다. 별도의 persistence 플러그인을 추가할 수도 있지만, 과제 규모에서는 의존성을 더 늘리지 않고 `watch`와 `localStorage`를 사용했습니다.

- Store 생성 시 저장된 값을 초기 상태로 읽습니다.
- 즐겨찾기·최근 도시·단위가 바뀔 때 JSON 또는 문자열로 저장합니다.
- 즐겨찾기 ID를 실제 도시 객체로 바꾸는 작업은 getter/computed가 담당합니다.

저장소에는 API 키나 API 응답 전체를 넣지 않고 사용자 설정에 필요한 최소 ID만 저장했습니다.

### 11. 여러 UI 라이브러리를 섞지 않기로 한 이유

UI 라이브러리를 여러 개 사용하면 버튼, focus ring, 색상 토큰, 번들 크기가 서로 달라질 수 있습니다. 따라서 PrimeVue 한 종류만 사용하고 카드 레이아웃과 반응형 그리드는 직접 CSS로 작성했습니다.

처음 설치 당시 최신 PrimeVue 5에서 화면에 라이선스 안내 배지가 표시되는 문제를 시각 검수 중 발견했습니다. 과제 결과물에 배지가 남지 않도록 PrimeVue를 `4.4.1`, 테마 패키지를 `1.2.3`으로 고정한 뒤 다시 빌드하고 브라우저 화면에서 배지가 사라진 것을 확인했습니다.

PrimeVue는 ContextMenu, Toast, Button, InputText, Skeleton, Message에 실제로 사용하고 있습니다. `primeicons`는 PrimeVue 연동 아이콘 패키지이며 별도의 UI 프레임워크로 보지 않았습니다.

### 12. 환경 변수와 Vite의 빌드 시점 주의사항

Vite의 `VITE_` 접두사가 붙은 값은 브라우저 번들에서 읽을 수 있으므로 완전한 서버 비밀값은 아닙니다. 이번 과제는 정적 프런트엔드에서 OpenWeatherMap을 호출하는 구조이므로 다음 원칙을 적용했습니다.

- 실제 값은 `.env.local`에만 저장합니다.
- `.gitignore`의 `*.local` 규칙으로 Git 추적을 막습니다.
- `.env.example`에는 변수명만 제공합니다.
- README, 코드, 오류 로그에 실제 키를 기록하지 않습니다.
- Vercel 배포 시 프로젝트 환경 변수에 별도로 등록해야 합니다.

상용 서비스라면 서버리스 함수에서 API를 대신 호출해 키를 서버에만 보관하고 사용량 제한도 적용하는 구조가 더 안전하다고 판단했습니다.

### 13. Vercel 배포 시 동적 경로 새로고침 문제

Vue Router의 history 모드에서는 앱 내부 링크 이동은 정상이어도 `/weather/seoul`을 주소창에서 직접 열거나 새로고침하면 정적 호스팅 서버가 해당 파일을 찾지 못해 404를 반환할 수 있습니다. Vercel 배포 시 모든 앱 경로를 `index.html`로 돌리는 rewrite 설정이 필요합니다.

배포 후에는 홈 화면만 확인하지 않고 다음 주소와 기능을 다시 검증해야 합니다.

- `/`
- `/weather/seoul` 직접 접근과 새로고침
- `/favorites`, `/about`
- 존재하지 않는 경로의 Vue 404 화면
- Vercel 환경 변수 적용 후 실제 API 요청

## 검증 과정에서 실제로 발견하고 수정한 문제

| 발견한 문제 | 원인 | 해결 및 확인 |
|---|---|---|
| 상세 버튼 클릭 시 카드 클릭도 실행될 가능성 | DOM 이벤트 버블링 | 내부 버튼에 `.stop` 적용 |
| API 한 건 실패가 전체 도시 로딩 실패로 연결 | `Promise.all` 형태의 일괄 실패 | `Promise.allSettled`와 도시별 fallback 적용 |
| API 키 401에서 화면을 사용할 수 없음 | 실데이터만 전제로 한 렌더링 | Mock 데이터 유지와 경고 Message 추가 |
| 위치 검색 성공 후 날씨 인증 실패 시 결과 소실 | 지오코딩과 날씨 요청을 하나의 실패 단위로 처리 | 요청 단계를 분리하고 위치 결과 유지 |
| 우클릭 기능을 키보드·모바일에서 사용할 수 없음 | 포인터 이벤트만 고려 | `Shift+F10`, 메뉴 키, 더보기 버튼 추가 |
| 전역 단축키가 검색 입력을 방해할 가능성 | 입력 요소 구분 없는 keydown | input/textarea/select/contenteditable 예외 처리 |
| 최신 PrimeVue에서 라이선스 배지 노출 | PrimeVue 5 패키지 정책 | PrimeVue 4.4.1로 고정하고 화면 재검수 |
| 화씨 전환이 대표 온도에만 적용될 가능성 | 화면별 변환 로직 분산 | 체감·예보까지 동일 Store 상태로 변환 |
| ESLint 오류는 없지만 템플릿 형식 경고가 다수 발생 | 프로젝트 포맷과 기본 Vue 규칙 차이 | 팀 포맷에 불필요한 형식 규칙을 명시적으로 조정해 경고 0개 확인 |

## 다음 단계에서 개선하고 싶은 점

- OpenWeatherMap 키가 정상화되면 실시간 현재 날씨와 5일 예보를 배포 환경에서 다시 검증합니다.
- API 키 보호가 중요한 운영 환경이라면 Vercel Serverless Function을 프록시로 추가합니다.
- Vitest와 Vue Test Utils를 추가해 Store, mapper, 온도 변환을 자동 테스트합니다.
- Playwright E2E 테스트로 검색, 즐겨찾기, 단위 전환, 상세 이동, 우클릭 메뉴를 회귀 테스트합니다.
- 즐겨찾기 도시가 외부 검색으로 추가된 도시인 경우 새로고침 후 좌표와 표시 정보를 복원하는 영속 모델을 확장합니다.

## 환경 변수

```bash
cp .env.example .env.local
```

`.env.local`에 `VITE_OPENWEATHER_API_KEY`를 설정합니다. 실제 키는 Git에 커밋하지 않습니다.

## 명령어

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## 문서

- [프로젝트 전체 설계 및 구현 순서](docs/PROJECT_DESIGN.md)
- [최종 요구사항 체크리스트](docs/PROJECT_DESIGN.md#7-최종-검수-체크리스트)

## 과제 제출 전 확인

- Public GitHub 저장소가 시크릿 창에서 로그인 없이 열리는지 확인합니다.
- 배포 URL에서 새로고침과 `/weather/:cityId` 직접 접근이 정상인지 확인합니다.
- README의 개인 커스터마이징, 이벤트 단축키, 사용 라이브러리/API 내역을 최신 상태로 유지합니다.

## 현재 검증 상태

- `npm run lint`, `npm run build` 통과
- 홈, 상세 동적 경로, 404, 섭씨/화씨, 외부 도시 검색, 우클릭 메뉴, `/` 검색 단축키 확인
- 제공된 OpenWeatherMap 키는 2026-08-27 현재 API에서 401 응답을 반환하여 Mock fallback으로 표시 중
- GitHub Public 공개와 정적 호스팅은 아직 수행하지 않음
