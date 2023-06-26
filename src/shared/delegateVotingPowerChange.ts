import { BigInt } from "@graphprotocol/graph-ts";
import { DelegateVotingPowerChange } from "../../generated/schema";



export function handleDelegateVotingPowerChange(
    hash: string,
    logIndex: string,
    previousBalance: BigInt,
    newBalance: BigInt,
    delegate: string,
    tokenAddress: string,
    blockTimestamp: BigInt,
    blockNumber: BigInt): void {
  const delegatePowerChange = new DelegateVotingPowerChange( `${hash}-${logIndex}`);
  delegatePowerChange.previousBalance = previousBalance;
  delegatePowerChange.newBalance = newBalance;
  delegatePowerChange.delegate = delegate;
  delegatePowerChange.tokenAddress = tokenAddress;
  delegatePowerChange.txnHash = hash;
  delegatePowerChange.blockTimestamp = blockTimestamp;
  delegatePowerChange.blockNumber = blockNumber;
  delegatePowerChange.save();
}
