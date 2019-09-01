//Initialize Libraries needed
const request = require('request');

var explorerAPILink = "http://159.69.33.243:3001/api/";
var blockspacing = 50000;
//get this number from last block on explorer
var currentblock = 581563;
var i = 0;
function generateCheckpoints(blockdelay, blockcountcurr) {
    if (i <= blockcountcurr) {
        if (i + blockdelay > blockcountcurr || i > blockcountcurr) 
            i = blockcountcurr;
        else if (i == 1) 
            i = blockdelay;
        else if (i == 0) {
            outputdatax = "";
        } else 
            i += blockdelay;
        
        request(explorerAPILink + 'getblockhash?index=' + i, {
            json: false
        }, (err, res, body) => {
            currblockhash = body;
            //now that we got blockhash,get block data and parse it to needed info
            ConvertBlockData(body);
            //Call the func in of itself,emulating a for loop type situation.
            generateCheckpoints(blockspacing, currentblock);
        });
    }
    //increment i 
    i += 1;

}
function ConvertBlockData(currblockhash) {
    var outputdata = ""
    request(explorerAPILink + 'getblock?hash=' + currblockhash, {
        json: true
    }, (err, res, body) => {
        if (body.height == 0 || body.height < currentblock) { //genesis block
            outputdata = "{" + body.height + ',uint256("' + body.hash + '"), ' + body.time + ",0x" + body.bits + "},";
        } else if (body.height == currentblock) { //last block in checkpoints,so dont add , at end of output data
            outputdata = "{" + body.height + ',uint256("' + body.hash + '"), ' + body.time + ",0x" + body.bits + "}";
        }
        console.log(outputdata)
    });
}
generateCheckpoints(blockspacing, currentblock);