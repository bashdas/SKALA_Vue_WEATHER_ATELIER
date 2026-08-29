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

### 1. SearchBar의 명시적 입력 이벤트 처리

과제에서 한글 입력 처리 과정을 직접 확인할 수 있도록 `:value`와 `@input` 사용을 요구했습니다. 따라서 단순히 `v-model`만 붙이지 않고 `SearchBar`에서 입력값을 받아 부모에게 명시적으로 전달했습니다.

```vue
<InputText
  :value="modelValue"
  @input="update($event.target.value)"
/>
```

`SearchBar`는 `update:modelValue`와 과제에서 요구한 의미가 드러나는 `update-query` 이벤트를 함께 발생시킵니다. 검색 필터링은 부모의 `computed(filteredWeatherList)`가 담당합니다. 덕분에 입력 컴포넌트, 검색 규칙, 데이터 상태의 역할이 분리되고 한글 조합 입력 결과도 부모 화면에 즉시 표시됩니다.

### 2. 카드 클릭과 내부 버튼의 이벤트 버블링

날씨 카드를 누르면 도시가 선택되어야 하지만, 카드 안의 즐겨찾기·상세보기 버튼을 눌렀을 때까지 카드 선택 이벤트가 같이 발생하는 문제가 있었습니다. DOM 이벤트가 자식 버튼에서 카드로 버블링하기 때문입니다.

버튼에는 Vue 이벤트 수식어인 `.stop`을 적용했습니다.

```vue
<Button @click.stop="emit('toggle-favorite', city.id)" />
<Button @click.stop="emit('click-detail', city)" />
```

카드 선택과 버튼 동작을 분리하면서 과제의 이벤트 수식어 요구도 코드에서 명확히 확인할 수 있게 했습니다.

### 3. `window.alert` 요구와 Router 상세 페이지 요구가 충돌한 문제

초기 단원에서는 상세보기 버튼으로 `window.alert()`를 띄우도록 되어 있지만, Router 단원에서는 alert를 제거하고 `/weather/:cityId`로 이동하도록 요구합니다. 두 동작을 동시에 남기면 최종 앱에서 상세 버튼의 의미가 불분명해집니다.

최종 결과물은 뒤 단원의 요구가 앞 단원을 확장한다고 판단해 programmatic navigation을 선택했습니다.

```js
router.push({
  name: 'weather-detail',
  params: { cityId: city.id },
})
```

동적 경로로 이동한 뒤 `cityId`로 도시를 다시 찾고 예보 API를 요청합니다. 초기 alert 실습의 목적이었던 “자식 버튼 이벤트를 부모로 전달하기”는 `click-detail` emit으로 그대로 보존했습니다.

### 4. 우클릭 기능만 만들면 키보드와 모바일 사용자는 쓸 수 없는 문제

개인 커스터마이징으로 카드 우클릭 빠른 메뉴를 추가했지만, `contextmenu` 이벤트만 구현하면 마우스를 쓰지 않는 사용자는 기능에 접근할 수 없습니다. 모바일에서는 우클릭 자체가 명확하지 않다는 문제도 있었습니다.

그래서 같은 작업 메뉴로 들어가는 경로를 세 가지로 만들었습니다.

- 데스크톱: 카드 `@contextmenu.prevent`
- 키보드: 카드에 포커스 후 `Shift + F10` 또는 메뉴 키
- 모바일: 카드의 더보기 버튼

브라우저 기본 우클릭은 페이지 전체가 아니라 날씨 카드에서만 방지했습니다. `/`와 `F` 단축키는 사용자가 input에서 한글이나 영문을 입력할 때 가로채지 않도록 입력 요소 여부를 먼저 검사합니다. 전역 이벤트는 `onMounted`에서 등록하고 `onUnmounted`에서 반드시 해제해 화면 이동 후 핸들러가 중복되는 문제도 방지했습니다.

### 5. 일부 API 요청 실패에도 화면을 유지하는 방법

