-- ============================================================================
-- Project: Telovox - Open Source AI Telephony & Calling Automation Platform
-- Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
-- Copyright: (c) 2026 Fingvo. All rights reserved.
-- License: MIT License
-- ============================================================================
-- Description: MySQL Database Schema definition for Telovox Platform.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `telovox_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `telovox_db`;

-- 1. AI Agents Configuration Table
CREATE TABLE IF NOT EXISTS `agents` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `system_prompt` TEXT NOT NULL,
    `voice_id` VARCHAR(100) NOT NULL DEFAULT 'sonic-english',
    `voice_provider` ENUM('cartesia', 'elevenlabs', 'deepgram', 'custom') NOT NULL DEFAULT 'cartesia',
    `language` VARCHAR(10) NOT NULL DEFAULT 'en-US',
    `temperature` DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    `first_message` VARCHAR(500) NOT NULL,
    `max_call_duration_sec` INT UNSIGNED NOT NULL DEFAULT 600,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_agents_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Outbound Calling Campaigns
CREATE TABLE IF NOT EXISTS `campaigns` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `agent_id` VARCHAR(36) NOT NULL,
    `status` ENUM('draft', 'running', 'paused', 'completed') NOT NULL DEFAULT 'draft',
    `concurrency_limit` INT UNSIGNED NOT NULL DEFAULT 5,
    `total_leads` INT UNSIGNED NOT NULL DEFAULT 0,
    `completed_leads` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Campaign Leads Target Phone List
CREATE TABLE IF NOT EXISTS `leads` (
    `id` VARCHAR(36) PRIMARY KEY,
    `campaign_id` VARCHAR(36) NOT NULL,
    `phone_number` VARCHAR(32) NOT NULL,
    `customer_name` VARCHAR(120),
    `metadata` JSON,
    `status` ENUM('pending', 'in_progress', 'completed', 'failed', 'busy', 'no_answer') NOT NULL DEFAULT 'pending',
    `retry_count` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `last_called_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
    INDEX `idx_leads_campaign_status` (`campaign_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Call Logs & Session Telemetry
CREATE TABLE IF NOT EXISTS `call_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `call_sid` VARCHAR(100) UNIQUE,
    `agent_id` VARCHAR(36) NOT NULL,
    `campaign_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NULL,
    `direction` ENUM('inbound', 'outbound') NOT NULL,
    `caller_number` VARCHAR(32) NOT NULL,
    `recipient_number` VARCHAR(32) NOT NULL,
    `status` ENUM('queued', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer') NOT NULL DEFAULT 'queued',
    `duration_seconds` INT UNSIGNED NOT NULL DEFAULT 0,
    `cost_cents` INT UNSIGNED NOT NULL DEFAULT 0,
    `disconnect_reason` VARCHAR(100),
    `recording_url` VARCHAR(500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ended_at` TIMESTAMP NULL,
    FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE,
    INDEX `idx_call_status` (`status`),
    INDEX `idx_call_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Turn-by-Turn Audio Transcripts
CREATE TABLE IF NOT EXISTS `call_transcripts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `call_id` VARCHAR(36) NOT NULL,
    `speaker` ENUM('user', 'agent', 'system') NOT NULL,
    `text` TEXT NOT NULL,
    `latency_ms` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`call_id`) REFERENCES `call_logs`(`id`) ON DELETE CASCADE,
    INDEX `idx_transcripts_call` (`call_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Dynamic Agent Function Calling & Webhook Automations
CREATE TABLE IF NOT EXISTS `agent_tools` (
    `id` VARCHAR(36) PRIMARY KEY,
    `agent_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `parameters_schema` JSON NOT NULL,
    `webhook_url` VARCHAR(500) NOT NULL,
    `method` ENUM('GET', 'POST', 'PUT', 'DELETE') NOT NULL DEFAULT 'POST',
    `headers` JSON NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE,
    INDEX `idx_tools_agent` (`agent_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
