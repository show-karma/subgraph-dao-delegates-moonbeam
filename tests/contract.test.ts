import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Delegated } from "../generated/schema"
import { Delegated as DelegatedEvent } from "../generated/Contract/Contract"
import { handleDelegated } from "../src/contract"
import { createDelegatedEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let trackId = 123
    let from = Address.fromString("0x0000000000000000000000000000000000000001")
    let to = Address.fromString("0x0000000000000000000000000000000000000001")
    let delegatedAmount = BigInt.fromI32(234)
    let conviction = 123
    let newDelegatedEvent = createDelegatedEvent(
      trackId,
      from,
      to,
      delegatedAmount,
      conviction
    )
    handleDelegated(newDelegatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Delegated created and stored", () => {
    assert.entityCount("Delegated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Delegated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "trackId",
      "123"
    )
    assert.fieldEquals(
      "Delegated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "from",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Delegated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "to",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Delegated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "delegatedAmount",
      "234"
    )
    assert.fieldEquals(
      "Delegated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "conviction",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
