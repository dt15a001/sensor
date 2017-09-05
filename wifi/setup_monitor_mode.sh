#! /usr/bin/env bash

function get_dev_phy()
{
	iw list 2> /dev/null | grep 'Wiphy' | perl -pe 's/.*(phy([0-9]){1,}).*/\1/ | head -1'
}

DUMPER_IFACE="wmon_dev"
DRIVER_MODULE=rt2800usb

echo "begin enable monitor module."

MON_DEV=$(iwconfig 2> /dev/null | grep 'Mode:Monitor' | head -1)
if [ -z "$MON_DEV" ];
then
	DEV_PHY="$(get_dev_phy)"
	if [ -z "$DEV_PHY" ];
	then
		echo "reload module."

		modprobe -r $DRIVER_MODULE
		sleep 1
		modprobe $DRIVER_MODULE
	fi

	DEV_PHY="$(get_dev_phy)"
	if [ -z "$DEV_PHY" ];
	then
		echo " ... failed." >&2
		echo " Wi-Fi device not installed." >&2
		exit 1
	fi

	echo "found device: $DEV_PHY"

	MSG=$(iw phy "$DEV_PHY" interface add "$DUMPER_IFACE" type monitor)
	MON_DEV=$(iwconfig "$DUMPER_IFACE" | grep 'Mode:Monitor')
	if [ -n "$MON_DEV" ];
	then
		echo " ... succeeded."
	else
		echo " ... failed." >&2
		echo "$MSG" >&2
		exit 2
	fi

else
	echo " ... already enabled."
fi

UP_DEV=$(ip link list up | grep "$DUMPER_IFACE")
if [ -z "$UP_DEV" ];
then
	echo " bringup $DUMPER_IFACE ... "

	ip link set "$DUMPER_IFACE" up
	if [ $? -ne 0 ];
	then
		echo " ... failed." >&2
		exit 3
	fi
fi
