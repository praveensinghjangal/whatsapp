#!/bin/bash



echo $1
echo $2
echo $3
echo "spawnning server"
sleep 1
echo "configuring server"
sleep 1
echo "spawnning fb containers"
sleep 1
echo "all done"
echo "private IP = 10.40.13.240" > shell_scripts/launch_server/output/$3.txt

