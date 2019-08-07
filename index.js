const sqlite3 = require("sqlite3").verbose();
const Dropbox = require("dropbox").Dropbox;
const fetch = require('isomorphic-fetch');
const moment = require("moment");
const sleep = require('sleep');

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch
})

fetchMoreDocs = async (docIds, l, fetchMoreDocs) => {
  docIds = docIds.concat(l.doc_ids);
  console.info("Paper docs fetched batch", l.doc_ids.length);
  if (l.has_more) {
    return dbx.paperDocsListContinue({ cursor: l.cursor.value })
      .then(n => fetchMoreDocs(docIds, n, fetchMoreDocs))
      .catch(err => {
        console.warn("Failed to fetch more docs", err); 
        return Promise.reject(err);
      })
  } else {
    return Promise.resolve(docIds);
  }
}

main = async () => {
  const docs = 
    await dbx.paperDocsList({ limit: 1000 })
    .then(l => fetchMoreDocs([], l, fetchMoreDocs))
    .catch(err => console.warn("Failed to fetch doc list", er))
    .then(docs => {
      return Promise.all(
        docs.map(id => dbx.paperDocsDownload({
          doc_id: id,
          export_format: "markdown"
        })
          .then(doc => { 
            console.info("Doc " + id + " " + doc.title, doc)
            return Promise.resolve(doc);
          })
          .catch(err => {
            console.warn("Failed to download " + id, err);
            return Promise.reject(err); 
          })
        )
      )
    })

  console.info("Existing docs", docs.length);
  const existing = {};
  for (let i = 0; i < docs.length; i++) {
    const title = docs[i].title;
    const m = title.match(/^\[([0-9]+)\] .*/)
    if (m) {
      const id = parseInt(m[1], 10)
      existing[id] = docs[i];
    } else {
      // console.warn("No id" + docs[i].title)
    }
  }

  const db = new sqlite3.Database(process.env.NOTE_DB);
  db.serialize(() => {
    db.each("select * from note", async (err, row) => {
      if (row._id >= 0 && existing[row._id] === undefined) {
        await dbx.paperDocsCreate({
          contents: "[" + row._id + "] " + moment(row.modified_date).format("YYYY-MM-DD") + " " + row.snippet,
          import_format: "plain_text",
          parent_folder_id: process.env.FOLDER_ID
        }).then(r => {
          console.info("Created " + row._id);
        }).catch(err => {
          /// FFS gives 500 Internal Server Error but still creates a note?
          console.warn("Failed to create " + row._id);
        })
      } else {
        console.info("Skipping creating " + row._id);
      }
    })
  })
  db.close();
}

  main();