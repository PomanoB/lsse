/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE TABLE IF NOT EXISTS `lemms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `word` int(10) NOT NULL,
  `lemm` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `word` (`word`),
  KEY `lemm` (`lemm`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `models` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `words` int(11) NOT NULL DEFAULT '0',
  `relations` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `relations` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `word` int(10) NOT NULL,
  `model` int(10) NOT NULL,
  `relation` int(11) NOT NULL,
  `value` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `model` (`model`),
  KEY `word` (`word`),
  KEY `value` (`value`),
  KEY `relation` (`relation`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `words` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `word` varchar(400) NOT NULL,
  `lang` varchar(10) DEFAULT NULL,
  `frequency` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `word_lang` (`word`(255),`lang`),
  KEY `lang_word_freq` (`lang`,`word`(255),`frequency`)
) DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
