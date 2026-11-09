const fs = require('node:fs');
const path = require('node:path');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getBackendIds(token) {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Invalid runtime token');

  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  const scope = String(claims.scp || '')
    .split(' ')
    .find(value => value.startsWith('Actions.Results:'));

  if (!scope) throw new Error('Actions.Results scope is missing');
  const scopeParts = scope.split(':');
  if (scopeParts.length !== 3) throw new Error('Invalid Actions.Results scope');

  return {
    workflowRunBackendId: scopeParts[1],
    workflowJobRunBackendId: scopeParts[2],
  };
}

async function main() {
  const token = requireEnv('ACTIONS_RUNTIME_TOKEN');
  const resultsUrl = requireEnv('ACTIONS_RESULTS_URL');
  const workspace = requireEnv('GITHUB_WORKSPACE');
  const ids = getBackendIds(token);

  const endpoint = new URL(
    'twirp/results.services.receiver.Receiver/GetJobLogsSignedBlobURL',
    resultsUrl,
  );

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_job_run_backend_id: ids.workflowJobRunBackendId,
      workflow_run_backend_id: ids.workflowRunBackendId,
    }),
  });

  if (!response.ok) {
    throw new Error(`GetJobLogsSignedBlobURL failed: ${response.status}`);
  }

  const result = await response.json();
  const signedUrl = result.logs_url ?? result.logsUrl;
  if (typeof signedUrl !== 'string' || !signedUrl) {
    throw new Error('Signed job log URL is missing');
  }

  console.log(`::add-mask::${signedUrl}`);
  fs.writeFileSync(path.join(workspace, 'signed-url.txt'), signedUrl, {
    encoding: 'utf8',
    mode: 0o600,
  });
  console.log('Signed job log URL saved for artifact upload.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
