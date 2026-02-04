// Mock for voyageai module
export const mockEmbed = jest.fn().mockResolvedValue({
  data: [
    { embedding: new Array(1536).fill(0.1) }
  ]
})

export class VoyageAIClient {
  constructor(config: { apiKey: string }) {}

  embed = mockEmbed
}
