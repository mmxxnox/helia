import { expect } from 'aegir/chai'
import last from 'it-last'
import { importer } from 'ipfs-unixfs-importer'
import type { CID } from 'multiformats/cid'
import type { Blockstore } from 'interface-blockstore'

export async function createShardedDirectory (blockstore: Blockstore, files = 1001): Promise<CID> {
  const result = await last(importer((function * () {
    for (let i = 0; i < files; i++) {
      yield {
        path: `./file-${i}`,
        content: Uint8Array.from([0, 1, 2, 3, 4, 5, i])
      }
    }
  }()), blockstore, {
    shardSplitThresholdBytes: 1,
    wrapWithDirectory: true
  }))

  if (result == null) {
    throw new Error('No result received from ipfs.addAll')
  }

  expect(result).to.have.nested.property('unixfs.type', 'hamt-sharded-directory', 'tried to create a shared directory but the result was not a shard')

  return result.cid
}
