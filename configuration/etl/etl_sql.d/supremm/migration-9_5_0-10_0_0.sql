DROP TABLE IF EXISTS `modw_supremm`.`catastrophe_buckets`
//
CREATE TABLE `modw_supremm`.`catastrophe_buckets` (
  `id` int(11) NOT NULL,
  `min` double NOT NULL,
  `max` double NOT NULL,
  `description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `h_description` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
//

LOCK TABLES `modw_supremm`.`catastrophe_buckets` WRITE
//
INSERT INTO `modw_supremm`.`catastrophe_buckets` VALUES (1,-0.1,0.0001,'&lt; 0.0001', '0.00 - 10.00'),(2,0.0001,0.001,'0.0001 - 0.001', '10.00 - 50.00'),(3,0.001,0.01,'0.001 - 0.01', '50.00 - 90.00'),(4,0.01,0.1,'0.01 - 0.1', '90.00 - 99.00'),(5,0.1,0.5,'0.1 - 0.5', '99.00 - 99.80'),(6,0.5,1,'0.5 - 1.0', '99.80 - 99.90'),(7,1,1.5,'1.0 - 1.5', '99.90 - 99.93'),(8,1.5,10000000,'&gt; 1.5', '99.93 - 100.00'),(9,-100000000,-0.1,'NA', 'NA')
//
UNLOCK TABLES
//
