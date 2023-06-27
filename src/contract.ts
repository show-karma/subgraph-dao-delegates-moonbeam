import { store } from '@graphprotocol/graph-ts'
import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated as DelegatedEvent,
  Undelegated as UndelegatedEvent,
  Unlocked as UnlockedEvent,
  VoteRemoved as VoteRemovedEvent,
  VoteRemovedForTrack as VoteRemovedForTrackEvent,
  VoteRemovedOther as VoteRemovedOtherEvent,
  VoteSplit as VoteSplitEvent,
  VoteSplitAbstained as VoteSplitAbstainedEvent,
  Voted as VotedEvent
} from "../generated/Contract/Contract"
import {
  DelegateChange,
  Delegated,
  DelegatingHistory,
  DelegatorOrganization,
  Organization,
  UndelegatedHistory,
  Unlocked,
  User,
  VoteRemoved,
  VoteRemovedForTrack,
  VoteRemovedOther,
  VoteSplit,
  VoteSplitAbstained,
  Vote,
  Delegation,
  DelegateOrganization,
  Voted,
  DelegateVotingPowerChange
} from "../generated/schema"
import { getDelegateOrganization } from "./shared/getDelegateOrganization";
import { getFirstTokenDelegatedAt } from "./shared/getFirstTokenDelegatedAt";
import { getOrganization } from "./shared/getOrganization";
import { getDelegatorOrganization } from "./shared/getDelegatorOrganization";
import { getUser } from './shared/getUser';
import { handleDelegateVotingPowerChange } from './shared/delegateVotingPowerChange';

const daoName = "moonriver";

