import { store } from '@graphprotocol/graph-ts'
import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated as DelegatedEvent,
  Undelegated as UndelegatedEvent,
  Proposed as ProposedEvent,
  Seconded as SecondedEvent,
  StandardVote as VoteEvent
} from "../generated/MonriverV1/MonriverV1"
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
  DelegateVotingPowerChange,
  Seconded,
  Proposal
} from "../generated/schema"
import { getDelegateOrganization } from "./shared/getDelegateOrganization";
import { getFirstTokenDelegatedAt } from "./shared/getFirstTokenDelegatedAt";
import { getOrganization } from "./shared/getOrganization";
import { getDelegatorOrganization } from "./shared/getDelegatorOrganization";
import { getUser } from './shared/getUser';
import { handleDelegateVotingPowerChange } from './shared/delegateVotingPowerChange';

const daoName = "moonbeam";

export function handleDelegated(event: DelegatedEvent): void {
  let organization = Organization.load(daoName)
  if(!organization){
    organization = new Organization(daoName)
  }
  organization.token = daoName
  organization.save()

  let delegate = new User(event.params.target.toHexString())
  delegate.save();

  let delegator = new User(event.params.who.toHexString())
  delegator.save();

  const delegatorId = `${delegator.id}-${organization.id}`;
  let delegatorOrganization = getDelegatorOrganization(delegatorId);
  delegatorOrganization.delegate = delegate.id
  delegatorOrganization.delegator = delegator.id
  delegatorOrganization.organization = organization.id
  delegatorOrganization.save();

  const delegateOrganizationId = `${delegate.id}-${organization.id}`;
  const delegateOrganization = getDelegateOrganization(delegateOrganizationId);

  delegateOrganization.voteBalance = BigInt.zero();
  
  delegateOrganization.delegate = delegate.id;
  delegateOrganization.organization = organization.id;
  delegateOrganization.firstTokenDelegatedAt = getFirstTokenDelegatedAt(event, delegateOrganization);
  
  delegateOrganization.save()


  let delegation = new Delegation(`${delegatorId}-governanceV1`);
  delegation.delegator = delegatorOrganization.id;
  delegation.delegate = delegateOrganization.id;
  delegation.trackId = -1;
  delegation.amount = BigInt.zero();
  delegation.timestamp = event.block.timestamp;
  delegation.status = true;
  delegation.save();
  
  let delegatingHistory = DelegatingHistory.load(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`)
  if(!delegatingHistory){
    delegatingHistory = new DelegatingHistory(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    delegatingHistory.daoName = organization.id;
    delegatingHistory.amount =  BigInt.zero();
    delegatingHistory.timestamp = event.block.timestamp;
    delegatingHistory.trackId = -1;
  }
  delegatingHistory.fromDelegate = null;
  delegatingHistory.toDelegate = event.params.target.toHexString();
  delegatingHistory.delegator = delegator.id;
  delegatingHistory.save();

  handleDelegateVotingPowerChange(
    event.transaction.hash.toHexString(),
    event.logIndex.toHexString(),
    BigInt.zero(),
    delegateOrganization.voteBalance!,
    event.params.target.toHexString(),
    event.address.toHexString(),
    event.block.timestamp,
    event.block.number
    );
}

export function handleUndelegated(event: UndelegatedEvent): void {
  let delegator = User.load(event.params.who.toHexString())
  if (!delegator) {
    delegator = new User(event.params.who.toHexString())
    delegator.save();
  }

  let organization = getOrganization(daoName)
  const delegatorId = `${delegator.id}-${organization.id}`;


  let delegation = Delegation.load(`${delegatorId}-governanceV1`);
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

    store.remove("Delegation", `${delegatorId}-governanceV1`);
  }


  let entity = new UndelegatedHistory(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.trackId = -1
  entity.delegator = event.params.who
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

}


export function handleStandardVote(event: VoteEvent): void {
  let organization = Organization.load(daoName)
  if(!organization){
    organization = new Organization(daoName)
  }
  organization.token = daoName
  organization.save()

  let vote = new Vote(
    event.params.voter.toHexString() + event.params.referendumIndex.toHexString()
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
    vote.proposal = `${event.params.referendumIndex.toHexString()}-governanceV1`;
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
  entity.pollIndex = event.params.referendumIndex
  entity.voter = event.params.voter
  entity.aye = event.params.aye
  entity.voteAmount = event.params.voteAmount
  entity.conviction = event.params.conviction

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposed(event: ProposedEvent): void {
  let entity = new Proposal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.deposit = event.params.deposit
  entity.proposalIndex = event.params.proposalIndex
  entity.save()
}


export function handleSeconded(event: SecondedEvent): void {
  let entity = new Seconded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.seconder = event.params.seconder.toHexString()
  entity.proposalIndex = event.params.proposalIndex
  entity.save()
}
