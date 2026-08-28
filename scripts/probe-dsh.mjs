import { probeHosts } from './compat-lib.mjs'
import { loadCatalog } from '../test/compat/catalog.mjs'

function hostHasLayer(host, layer) {
  return (host.layers || []).includes(layer)
}

const catalog = await loadCatalog()
const hosts = (catalog.hosts || []).filter((host) => host.kind === 'npm' && hostHasLayer(host, 'l2'))
const report = await probeHosts(catalog, hosts)
console.log(JSON.stringify(report, null, 2))
if (report.warnings.length) {
  console.error(`compat probe warnings (${report.warnings.length}):\n${report.warnings.map((item) => `- ${item}`).join('\n')}`)
}
if (report.failures.length) {
  console.error(`compat probe failures (${report.failures.length}):\n${report.failures.map((item) => `- ${item}`).join('\n')}`)
  process.exit(1)
}
