-- MySQL dump 10.13  Distrib 5.5.46, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: modw_supremm
-- ------------------------------------------------------
-- Server version	5.5.46-0ubuntu0.14.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `modw_supremm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `modw_supremm` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;

USE `modw_supremm`;

--
-- Table structure for table `catastrophe_buckets`
--

DROP TABLE IF EXISTS `catastrophe_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `catastrophe_buckets` (
  `id` int(11) NOT NULL,
  `min` double NOT NULL,
  `max` double NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catastrophe_buckets`
--

LOCK TABLES `catastrophe_buckets` WRITE;
/*!40000 ALTER TABLE `catastrophe_buckets` DISABLE KEYS */;
INSERT INTO `catastrophe_buckets` VALUES (1,-0.1,0.0001,'&lt; 0.0001'),(2,0.0001,0.001,'0.0001 - 0.001'),(3,0.001,0.01,'0.001 - 0.01'),(4,0.01,0.1,'0.01 - 0.1'),(5,0.1,0.5,'0.1 - 0.5'),(6,0.5,1,'0.5 - 1.0'),(7,1,1.5,'1.0 - 1.5'),(8,1.5,10000000,'&gt; 1.5'),(9,-100000000,-0.1,'NA');
/*!40000 ALTER TABLE `catastrophe_buckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpibuckets`
--

DROP TABLE IF EXISTS `cpibuckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpibuckets` (
  `id` int(11) NOT NULL,
  `min_cpi` double DEFAULT NULL,
  `max_cpi` double DEFAULT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpibuckets`
--

LOCK TABLES `cpibuckets` WRITE;
/*!40000 ALTER TABLE `cpibuckets` DISABLE KEYS */;
INSERT INTO `cpibuckets` VALUES (1,-10000000000,0,'NA'),(2,0,0.4,'&lt; 0.4'),(3,0.4,0.5,'0.4 - 0.5'),(4,0.5,0.6,'0.5 - 0.6'),(5,0.6,0.7,'0.6 - 0.7'),(6,0.7,0.8,'0.7 - 0.8'),(7,0.8,0.9,'0.8 - 0.9'),(8,0.9,1,'0.9 - 1.0'),(9,1,1.1,'1.0 - 1.1'),(10,1.1,1.2,'1.1 - 1.2'),(11,1.2,10000000000,'&gt; 1.2');
/*!40000 ALTER TABLE `cpibuckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpu_user_cv_buckets`
--

DROP TABLE IF EXISTS `cpu_user_cv_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpu_user_cv_buckets` (
  `id` int(11) NOT NULL,
  `min` float NOT NULL,
  `max` float NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpu_user_cv_buckets`
--

LOCK TABLES `cpu_user_cv_buckets` WRITE;
/*!40000 ALTER TABLE `cpu_user_cv_buckets` DISABLE KEYS */;
INSERT INTO `cpu_user_cv_buckets` VALUES (0,-1000000,0,'NA'),(1,0,0.1,'&lt; 0.1'),(2,0.1,0.2,'0.1 - 0.2'),(3,0.2,0.4,'0.2 - 0.4'),(4,0.4,0.8,'0.4 - 0.8'),(5,0.8,1.6,'0.8 - 1.6'),(6,1.6,3.2,'1.6 - 3.2'),(7,3.2,6.4,'3.2 - 6.4'),(8,6.4,10000000,'&gt; 6.4');
/*!40000 ALTER TABLE `cpu_user_cv_buckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log2scale_buckets`
--

DROP TABLE IF EXISTS `log2scale_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log2scale_buckets` (
  `id` int(11) NOT NULL,
  `min` float NOT NULL,
  `max` float NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log2scale_buckets`
--

LOCK TABLES `log2scale_buckets` WRITE;
/*!40000 ALTER TABLE `log2scale_buckets` DISABLE KEYS */;
INSERT INTO `log2scale_buckets` VALUES (1,-3.40282e38,0,'NA'),(2,0,1048580,'&lt; 1Mi'),(3,1048580,2097150,'1Mi - 2Mi'),(4,2097150,4194300,'2Mi - 4Mi'),(5,4194300,8388610,'4Mi - 8Mi'),(6,8388610,16777200,'8Mi - 16Mi'),(7,16777200,33554400,'16Mi - 32Mi'),(8,33554400,67108900,'32Mi - 64Mi'),(9,67108900,134218000,'64Mi - 128Mi'),(10,134218000,268435000,'128Mi - 256Mi'),(11,268435000,536871000,'256Mi - 512Mi'),(12,536871000,1073740000,'512Mi - 1Gi'),(13,1073740000,2147480000,'1Gi - 2Gi'),(14,2147480000,4294970000,'2Gi - 4Gi'),(15,4294970000,8589930000,'4Gi - 8Gi'),(16,8589930000,17179900000,'8Gi - 16Gi'),(17,17179900000,34359700000,'16Gi - 32Gi'),(18,34359700000,68719500000,'32Gi - 64Gi'),(19,68719500000,137439000000,'64Gi - 128Gi'),(20,137439000000,274878000000,'128Gi - 256Gi'),(21,274878000000,549756000000,'256Gi - 512Gi'),(22,549756000000,1099510000000,'512Gi - 1Ti'),(23,1099510000000,3.40282e38,'&gt; 1Ti');
/*!40000 ALTER TABLE `log2scale_buckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logscalebytes_buckets`
--

DROP TABLE IF EXISTS `logscalebytes_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logscalebytes_buckets` (
  `id` int(11) NOT NULL,
  `min` double NOT NULL,
  `max` double NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `min_UNIQUE` (`min`),
  UNIQUE KEY `max_UNIQUE` (`max`),
  UNIQUE KEY `description_UNIQUE` (`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logscalebytes_buckets`
--

LOCK TABLES `logscalebytes_buckets` WRITE;
/*!40000 ALTER TABLE `logscalebytes_buckets` DISABLE KEYS */;
INSERT INTO `logscalebytes_buckets` VALUES (1,-1e99,0,'NA'),(2,0,100,'&lt; 100'),(3,100,1000,'100 - 1k'),(4,1000,10000,'1k - 10k'),(5,10000,100000,'10k - 100k'),(6,100000,1000000,'100k - 1M'),(7,1000000,10000000,'1M - 10M'),(8,10000000,100000000,'10M - 100M'),(9,100000000,1000000000,'100M - 1G'),(10,1000000000,10000000000,'1G - 10G'),(11,10000000000,1e99,'$gt; 10G');
/*!40000 ALTER TABLE `logscalebytes_buckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `percentages_buckets`
--

DROP TABLE IF EXISTS `percentages_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `percentages_buckets` (
  `id` int(11) NOT NULL,
  `min` float NOT NULL,
  `max` float NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `percentages_buckets`
--

LOCK TABLES `percentages_buckets` WRITE;
/*!40000 ALTER TABLE `percentages_buckets` DISABLE KEYS */;
INSERT INTO `percentages_buckets` VALUES (0,-1000000000,0,'NA'),(1,0,10,'&lt; 10'),(2,10,20,'10 - 20'),(3,20,30,'20 - 30'),(4,30,40,'30 - 40'),(5,40,50,'40 - 50'),(6,50,60,'50 - 60'),(7,60,70,'60 - 70'),(8,70,80,'70 - 80'),(9,80,90,'80 - 90'),(10,90,1000000000,'&gt; 90');
/*!40000 ALTER TABLE `percentages_buckets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shared`
--

DROP TABLE IF EXISTS `shared`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shared` (
  `id` int(11) NOT NULL,
  `name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shared`
--

LOCK TABLES `shared` WRITE;
/*!40000 ALTER TABLE `shared` DISABLE KEYS */;
INSERT INTO `shared` VALUES (0,'Exclusive'),(1,'Shared');
/*!40000 ALTER TABLE `shared` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-11-25 14:19:49
-- MySQL dump 10.13  Distrib 5.5.46, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: modw_supremm
-- ------------------------------------------------------
-- Server version	5.5.46-0ubuntu0.14.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application` (
  `id` int(11) NOT NULL,
  `name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `license_type` enum('unknown','proprietary','permissive') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'unknown',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `appname` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `application_hint`
--

DROP TABLE IF EXISTS `application_hint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_hint` (
  `id` int(11) NOT NULL,
  `hint` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `realid` int(11) NOT NULL,
  PRIMARY KEY (`id`,`hint`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `batchscripts`
--

DROP TABLE IF EXISTS `batchscripts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `batchscripts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) NOT NULL,
  `local_job_id` int(11) NOT NULL,
  `script` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `jobid` (`resource_id`,`local_job_id`),
  KEY `updated` (`resource_id`,`updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cwd`
--

DROP TABLE IF EXISTS `cwd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cwd` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) NOT NULL DEFAULT '-1',
  `cwd` varchar(4096) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'NA',
  `cwd_md5` char(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`cwd_md5`,`resource_id`),
  KEY `cwd_md5` (`cwd_md5`,`resource_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `datasource`
--

DROP TABLE IF EXISTS `datasource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `datasource` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`description`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `executable`
--

DROP TABLE IF EXISTS `executable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `executable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) NOT NULL DEFAULT '-1',
  `exec` varchar(4096) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'NA',
  `exec_md5` char(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `binary` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `application_id` int(11) DEFAULT '-1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`exec_md5`,`resource_id`),
  KEY `exec_md5` (`exec_md5`,`resource_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exit_status`
--

DROP TABLE IF EXISTS `exit_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exit_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `granted_pe`
--

DROP TABLE IF EXISTS `granted_pe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `granted_pe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `host`
--

DROP TABLE IF EXISTS `host`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `host` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) DEFAULT NULL,
  `name` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`resource_id`,`name`),
  KEY `lookup` (`name`,`resource_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobhost`
--

DROP TABLE IF EXISTS `jobhost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobhost` (
  `host_id` int(11) NOT NULL,
  `local_job_id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  PRIMARY KEY (`host_id`,`local_job_id`,`resource_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobstatus`
--

DROP TABLE IF EXISTS `jobstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobstatus` (
  `job_id` int(11) NOT NULL,
  `aggregated_day` bit(1) NOT NULL DEFAULT b'0',
  `aggregated_month` bit(1) NOT NULL DEFAULT b'0',
  `aggregated_quarter` bit(1) NOT NULL DEFAULT b'0',
  `aggregated_year` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`job_id`),
  KEY `days` (`aggregated_day`),
  KEY `months` (`aggregated_month`),
  KEY `quarters` (`aggregated_quarter`),
  KEY `years` (`aggregated_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_name`
--

DROP TABLE IF EXISTS `job_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'NA',
  `name_md5` char(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`name_md5`),
  KEY `name_md5` (`name_md5`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_peers`
--

DROP TABLE IF EXISTS `job_peers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_peers` (
  `job_id` int(11) NOT NULL,
  `other_job_id` int(11) NOT NULL,
  UNIQUE KEY `UNIQUE` (`job_id`,`other_job_id`),
  KEY `index2` (`job_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-11-25 14:19:50

CREATE TABLE IF NOT EXISTS etl_uid (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(128) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL);

INSERT INTO etl_uid (uuid, valid_from, valid_to)
  SELECT * FROM (SELECT UUID(), FROM_UNIXTIME(0), FROM_UNIXTIME(2147483647)) AS tmp
  WHERE NOT EXISTS (SELECT * FROM etl_uid) LIMIT 1;
