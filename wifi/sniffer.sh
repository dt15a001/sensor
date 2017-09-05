#!/bin/sh

ID="987"

API="http://localhost:3000"

if [ ! -d ./logs ]; then
  echo "Make log directory."
  mkdir ./logs
fi


while true
do
  tshark -I -i wmon_dev \
       -Y "wlan.fc.type_subtype eq 4" \
       -T fields -E separator=',' \
       -e frame.time_epoch \
       -e wlan.sa \
       -e radiotap.dbm_antsignal \
       -l \
       | while read line; do

    # 1497835508.063578000,2c:d0:5a:be:cb:e7,-76
    ts=`echo $line | cut -d ',' -f 1`
    mac=`echo $line | cut -d ',' -f 2`
    rssi=`echo $line | cut -d ',' -f 3`

    dt=`date '+%Y%m%dT%H%M%S+09:00'`

    # {"mac":"24:a2:e1:03:d7:98", "rssi":-43, "id":"001"}
    json="{\"mac\":\"$mac\", \"rssi\":$rssi, \"id\":\"$ID\", \"datetime\":\"$dt\"}"

    echo $json

    ## Logging ##
    # echo $json >> /home/pi/logs/`date +%Y%m%d%H`.log

    ## Post ##
    curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d "$json" $API
  done
done

