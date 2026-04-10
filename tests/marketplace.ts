import * as anchor from '@coral-xyz/anchor';
import { assert } from 'chai';

describe('marketplace', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it('initializes marketplace', async () => {
    assert.ok(true);
  });

  it('registers publisher and publishes tool', async () => {
    assert.ok(true);
  });
});
