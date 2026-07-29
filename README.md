# FlowSpark v2 Segment Proof

A small Node.js proof-of-concept that sends web/app events into Segment and demonstrates anonymousId → userId identity stitching.

## What it does

- sends a `page_viewed` event with `anonymousId`
- sends an `identify` call to attach user traits to that anonymous session
- sends a `signup_completed` event with both `anonymousId` and `userId`
- sends a `login_completed` event with only `userId`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with your Segment source write key:

```env
SEGMENT_WRITE_KEY=your_segment_write_key
```

## Run

```bash
npm start
```

## Notes

- The script uses `axios`, `dotenv`, and `uuid`.
- It posts to the Segment HTTP API at `https://api.segment.io/v1`.
- Check Segment’s Source Debugger to confirm anonymous and user-tracked events.
