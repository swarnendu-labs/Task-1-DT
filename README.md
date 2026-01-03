# API Creation

Go through the documentation and create the API as instructed.  
**Frontend is not required** — you can demonstrate the API using **Postman**.

---

## Table 1: Event APIs

| Widget | Request Type | Base URL | API Endpoint | Payload | Description |
|------|-------------|----------|--------------|---------|-------------|
| Event | GET | `/api/v3/app` | `/events?id=:event_id` | `-` | Gets an event by its unique ID |
| Event | GET | `/api/v3/app` | `/events?type=latest&limit=5&page=1` | `-` | Gets events by recency and paginates results by page number and limit |
| Event | POST | `/api/v3/app` | `/events` | See payload below | Creates an event and returns the created event ID |
| Event | PUT | `/api/v3/app` | `/events/:id` | Same as POST payload | Updates an existing event |
| Event | DELETE | `/api/v3/app` | `/events/:id` | `-` | Deletes an event based on its unique ID |

---

## Object Data Model of an Event

```json
{
  "type": "event",
  "uid": 18,
  "name": "Name of the event",
  "tagline": "A proper tag-line for the event",
  "schedule": "Date + Time (Timestamp)",
  "description": "String",
  "files": "Image file (File upload)",
  "moderator": "User who is hosting the event",
  "category": "Category of the event",
  "sub_category": "Sub category",
  "rigor_rank": "Integer value",
  "attendees": ["Array of user IDs attending the event"]
}
