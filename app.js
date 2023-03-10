const express = require('express')
const morgan = require('morgan')

const Modbus = require('jsmodbus')
const net = require('net')
const {readAllData,readPinData} = require("./functions/parameters.js")
const path = require("path")
const app = express();
const nconf = require('nconf');
const fs = require('fs');
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

nconf.file('config.json')

app.get('/', (req, res) => {
    return res.send("Home Page")
});

app.post('/save-data',(req,res)=>{
    nconf.set('data',req.body)
    nconf.save()
    res.send("Saved")
})

app.get('/get-data/:pin', (req,res)=>{

    const modbusSocket = new net.Socket()
    const client = new Modbus.client.TCP(modbusSocket, 0x1)

    const options = {
        'host': '10.87.133.51',
        'port': 502,
        'debug': true
    }

    modbusSocket.setTimeout(3000)
    modbusSocket.connect(options)
    modbusSocket.on('connect', function () {

        console.log("modbusSocket is connected")

        setTimeout(() => {
            console.log('here')
            readPinData(client,req.params.pin)
                .then(value => {
                    console.log('value', value)
                    return res.json({data: value})
                })
        }, 100)

    });
    modbusSocket.on('error', ()=>{
        res.end(`<h1>Error on modbus</h1>`)
    })
    modbusSocket.on('timeout', ()=>{
        res.end(`<h1>Socket Timeout</h1>`)
    })
    
})

app.get('/get-data', (req,res)=>{

    const modbusSocket = new net.Socket()
    const client = new Modbus.client.TCP(modbusSocket, 0x1)

    const options = {
        'host': '10.87.133.51',
        'port': 502,
        'debug': true
    }

    modbusSocket.setTimeout(3000)
    modbusSocket.connect(options)
    modbusSocket.on('connect', function () {

        console.log("modbusSocket is connected")

        setTimeout(() => {
            console.log('here')
            readAllData(client)
                .then(values => {
                    console.log('values', values)
                    return res.json({data: values})
                })
        }, 100)

    });
    modbusSocket.on('error', ()=>{
        res.end(`<h1>Error on modbus</h1>`)
    })
    modbusSocket.on('timeout', ()=>{
        res.end(`<h1>Socket Timeout</h1>`)
    })

})

module.exports = app;