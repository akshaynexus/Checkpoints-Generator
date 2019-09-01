//Initialize Libraries needed
const request = require('request');

var explorerAPILink = "http://159.69.33.243:3001/api/";
var blockspacing = 50000;
var currentblock = 581563;

function generateCheckpoints(blockdelay, blockcountcurr) {
    var currblockhash = "";
    var outputdatax = "";
    for (var i = 0; i <= blockcountcurr; i++) {
        if (i + blockdelay > blockcountcurr || i > blockcountcurr) 
            i = blockcountcurr;
        else if (i == 1) 
            i = blockdelay;
        else if(i==0){
            outputdatax = "";
        }
        else 
            i += blockdelay;

        console.log("Getting Blockhash of block: " + i);
        request(explorerAPILink + 'getblockhash?index=' + i, {
            json: false
        }, (err, res, body) => {
                currblockhash = body;
                console.log("Blockhash of block: " + i + " = " + currblockhash);
                // if (i == 0) {i = 1;}
                //now that we got blockhash,get block data and parse it to needed info
             ConvertBlockData(body);
              //  console.log(outputdatax)
        });

    }

    

}
function ConvertBlockData(currblockhash){
    var outputdata = ""
    request(explorerAPILink + 'getblock?hash=' + currblockhash, {
        json: true
    }, (err, res, body) => {
         
            if (body.height == 0 || body.height < currentblock) { //genesis block
              //  console.log("generating checkpoint data for block 0")
                outputdata = "{" + body.height + ",uint256('" + body.hash + "'), " + body.time + ",0x" + body.bits + "},";
               console.log(outputdata)
            } 
            else if (body.height == currentblock) { //last block in checkpoints,so dont add , at end of output data
                outputdata = "{" + body.height + ",uint256('" + body.hash + "'), " + body.time + ",0x" + body.bits + "}";
                console.log(outputdata)

            }

    });
    return outputdata;
}

generateCheckpoints(blockspacing, currentblock);