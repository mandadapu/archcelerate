/**
 * @jest-environment node
 */

import { generateMetadata } from '../metadata'

describe('generateMetadata', () => {
  it('returns defaults when no params provided', () => {
    const meta = generateMetadata({})
    expect(meta.title).toBe('AI Architect Accelerator - Learn AI Engineering')
    expect(meta.description).toContain('Transform from developer')
  })

  it('concatenates custom title', () => {
    const meta = generateMetadata({ title: 'Week 1' })
    expect(meta.title).toBe('Week 1 | AI Architect Accelerator')
  })

  it('uses custom description', () => {
    const meta = generateMetadata({ description: 'Custom desc' })
    expect(meta.description).toBe('Custom desc')
  })

  it('builds canonical URL from path', () => {
    const meta = generateMetadata({ path: '/curriculum' })
    expect(meta.alternates?.canonical).toBe('https://archcelerate.com/curriculum')
  })

  it('sets OpenGraph and Twitter metadata', () => {
    const meta = generateMetadata({ title: 'Test', image: '/test.png' })
    const og = meta.openGraph as any
    expect(og.title).toBe('Test | AI Architect Accelerator')
    expect(og.images[0].url).toBe('/test.png')
    const tw = meta.twitter as any
    expect(tw.card).toBe('summary_large_image')
    expect(tw.images).toEqual(['/test.png'])
  })
})
