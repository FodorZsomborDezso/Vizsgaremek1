-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Gép: db:3306
-- Létrehozás ideje: 2026. Feb 23. 22:38
-- Kiszolgáló verziója: 8.0.45
-- PHP verzió: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `artisticeye_db`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(5, 'Design'),
(4, 'Digitális Art'),
(3, 'Tech'),
(1, 'Természet'),
(2, 'Város');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`) VALUES
(10, 11, 10, 'Ez gyönyörű lett! Milyen géppel fotóztad?', '2026-02-23 22:04:18'),
(11, 10, 10, 'Köszönöm Peti! Egy Sony A7III-mal készült, hajnal 5-kor. :)', '2026-02-23 22:04:18'),
(12, 10, 11, 'Wow, pont ilyesmire gondoltam! Zseniális a kék neon tükröződése a vízen.', '2026-02-23 22:04:18'),
(13, 12, 12, 'Nagyon letisztult setup. Gratula az új asztalhoz!', '2026-02-23 22:04:18');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ideas`
--

CREATE TABLE `ideas` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `ideas`
--

INSERT INTO `ideas` (`id`, `user_id`, `category_id`, `title`, `description`, `created_at`) VALUES
(1, 1, 2, 'Futurisztikus Budapest', 'Szeretnék egy képet a Lánchídról neon fényekben.', '2026-02-18 18:57:24'),
(2, 1, 4, 'Cyberpunk Szamuráj', 'Egy robotikus szamuráj a szakadó esőben.', '2026-02-18 18:57:24'),
(3, 1, 1, 'Békés Hegyi Tó', 'Nyugodt tó a hegyek között, naplementében.', '2026-02-18 18:57:24'),
(4, 7, 1, 'fdfd', 'fdfd', '2026-02-23 21:36:46'),
(10, 11, 3, 'Holografikus okosóra', 'Egy futurisztikus okosóra terve, ami a levegőbe vetíti a kijelzőt 3D-ben.', '2026-02-23 22:04:18'),
(11, 10, 2, 'Esős neon utca', 'Egy cyberpunk stílusú utcakép, pocsolyákban tükröződő neonfényekkel.', '2026-02-23 22:04:18'),
(12, 12, 5, 'Modern pékség arculat', 'Logó és színvilág egy új, kézműves pékségnek a belvárosban.', '2026-02-23 22:04:18');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `likes`
--

CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `likes`
--

INSERT INTO `likes` (`user_id`, `post_id`, `created_at`) VALUES
(7, 12, '2026-02-23 22:05:05'),
(10, 11, '2026-02-23 22:04:18'),
(10, 12, '2026-02-23 22:04:18'),
(11, 10, '2026-02-23 22:04:18'),
(11, 11, '2026-02-23 22:04:18'),
(12, 10, '2026-02-23 22:04:18'),
(12, 13, '2026-02-23 22:04:18');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `idea_id` int DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `category_id`, `idea_id`, `title`, `description`, `image_url`, `created_at`) VALUES
(7, 11, 1, 1, 'Melon', 'bru', 'http://localhost:3000/uploads/post-1771441075594.jpeg', '2026-02-18 18:57:55'),
(10, 10, 1, NULL, 'Ködös fenyves', 'Hajnali séta az erdőben. Nagyon misztikus volt a hangulat.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', '2026-02-23 22:04:18'),
(11, 12, 2, 11, 'Neon éjszaka', 'Itt a cyberpunk utcakép, amit kértél, Anna! Remélem tetszik a színvilág.', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d', '2026-02-23 22:04:18'),
(12, 11, 3, NULL, 'Cyber Setup', 'Az új munkaállomásom és a friss kódolós környezetem.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', '2026-02-23 22:04:18'),
(13, 10, 4, NULL, 'Absztrakt 3D', 'Blenderben készült kísérlet textúrákkal és fényekkel.', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853', '2026-02-23 22:04:18'),
(14, 7, 1, NULL, 'boti', 'sd', 'http://localhost:3000/uploads/post-1771885711792.jpeg', '2026-02-23 22:28:31');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `full_name` varchar(100) DEFAULT NULL,
  `bio` text,
  `avatar_url` varchar(255) DEFAULT 'https://via.placeholder.com/150',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`, `bio`, `avatar_url`, `created_at`) VALUES
(1, 'TesztUser', 'teszt@user.hu', 'hash123', 'user', 'Teszt Elek', NULL, 'https://via.placeholder.com/150', '2026-02-18 18:57:17'),
(7, 'zsonibi', 'fodorzsombi0606@gmail.com', '$2b$10$Vgkg77FrC2JtiYgR8QYXkeZRwa76xKp1lPB2chJw/9Bf5k3kUCK1e', 'user', NULL, NULL, 'https://ui-avatars.com/api/?name=zsonibi&background=random&color=fff&size=128', '2026-02-17 18:21:27'),
(8, 'botond', 'boti@cigany.ci', '$2b$10$6mCLurFeX8.pLCkWuDqZ7.n2.HUgfSPPkLNOQRBfgsNkw93OtT8VS', 'user', NULL, NULL, 'http://localhost:3000/uploads/1771356880616.png', '2026-02-17 19:34:40'),
(9, 'A7X', 'A@7.X', '$2b$10$AI3Ff.diK7Kz8cPfoI34w.4Wk2c5F8CzNIGsvcC6Frxh7jHQjua42', 'user', NULL, NULL, 'http://localhost:3000/uploads/user-1771359417412.jpeg', '2026-02-17 20:16:57'),
(10, 'KreativAnna', 'anna@teszt.hu', 'dummy_hash', 'user', 'Nagy Anna', 'Imádom a digitális művészetet és a természetet.', 'https://ui-avatars.com/api/?name=Anna&background=FF69B4&color=fff', '2026-02-23 22:04:18'),
(11, 'boti', 'bot@gmail.com', '$2b$10$lYbgzEUldMiOqh7OLdXLJOeasCCZwJIfdu.my9mED8eO7r/20IHBy', 'user', NULL, NULL, 'http://localhost:3000/uploads/user-1771440029771.jpeg', '2026-02-18 18:40:29'),
(12, 'DesignGuru', 'guru@teszt.hu', 'dummy_hash', 'user', 'Szabó Gábor', 'Minimalizmus mindenek felett.', 'https://ui-avatars.com/api/?name=Gabor&background=4CAF50&color=fff', '2026-02-23 22:04:18');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `ideas`
--
ALTER TABLE `ideas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- A tábla indexei `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_posts_ideas` (`idea_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT a táblához `ideas`
--
ALTER TABLE `ideas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT a táblához `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `ideas`
--
ALTER TABLE `ideas`
  ADD CONSTRAINT `ideas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ideas_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Megkötések a táblához `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_ideas` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
