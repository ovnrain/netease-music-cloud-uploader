import { execa } from 'execa';

export async function execCommand(
  command: string,
  args: string[],
  { cwd }: { cwd?: string } = {},
): Promise<void> {
  return execa(command, args, {
    cwd,
    stdio: 'inherit',
    env: { FORCE_COLOR: '0' },
  }).then();
}
