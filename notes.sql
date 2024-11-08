-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: mariadb1011.server798294.nazwa.pl:3306
-- Generation Time: Oct 07, 2024 at 06:42 PM
-- Server version: 10.11.6-MariaDB-log
-- PHP Version: 7.2.24-0ubuntu0.18.04.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `server798294_discord`
--

-- --------------------------------------------------------


-- --------------------------------------------------------

--
-- Table structure for table `notebooks`
--

CREATE TABLE `notebooks` (
  `id` varchar(36) NOT NULL,
  `name` varchar(40) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin2 COLLATE=latin2_general_ci;

--
-- Dumping data for table `notebooks`
--


-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` varchar(36) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `content` varchar(8000) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `date_updated` datetime DEFAULT NULL,
  `notebook` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin2 COLLATE=latin2_general_ci;

--
-- Dumping data for table `notes`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `reset_token_hash` varchar(64) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  `account_activation_hash` varchar(64) DEFAULT NULL,
  `cookie_token` varchar(64) DEFAULT NULL,
  `cookie_token_expiry` datetime DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `panel_hash` varchar(64) DEFAULT NULL,
  `ip_panel_access` varchar(16) DEFAULT NULL,
  `panel_expiry_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin2 COLLATE=latin2_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password_hash`, `reset_token_hash`, `reset_token_expires_at`, `account_activation_hash`, `cookie_token`, `cookie_token_expiry`, `is_admin`, `panel_hash`, `ip_panel_access`, `panel_expiry_date`) VALUES
(199, 'admin', 'admin@gmail.com', '$2y$10$kFxbHTreoQFCpjf7NwtNbeP8lOYX676j2zZXKQOuXYCytSwU2Ub8O', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);

--
-- Indexes for dumped tables
-

--
-- Indexes for table `notebooks`
--
ALTER TABLE `notebooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`user_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notes_ibfk_1` (`notebook`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `reset_token_hash` (`reset_token_hash`),
  ADD UNIQUE KEY `account_activation_hash` (`account_activation_hash`),
  ADD UNIQUE KEY `cookie_token` (`cookie_token`),
  ADD UNIQUE KEY `panel_hash` (`panel_hash`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notebooks`
--
ALTER TABLE `notebooks`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`notebook`) REFERENCES `notebooks` (`id`) ON DELETE CASCADE;
COMMIT;
