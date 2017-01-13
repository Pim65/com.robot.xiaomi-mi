# Homey app for Xiaomi Mi Robot Vacuum Cleaner
Use [Homey](https://www.athom.com/) to control your [Xiaomi Mi Robot Vacuum Cleaner](http://xiaomi-mi.com/smart-home/xiaomi-mi-robot-vacuum-cleaner-white/). Currently Xiaomi does not offer an open API for controlling the Mi Robot. This app works by sending UDP packets from Homey to the Mi Robot on your local network. These UDP packets are send as HEX values and these values are different for each Mi Robot. The HEX values have to be retrieved by sniffing the traffic between the Mi Home smartphone app and the Mi Robot on your local network. Although retrieving these HEX values is explained below, this is not for the faint-hearted and requires some technical skills (or at least being able to follow a tutorial step by step).

**Supported Flow Action Cards**
- Start Vacuum Cleaning
- Pause Vacuum Cleaning
- Send Vacuum Cleaner Home To Dock
- Find Vacuum Cleaner

## Installation
This Homey app is not available in the [Homey App Store](https://apps.athom.com/) due to the extra and complex steps needed before being able to add the Mi Robot as a device within Homey. You can install this app using the [CLI install method](https://forum.athom.com/discussion/1448/how-to-cli-install-method). After installation you can add a Mi Robot as device where you will be asked to add it's IP address and the HEX values corresponding with the commands "start", "pause", "home" and "find". How to retrieve these values is described below.

## Retrieving the HEX values for sending the commands
This guide (credits to Sevift for the initial break down and screenshots) will explain how to retrieve the HEX values for the UDP packets which Homey needs to send to the Mi Robot. This guide is written from a Windows point of view but there are probably alternatives for OSX as well.
### Requirements
- Download and install [BlueStacks](http://www.bluestacks.com/). This will allow you to run the Mi Home app from your desktop.
- Download and install (or use the portable version) of [Wireshark](https://www.wireshark.org/). This will allow you to sniff the traffic between the app running on your desktop and the Mi Robot.
- Download and install (or use the portable version) of [PacketSender](https://packetsender.com/). This will allow you to test the retrieved HEX values to make sure you have the right ones.

### BlueStacks
Run BlueStacks, configure your Android environment and install the Mi Home app through the Play Store. Log in with your Xiaomi Mi account so your Mi Robot is available in the app. If you dont know this already, use the app the retrieve the IP address of the Mi Robot and remember it (best is to configure a static IP in your router so it doesnt change).

### Wireshark
Start Wireshark and select the right networking interface which is used to connect your desktop to the internet. We will be monitoring this for the traffic between your desktop and the Mi Robot.
![WireShark Interface](/assets/readme/wireshark_interface.png?raw=true)

Once you have confirmed you can monitor the traffic of your desktop through WireShark we need to intercept the UDP packets from the Mi Home app running on the desktop inside BlueStacks and the Mi Robot. We do this by recording the traffic while we press the right button in the Mi Home app. So hit the record button in WireShark and press the button in the MiHome app to start the Mi Robot. Right after that stop the recording in WireShark to avoid to much clutter in the WireShark logs.
![WireShark Record](/assets/readme/wireshark_record.png?raw=true)

Now we need to find the right UDP packet, this can be a trail and error process. Look in WireShark for all UDP traffic to the IP address of your Mi Robot. If you clicked record in WireShark and Start cleaning in the Mi Home fast after each other it will be one of the top most records. For every record that might be the right packet to start the Mi Robot we will need to test if it is actually the right UDP packet. It is clutter because of communication between the Mi Home app and the Mi Robot for the map feature. Select the first possible record as shown below.
![WireShark Data](/assets/readme/wireshark_data.png?raw=true)

Select Data field in the details pane. Select "Copy > ... as a HEX Stream" from the the right click menu as show below.
![WireShark Copy](/assets/readme/wireshark_copy.png?raw=true)

### Testing the UDP packets with PacketSender
Now when have copy a HEX value we need to test if this is actually the right UDP packet to start the Mi Robot. Start the PacketSender application and fill in the details of your Mi Robot (IP of the Mi Robot, port is 54321 and protocol is UDP). Then paste the HEX Stream which you copy in the previous step in the HEX field of PacketSender and hit the send button. If you Mi Robot just started you have found the right UDP packet. If it didnt you need to go back to WireShark and repeat this for all other UDP traffic records to your Mi Robot IP address until you find the correct UDP packet to start the Robot. Once you have found it, save it somewhere so you can add it during the "Add device wizard" within Homey.

Now repeat this process for the "pause", "home" and "find" actions. Once you have all the correct HEX values you can add your Xiaomi Mi Robot Vacuum Cleaner in Homey.
