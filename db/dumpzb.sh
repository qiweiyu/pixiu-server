#!/bin/sh
mysqldump pixiu -uroot $(mysql -uroot -D pixiu -Bse "SHOW TABLES LIKE 'zb_%'") > zb.sql

