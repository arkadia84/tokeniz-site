# IG card renderer — Nifty Founder / Atomise (locked branding)

Fixed template; only the words change. 1080×1350 PNG (Instagram 4:5).

## Run (cloud session, fresh)
```
mkdir -p /tmp/igcard && cd /tmp/igcard
# fetch template.html + render.js from this artifact (Artifact read, paths)
npm init -y >/dev/null && npm i @fontsource/inter playwright-core >/dev/null
node render.js spec.json out.png
```
Chromium is at /opt/pw-browsers/chromium (already installed in cloud sessions).

## Spec (one JSON per card)
```
{"brand":"nifty"|"atomise",
 "variant":"headline"|"quote",
 "kicker":"THIS WEEK'S STORY",            // headline variant, optional
 "headline":"Plain words. *Blue words.*",  // *…* colours the accent words
 "sub":"One supporting sentence.",         // optional
 "quote":"…", "who":"Yacine Terai", "role":"The Nifty Founder", // quote variant
 "num":"№ 04"}                             // footer right, optional (issue number)
```
Headline ≤ 12 words. Sub ≤ 25 words. Quote ≤ 22 words. One accent phrase per card, never more.

## Then
Upload the PNG with blotato_create_presigned_upload_url → put the public URL in the Content Calendar row's Visual → schedule as usual.
Never call Canva generate-design for IG posts any more. Canva stays only for banners/one-offs Yacine asks for by hand.
