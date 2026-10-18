import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ss-pick-abstraction",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "concept",
      section: "three-storage-abstractions-and-the-one-you-should-default-to",
      kind: "single",
      prompt:
        "<p>A photo app saves each user upload once. Every file is later fetched whole over HTTP, usually through a CDN, and is never edited in place. Nothing in the product needs a directory tree or file locking. Which storage abstraction fits these access properties best?</p>",
      choices: [
        {
          id: "a",
          text: "Block volumes attached to the app servers, because uploads need fast random writes.",
          why: "Block storage is a device normally attached to one machine, and its strength is random read and write at any offset. These files are written once and read whole, so you would pay for latency you do not use and would still have to share the data across the fleet.",
        },
        {
          id: "b",
          text: "A managed network file share mounted by every app server, so all of them see the same files.",
          why: "A shared file system gives you a directory hierarchy, random writes and locking, which this product does not need. It typically costs roughly an order of magnitude more per GB than object storage, and metadata operations slow down as it grows.",
        },
        {
          id: "c",
          text: "A BLOB column in the relational database, so a file and its metadata commit together.",
          why: "The shared transaction is real, but blobs in the database crowd out hot pages, inflate backups and replication traffic, and pass every byte through the connection pool. A CDN could front an HTTP endpoint, but every cache miss still reads the bytes out of the database.",
        },
        {
          id: "d",
          text: "Object storage, because each file is written whole and read whole over HTTP.",
          why: "Object storage holds an immutable blob plus metadata behind HTTP GET and PUT, with a flat namespace and no practical size ceiling. That matches whole-file, write-once access, and it is the cheapest of the three per GB.",
        },
      ],
      answer: "d",
    },
    {
      id: "ss-delete-vs-durability",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "diagnose",
      section: "why-object-storage-is-the-default-and-what-the-durability-nu",
      kind: "single",
      prompt:
        "<p>A cleanup job with a bug deletes every object under one prefix of a bucket. The storage class is designed for eleven nines of durability, but versioning and Object Lock were both off. The team asks why that durability figure did not protect them. Which explanation is right?</p>",
      choices: [
        {
          id: "a",
          text: "The figure is only a design target, so losing objects on this scale was statistically expected.",
          why: "A design target of eleven nines does imply that hardware losses are vanishingly rare, so this scale of loss would not be expected from failures. The objects were removed by a valid delete request, which is a different cause.",
        },
        {
          id: "b",
          text: "Availability is only 99.99%, so a design with more nines of availability would have refused the delete.",
          why: "Availability is the chance that requests succeed. A more available service carries out a valid delete more reliably, not less, so adding nines of availability cannot stop it.",
        },
        {
          id: "c",
          text: "Durability covers hardware loss, not valid requests; versioning or Object Lock would have kept it.",
          why: "Durability is about the bytes surviving device and facility failures. A delete from an authorised caller is carried out faithfully, so recovery needs versioning, Object Lock or a separate protected copy such as replication to another account.",
        },
        {
          id: "d",
          text: "Strong consistency applied the delete to every copy at once, so no replica could still hold the data.",
          why: "Consistency describes what a read returns after a write. Internal redundancy exists for hardware failures, and the service does not expose old copies as a backup once a delete is accepted, so it cannot be relied on to undo one.",
        },
      ],
      answer: "c",
    },
    {
      id: "ss-uploads-through-api",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "diagnose",
      section: "presigned-urls-get-your-app-servers-out-of-the-byte-path",
      kind: "single",
      prompt:
        "<p>A photo API accepts uploads as POST requests to its app servers, which stream each file on to object storage. Autoscaling now follows upload volume rather than request volume, and clients on slow mobile connections each hold a worker for minutes. Which change removes the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Issue presigned URLs and let clients PUT directly to the bucket.",
          why: "The cause is that every byte crosses the app tier. With a presigned URL the client sends the file straight to storage, and the app server handles only a few small JSON calls per upload whatever the file size.",
        },
        {
          id: "b",
          text: "Move to larger app instances so each one can hold more concurrent uploads.",
          why: "Larger instances make the same mistake bigger. The bytes still pass through the app tier and use its bandwidth twice, and slow clients still occupy slots for as long as they are connected.",
        },
        {
          id: "c",
          text: "Put a CDN in front of the API so uploads are cached at the edge.",
          why: "A CDN caches responses to repeated reads. An upload is a unique write, so there is nothing to serve from cache, and the bytes still have to reach the origin.",
        },
        {
          id: "d",
          text: "Buffer each upload on local disk first, then queue the copy to storage.",
          why: "This moves the wait but not the load. The app server still receives every byte over a connection held by the slow client, and now also spends disk and a second transfer on it.",
        },
      ],
      answer: "a",
    },
    {
      id: "ss-multipart-part-size",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "estimate",
      section: "large-media-chunked-resumable-and-parallel",
      kind: "single",
      prompt:
        "<p>A client must upload one 2 TiB object with S3 multipart upload. A multipart upload allows at most 10,000 parts, each between 5 MiB and 5 GiB. The client will use equal-size parts, except that the last part may be smaller. Taking 1 TiB as 1,048,576 MiB, what is the smallest whole-MiB part size that works?</p>",
      choices: [
        {
          id: "a",
          text: "5 MiB",
          why: "5 MiB is the smallest part size allowed, but 10,000 parts of 5 MiB cover only 50,000 MiB, about 49 GiB. The part-count cap forces much larger parts for a 2 TiB object.",
        },
        {
          id: "b",
          text: "210 MiB",
          why: "2 TiB is 2,097,152 MiB. Dividing by 10,000 parts gives 209.7 MiB, and the next whole MiB is 210. At 209 MiB the 10,000 parts would total 2,090,000 MiB, which falls short.",
        },
        {
          id: "c",
          text: "21 MiB",
          why: "This is off by a factor of ten, as if 100,000 parts were allowed. At 21 MiB the 10,000 parts cover only 210,000 MiB, about a tenth of the object.",
        },
        {
          id: "d",
          text: "2,098 MiB",
          why: "This is the answer for about 1,000 parts, another factor-of-ten slip. It would work, since it is within the 5 GiB limit, but it is not the smallest part size that does.",
        },
      ],
      answer: "b",
    },
    {
      id: "ss-tiering-saving",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "estimate",
      section: "hot-warm-cold-tiering-and-what-it-actually-saves",
      kind: "single",
      prompt:
        "<p>A bucket holds 200 TB of user media, taken as 200,000 GB, and 90% of it is rarely read. Assume Standard storage costs $0.023 per GB-month and a colder tier costs $0.004 per GB-month. Ignore retrieval, transition and minimum-duration charges. How much does moving the rarely read 90% to the colder tier save per month?</p>",
      choices: [
        {
          id: "a",
          text: "$720 a month",
          why: "$720 is what the cold 180,000 GB costs to keep in the colder tier (180,000 × $0.004). That is the new cost of those objects, not what you save.",
        },
        {
          id: "b",
          text: "$4,140 a month",
          why: "$4,140 is what the cold 180,000 GB costs in Standard (180,000 × $0.023). Moving them still costs $720 in the colder tier, so the saving is smaller than this.",
        },
        {
          id: "c",
          text: "$1,180 a month",
          why: "$1,180 is the whole bucket's bill after the move: 20,000 GB × $0.023 plus 180,000 GB × $0.004. The saving is the difference from the old bill, not the new bill.",
        },
        {
          id: "d",
          text: "$3,420 a month",
          why: "The moved data saves the price difference of $0.019 per GB-month across 180,000 GB, which is $3,420. The bill falls from $4,600 to $1,180.",
        },
      ],
      answer: "d",
    },
    {
      id: "ss-blobs-in-the-database",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "tradeoff",
      section: "where-not-to-put-blobs-your-relational-database",
      kind: "multi",
      prompt:
        "<p>A team stores 2 MB product images in a PostgreSQL <code>BYTEA</code> column so that images and product rows live in one transactional store. The image volume is heading towards several terabytes. Select every problem that this choice causes.</p>",
      choices: [
        {
          id: "a",
          text: "Image reads that reach the database leave through its connection pool, competing with ordinary queries for slots.",
          why: "Without a cache in front, the bytes come out through the connection pool. Large reads occupy connections that real queries need.",
        },
        {
          id: "b",
          text: "Every image write is carried in the replication stream to each replica.",
          why: "Blob bytes ride the same stream that carries all other changes, and replication lag is what governs how stale replica reads are. Heavy blob traffic in that channel makes the lag worse.",
        },
        {
          id: "c",
          text: "Backups and restores grow with the image volume, which stretches recovery time.",
          why: "A database that carries terabytes of images takes far longer to back up and restore than one holding only rows. The recovery time objective quietly becomes hours.",
        },
        {
          id: "d",
          text: "PostgreSQL rejects any single value above 1 MB, so 2 MB images cannot be stored at all.",
          why: "PostgreSQL allows a single value of up to 1 GB, so a 2 MB image fits. The trouble is the load and cost of many large values, not a hard size limit on one.",
        },
        {
          id: "e",
          text: "The image and its metadata row can no longer be committed together in one transaction.",
          why: "This has it backwards. Keeping both in the database is what gives you one transaction. It is the split design, with the blob in object storage, that loses atomicity and needs a pending state and an orphan sweep.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "ss-upload-finish-order",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "sequence",
      section: "presigned-urls-get-your-app-servers-out-of-the-byte-path",
      kind: "order",
      prompt:
        "<p>In the chapter's presigned-upload design, the storage layer, not the client, moves a pending upload to ready. Starting from the moment the file's last bytes reach the bucket, put these steps in the order the chapter gives them. The row becomes ready only after the checks pass.</p>",
      items: [
        { id: "event", text: "The storage layer emits an object-created event onto a queue" },
        { id: "scan", text: "A worker consumes the event, then verifies and scans the object" },
        { id: "ready", text: "The worker flips the metadata row from pending to ready" },
      ],
      why: "The event can only fire once the object exists, and the worker acts on the event, and the checks must finish before the row becomes ready, because ready is what makes the file visible to anyone. Driving the change from the storage event instead of a client call also stops a buggy client from marking a missing object as ready.",
    },
    {
      id: "ss-create-if-absent",
      chapter: "sysdes-storage-systems",
      level: "intermediate",
      skill: "tradeoff",
      section: "why-object-storage-is-the-default-and-what-the-durability-nu",
      kind: "single",
      prompt:
        "<p>Two workers may try at the same moment to create the S3 object <code>reports/2026-10.json</code>. Exactly one must create it, and the other must learn that it lost, with no extra coordination service. Which approach does that?</p>",
      choices: [
        {
          id: "a",
          text: "PUT with <code>If-None-Match: *</code>, and treat a 412 response as meaning the other worker won.",
          why: "S3 evaluates the condition as part of the write, so only one create succeeds and the other is rejected with 412 Precondition Failed. If two requests collide mid-upload S3 can answer 409 instead, and the loser retries and then gets its 412. That is a compare-and-set on a single key.",
        },
        {
          id: "b",
          text: "HEAD the key first and PUT only if it is missing, trusting strong consistency to keep the check accurate.",
          why: "Strong consistency makes each HEAD accurate at that instant, but a check followed by a write is not atomic. Both workers can see the key missing, both write, and the later write silently replaces the first.",
        },
        {
          id: "c",
          text: "Turn on versioning, so both writes are kept and a reader chooses the winner later.",
          why: "Versioning keeps both versions, but both PUT calls succeed, so neither worker learns that it lost. It protects the data from being overwritten without deciding who created the object first.",
        },
        {
          id: "d",
          text: "PUT with <code>If-Match</code> and an ETag, since that condition also works on a key that does not exist.",
          why: "<code>If-Match</code> succeeds only when the existing object's ETag matches, so it is for overwriting an object that has not changed. On a key that does not exist yet, the write fails rather than creating it.",
        },
      ],
      answer: "a",
    },
  ],
};
