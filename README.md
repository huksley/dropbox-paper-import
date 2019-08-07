# Import docs to Dropbox Paper

This home project imports notes.db SQLite3 db to Dropbox paper.
For example Xiaomi MIUI Notes app keeps docs in this format.

Run with

```
yarn
DROPBOX_ACCESS_TOKEN=token NOTE_DB=folder/note.db FOLDER_ID=<Paper-folder-id> node .
```

It creates docs in format `[id] YYYY-mm-dd doc contents...` so it can check which were already uploaded afterwards.
Run script multiple times to upload not yet uploaded documents.

## Bad experience with Dropbox Paper API

- API slow
- No way to filter by parent_folder_id
- No ID of document?!
- On creating document, API throws 500 Internal Server Error but still creates doc?!
- No declaration of API limits (requests/second)
- No way to set doc metadata
- No way to set title but somehow it is inferred?
- Downloading slow, list fetching slow
- After deleting docs from UI they are still available on API

## Bad experience with Dropbox Paper UI

- No import
- No export
- No way to delete multiple notes
- No way to move multiple notes to folder
- Archiving folder does not archive docs in it (At least it should ask!?)
- Slow
- Deleting slow
- Inconsistent behaviour for selecting multiple docs (Shift-click)
- Delete button unexpectedly disabled (You must be owner of folder) when autoselecting all docs in folder
- No keyboard navigation