export function handleDelegated(event: DelegatedEvent): void {
  let organization = Organization.load(daoName)
  if(!organization){
    organization = new Organization(daoName)
  }
  organization.token = daoName
  organization.save()

  let delegate = new User(event.params.to.toHexString())
  delegate.save();

  let delegator = new User(event.params.from.toHexString())
  delegator.save();

  const delegatorId = `${delegator.id}-${organization.id}`;
  let delegatorOrganization = getDelegatorOrganization(delegatorId);
  delegatorOrganization.delegate = delegate.id
  delegatorOrganization.delegator = delegator.id
  delegatorOrganization.organization = organization.id
  delegatorOrganization.save();

  const delegateOrganizationId = `${delegate.id}-${organization.id}`;
  const delegateOrganization = getDelegateOrganization(delegateOrganizationId);
  let auxBalance = delegateOrganization.voteBalance === null ? BigInt.zero() : delegateOrganization.voteBalance!;

  delegateOrganization.voteBalance = event.params.delegatedAmount.plus(auxBalance);
  
  delegateOrganization.delegate = delegate.id;
  delegateOrganization.organization = organization.id;
  delegateOrganization.firstTokenDelegatedAt = getFirstTokenDelegatedAt(event, delegateOrganization);
  
  delegateOrganization.save()


  let delegation = new Delegation(`${delegatorId}-${event.params.trackId}`);
  delegation.delegator = delegatorOrganization.id;
  delegation.delegate = delegateOrganization.id;
  delegation.trackId = event.params.trackId;
  delegation.amount = event.params.delegatedAmount;
  delegation.timestamp = event.block.timestamp;
  delegation.conviction = event.params.conviction;
  delegation.status = true;
  delegation.save();
  
  let delegatingHistory = DelegatingHistory.load(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`)
  if(!delegatingHistory){
    delegatingHistory = new DelegatingHistory(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    delegatingHistory.daoName = organization.id;
    delegatingHistory.amount =  event.params.delegatedAmount;
    delegatingHistory.timestamp = event.block.timestamp;
    delegatingHistory.trackId = event.params.trackId;
  }
  delegatingHistory.conviction = event.params.conviction;
  delegatingHistory.fromDelegate = event.params.from.toHexString();
  delegatingHistory.toDelegate = event.params.to.toHexString();
  delegatingHistory.delegator = delegator.id;
  delegatingHistory.save();

  handleDelegateVotingPowerChange(
    event.transaction.hash.toHexString(),
    event.logIndex.toHexString(),
    auxBalance,
    delegateOrganization.voteBalance!,
    event.params.to.toHexString(),
    event.address.toHexString(),
    event.block.timestamp,
    event.block.number
    );
}

export function handleUndelegated(event: UndelegatedEvent): void {
  let delegator = User.load(event.params.caller.toHexString())
  if (!delegator) {
    delegator = new User(event.params.caller.toHexString())
    delegator.save();
  }

  let organization = getOrganization(daoName)
  const delegatorId = `${delegator.id}-${organization.id}`;


  let delegation = Delegation.load(`${delegatorId}-${event.params.trackId}`);
  if(delegation){
    
    const delegateOrganization = DelegateOrganization.load(delegation.delegate);
    if(delegateOrganization){
      let auxBalance = delegateOrganization.voteBalance === null ? BigInt.zero() : delegateOrganization.voteBalance!;
      delegateOrganization.voteBalance = delegateOrganization.voteBalance!.minus(delegation.amount!)
      delegateOrganization.save();


    handleDelegateVotingPowerChange(
      event.transaction.hash.toHexString(),
      event.logIndex.toHexString(),
      auxBalance,
      delegateOrganization.voteBalance!,
      delegateOrganization.delegate,
      event.address.toHexString(),
      event.block.timestamp,
      event.block.number
      );
    }

    store.remove("Delegation", `${delegatorId}-${event.params.trackId}`);
  }


  let entity = new UndelegatedHistory(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.trackId = event.params.trackId
  entity.delegator = event.params.caller
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

}

export function handleUnlocked(event: UnlockedEvent): void {
  let entity = new Unlocked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.trackId = event.params.trackId
  entity.caller = event.params.caller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteRemoved(event: VoteRemovedEvent): void {
  store.remove("Vote",  event.params.voter.toHexString() + event.params.pollIndex.toHexString());
  
  let entity = new VoteRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.voter = event.params.voter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteRemovedForTrack(
  event: VoteRemovedForTrackEvent
): void {
  store.remove("Vote",  event.params.voter.toHexString() + event.params.pollIndex.toHexString());
  

  let entity = new VoteRemovedForTrack(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.trackId = event.params.trackId
  entity.voter = event.params.voter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteRemovedOther(event: VoteRemovedOtherEvent): void {
  store.remove("Vote",  event.params.caller.toHexString() + event.params.pollIndex.toHexString());
  
  let entity = new VoteRemovedOther(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.caller = event.params.caller
  entity.target = event.params.target
  entity.trackId = event.params.trackId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteSplit(event: VoteSplitEvent): void {
  let entity = new VoteSplit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.voter = event.params.voter
  entity.aye = event.params.aye
  entity.nay = event.params.nay

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteSplitAbstained(event: VoteSplitAbstainedEvent): void {
  store.remove("VoteSplit",  event.params.voter.toHexString() + event.params.pollIndex.toHexString());
  
  let entity = new VoteSplitAbstained(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.voter = event.params.voter
  entity.aye = event.params.aye
  entity.nay = event.params.nay
  entity.abstain = event.params.abstain

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoted(event: VotedEvent): void {
  let organization = Organization.load(daoName)
  if(!organization){
    organization = new Organization(daoName)
  }
  organization.token = daoName
  organization.save()

  let vote = new Vote(
    event.params.voter.toHexString() + event.params.pollIndex.toHexString()
  );

  let delegate = new User(event.params.voter.toHexString())
  delegate.save();


  const delegateOrganizationId = `${delegate.id}-${organization.id}`;
  const delegateOrganization = getDelegateOrganization(delegateOrganizationId);
  delegateOrganization.voteBalance = BigInt.zero()
  delegateOrganization.delegate = delegate.id;
  delegateOrganization.organization = organization.id;
  delegateOrganization.firstTokenDelegatedAt = getFirstTokenDelegatedAt(event, delegateOrganization);
  delegateOrganization.save()


  const voteWeight = event.params.voteAmount;

  if (voteWeight && voteWeight.gt(new BigInt(0))) {
    vote.proposal = event.params.pollIndex.toHexString();
    vote.user = delegate.id;
    vote.support = event.params.aye === true ? 1 : 0;
    vote.weight = voteWeight;
    vote.reason = null;
    vote.timestamp = event.block.timestamp;
    vote.organization = organization.id;
    vote.conviction = event.params.conviction;
    vote.save();
  }
  


  // historic
  let entity = new Voted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pollIndex = event.params.pollIndex
  entity.voter = event.params.voter
  entity.aye = event.params.aye
  entity.voteAmount = event.params.voteAmount
  entity.conviction = event.params.conviction

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
