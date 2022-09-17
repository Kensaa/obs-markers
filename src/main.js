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

uIOhook.on('keydown', async e => {
    if (e.keycode === UiohookKey.F7) {
        console.log('adding marker')
        const res = await obs.call('GetRecordStatus')
        output.push({
            timecode: res.outputTimecode,
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