-- Create the database (run this first if it doesn't exist)
-- CREATE DATABASE IF NOT EXISTS project_brainstormer;
-- USE project_brainstormer;

-- Create project_ideas table
CREATE TABLE IF NOT EXISTS project_ideas (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority ENUM('High', 'Medium', 'Low') DEFAULT NULL,
  effort ENUM('High', 'Medium', 'Low') DEFAULT NULL,
  impact ENUM('High', 'Medium', 'Low') DEFAULT NULL,
  elaboration JSON DEFAULT NULL,
  context JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
