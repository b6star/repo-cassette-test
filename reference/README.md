# Reference Files

## `github-action/action.yml`

`main.js`를 GitHub custom JavaScript Action으로 실행하기 위한 설정 파일입니다.

- Action의 이름과 설명을 정의합니다.
- Node.js 20으로 `main.js`를 실행하도록 지정합니다.

## `github-action/main.js`

실행 중인 GitHub Actions Job 로그 Blob의 임시 서명 URL을 가져오는 코드입니다.

- `ACTIONS_RUNTIME_TOKEN`에서 Workflow Run과 Job Run의 backend ID를 추출합니다.
- `ACTIONS_RESULTS_URL`의 `GetJobLogsSignedBlobURL` endpoint를 호출합니다.
- 반환된 URL을 로그에서 마스킹합니다.
- URL을 `signed-url.txt`에 저장합니다.

## `repo-cassette-log.yml`

`github-action`을 실행하고 결과 파일을 Artifact로 저장하는 Workflow 참고 파일입니다.

- 저장소 파일을 Runner로 가져옵니다.
- `get-log-url` custom Action을 실행합니다.
- 생성된 `signed-url.txt`를 Artifact로 업로드합니다.
- Artifact 보관 기간을 1일로 설정합니다.
