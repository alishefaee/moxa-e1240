const {catchAsync} = require("./functions.js");
const nconf = require("nconf")

exports.readData = catchAsync(async (resolve, reject, client) => {
    let resp = await client.readInputRegisters(8, 32).catch(err => {
        console.log(err)
    })
    
    let data = nconf.get('data')
    let result = []
    for (let key in data) {
        if (data[key].active){
            let value = convertData(resp, {
                pin: Number(key), // A0
                min: data[key].min,
                max: data[key].max,
            })
            result.push({pin:key, value:value.toFixed(1)})
        }
    }

    resolve(result)

})

const hexToUint16 = (str) =>
    Uint16Array
        .from(str.match(/.{1,2}/g)
            .map((comp) => parseInt(comp, 16))
        );

function convertData(resp, options) {
    let {pin, min, max} = options
    console.log(resp.response._body._valuesAsBuffer)
    console.log(new Buffer(resp.response._body._valuesAsBuffer).toString('hex'))
    const [A, B, C, D] = hexToUint16(new Buffer(resp.response._body._valuesAsBuffer).toString('hex', pin * 4))

    const swappedValue = new Uint8Array([C, D, A, B]);
    const floatValue = new DataView(swappedValue.buffer).getFloat32(0);

    let scaledValue = (((floatValue - 4.0) * (max - min)) / 16.0) - Math.abs(min)
    return scaledValue
}
