export type OrderInfo = {
  fiat_amount: string
  coin: string
  concept: string
  identifier: string
  payment_uri: string
  expected_input_amount: string
  tag_memo: string
  address: string
  image: string
}
export type Currency = {
  symbol: string
  name: string
  image: string
  min_amount: number
  max_amount: number
}
