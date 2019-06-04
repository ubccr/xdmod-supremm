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
  `application_fosid` int(11) NOT NULL DEFAULT '-1',
  `url` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `appname` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `application_fos`
--

DROP TABLE IF EXISTS `application_fos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_fos` (
      `id` int(11) NOT NULL,
      `description` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
      PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
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
LOCK TABLES `modw_supremm`.`application_fos` WRITE, `modw_supremm`.`application` WRITE;
DELETE IGNORE FROM `modw_supremm`.`application_fos`;
DELETE IGNORE FROM `modw_supremm`.`application`;
INSERT INTO `modw_supremm`.`application` (id, name, license_type, application_fosid, url) VALUES 
	(-1,'NA','permissive',-1,NULL),
	(0,'uncategorized','permissive',1,NULL),
	(1,'adcirc','proprietary',1,NULL),
	(2,'amber','permissive',2,'http://ambermd.org/'),
	(3,'berkeleygw','permissive',1,NULL),
	(4,'cactus','permissive',3,'http://cactuscode.org/'),
	(5,'casino','proprietary',1,NULL),
	(6,'ccsm','permissive',1,NULL),
	(7,'cesm','permissive',4,'http://www.cesm.ucar.edu/'),
	(8,'charmm','permissive',1,NULL),
	(9,'cp2k','permissive',5,'https://www.cp2k.org/'),
	(10,'cpmd','proprietary',5,NULL),
	(11,'desmond','proprietary',1,NULL),
	(12,'enzo','permissive',6,'http://enzo-project.org/'),
	(13,'gadget','permissive',6,NULL),
	(14,'gamess','permissive',7,NULL),
	(15,'gpaw','permissive',1,NULL),
	(16,'gromacs','permissive',2,'http://www.gromacs.org/'),
	(17,'homme','permissive',4,'https://www.homme.ucar.edu/'),
	(18,'lammps','permissive',2,'http://lammps.sandia.gov/'),
	(19,'lattice boltzmann','permissive',1,NULL),
	(20,'mcnpx','proprietary',1,NULL),
	(21,'milc','permissive',8,'http://physics.indiana.edu/~sg/milc.html'),
	(22,'mpiblast','permissive',1,NULL),
	(23,'namd','permissive',2,'http://www.ks.uiuc.edu/Research/namd/'),
	(24,'nwchem','permissive',7,'http://www.nwchem-sw.org/index.php/Main_Page'),
	(25,'openfoam','permissive',9,'http://www.openfoam.com/'),
	(26,'opensees','permissive',10,'http://opensees.berkeley.edu/'),
	(27,'paratec','permissive',5,'http://www.nersc.gov/users/software/applications/materials-science/paratec/'),
	(28,'q-espresso','permissive',5,'http://www.quantum-espresso.org/'),
	(29,'siesta','permissive',5,'http://departments.icmab.es/leem/siesta/'),
	(30,'specfem3d','permissive',10,'https://github.com/geodynamics/specfem3d'),
	(31,'superlu','permissive',1,NULL),
	(32,'vasp','proprietary',5,NULL),
	(33,'wrf','permissive',4,NULL),
	(34,'pegasus','proprietary',1,NULL),
	(35,'rosetta','permissive',2,'https://www.rosettacommons.org'),
	(36,'cybershake','permissive',1,'https://scec.usc.edu/scecpedia/CyberShake_Code_Base'),
	(37,'hpcc','permissive',11,'http://icl.cs.utk.edu/hpcc/'),
	(38,'aesop','unknown',1,NULL),
	(39,'qcff','unknown',1,NULL),
	(40,'linpack','permissive',11,'http://www.netlib.org/linpack/'),
	(41,'ior','permissive',11,'https://github.com/LLNL/ior'),
	(42,'imb','permissive',1,NULL),
	(43,'mpi-tile-io','permissive',1,NULL),
	(44,'charm++','permissive',1,NULL),
	(45,'wien2k','permissive',1,NULL),
	(46,'pstgf','unknown',1,NULL),
	(47,'stgf','unknown',1,NULL),
	(48,'stgfz','unknown',1,NULL),
	(49,'parsec','permissive',1,NULL),
	(50,'enkf','permissive',1,NULL),
	(51,'dsmc','permissive',1,NULL),
	(52,'p-flapw','permissive',1,NULL),
	(53,'hisq','unknown',1,NULL),
	(54,'petsc','permissive',1,NULL),
	(55,'h2mol','permissive',1,NULL),
	(56,'numactl','permissive',1,NULL),
	(57,'matmult','permissive',1,NULL),
	(58,'mitgcm','permissive',12,'http://mitgcm.org/'),
	(59,'dl_poly','permissive',2,'http://www.ccp5.ac.uk/DL_POLY_CLASSIC/'),
	(60,'vmd','permissive',13,NULL),
	(61,'gaussian','proprietary',7,'http://www.gaussian.com/'),
	(62,'qmcchem','permissive',5,NULL),
	(63,'olympus','unknown',1,NULL),
	(64,'visit','permissive',13,'http://www.visitusers.org'),
	(65,'meep','permissive',1,NULL),
	(66,'sweep3d','permissive',1,NULL),
	(67,'wannier90','permissive',1,NULL),
	(68,'abinit','permissive',1,NULL),
	(69,'qwalk','permissive',5,'http://qwalk.github.io/mainline/'),
	(70,'octopus','permissive',1,NULL),
	(71,'fdtd','proprietary',12,NULL),
	(72,'gipaw','permissive',1,NULL),
	(73,'acesiii','permissive',1,NULL),
	(74,'q-chem','proprietary',5,NULL),
	(75,'castep','proprietary',1,NULL),
	(76,'rmhd','permissive',1,NULL),
	(77,'aerosoft gasp','proprietary',1,NULL),
	(78,'chroma','permissive',8,'http://jeffersonlab.github.io/chroma/'),
	(79,'a.out','permissive',1,NULL),
	(80,'stellarbox','permissive',1,NULL),
	(81,'rocflo','unknown',1,NULL),
	(82,'bsr hbd3','unknown',1,NULL),
	(83,'mlrho','permissive',1,NULL),
	(84,'harm3d','permissive',3,'http://dx.doi.org/10.1088/0004-637X/692/1/411'),
	(85,'bsr','unknown',1,NULL),
	(86,'nek5000','permissive',9,NULL),
	(87,'cfdem','permissive',1,NULL),
	(88,'spec','permissive',3,'https://www.black-holes.org/SpEC.html'),
	(89,'cdp','unknown',1,NULL),
	(90,'swan','permissive',1,NULL),
	(91,'mpsolve','permissive',1,NULL),
	(92,'openggcm','permissive',1,NULL),
	(93,'fdl3di','permissive',1,NULL),
	(94,'tmdmpi','unknown',1,NULL),
	(95,'gh3d2m','permissive',1,NULL),
	(96,'mc3dp','unknown',1,NULL),
	(97,'fd3d','permissive',1,NULL),
	(98,'3dsg','unknown',1,NULL),
	(99,'cmaq_cctm','permissive',1,NULL),
	(100,'zeus-mp','permissive',14,'http://www.netpurgatory.com/zeusmp.html'),
	(101,'zasp','unknown',1,NULL),
	(102,'ifortddwntl.om','unknown',1,NULL),
	(103,'uts_ws','unknown',1,NULL),
	(104,'transfer','unknown',1,NULL),
	(105,'mangll_dgae_snell','unknown',1,NULL),
	(106,'md1_mpi','unknown',1,NULL),
	(107,'flash4','permissive',1,NULL),
	(108,'mhd3d','permissive',14,NULL),
	(109,'lesmpi_rankine.a','unknown',1,NULL),
	(110,'graph500','permissive',1,NULL),
	(111,'nrlmol','unknown',1,NULL),
	(112,'PROPRIETARY','permissive',1,NULL),
	(113,'adf','proprietary',1,NULL),
	(114,'maker','permissive',1,NULL),
	(115,'python','permissive',1,NULL),
	(116,'nemo','permissive',5,'https://engineering.purdue.edu/gekcogrp/software-projects/nemo5/'),
	(117,'lsms','permissive',1,NULL),
	(118,'aims','proprietary',1,NULL),
	(119,'cnvnator','permissive',1,NULL),
	(120,'matlab','proprietary',1,NULL),
	(121,'arps','permissive',1,NULL),
	(122,'chargemol','permissive',1,NULL),
	(123,'rsqsim','permissive',1,NULL),
	(124,'gizmo','permissive',1,'http://www.tapir.caltech.edu/~phopkins/Site/GIZMO.html'),
	(125,'uspex','permissive',1,'http://uspex.stonybrook.edu/uspex.html'),
	(126,'hoomd','permissive',1,NULL),
	(127,'dumses','permissive',1,NULL),
	(128,'titan2d','permissive',1,'https://vhub.org/resources/titan2d'),
	(129,'astrogk','permissive',1,'http://newton.physics.uiowa.edu/~ghowes/astrogk/'),
	(130,'snoopy','permissive',1,'http://ipag.osug.fr/~lesurg/snoopy_doc/html/index.html'),
	(131,'r','permissive',15,'https://www.r-project.org/'),
	(132,'unknown (ran under a debugger)','permissive',1,NULL),
	(133,'ncbi-blast','permissive',1,'http://blast.ncbi.nlm.nih.gov/Blast.cgi'),
	(134,'gnu-octave','permissive',1,'https://www.gnu.org/software/octave/'),
	(135,'garli','permissive',1,'http://wiki.hpc.ufl.edu/doc/Garli'),
	(136,'orca','permissive',1,'https://orcaforum.cec.mpg.de/'),
	(137,'paraview','permissive',13,'http://www.paraview.org/'),
	(138,'dirac','permissive',1,'http://diracprogram.org/doku.php'),
	(139,'gatk','permissive',1,'https://www.broadinstitute.org/gatk/'),
	(140,'varscan','permissive',1,'http://varscan.sourceforge.net/'),
	(141,'picard','permissive',1,'http://broadinstitute.github.io/picard/'),
	(142,'setsm','permissive',16,'http://www.pgc.umn.edu/elevation/stereo/'),
	(143,'gdal','permissive',1,'http://www.gdal.org/'),
	(144,'citcoms','permissive',10,'https://geodynamics.org/cig/software/citcoms/'),
	(145,'adda','permissive',17,'https://www.openhub.net/p/adda'),
	(146,'meld','permissive',2,'https://github.com/laufercenter/meld'),
	(147,'osiris','permissive',17,'http://epp.ist.utl.pt/wp/osiris/'),
	(148,'chimera','permissive',13,'https://www.cgl.ucsf.edu/chimera'),
	(149,'rockstar-galaxies','permissive',6,'https://bitbucket.org/pbehroozi/rockstar-galaxies'),
	(150,'swift','permissive',1,'http://swift-lang.org/'),
	(151,'castro','permissive',18,'http://boxlib-codes.github.io/Castro/'),
	(152,'mdtest','permissive',1,'https://sourceforge.net/projects/mdtest/'),
	(153,'waveqlab3d','permissive',1,'https://www.scec.org/publication/7004'),
	(154,'msflukss','permissive',14,'http://dl.acm.org/citation.cfm?id=2616499'),
	(155,'awp-odc','permissive',10,'https://github.com/HPGeoC/awp-odc-os'),
	(156,'fluent','proprietary',9,'http://www.ansys.com/'),
	(157,'ls-dyna','permissive',1,'http://www.oasys-software.com/dyna/en/software/ls-dyna.shtml'),
	(158,'psdns','permissive',19,'http://www.cs.odu.edu/~mln/ltrs-pdfs/conf-hpc-95-p1.pdf'),
	(159,'openatom','permissive',2,'http://charm.cs.illinois.edu/OpenAtom/'),
	(160,'changa','permissive',6,'http://www-hpcc.astro.washington.edu/tools/changa.html'),
	(161,'maestro','permissive',18,'http://boxlib-codes.github.io/MAESTRO/'),
	(162,'caffe','permissive',20,'http://caffe.berkeleyvision.org/'),
	(163,'hpcg','permissive',11,'https://software.sandia.gov/hpcg/html/index.html'),
	(164,'feap','permissive',21,'http://www.ce.berkeley.edu/~sanjay/FEAP/feap.html'),
	(165,'system applications','permissive',22,NULL),
	(166,'star-ccm+','proprietary',9,'http://www.ce.berkeley.edu/~sanjay/FEAP/feap.html'),
	(167,'neo-rxchf','permissive',23,NULL),
	(168,'episimdemics','permissive',24,'http://charm.cs.uiuc.edu/research/episim'),
	(169,'alya','permissive',9,'http://www.bsc.es/es/computer-applications/alya-system'),
	(170,'distuf','permissive',19,NULL),
	(171,'eve','permissive',25,'https://tavazoielab.c2b2.columbia.edu/EVE/'),
	(172,'moose','permissive',26,'http://mooseframework.org/'),
	(173,'X11 applications','permissive',22,NULL),
	(174,'specfem2d','permissive',10,'https://github.com/geodynamics/specfem2d'),
	(175,'hadoop','permissive',27,'https://github.com/glennklockwood/myhadoop/'),
	(176,'supremm','permissive',28,'http://supremm.xdmod.org/'),
	(177,'vpic','permissive',29,'https://github.com/losalamos/vpic'),
	(178,'rmgdft','permissive',5,'https://sourceforge.net/p/rmgdft/wiki/Home/'),
	(179,'ramses','permissive',6,'http://dx.doi.org/10.1051/0004-6361:20011817'),
	(180,'lsqr','permissive',10,'http://www.cs.ucf.edu/~lwang/LSQR.html'),
	(181,'cg-md','permissive',2,'http://pubs.acs.org/doi/abs/10.1021/ct400727q'),
	(182,'ppm','permissive',19,'https://www.xsede.org/documents/271087/586927/Woodward.pdf'),
	(183,'wsmp','permissive',1,'http://researcher.watson.ibm.com/researcher/view_group.php?id=1426'),
	(184,'lsu3shell','permissive',1,'https://arxiv.org/abs/1602.02965'),
	(185,'sord','permissive',10,'http://gely.github.io/coseis/docs/SORD.html'),
	(186,'grips','permissive',1,'https://bluewaters.ncsa.illinois.edu/documents/10157/c321b78f-5176-495c-b34b-a229dbbf96a4'),
	(187,'plascomcm','permissive',17,'https://bitbucket.org/xpacc/plascomcm'),
	(188,'mconv','permissive',14,'https://bluewaterssymposium2015.sched.org/event/38Pr/astro-robert-f-stein-ab-initial-models-of-solar-activity'),
	(189,'INTERACTIVE','permissive',1,NULL),
	(190,'cgmd','permissive',2,'https://vothgroup.uchicago.edu/research/multiscale-theory-and-simulations-biomolecular-systems'),
	(191,'3dh','permissive',29,'http://www.ncsa.illinois.edu/news/stories/ESSsolar/'),
	(192,'hmc','permissive',8,NULL),
	(193,'SYSTEM TESTING','permissive',22,NULL),
	(194,'athena','permissive',14,'https://arxiv.org/abs/0804.0402'),
	(195,'raxml','permissive',30,'https://academic.oup.com/bioinformatics/article/30/9/1312/238053'),
	(196,'beast','permissive',30,'http://beast.community/'),
	(197,'beast2','permissive',30,'http://www.beast2.org/'),
	(198,'neuron','permissive',31,'https://neuron.yale.edu/neuron/'),
	(199,'molpro','proprietary',2,'https://www.molpro.net'),
	(200,'mrbayes','permissive',32,'http://mrbayes.sourceforge.net/index.php'),
	(201,'mupfes','permissive',17,'https://sites.google.com/site/memt63/tools/MUPFES'),
	(202,'migrate-n','permissive',30,'https://popgen.sc.fsu.edu/Migrate/Migrate-n.html'),
	(203,'viriato','permissive',14,'https://doi.org/10.1016/j.cpc.2016.05.004'),
	(204,'tophat','permissive',30,'https://ccb.jhu.edu/software/tophat/index.shtml'),
	(205,'satsuma2','permissive',30,'https://github.com/bioinfologics/satsuma2'),
	(206,'canu','permissive',33,'https://canu.readthedocs.io/en/stable/'),
	(207,'trinity','permissive',30,'http://trinityrnaseq.sourceforge.net/'),
	(208,'samtools','permissive',30,'http://samtools.sourceforge.net'),
	(209,'hisat2','permissive',30,'https://ccb.jhu.edu/software/hisat2/index.shtml'),
	(210,'abaqus','proprietary',21,'https://www.3ds.com/products-services/simulia/products/abaqus/'),
	(211,'lastz','permissive',30,'http://www.bx.psu.edu/miller_lab/dist/README.lastz-1.02.00/README.lastz-1.02.00a.html#intro'),
	(212,'salmon','permissive',30,'https://combine-lab.github.io/salmon/'),
	(213,'unknown (htcondor)','permissive',34,'https://research.cs.wisc.edu/htcondor/'),
	(214,'hh-suite','permissive',30,'https://github.com/soedinglab/hh-suite'),
	(215,'partitionfinder2','permissive',30,'http://www.robertlanfear.com/partitionfinder/'),
	(216,'cnfpred','permissive',30,'http://raptorx.uchicago.edu/'),
	(217,'fasttree','permissive',30,'http://meta.microbesonline.org/fasttree/'),
	(218,'mafft','permissive',30,'https://mafft.cbrc.jp/alignment/software/'),
	(219,'paup','permissive',30,'http://paup.phylosolutions.com/'),
	(220,'iqtree','permissive',30,'http://www.iqtree.org/doc/Home#why-iq-tree'),
	(221,'phyml','permissive',30,'http://www.atgc-montpellier.fr/phyml/binaries.php'),
	(222,'bwa','permissive',30,'http://bio-bwa.sourceforge.net/'),
	(223,'prospect','permissive',30,'http://compbio.ornl.gov/structure/prospect/index.html'),
	(224,'oxdna','permissive',30,'https://dna.physics.ox.ac.uk/index.php/Main_Page'),
	(225,'gransim','permissive',35,'http://malthus.micro.med.umich.edu/lab/');
INSERT INTO 
	`modw_supremm`.`application_fos` (id, description)
VALUES 
	(-1,'NA'),
	(1,'uncategorized'),
	(2,'Molecular Dynamics'),
	(3,'General Relativity'),
	(4,'Climate and Weather'),
	(5,'Material Science'),
	(6,'Cosmology'),
	(7,'Computational Chemistry'),
	(8,'Quantum Chromo Dynamics'),
	(9,'Computational Fluid Dynamics'),
	(10,'Earthquakes/Seismology'),
	(11,'Benchmarking'),
	(12,'Atmostpheric Science'),
	(13,'Visualization'),
	(14,'Magnetohydrodynamics'),
	(15,'Statistical Analysis'),
	(16,'Earth Science'),
	(17,'Physics'),
	(18,'Stellar Atmospheres and Supernovae'),
	(19,'Turbulence'),
	(20,'Machine Learning'),
	(21,'Finite Element Analysis'),
	(22,'None'),
	(23,'Quantum Chemistry'),
	(24,'Social Networks'),
	(25,'Cellular Evolution'),
	(26,'Computational Mechanics'),
	(27,'Map Reduce'),
	(28,'System Monitoring'),
	(29,'Plasmas/Magnetosphere'),
	(30,'Bioinformatics'),
	(31,'Biophysics'),
	(32,'Phylogenetics'),
	(33,'Molecular Sequencing'),
	(34,'N/A'),
	(35,'Biology');
UNLOCK TABLES
