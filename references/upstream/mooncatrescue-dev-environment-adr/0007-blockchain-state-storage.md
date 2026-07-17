# 0007 - Blockchain state storage
**Updated:** 8 Apr 2023

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
Data stored on a blockchain is open and verifiable, but it is not fast. When storing large amounts of data, or needing to do complex queries on data from a blockchain, it is much more efficient to keep local copies of that data (a local cache) and update it periodically. The issue with a local cache of blockchain data is to then decide how frequently to update it. Periodically refreshing all the stored blockchain data is a simple method that ensures all the data is accurate up through the point of that refresh, but the amount of time a full refresh takes can be hours, and updates a lot of data that hasn’t been updated.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
In order to more intelligently decide if a bit of data needs to be updated, there’s two bits of additional metadata that SHALL be stored with the data value:

- **Modified Time** The most recent moment when the data changed to a new value.
- **Checked Time** The most recent moment in time the data was checked on the origin server to see if it has changed.

For all bits of data, the checked time MUST be the same as or more recent than the modified time. For data that changes infrequently (but is not static, so could still change), the modified time will likely be in the far past and the checked time can be a gauge of if it should be part of a manual check to see if an update has happened. Having each bit of data have its own storage of these two values means the data can be batch-updated (if there was just one checked time for the whole dataset, they would need to be all updated together, which is too time-intensive to be feasible).

For blockchain data, every time it’s modified can be able to be tracked back to a specific transaction when that state changed. So the data stored for the modified time SHALL be `txHash` (the hexadecimal hash identifier of the transaction), `blockHeight` (integer number identifying the block the transaction was included in), `timestamp` (date-time value that the block identifies it was issued at). Techncially the minimum data needed to identify the modified date is the transaction hash (there are common RPC functions for deriving the other data points from that key value), however the additional properties are included in this policy because they’re the most common data needed for querying the data, and they make it easier to do human introspection into the data.

For blockchain data, the checked time represents a moment in time in which an RPC call was made to an Ethereum node to see if there’s new data. The data the Ethereum node goes off of is the most recent block in the blockchain. So the checked time value SHOULD NOT just be a timestamp of the moment the client made the RPC call to the Ethereum node, but rather it SHOULD be the timestamp of the most-recent block the node has in storage. Hence, the data stored for the checked time SHALL be `blockHeight` (integer identifying the block the data was queried at), and `timestamp` (date-time value that the block identifies it was issued at).

To populate this data, querying different transactions is most effectively done by querying for Events/Logs. As long as the smart contract in question is coded to inclued appropriate Events, that method works for finding the source transaction that modified specific values. If for a certain bit of data it’s hard to query directly for the transaction that modified the value, the application MAY leave the modified time as undefined. If the modified time is undefined, the front-end application can tell the end user how fresh the data is (it’s accurate as of the checked time) at least. If for a certain bit of data it’s possible to move from a mutable to an immutable state (e.g. naming a MoonCat, or transferring a token to a “burn” address), the application MAY leave the checked time as undefined.

Here’s an example of this practice being used to track data about a specific MoonCat:

```json
{
  "id": "0x00d658d50b",
  "rescueOrder": 0,
  "owner": {
    "value": "0x5fcf881976edaf9faa5e9d7f2e08ee8afd163372",
    "modified": {
      "txHash": "0x4895555391b1d759986a2ca5b9ffccdac0c443c0a62995a0de89f816bd283609",
      "blockHeight": 15584227,
      "timestamp": "Sep-21-2022 08:49:35 PM +UTC"
    },
    "checked": {
      "blockHeight": 16763891,
      "timestamp": "Mar-05-2023 06:11:35 PM +UTC"
    }
  },
  "name": {
    "value": null,
    "checked": {
      "blockHeight": 16763891,
      "timestamp": "Mar-05-2023 06:11:35 PM +UTC"
    }
  },
  "totalAccessories": {
    "value": 12,
    "modified": {
      "txHash": "0x4314c1118c88aa01525e90ea97af7d82aadc8d7f740ba3f5cb2767e7bd14d159",
      "blockHeight": 15259687,
      "timestamp": "Aug-01-2022 11:43:42 PM +UTC"
    },
    "checked": {
      "blockHeight": 16763891,
      "timestamp": "Mar-05-2023 06:11:35 PM +UTC"
    }
  }
}
```

- The `owner`, `name`, and `totalAccessories` values are each blockchain-sourced data, and have independant `modified` and `checked` values.
- The `checked` time for all three of the blockchain-sourced data points in this example are the same, which indicates they were batch-updated together. But each of those values could be checked independently, and have a different `checked` time after that.
- The `name` value has currently not been set, so there is no `modified` propety for that value; it’s been the same since the contract was created and not changed up through the `checked` block.
- The `owner` and `totalAccessories` values have different `modified` transaction identifiers, as they point to the transactions that changed that specific value, not the transaction when any value on that MoonCat changed.

## Event identification
When tracking what things have changed, tracking it back to which thing/action changed it is important. Blocks, addresses, and transactions all have canonical hashes that uniquely identify them within a blockchain (and plus the chain ID from the blockchain, uniquely across multiple chains). The key blockchain entity that doesn’t have its own unique identifer is Events/Logs. Events have “topics” that they get searched on, and are part of a transaction (which has a unique hash), but one transaction can have many events fire. So, to uniquely identify an event, it needs to include the hash of the transaction and the order of the event. The core Ethereum Node specificaiton gives a `logIndex` property to each log object, which gives the order of the log within a block. Some Ethereum nodes also return a `transactionLogIndex` property which gives the order of each log event within the transaction it’s a part of. However, that being non-standard would make it hard to ensure was enumerated properly. Therefore, for events, a combination of their `logIndex` (position within block) and transaction hash (unique identifier of the transaction it’s a part of) SHALL be used to identify them. This guarantees uniqueness, and gives enough information to query the blockchain for more details about that event (`(await provider.getTransactionReceipt(EVENT_TX_HASH)).logs.find(l => l.logIndex == EVENT_LOGINDEX)`).
 

## Consequences
<!-- Outcomes, both positive and negative -->
Having every update-able bit of data have its own modified and checked times is a bit of data bloat. Transaction hashes are 32-byte values and need the largest amount of storage. The block heights and timestamps are smaller integers; including them is a balance between useful-ness for queries an avoiding further database storage bloat. While this additional storage need is measurable, it isn’t so big that it incurs excessive additional cost to cache.

Storing the transactions and blocks as the primary identifier of updates is generally specific-enough to know if a new bit of data comes before or after the already-stored data. However these is the rare case where two different transactions in the same block cause an update to the same bit of data, or even within a single transaction, the same data could get updated several times (the same event might be fired multiple times in the same transaction). The client application should discard any incoming data that has a block height smaller than what was already stored. But if the block height is equal-to the currently-stored block height, it’s the client’s responsibility to ensure it has all the data for that block, and ensure that what gets stored as the value for that bit of data is the value at the end of all the block’s transactions.