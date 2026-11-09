# Repo Cassette GitHub Actions 실습 자료

Repo Cassette 문제에서 사용된 GitHub Actions Job 로그 흐름과 로그 Blob 교체 과정을 다시 실습하기 위한 참고 자료입니다.

이 저장소는 GitHub Actions Workflow와 로그 교체 스크립트를 포함합니다. 본인 소유 저장소나 명시적으로 허가받은 환경에서만 사용해야 합니다.

## 파일 구조

```text
repo-cassette-test/
├─ .github/
│  ├─ actions/
│  │  └─ get-log-url/
│  │     ├─ action.yml
│  │     └─ main.js
│  ├─ workflows/
│  │  └─ repo-cassette-log.yml
│  └─ README.md
│
├─ exploit/
│  ├─ inject_job_log.py
│  └─ payload.example.json
│
├─ .gitignore
└─ README.md
```

### `.github/actions/get-log-url/`

GitHub-hosted Runner에서 제공되는 `ACTIONS_RUNTIME_TOKEN`과 `ACTIONS_RESULTS_URL`을 사용하여 현재 Job 로그 Blob의 임시 서명 URL을 요청하는 custom JavaScript Action입니다.

서명 URL은 Workflow 로그에 출력하지 않고 `signed-url.txt`에 저장합니다.

### `.github/workflows/repo-cassette-log.yml`

custom Action을 호출하고 `signed-url.txt`를 Artifact로 업로드하는 Workflow 파일입니다.

### `exploit/inject_job_log.py`

Artifact에서 내려받은 `signed-url.txt`와 Job ID를 사용하여 공격 payload를 만들고, 서명 URL에 HTTP PUT 요청으로 업로드합니다.

### `exploit/payload.example.json`

실제 payload의 한 줄 JSON 구조를 보여주는 예시입니다. `OWNER`, `REPO`, `JOB_ID`는 실행할 때 실제 값으로 교체됩니다.

## Workflow 실행

Actions 탭에서 `Repo Cassette Log Lab`을 수동 실행합니다. 실행이 완료되면 Summary 페이지의 Artifacts 영역에서 다음 파일을 내려받습니다.

```text
signed-job-log-url-RUN_ID.zip
└─ signed-url.txt
```

Job 화면 주소 마지막 숫자가 `JOB_ID`입니다.

```text
https://github.com/OWNER/REPO/actions/runs/RUN_ID/job/JOB_ID
```

## payload 주입

다음 명령에서 저장소 정보, Job ID, 서명 URL 파일 경로를 실제 값으로 바꿉니다.

```bash
python exploit/inject_job_log.py \
  --owner OWNER \
  --repo REPO \
  --job-id JOB_ID \
  --signed-url-file /path/to/signed-url.txt
```

스크립트는 마지막 개행이 없는 `exploit/payload.json`을 생성하고 로그 Blob에 업로드합니다. 성공하면 다음 상태가 출력됩니다.

```text
PUT status: 201
```

인증되지 않은 GitHub API 요청이 `403 Forbidden`을 반환할 수 있습니다. 이 경우 Job 로그 화면의 **Show options → View raw logs**에서 전체 로그가 payload JSON 하나로 교체됐는지 확인합니다.

## 주의사항

- `signed-url.txt`에는 만료 전까지 Blob 접근 권한이 포함될 수 있으므로 공유하거나 커밋하지 않습니다.
- `payload.json`의 공백과 마지막 개행도 SHA-256 값에 영향을 줍니다.
- 현재 GitHub의 권한 정책이 대회 당시와 다르면 서명 URL 요청 또는 PUT 요청이 실패할 수 있습니다.
- 이미 완료된 Job의 로그는 실습 과정에서 교체되므로 별도의 테스트 저장소를 사용하는 것이 좋습니다.
