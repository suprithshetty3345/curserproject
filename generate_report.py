from pymongo import MongoClient
import pandas as pd

# ✅ Connect to MongoDB (local)
client = MongoClient("mongodb://localhost:27017/bookingDb")
db = client["bookingDb"]
collection = db["bookings"]

# ✅ Fetch documents
data = list(collection.find())
print("Documents fetched:", len(data))  # Debugging print

# ✅ Format data
filtered_data = []
for doc in data:
    filtered_data.append({
        "Booking ID": doc.get("bookingId"),
        "User Email": doc.get("userEmail"),
        "Resource ID": doc.get("resourceId"),
        "Date": doc.get("date"),
        "Time": doc.get("time"),
        "Duration (hrs)": doc.get("duration"),
        "Purpose": doc.get("purpose"),
        "Attendees": doc.get("attendees"),
        "Status": doc.get("status"),
        "Created At": doc.get("createdAt"),
    })

print("Filtered rows:", len(filtered_data))  # Debugging print

# ✅ Save to Excel
df = pd.DataFrame(filtered_data)
df.to_excel("booking_report.xlsx", index=False)
print("✅ booking_report.xlsx generated successfully!")
