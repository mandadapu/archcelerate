/**
 * @jest-environment node
 */

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn(),
    rpc: jest.fn(),
  }),
}))

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../server'

describe('Supabase server client', () => {
  it('creates admin client with service role key (no cookie auth)', () => {
    expect(createSupabaseClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  })

  it('createClient() is async and returns the same singleton', async () => {
    const client1 = await createClient()
    const client2 = await createClient()

    expect(client1).toBe(client2)
  })

  it('returned client has data query methods', async () => {
    const client = await createClient()

    expect(client.from).toBeDefined()
    expect(client.rpc).toBeDefined()
  })
})
