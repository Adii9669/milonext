/**
 * Onechat Jam web feature flag.
 *
 * Jam ships enabled so the web app works without extra environment setup.
 * Set NEXT_PUBLIC_FEATURE_JAM=false to hide all Jam UI and disable queries.
 */
export function isJamEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_JAM !== 'false';
}
