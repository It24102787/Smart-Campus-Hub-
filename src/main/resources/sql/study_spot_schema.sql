CREATE TABLE IF NOT EXISTS study_rooms (
  id BIGINT NOT NULL AUTO_INCREMENT,
  room_name VARCHAR(120) NOT NULL,
  building VARCHAR(120) NOT NULL,
  floor VARCHAR(40) NOT NULL,
  zone VARCHAR(80) NOT NULL,
  capacity INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  description VARCHAR(500),
  image_url VARCHAR(500),
  qr_code_value VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_study_room_qr_code (qr_code_value)
);

CREATE TABLE IF NOT EXISTS study_reservations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(100) NOT NULL,
  room_id BIGINT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_study_reservation_room_date (room_id, date),
  KEY idx_study_reservation_user (user_id),
  CONSTRAINT fk_study_reservation_room FOREIGN KEY (room_id) REFERENCES study_rooms (id)
);
