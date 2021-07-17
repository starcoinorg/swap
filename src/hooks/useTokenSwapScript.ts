import { bcs, utils } from '@starcoin/starcoin'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { useCallback } from 'react'
import useStarcoinProvider from './useStarcoinProvider'
import { TransactionPayloadVariantScriptFunction } from '@starcoin/starcoin/dist/src/lib/runtime/starcoin_types'

const PREFIX = '0x07fa08a855753f0ff7292fdcbe871216::TokenSwapScripts::'

function serializeU128(value: string | number): string {
  const se = new bcs.BcsSerializer()
  se.serializeU128(BigInt(value))
  return hexlify(se.getBytes())
}

function serializeScriptFunction(scriptFunction: TransactionPayloadVariantScriptFunction) {
  const se = new bcs.BcsSerializer()
  scriptFunction.serialize(se)
  return hexlify(se.getBytes())
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
  const provider = useStarcoinProvider()
  return useCallback(async () => {
    if (!x || !y || !amount_x_in || !amount_y_out_min) {
      return undefined
    }
    const functionId = `${PREFIX}::swap_exact_token_for_token`
    const tyArgs = utils.tx.encodeStructTypeTags([x, y])
    const args = [arrayify(serializeU128(amount_x_in)), arrayify(serializeU128(amount_y_out_min))]
    const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, args)
    const transactionHash = await provider.getSigner(signer).sendUncheckedTransaction({
      data: serializeScriptFunction(scriptFunction),
    })
    return transactionHash
  }, [amount_x_in, amount_y_out_min, provider, signer, x, y])
}
