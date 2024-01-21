interface Window {
  ethereum?: {
    request: ({ method }: { method: string; params?: Array }) => Promise<void>
  }
}
