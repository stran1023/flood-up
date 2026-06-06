# Firebase Configuration

## Firestore indexes (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "geohash",   "order": "ASCENDING" },
        { "fieldPath": "status",    "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId",    "order": "ASCENDING" },
        { "fieldPath": "reportedAt","order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "homeGeohash", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy with: `firebase deploy --only firestore:indexes`

---

## Firestore security rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /reports/{reportId} {
      // Public read — anyone can view the live map
      allow read: if true;

      // Authenticated users can submit reports for themselves
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.depth in ['ankle','knee','waist','chest'];

      // Any authenticated user can upvote/downvote
      // Own report can update photoUrl
      allow update: if request.auth != null
        && (
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['upvotes', 'downvotes'])
          || resource.data.userId == request.auth.uid
        );

      // Deletion is reserved for Cloud Functions only
      allow delete: if false;
    }

    match /users/{userId} {
      // Users can read and write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // City authority dashboard can read any user document (for FCM token queries)
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'authority';
    }
  }
}
```

Deploy with: `firebase deploy --only firestore:rules`

---

## Environment variables

### `mobile/.env`

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY=
```

### `functions/.env`

```
ANTHROPIC_API_KEY=
GOOGLE_ROADS_API_KEY=
```

Do not commit either `.env` file. Add both to `.gitignore`.
