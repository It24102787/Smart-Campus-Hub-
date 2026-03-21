INSERT INTO study_rooms (
  room_name, building, floor, zone, capacity, status, description, image_url, qr_code_value, created_at, updated_at
)
SELECT 'Library Room 1', 'Library', '1', 'Library District', 6, 'AVAILABLE',
       'Quiet study room near the reference section.',
       'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=900',
       'QR-LIB-RM1', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM study_rooms WHERE qr_code_value = 'QR-LIB-RM1');

INSERT INTO study_rooms (
  room_name, building, floor, zone, capacity, status, description, image_url, qr_code_value, created_at, updated_at
)
SELECT 'Silent Pod A', 'Library', '3', 'Library District', 1, 'AVAILABLE',
       'Single-person silent pod with noise isolation.',
       'https://images.unsplash.com/photo-1517504734587-2890819debab?auto=format&fit=crop&q=80&w=900',
       'QR-LIB-POD-A', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM study_rooms WHERE qr_code_value = 'QR-LIB-POD-A');

INSERT INTO study_rooms (
  room_name, building, floor, zone, capacity, status, description, image_url, qr_code_value, created_at, updated_at
)
SELECT 'Group Room B', 'IT Center', '2', 'Tech Hub', 10, 'AVAILABLE',
       'Collaborative room with whiteboard and display.',
       'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=900',
       'QR-IT-GRB', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM study_rooms WHERE qr_code_value = 'QR-IT-GRB');

INSERT INTO study_rooms (
  room_name, building, floor, zone, capacity, status, description, image_url, qr_code_value, created_at, updated_at
)
SELECT 'New Building Room 101', 'New Building', '1', 'Innovation Wing', 8, 'AVAILABLE',
       'Bright room with natural light and charging ports.',
       'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=900',
       'QR-NB-101', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM study_rooms WHERE qr_code_value = 'QR-NB-101');

INSERT INTO study_rooms (
  room_name, building, floor, zone, capacity, status, description, image_url, qr_code_value, created_at, updated_at
)
SELECT 'Main Building Room 202', 'Main Building', '2', 'Main Hall', 12, 'MAINTENANCE',
       'Large room for team sessions (currently under maintenance).',
       'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900',
       'QR-MB-202', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM study_rooms WHERE qr_code_value = 'QR-MB-202');
