import { execa } from 'execa';
export async function execCommand(command, args, { cwd }) {
  return execa(command, args, {
    cwd,
    stdio: 'inherit',
    env: { FORCE_COLOR: '0' },
  }).then();
}
