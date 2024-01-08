import fs from 'fs';
import { join, resolve } from 'path';

import { getBooleanInput, getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import YAML from 'yaml';
import format from 'date-fns/format';
import addHours from 'date-fns/addHours';
import formatRFC3339 from 'date-fns/formatRFC3339';

import { execCommand } from './utils';

async function run(): Promise<void> {
  if (typeof process.env.GITHUB_TOKEN === 'undefined') {
    return setFailed('GITHUB_TOKEN is not defined');
  }

  const repoKit = getOctokit(process.env.GITHUB_TOKEN);

  const projectPath = resolve(process.cwd(), '.');
  const tauriConfingPath = join(projectPath, 'src-tauri/tauri.conf.json');

  const tauriConfig = JSON.parse(fs.readFileSync(tauriConfingPath, 'utf8'));
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const productName = tauriConfig.package.productName;
  const version = pkg.version;
  const vVersion = `v${version}`;
  const pkgName = pkg.name;

  const latestRelease = await repoKit.rest.repos.getLatestRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  if (latestRelease.data.tag_name === vVersion) {
    return setFailed(`The release ${vVersion} has already been released`);
  }

  await execCommand('pnpm', ['tauri', 'build', '--target', 'aarch64-apple-darwin'], {
    cwd: projectPath,
  });
  await execCommand('pnpm', ['tauri', 'build', '--target', 'x86_64-apple-darwin'], {
    cwd: projectPath,
  });

  const files: string[] = [];
  const platforms: Partial<
    Record<'darwin-aarch64' | 'darwin-x86_64', { signature: string; url: string }>
  > = {};

  for (const arch of ['aarch64', 'x64']) {
    const bundlePath = join(
      projectPath,
      `src-tauri/target/${arch === 'x64' ? 'x86_64' : arch}-apple-darwin/release/bundle`,
    );

    const originDmgPath = join(bundlePath, 'dmg', `${productName}_${version}_${arch}.dmg`);
    const newDmgPath = join(bundlePath, 'dmg', `${pkgName}_${version}_${arch}.dmg`);
    fs.renameSync(originDmgPath, newDmgPath);

    const originGzPath = join(bundlePath, 'macos', `${productName}.app.tar.gz`);
    const newGzName = `${pkgName}_${version}_${arch}.tar.gz`;
    const newGzPath = join(bundlePath, 'macos', newGzName);
    fs.renameSync(originGzPath, newGzPath);

    files.push(newDmgPath, newGzPath);

    const sigPath = join(bundlePath, 'macos', `${productName}.app.tar.gz.sig`);

    platforms[arch === 'x64' ? 'darwin-x86_64' : 'darwin-aarch64'] = {
      signature: fs.readFileSync(sigPath, 'utf8'),
      url: `https://github.com/ovnrain/netease-music-cloud-uploader/releases/download/${vVersion}/${newGzName}`,
    };
  }

  const changelog: { tag: string; notes: string[] }[] = YAML.parse(
    fs.readFileSync(join(projectPath, 'changelog.yaml'), 'utf8'),
  );
  const targetLog = changelog.find((log) => log.tag === vVersion);

  if (!targetLog) {
    return setFailed(`The changelog of ${vVersion} is not found`);
  }

  const draft = getBooleanInput('draft', {
    required: false,
  });

  const newRelease = await repoKit.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: targetLog.tag,
    name: `${targetLog.tag} (${format(addHours(new Date(), 8), 'yyyy-MM-dd')})`,
    body: targetLog.notes.map((s) => `- ${s}`).join('\n'),
    draft,
    prerelease: false,
    target_commitish: context.sha,
  });

  // 上传文件
  for (const file of files) {
    const ext = file.split('.').pop();
    await repoKit.rest.repos.uploadReleaseAsset({
      owner: context.repo.owner,
      repo: context.repo.repo,
      release_id: newRelease.data.id,
      name: file.split('/').pop() as string,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data: fs.readFileSync(file),
      headers: {
        'content-type': ext === 'gz' ? 'application/gzip' : 'application/octet-stream',
        'content-length': fs.statSync(file).size,
      },
    });
  }

  if (typeof process.env.GIST_TOKEN === 'undefined') {
    return setFailed('GIST_TOKEN is not defined');
  }

  const gistKit = getOctokit(process.env.GIST_TOKEN);

  // 更新 gist
  const gistId = getInput('gistId', {
    required: true,
  });

  const notes =
    targetLog.notes.length < 2
      ? targetLog.notes[0]
      : targetLog.notes.map((s, i) => `${i + 1}. ${s}`).join('\n');

  await gistKit.rest.gists.update({
    gist_id: gistId,
    files: {
      'netease-music-cloud-uploader-updater.json': {
        content: JSON.stringify(
          {
            version: vVersion,
            notes,
            pub_date: formatRFC3339(new Date()),
            platforms,
          },
          null,
          2,
        ),
      },
    },
  });
}

run();
