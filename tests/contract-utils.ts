import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Delegated,
  Undelegated,
  Unlocked,
  VoteRemoved,
  VoteRemovedForTrack,
  VoteRemovedOther,
  VoteSplit,
  VoteSplitAbstained,
  Voted
} from "../generated/Contract/Contract"

export function createDelegatedEvent(
  trackId: i32,
  from: Address,
  to: Address,
  delegatedAmount: BigInt,
  conviction: i32
): Delegated {
  let delegatedEvent = changetype<Delegated>(newMockEvent())

  delegatedEvent.parameters = new Array()

  delegatedEvent.parameters.push(
    new ethereum.EventParam(
      "trackId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(trackId))
    )
  )
  delegatedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  delegatedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  delegatedEvent.parameters.push(
    new ethereum.EventParam(
      "delegatedAmount",
      ethereum.Value.fromUnsignedBigInt(delegatedAmount)
    )
  )
  delegatedEvent.parameters.push(
    new ethereum.EventParam(
      "conviction",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(conviction))
    )
  )

  return delegatedEvent
}

export function createUndelegatedEvent(
  trackId: i32,
  caller: Address
): Undelegated {
  let undelegatedEvent = changetype<Undelegated>(newMockEvent())

  undelegatedEvent.parameters = new Array()

  undelegatedEvent.parameters.push(
    new ethereum.EventParam(
      "trackId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(trackId))
    )
  )
  undelegatedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )

  return undelegatedEvent
}

export function createUnlockedEvent(trackId: i32, caller: Address): Unlocked {
  let unlockedEvent = changetype<Unlocked>(newMockEvent())

  unlockedEvent.parameters = new Array()

  unlockedEvent.parameters.push(
    new ethereum.EventParam(
      "trackId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(trackId))
    )
  )
  unlockedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )

  return unlockedEvent
}

export function createVoteRemovedEvent(
  pollIndex: BigInt,
  voter: Address
): VoteRemoved {
  let voteRemovedEvent = changetype<VoteRemoved>(newMockEvent())

  voteRemovedEvent.parameters = new Array()

  voteRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  voteRemovedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )

  return voteRemovedEvent
}

export function createVoteRemovedForTrackEvent(
  pollIndex: BigInt,
  trackId: i32,
  voter: Address
): VoteRemovedForTrack {
  let voteRemovedForTrackEvent = changetype<VoteRemovedForTrack>(newMockEvent())

  voteRemovedForTrackEvent.parameters = new Array()

  voteRemovedForTrackEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  voteRemovedForTrackEvent.parameters.push(
    new ethereum.EventParam(
      "trackId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(trackId))
    )
  )
  voteRemovedForTrackEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )

  return voteRemovedForTrackEvent
}

export function createVoteRemovedOtherEvent(
  pollIndex: BigInt,
  caller: Address,
  target: Address,
  trackId: i32
): VoteRemovedOther {
  let voteRemovedOtherEvent = changetype<VoteRemovedOther>(newMockEvent())

  voteRemovedOtherEvent.parameters = new Array()

  voteRemovedOtherEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  voteRemovedOtherEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  voteRemovedOtherEvent.parameters.push(
    new ethereum.EventParam("target", ethereum.Value.fromAddress(target))
  )
  voteRemovedOtherEvent.parameters.push(
    new ethereum.EventParam(
      "trackId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(trackId))
    )
  )

  return voteRemovedOtherEvent
}

export function createVoteSplitEvent(
  pollIndex: BigInt,
  voter: Address,
  aye: BigInt,
  nay: BigInt
): VoteSplit {
  let voteSplitEvent = changetype<VoteSplit>(newMockEvent())

  voteSplitEvent.parameters = new Array()

  voteSplitEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  voteSplitEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )
  voteSplitEvent.parameters.push(
    new ethereum.EventParam("aye", ethereum.Value.fromUnsignedBigInt(aye))
  )
  voteSplitEvent.parameters.push(
    new ethereum.EventParam("nay", ethereum.Value.fromUnsignedBigInt(nay))
  )

  return voteSplitEvent
}

export function createVoteSplitAbstainedEvent(
  pollIndex: BigInt,
  voter: Address,
  aye: BigInt,
  nay: BigInt,
  abstain: BigInt
): VoteSplitAbstained {
  let voteSplitAbstainedEvent = changetype<VoteSplitAbstained>(newMockEvent())

  voteSplitAbstainedEvent.parameters = new Array()

  voteSplitAbstainedEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  voteSplitAbstainedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )
  voteSplitAbstainedEvent.parameters.push(
    new ethereum.EventParam("aye", ethereum.Value.fromUnsignedBigInt(aye))
  )
  voteSplitAbstainedEvent.parameters.push(
    new ethereum.EventParam("nay", ethereum.Value.fromUnsignedBigInt(nay))
  )
  voteSplitAbstainedEvent.parameters.push(
    new ethereum.EventParam(
      "abstain",
      ethereum.Value.fromUnsignedBigInt(abstain)
    )
  )

  return voteSplitAbstainedEvent
}

export function createVotedEvent(
  pollIndex: BigInt,
  voter: Address,
  aye: boolean,
  voteAmount: BigInt,
  conviction: i32
): Voted {
  let votedEvent = changetype<Voted>(newMockEvent())

  votedEvent.parameters = new Array()

  votedEvent.parameters.push(
    new ethereum.EventParam(
      "pollIndex",
      ethereum.Value.fromUnsignedBigInt(pollIndex)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )
  votedEvent.parameters.push(
    new ethereum.EventParam("aye", ethereum.Value.fromBoolean(aye))
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "voteAmount",
      ethereum.Value.fromUnsignedBigInt(voteAmount)
    )
  )
  votedEvent.parameters.push(
    new ethereum.EventParam(
      "conviction",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(conviction))
    )
  )

  return votedEvent
}