기본 도시의 실시간 날씨 요청은 `Promise.allSettled()`로 처리합니다. 성공한 도시는 API 응답으로 갱신하고, 실패한 도시는 Mock 데이터를 유지해 전체 화면이 비지 않도록 했습니다. Axios 오류는 `readableApiError()`에서 사용자 메시지로 변환하며, Vercel 배포본에서 실시간 현재 날씨와 5일 예보 표시를 확인했습니다.

### 6. 외부 도시 검색과 날씨 API의 역할 분리

Open-Meteo Geocoding API로 도시명과 좌표를 찾고, OpenWeatherMap API로 해당 좌표의 날씨를 조회합니다. 날씨 요청이 실패해도 도시 검색 결과는 유지하도록 두 단계를 분리했습니다.

### 7. 외부 API 응답을 컴포넌트에서 바로 사용하지 않은 이유

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

### 8. 섭씨/화씨 변환 코드가 메인과 상세에서 중복될 가능성

단위 설정은 `configStore`의 `unit`, `unitSymbol`, `toggleUnit`으로 관리합니다. 실제 온도 변환은 `useTemperature` composable로 분리해 메인 카드와 상세 대표 온도가 같은 공식을 사용하도록 했습니다.

상세 화면의 체감 온도와 예보 온도도 단위 변경에 반응하도록 별도로 확인했습니다. 원본 데이터는 항상 섭씨로 유지하고 표시할 때만 변환하므로, 버튼을 여러 번 눌러도 변환 오차가 누적되지 않습니다.

### 9. Pinia 상태를 새로고침 후에도 유지하는 방법

Pinia 상태만 사용하면 새로고침 시 온도 단위와 즐겨찾기가 초기화됩니다. 별도의 persistence 플러그인을 추가할 수도 있지만, 과제 규모에서는 의존성을 더 늘리지 않고 `watch`와 `localStorage`를 사용했습니다.

- Store 생성 시 저장된 값을 초기 상태로 읽습니다.
- 즐겨찾기·최근 도시·단위가 바뀔 때 JSON 또는 문자열로 저장합니다.
- 즐겨찾기 ID를 실제 도시 객체로 바꾸는 작업은 getter/computed가 담당합니다.

저장소에는 API 키나 API 응답 전체를 넣지 않고 사용자 설정에 필요한 최소 ID만 저장했습니다.

### 10. 환경 변수와 Vite의 빌드 시점 주의사항

Vite의 `VITE_` 접두사가 붙은 값은 브라우저 번들에서 읽을 수 있으므로 완전한 서버 비밀값은 아닙니다. 이번 과제는 정적 프런트엔드에서 OpenWeatherMap을 호출하는 구조이므로 다음 원칙을 적용했습니다.

- 실제 값은 `.env.local`에만 저장합니다.
- `.gitignore`의 `*.local` 규칙으로 Git 추적을 막습니다.
- `.env.example`에는 변수명만 제공합니다.
- README, 코드, 오류 로그에 실제 키를 기록하지 않습니다.
- Vercel 배포 시 프로젝트 환경 변수에 별도로 등록해야 합니다.

상용 서비스라면 서버리스 함수에서 API를 대신 호출해 키를 서버에만 보관하고 사용량 제한도 적용하는 구조가 더 안전하다고 판단했습니다.

### 11. Vercel 배포 시 동적 경로 새로고침 문제

Vue Router history 모드의 직접 접근·새로고침 문제는 `vercel.json`의 rewrite로 모든 앱 경로를 `index.html`에 연결해 해결했습니다. 배포본에서 `/weather/seoul` 직접 접근과 새로고침, Vue 404 화면을 확인했습니다.

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

## 최종 검증 상태

- `npm run lint`, `npm run build` 통과
- 홈, 상세 동적 경로, 404, 섭씨/화씨, 외부 도시 검색, 우클릭 메뉴, `/` 검색 단축키 확인
- OpenWeatherMap API 키 정상화 및 Vercel Production 환경 변수(`VITE_OPENWEATHER_API_KEY`) 등록 완료
- 배포본에서 실시간 현재 날씨와 5일 예보 표시 확인
- GitHub Public 저장소 및 Vercel 정적 호스팅 완료
- Vercel rewrite 설정으로 `/weather/:cityId` 직접 접근·새로고침과 catch-all 404 동작 확인
