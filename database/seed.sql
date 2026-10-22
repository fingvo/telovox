-- ============================================================================
-- Project: Telovox - Open Source AI Telephony & Calling Automation Platform
-- Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
-- Copyright: (c) 2026 Fingvo. All rights reserved.
-- License: MIT License
-- ============================================================================
-- Description: Production seed data for Telovox Platform.
-- ============================================================================

USE `telovox_db`;

-- Seed 1: Dental Clinic Appointment Booking Agent
INSERT INTO `agents` (
    `id`, `name`, `system_prompt`, `voice_id`, `voice_provider`, `language`, `temperature`, `first_message`, `max_call_duration_sec`, `is_active`
) VALUES (
    'agent-dental-01',
    'Apex Dental Clinic Scheduler',
    'You are Sarah, a warm, professional front-desk coordinator for Apex Dental Clinic. Your job is to answer inquiries, verify patient insurance provider, and schedule appointment slots. Always speak concisely and confirm appointment date and time before ending the call.',
    'sonic-english',
    'cartesia',
    'en-US',
    0.65,
    'Hello! Thank you for calling Apex Dental Clinic. My name is Sarah. How can I help you today?',
    480,
    1
) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed 2: Agent Tools for Apex Dental
INSERT INTO `agent_tools` (
    `id`, `agent_id`, `name`, `description`, `parameters_schema`, `webhook_url`, `method`, `is_active`
) VALUES (
    'tool-book-apt-01',
    'agent-dental-01',
    'check_and_book_slot',
    'Checks dentist availability for a given date and reserves the appointment time.',
    '{"type": "object", "properties": {"patient_name": {"type": "string"}, "preferred_date": {"type": "string"}, "service_type": {"type": "string", "enum": ["cleaning", "checkup", "whitening", "emergency"]}}, "required": ["patient_name", "preferred_date"]}',
    'https://api.apexdental.com/v1/appointments',
    'POST',
    1
) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
