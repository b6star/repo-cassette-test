# Repo Cassette GitHub Actions Lab

This repository is a personal practice environment for inspecting the GitHub Actions job-log flow used by the Repo Cassette CTF challenge.

## Goals

- Run a GitHub Actions workflow and job.
- Find the `RUN_ID` and `JOB_ID` in the job page URL.
- Compare the log shown in GitHub Actions with the log returned by the Jobs API.

## Usage

1. Open the **Actions** tab.
2. Select the **Repo Cassette Log Lab** workflow.
3. Click **Run workflow**.
4. Open the completed workflow run and select the **make-log** job.
5. Find the IDs in the page URL:

```text
https://github.com/OWNER/REPO/actions/runs/RUN_ID/job/JOB_ID
```

Repository name to enter in Repo Cassette:

```text
b6star/repo-cassette-test
```

## Files

- `.github/workflows/repo-cassette-log.yml`: manually triggered practice workflow

> This repository is for CTF study. Use it only with repositories you own or systems you are authorized to test.
