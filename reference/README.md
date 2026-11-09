# GitHub Actions 참고 파일

이 디렉터리는 Repo Cassette 실습에서 GitHub Actions Job 로그의 임시 서명 URL을 얻기 위한 참고 코드를 보관합니다.

현재 파일들은 `reference/` 아래에 있으므로 GitHub Actions가 자동으로 인식하거나 실행하지 않습니다. 실제로 실습할 때만 아래에 설명된 `.github/` 경로로 복사해야 합니다.

## 파일 구조

```text
reference/
├─ github-action/
│  ├─ action.yml
│  └─ main.js
└─ repo-cassette-log.yml
```

## `github-action/action.yml`

`main.js`를 custom JavaScript Action으로 실행하기 위한 설정 파일입니다.

주요 역할은 다음과 같습니다.

- Action의 이름과 설명을 정의합니다.
- GitHub Actions Runner가 Node.js 20으로 `main.js`를 실행하도록 지정합니다.

실습할 때 복사할 위치:

```text
reference/github-action/action.yml
→ .github/actions/get-log-url/action.yml
```

## `github-action/main.js`

실행 중인 Job 로그 Blob의 임시 서명 URL을 얻는 JavaScript 코드입니다.

처리 흐름은 다음과 같습니다.

1. GitHub-hosted Runner가 제공하는 `ACTIONS_RUNTIME_TOKEN`을 읽습니다.
2. Runtime Token에서 Workflow Run과 Job Run의 backend ID를 추출합니다.
3. `ACTIONS_RESULTS_URL`을 기준으로 `GetJobLogsSignedBlobURL` endpoint를 호출합니다.
4. 반환된 임시 서명 URL을 로그에 노출하지 않도록 마스킹합니다.
5. URL을 저장소 작업 디렉터리의 `signed-url.txt`에 저장합니다.

이 파일은 URL을 payload 주입에 사용하지 않습니다. URL을 얻어 파일로 저장하는 역할까지만 담당합니다.

실습할 때 복사할 위치:

```text
reference/github-action/main.js
→ .github/actions/get-log-url/main.js
```

## `repo-cassette-log.yml`

custom Action을 호출하고 생성된 `signed-url.txt`를 Artifact로 업로드하는 Workflow 참고 파일입니다.

Workflow의 주요 Step은 다음과 같습니다.

1. `actions/checkout`으로 저장소 파일을 Runner에 가져옵니다.
2. `.github/actions/get-log-url`의 custom Action을 실행합니다.
3. 생성된 `signed-url.txt`를 `signed-job-log-url-RUN_ID` Artifact로 업로드합니다.
4. Artifact 보관 기간을 1일로 제한합니다.

실습할 때 복사할 위치:

```text
reference/repo-cassette-log.yml
→ .github/workflows/repo-cassette-log.yml
```

## 전체 실행 흐름

```text
repo-cassette-log.yml 실행
→ action.yml이 main.js를 custom Action으로 실행
→ main.js가 임시 서명 URL을 signed-url.txt에 저장
→ Workflow가 signed-url.txt를 Artifact로 업로드
→ 사용자가 Artifact를 다운로드
→ exploit/inject_job_log.py가 URL을 사용해 payload 업로드
```

## 주의사항

- `signed-url.txt`에는 만료 전까지 Blob 접근 권한이 포함될 수 있으므로 공개하거나 커밋하면 안 됩니다.
- 임시 서명 URL은 제한된 시간 동안만 사용할 수 있습니다.
- 현재 GitHub의 권한 정책이 대회 당시와 다르면 URL 요청이나 이후 PUT 요청이 실패할 수 있습니다.
- 본인 소유 저장소나 명시적으로 허가받은 환경에서만 실습해야 합니다.
