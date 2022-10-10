import { uIOhook, UiohookKey } from 'uiohook-napi'
import OBSWebSocket from 'obs-websocket-js'
import * as fs from 'fs'
import * as path from 'path'

const obs = new OBSWebSocket()
let output = []

if (!fs.existsSync('config.json')) {
    const defaultConfig = {
        "address": "ws://localhost:4455",
        "password": "password"
    }
    fs.writeFileSync('config.json', JSON.stringify(defaultConfig, null, 4))
}

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

obs.connect(config.address,config.password)

function parseTimecode(timecode){
    //0:15:05.0083
    const split = timecode.split(':')
    return {
        hours: parseInt(split[0]),
        minutes: parseInt(split[1]),
        seconds: parseInt(split[2].split('.')[0]),
        milliseconds: parseInt(split[2].split('.')[1])
    }
}

uIOhook.on('keydown', async e => {
    if (e.keycode === UiohookKey.F7) {
        console.log('adding marker')
        const res = await obs.call('GetRecordStatus')
        const time = parseTimecode(res.outputTimecode)
        //remove 30seconds from the econds
        time.seconds -= 30
        if (time.seconds < 0) {
            time.seconds = 60 + time.seconds
            time.minutes -= 1
        }
        if (time.minutes < 0) {
            time.minutes = 60 + time.minutes
            time.hours -= 1
        }
        if(time.hours < 0){
            time.hours = 0
            time.minutes = 0
            time.seconds = 0
        }
        time.hours = time.hours.toString().padStart(2,'0')
        time.minutes = time.minutes.toString().padStart(2,'0')
        time.seconds = time.seconds.toString().padStart(2,'0')
        time.milliseconds = time.milliseconds.toString().padStart(4,'0')
        
        output.push({
            timecode: `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`,
            duration: res.outputDuration
        })
    }
})

obs.on('RecordStateChanged',(res)=>{
    if(res.outputState === 'OBS_WEBSOCKET_OUTPUT_STOPPED'){
        const dir = path.dirname(res.outputPath)
        const filename = path.basename(res.outputPath, '.mkv')
        
        const file = path.join(dir, `${filename} markers.json`)
        fs.writeFileSync(file, JSON.stringify(output, null, 4))
        console.log('saved markers to', file)

        output = []
    }
})

uIOhook.start()