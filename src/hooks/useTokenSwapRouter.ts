import { useCallback } from 'react'
import useSWR from 'swr'
import useStarcoinProvider from './useStarcoinProvider'
import { useActiveWeb3React } from './web3'

const PREFIX = '0x07fa08a855753f0ff7292fdcbe871216::TokenSwapRouter::'

/**
 * 查询当前签名者在某代币对下的流动性
 */
export function useLiquidity(signer?: string, x?: string, y?: string) {
  const provider = useStarcoinProvider()
  return useSWR(
    x && y ? [provider, 'liquidity', signer, x, y] : null,
    async () =>
      (await provider.call({
        function_id: `${PREFIX}liquidity`,
        type_args: [x!, y!],
        args: [signer!],
      })) as [number]
  )
}

/**
 * 查询代币对池中的总额度
 */
export function useGetReserves(x?: string, y?: string) {
  const provider = useStarcoinProvider()
  return useSWR(
    x && y ? [provider, 'get_reserves', x, y] : null,
    async () =>
      (await provider.call({
        function_id: `${PREFIX}get_reserves`,
        type_args: [x!, y!],
        args: [],
      })) as [number, number]
  )
}

/**
 * 根据x计算y (无手续费)
 */
export function useQuote(amount_x?: number | string, reverse_x?: number, reverse_y?: number) {
  const provider = useStarcoinProvider()
  return useSWR(
    amount_x && reverse_x && reverse_y ? [provider, 'quote', amount_x, reverse_x, reverse_y] : null,
    async () =>
      (await provider.call({
        function_id: `${PREFIX}quote`,
        type_args: [],
        args: [`${amount_x!.toString()}u128`, `${reverse_x!.toString()}u128`, `${reverse_y!.toString()}u128`],
      })) as [number]
  )
}

/**
 * 根据换入额度计算换出额度，固定千分之三手续费
 */
export function useGetAmountOut(amount_in?: number | string, reverse_in?: number, reverse_out?: number) {
  const provider = useStarcoinProvider()
  return useSWR(
    amount_in && reverse_in && reverse_out ? [provider, 'get_amount_out', amount_in, reverse_in, reverse_out] : null,
    async () =>
      (await provider.call({
        function_id: `${PREFIX}get_amount_out`,
        type_args: [],
        args: [`${amount_in!.toString()}u128`, `${reverse_in!.toString()}u128`, `${reverse_out!.toString()}u128`],
      })) as [number]
  )
}

/**
 * 根据换出额度计算换入额度，固定千分之三手续费
 */
export function useGetAmountIn(amount_out?: number | string, reverse_in?: number, reverse_out?: number) {
  const provider = useStarcoinProvider()
  return useSWR(
    amount_out && reverse_in && reverse_out ? [provider, 'get_amount_in', amount_out, reverse_in, reverse_out] : null,
    async () =>
      (await provider.call({
        function_id: `${PREFIX}get_amount_in`,
        type_args: [],
        args: [`${amount_out!.toString()}u128`, `${reverse_in!.toString()}u128`, `${reverse_out!.toString()}u128`],
      })) as [number]
  )
}

/**
 * 通过指定换入的代币额度来换出代币
 */
export function useSwapExactTokenForToken(
  signer?: string,
  x?: string,
  y?: string,
  amount_x_in?: number | string,
  amount_y_out_min?: number | string
) {
  const { chainId } = useActiveWeb3React()
  const provider = useStarcoinProvider()
  console.log(x, y, amount_x_in, amount_y_out_min)
  return useCallback(
    async () =>
      x && y && amount_x_in && amount_y_out_min && chainId
        ? provider.getSigner(signer).sendUncheckedTransaction({
            script: {
              code: `${PREFIX}swap_exact_token_for_token`,
              type_args: [x, y],
              args: [`${amount_x_in.toString()}u128`, `${amount_y_out_min.toString()}u128`],
            },
          })
        : undefined,
    [amount_x_in, amount_y_out_min, chainId, provider, signer, x, y]
  )
}
