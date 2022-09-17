# OBS-Markers  
A simple software to place "markers" in your obs.

# Usage
Press F7 at any time during your obs record to add a marker, when you stop the record a json file will be created alongside your video with a list of all the markers you placed during your record

# Installation
If you are using a version of OBS older than 28.0, you need to manually install [obs-websocket](https://github.com/obsproject/obs-websocket) and activate it.

Just download the apropriate executable of the software [here](https://github.com/Kensaa/obs-markers/releases) and start it.  
When first started, the software will create a config.json file alongside the executable, in it, you'll be able to change the password to the password in obs-websocket config.

# Build
If you want to build it yourself, you'll need :
- NodeJS
- Yarn

First clone the repository :  
`git clone https://github.com/Kensaa/obs-markers`  
Then install the dependencies :  
`yarn install`  
Finally build the executables :  
`yarn build`
