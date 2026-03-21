# Smart Campus MongoDB Schema

## students
- id
- studentId
- name
- email
- cardUid
- faculty
- status (`ACTIVE`, `INACTIVE`)

## study_rooms
- id
- name
- roomName
- building
- floor
- zone
- capacity
- currentOccupancy
- temperature
- occupancyPercent
- status (`AVAILABLE`, `ACTIVE`, `NEARLY_FULL`, `FULL`, `MAINTENANCE`)
- deviceId
- sensorDeviceId
- qrCodeValue
- description
- imageUrl
- createdAt
- updatedAt

## room_bookings
- id
- studentId
- studentName
- studentEmail
- roomId
- roomName
- bookingDate
- startTime
- endTime
- status (`BOOKED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
- checkInTime (optional)
- checkOutTime (optional)
- source (`APP`, `CARD_TAP`)
- createdAt
- updatedAt

## tap_logs
- id
- studentId
- cardUid
- deviceId
- roomId
- action (`CHECK_IN`, `CHECK_OUT`)
- timestamp

## environment_readings
- id
- roomId
- sensorDeviceId
- temperature
- occupancyCount
- occupancyPercent
- recordedAt

## student_presence
- id
- studentId
- roomId
- enteredAt
